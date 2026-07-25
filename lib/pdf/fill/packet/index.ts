import type { PDFForm } from "pdf-lib";
import type { PacketFormData } from "@/lib/types/packet.types";
import { fillIntake } from "./intake";
import { fillLocalForms } from "./local";
import { fillFL100Body } from "./fl100";
import { fillFL142Body } from "./fl142";
import { fillFL105Body } from "./fl105";
import { fillFL150Body } from "./fl150";
import { fillFL140Body } from "./fl140";
import { fillFL115Body } from "./fl115";

// Fill the entire Riverside packet (one flat AcroForm). The intake cover fills
// the fields shared across every form; each fill*Body adds its form's unique
// fields. All setters are best-effort (never throw on a missing field).
export function fillPacket(form: PDFForm, data: PacketFormData): void {
  fillIntake(form, data);
  fillFL100Body(form, data);
  fillFL142Body(form, data);
  fillFL150Body(form, data);
  fillFL140Body(form, data);
  fillFL115Body(form, data);
  if (data.intake.hasMinorChildren) fillFL105Body(form, data);
  fillLocalForms(form, data);
}
