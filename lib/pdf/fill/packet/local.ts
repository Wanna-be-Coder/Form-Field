import type { PDFForm } from "pdf-lib";
import type { PacketFormData } from "@/lib/types/packet.types";
import { setText, check } from "../util";
import { petitionerName } from "../helpers";

// The two Riverside LOCAL forms as they appear in the packet:
//   RI-FL036 Declaration of Residence   (packet page index 11)
//   RI-FL011 Confidential Contact Info  (packet page index 12)
// Court selection + party/attorney header are shared fields (filled by intake).
export function fillLocalForms(form: PDFForm, data: PacketFormData): void {
  const { rifl036, rifl011 } = data;

  // --- RI-FL036 Declaration of Residence ---
  if (rifl036.reason === "geographic") {
    check(form, "CheckBox17b"); // "primary residence is within the geographical area"
    setText(form, "Cityofprimaryresidence", rifl036.city);
    setText(form, "Zipcodeofprimaryresidence", rifl036.zip);
  } else if (rifl036.reason === "other") {
    check(form, "Checkbox10"); // "Other:"
    setText(form, "Attorneyorpartywithout attorney", rifl036.otherReason);
  }

  // --- RI-FL011 Confidential Contact Information ---
  if (rifl011.agreeEmail) {
    check(form, "check box email");
    setText(form, "Emailaddress1", rifl011.email);
  }
  if (rifl011.stopEmail) check(form, "Checkbox no help");
  setText(form, "declarant", petitionerName(data.intake));
}
