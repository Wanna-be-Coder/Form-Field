import type { PDFForm } from "pdf-lib";
import type { PacketFormData } from "@/lib/types/packet.types";
import { setText, check } from "../util";

// FL-142 Schedule of Assets and Debts — packet pages 7/8/9/10 (0-based).
//
// This packet is a heavily flattened AcroForm. The item rows for assets 1-16
// (page 7: items 1-3; page 8: items 4-10; page 9: items 11-16, plus item 17's
// continuation and the item 18 totals) and debts 19-24 (page 10) are drawn on
// the page and even carry field-like names in the raw PDF (e.g. "Text8.0",
// "Check Box13.0", "Text15.0" ... "Text35.5"), but none of those widgets are
// registered in the AcroForm's /Fields array — they're orphaned annotations
// left over from the merge, not real interactive fields. Confirmed directly
// against pdf-lib: form.getFields() returns exactly the 397 fields in
// packet.labeled.json/packet.fields.json, and none of the dotted row-widget
// names are among them, so form.getTextField()/getCheckBox() can never reach
// them. There is therefore no reachable field for any individual asset entry,
// debt entry, or the running totals (items 18/26) in this template — every
// key in data.fl142.assets and data.fl142.debts currently has nowhere to go
// and is intentionally left unfilled rather than referencing invented names.
//
// The only FL-142 body content actually wired into this packet's AcroForm is
// the item 27 continuation-pages block on page 10 ("Check Box37" / "Text2").
// ("whoseSchedule", "caseNumber", and the signature/date are header/identity
// fields handled by the shared intake fill, not here.)
export function fillFL142Body(form: PDFForm, data: PacketFormData): void {
  const { continuationPages } = data.fl142;

  if (continuationPages) {
    setText(form, "Text2", continuationPages);
    const trimmed = String(continuationPages).trim();
    if (trimmed !== "" && trimmed !== "0") {
      check(form, "Check Box37");
    }
  }
}
