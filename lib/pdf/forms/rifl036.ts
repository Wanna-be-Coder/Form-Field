import type { PacketFormData } from "../../types/packet.types";
import { COURTHOUSES } from "../../constants/packet.constants";
import { petitionerName, respondentName, toCourtDate } from "../../utils/packet-helpers";
import { PdfBuilder } from "../PdfBuilder";

const COURT_ORDER = ["blythe", "riverside", "indio", "menifee"] as const;

export function drawRIFL036(b: PdfBuilder, data: PacketFormData): void {
  const { intake, rifl036 } = data;
  const p = petitionerName(intake);
  const r = respondentName(intake);
  const addr = [
    intake.petitionerStreet,
    [intake.petitionerCity, intake.petitionerState, intake.petitionerZip].filter(Boolean).join(", "),
  ]
    .filter(Boolean)
    .join(", ");

  b.title("RI-FL036", "Declaration of Residence");

  b.field("Petitioner:", p, { labelWidth: 165 });
  b.field("Respondent:", r, { labelWidth: 165 });
  b.field("Case Number:", intake.caseNumber, { labelWidth: 165, width: 200 });

  b.field("Party without attorney (name):", p, { labelWidth: 165 });
  b.field("Address:", addr, { labelWidth: 165 });
  b.field("Telephone:", intake.petitionerPhone, { labelWidth: 165 });
  b.field("E-mail:", intake.petitionerEmail, { labelWidth: 165 });
  b.field("Attorney for:", "Self-Represented", { labelWidth: 165, width: 160 });

  b.paragraph("The undersigned certifies that this case should be tried or heard in the:");

  COURT_ORDER.forEach((key) => {
    b.checkbox(`${COURTHOUSES[key].name} Court`, data.intake.courthouse === key);
  });

  b.paragraph("for the following reasons:");

  b.checkbox(
    "The party's primary residence is located within the geographical area. The city and zip code is:",
    rifl036.reason === "geographic",
  );
  b.field("City:", rifl036.city, { labelWidth: 60, width: 200 });
  b.field("Zip code:", rifl036.zip, { labelWidth: 60, width: 100 });

  b.checkbox("Other:", rifl036.reason === "other");
  if (rifl036.reason === "other") {
    b.fieldStacked("Other reason:", rifl036.otherReason, { multiline: true });
  }

  b.signature(p, toCourtDate(rifl036.date), "Signature");
}
