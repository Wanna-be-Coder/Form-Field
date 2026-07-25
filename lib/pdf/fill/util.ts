import { PDFForm, PDFName } from "pdf-lib";

// Safe setters: never throw if a field is missing or is a different type than
// expected — filling is best-effort across the packet's ~397 fields.

// Select one option of a multi-widget /Btn "choice" field (the packet's
// cross-page radios like TypeofCase). pdf-lib exposes these as checkboxes, so we
// set /V on the field and /AS on each widget by hand (verified approach).
export function selectChoice(form: PDFForm, name: string, choice: string): void {
  if (!choice) return;
  try {
    const acro = form.getField(name).acroField;
    acro.dict.set(PDFName.of("V"), PDFName.of(choice));
    for (const w of acro.getWidgets()) {
      let on: string | null = null;
      try {
        const ov = w.getOnValue();
        on = ov ? ov.asString() : null;
      } catch {
        on = null;
      }
      w.dict.set(PDFName.of("AS"), PDFName.of(on === `/${choice}` ? choice : "Off"));
    }
  } catch {
    // field absent — skip
  }
}

export function setText(form: PDFForm, name: string, value: unknown): void {
  if (value === undefined || value === null || value === "") return;
  try {
    form.getTextField(name).setText(String(value));
  } catch {
    // field absent or not a text field — skip
  }
}

export function check(form: PDFForm, name: string, on: boolean = true): void {
  if (!on) return;
  try {
    form.getCheckBox(name).check();
  } catch {
    // field absent or not a checkbox — skip
  }
}
