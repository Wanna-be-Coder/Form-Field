// Mirrors lib/pdf/generatePacketPdf.ts but reads the bundled template from disk
// (Node has no fetch to /public), fills it, appends the RI forms, and writes a
// demo file. Verifies values + editable field count.
import { readFileSync, writeFileSync } from "node:fs";
import { PDFDocument } from "pdf-lib";
import { sampleData } from "../lib/pdf/sampleData";
import { PdfBuilder } from "../lib/pdf/PdfBuilder";
import { fillFL100 } from "../lib/pdf/fill/fl100";
import { fillFL110 } from "../lib/pdf/fill/fl110";
import { fillFL105 } from "../lib/pdf/fill/fl105";
import { fillFL142 } from "../lib/pdf/fill/fl142";
import { fillFL150 } from "../lib/pdf/fill/fl150";
import { fillFL140 } from "../lib/pdf/fill/fl140";
import { fillFL115 } from "../lib/pdf/fill/fl115";
import { drawRIFL036 } from "../lib/pdf/forms/rifl036";
import { drawRIFL011 } from "../lib/pdf/forms/rifl011";

async function main() {
  const data = sampleData;
  const hasChildren = data.intake.hasMinorChildren;
  const tpl = hasChildren ? "packet-children.pdf" : "packet-no-children.pdf";
  const bytes = readFileSync(`public/form-templates/${tpl}`);
  const doc = await PDFDocument.load(bytes);
  const form = doc.getForm();

  fillFL100(form, data);
  fillFL110(form, data);
  if (hasChildren) fillFL105(form, data);
  fillFL142(form, data);
  fillFL150(form, data);
  fillFL140(form, data);
  fillFL115(form, data);

  const builder = await PdfBuilder.attach(doc);
  drawRIFL036(builder, data);
  builder.newPage();
  drawRIFL011(builder, data);

  const out = await doc.save();
  writeFileSync("public/demo-official-filled-packet.pdf", out);

  const re = await PDFDocument.load(out);
  const fields = re.getForm().getFields();
  const texts = fields.filter((f) => f.constructor.name === "PDFTextField");
  const filled = texts.filter((f) => {
    try { return !!(f as unknown as { getText(): string }).getText(); } catch { return false; }
  }).length;
  const boxes = fields.filter((f) => f.constructor.name === "PDFCheckBox");
  const checked = boxes.filter((f) => {
    try { return (f as unknown as { isChecked(): boolean }).isChecked(); } catch { return false; }
  }).length;

  console.log("wrote public/demo-official-filled-packet.pdf");
  console.log("pages:", re.getPageCount());
  console.log("editable fields:", fields.length, "| text pre-filled:", filled, "| checkboxes checked:", checked);
}

main().catch((e) => { console.error(e); process.exit(1); });
