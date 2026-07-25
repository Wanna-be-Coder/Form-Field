import type { PDFForm } from "pdf-lib";
import type { PacketFormData } from "@/lib/types/packet.types";
import { setText } from "./util";
import { petitionerName, respondentName, courtAddressLine, petitionerAddress } from "./helpers";

// FL-110 Summons uses opaque, position-derived field names (no semantic labels
// and no court checkboxes — item 1 is a free text box). Mapped by rectangle
// position on page 1 (see form-templates/fl110.fields.json).
const P = "topmostSubform[0].Page1[0].";

export function fillFL110(form: PDFForm, data: PacketFormData): void {
  const { intake } = data;
  const p = petitionerName(intake);
  const r = respondentName(intake);

  // Notice to Respondent (name) — top box.
  setText(form, P + "TextField2[0]", r);
  // Petitioner's name is — box below.
  setText(form, P + "TextField2[1]", p);
  // Case number (upper-right).
  setText(form, P + "T33[0]", intake.caseNumber);
  // Item 1 — name and address of the court.
  setText(form, P + "T89[0]", `Superior Court of California, County of Riverside — ${courtAddressLine(intake)}`);
  // Item 2 — petitioner (self-represented) name, address, and telephone.
  const contact = [p, petitionerAddress(intake), intake.petitionerPhone ? `Tel: ${intake.petitionerPhone}` : ""]
    .filter(Boolean)
    .join(", ");
  setText(form, P + "OtherSpecify_tf[0]", contact);
}
