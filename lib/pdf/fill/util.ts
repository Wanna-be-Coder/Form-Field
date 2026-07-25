import type { PDFForm } from "pdf-lib";

// Safe setters: never throw if a field is missing or is a different type than
// expected — filling is best-effort across ~845 official form fields.

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
