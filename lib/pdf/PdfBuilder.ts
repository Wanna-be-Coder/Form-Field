import {
  PDFDocument,
  PDFFont,
  PDFForm,
  PDFPage,
  PDFTextField,
  StandardFonts,
  rgb,
} from "pdf-lib";

// A small top-down layout engine over pdf-lib that produces court-form-style
// pages made of static text plus REAL, editable AcroForm fields (text boxes and
// checkboxes) pre-filled with the user's data. The origin is tracked from the
// top of the page (this.y decreases as content is added).

const LETTER: [number, number] = [612, 792];
const BLACK = rgb(0, 0, 0);
const FIELD_BG = rgb(0.96, 0.97, 1); // faint tint so fields are visible/fillable
const FIELD_BORDER = rgb(0.55, 0.6, 0.7);

export class PdfBuilder {
  doc!: PDFDocument;
  form!: PDFForm;
  font!: PDFFont;
  bold!: PDFFont;
  page!: PDFPage;

  readonly margin = 40;
  readonly pageWidth = LETTER[0];
  readonly pageHeight = LETTER[1];
  y = 0;
  private seq = 0;

  get left() {
    return this.margin;
  }
  get right() {
    return this.pageWidth - this.margin;
  }
  get contentWidth() {
    return this.pageWidth - this.margin * 2;
  }

  static async create(): Promise<PdfBuilder> {
    const b = new PdfBuilder();
    b.doc = await PDFDocument.create();
    b.doc.setTitle("Riverside Dissolution / Legal Separation / Nullity Packet");
    b.form = b.doc.getForm();
    b.font = await b.doc.embedFont(StandardFonts.Helvetica);
    b.bold = await b.doc.embedFont(StandardFonts.HelveticaBold);
    b.newPage();
    return b;
  }

  /** Draw additional pages + editable fields into an EXISTING document (e.g. to
   *  append the Riverside local forms onto the filled official templates). */
  static async attach(doc: PDFDocument): Promise<PdfBuilder> {
    const b = new PdfBuilder();
    b.doc = doc;
    b.form = doc.getForm();
    b.font = await doc.embedFont(StandardFonts.Helvetica);
    b.bold = await doc.embedFont(StandardFonts.HelveticaBold);
    b.newPage();
    return b;
  }

  private uid(): string {
    this.seq += 1;
    return `f${this.seq}`;
  }

  newPage(): void {
    this.page = this.doc.addPage(LETTER);
    this.y = this.pageHeight - this.margin;
  }

  /** Ensure at least `h` vertical points remain; otherwise start a new page. */
  need(h: number): void {
    if (this.y - h < this.margin) this.newPage();
  }

  space(h: number): void {
    this.y -= h;
  }

  // --- Low-level primitives (absolute placement; good for tables) -----------

  drawText(
    x: number,
    yBaseline: number,
    text: string,
    opts: { size?: number; bold?: boolean } = {},
  ): void {
    const size = opts.size ?? 9;
    this.page.drawText(text ?? "", {
      x,
      y: yBaseline,
      size,
      font: opts.bold ? this.bold : this.font,
      color: BLACK,
    });
  }

  /** Add an editable text field with its TOP-LEFT at (x, yTop). */
  addTextField(
    x: number,
    yTop: number,
    width: number,
    height: number,
    value: string,
    opts: { multiline?: boolean; size?: number } = {},
  ): PDFTextField {
    const tf = this.form.createTextField(this.uid());
    if (opts.multiline) tf.enableMultiline();
    tf.addToPage(this.page, {
      x,
      y: yTop - height,
      width,
      height,
      font: this.font,
      textColor: BLACK,
      backgroundColor: FIELD_BG,
      borderColor: FIELD_BORDER,
      borderWidth: 0.5,
    });
    // setFontSize requires the /DA entry created by addToPage.
    tf.setFontSize(opts.size ?? 9);
    if (value) tf.setText(value);
    return tf;
  }

  /** Add an editable checkbox with its TOP-LEFT at (x, yTop). */
  addCheckbox(x: number, yTop: number, size: number, checked: boolean): void {
    const cb = this.form.createCheckBox(this.uid());
    cb.addToPage(this.page, {
      x,
      y: yTop - size,
      width: size,
      height: size,
      borderColor: BLACK,
      borderWidth: 0.75,
      backgroundColor: rgb(1, 1, 1),
    });
    if (checked) cb.check();
    else cb.uncheck();
  }

  // --- Text helpers ---------------------------------------------------------

  private wrap(text: string, size: number, maxWidth: number, bold = false): string[] {
    const font = bold ? this.bold : this.font;
    const words = (text ?? "").split(/\s+/);
    const lines: string[] = [];
    let line = "";
    for (const word of words) {
      const attempt = line ? `${line} ${word}` : word;
      if (font.widthOfTextAtSize(attempt, size) > maxWidth && line) {
        lines.push(line);
        line = word;
      } else {
        line = attempt;
      }
    }
    if (line) lines.push(line);
    return lines.length ? lines : [""];
  }

  /** Centered/left title block with the form number on the right. */
  title(formNo: string, title: string, subtitle?: string): void {
    this.need(46);
    this.drawText(this.right - this.bold.widthOfTextAtSize(formNo, 11), this.y - 10, formNo, {
      size: 11,
      bold: true,
    });
    const tW = this.bold.widthOfTextAtSize(title, 13);
    this.drawText(this.pageWidth / 2 - tW / 2, this.y - 12, title, { size: 13, bold: true });
    this.y -= 26;
    if (subtitle) {
      const sW = this.font.widthOfTextAtSize(subtitle, 9);
      this.drawText(this.pageWidth / 2 - sW / 2, this.y - 9, subtitle, { size: 9 });
      this.y -= 16;
    }
  }

  sectionHeading(text: string): void {
    this.need(20);
    this.y -= 6;
    this.drawText(this.left, this.y - 10, text, { size: 10, bold: true });
    this.y -= 15;
  }

  paragraph(text: string, opts: { size?: number; bold?: boolean } = {}): void {
    const size = opts.size ?? 8.5;
    const lines = this.wrap(text, size, this.contentWidth, opts.bold);
    const lh = size + 3;
    for (const line of lines) {
      this.need(lh);
      this.drawText(this.left, this.y - size, line, { size, bold: opts.bold });
      this.y -= lh;
    }
  }

  // --- High-level field rows ------------------------------------------------

  /** Inline "Label: [ editable field ]" row. */
  field(
    label: string,
    value: string,
    opts: { labelWidth?: number; height?: number; multiline?: boolean; width?: number } = {},
  ): void {
    const height = opts.height ?? (opts.multiline ? 30 : 14);
    const labelWidth = opts.labelWidth ?? 120;
    this.need(height + 4);
    if (label) this.drawText(this.left, this.y - 10, label, { size: 8.5 });
    const x = this.left + labelWidth;
    const width = opts.width ?? this.right - x;
    this.addTextField(x, this.y, width, height, value, { multiline: opts.multiline });
    this.y -= height + 5;
  }

  /** A label on one line with a full-width field beneath it. */
  fieldStacked(label: string, value: string, opts: { height?: number; multiline?: boolean } = {}): void {
    const height = opts.height ?? (opts.multiline ? 34 : 14);
    this.need(height + 16);
    this.drawText(this.left, this.y - 9, label, { size: 8.5 });
    this.y -= 13;
    this.addTextField(this.left, this.y, this.contentWidth, height, value, { multiline: opts.multiline });
    this.y -= height + 5;
  }

  /** A single checkbox followed by a wrapped label. */
  checkbox(label: string, checked: boolean, opts: { indent?: number } = {}): void {
    const indent = opts.indent ?? 0;
    const size = 9;
    const x = this.left + indent;
    const textX = x + size + 5;
    const lines = this.wrap(label, 8.5, this.right - textX);
    const lh = 11.5;
    const blockH = Math.max(size, lines.length * lh);
    this.need(blockH + 3);
    this.addCheckbox(x, this.y, size, checked);
    lines.forEach((line, i) => {
      this.drawText(textX, this.y - 8 - i * lh, line, { size: 8.5 });
    });
    this.y -= blockH + 3;
  }

  /** Several checkboxes laid out on a single row (each short label). */
  checkboxRow(items: Array<{ label: string; checked: boolean }>): void {
    const size = 9;
    const gap = 6;
    this.need(size + 6);
    let x = this.left;
    const yTop = this.y;
    for (const item of items) {
      const labelW = this.font.widthOfTextAtSize(item.label, 8.5);
      const cellW = size + 4 + labelW + gap * 2;
      if (x + cellW > this.right) {
        // wrap to next line
        this.y -= size + 6;
        x = this.left;
      }
      this.addCheckbox(x, this.y, size, item.checked);
      this.drawText(x + size + 4, this.y - 8, item.label, { size: 8.5 });
      x += cellW;
    }
    // if we wrapped, yTop already advanced via this.y; align final decrement
    this.y = Math.min(this.y, yTop) - (size + 6);
  }

  rule(): void {
    this.need(6);
    this.page.drawLine({
      start: { x: this.left, y: this.y - 2 },
      end: { x: this.right, y: this.y - 2 },
      thickness: 0.5,
      color: rgb(0.7, 0.7, 0.7),
    });
    this.y -= 8;
  }

  /** Signature block: an editable name field, a date field, and the declaration. */
  signature(name: string, date: string, role: string, declaration = true): void {
    this.need(60);
    this.y -= 6;
    if (declaration) {
      this.paragraph(
        "I declare under penalty of perjury under the laws of the State of California that the foregoing is true and correct.",
        { size: 8.5 },
      );
    }
    this.field("Date:", date, { labelWidth: 40, width: 150 });
    this.drawText(this.left, this.y - 9, "Type or print name:", { size: 8.5 });
    this.addTextField(this.left + 105, this.y, 230, 14, name);
    this.y -= 20;
    this.drawText(this.left, this.y - 9, `Signature (${role}):`, { size: 8.5 });
    this.addTextField(this.left + 105, this.y, 230, 16, name);
    this.y -= 22;
  }

  async save(): Promise<Uint8Array> {
    // Render field values using our embedded font.
    this.form.updateFieldAppearances(this.font);
    return this.doc.save();
  }
}
