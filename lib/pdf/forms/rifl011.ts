import type { PacketFormData } from "../../types/packet.types";
import { COURTHOUSES } from "../../constants/packet.constants";
import { petitionerName, respondentName, toCourtDate } from "../../utils/packet-helpers";
import { PdfBuilder } from "../PdfBuilder";

export function drawRIFL011(b: PdfBuilder, data: PacketFormData): void {
  const { intake, rifl011 } = data;
  const p = petitionerName(intake);
  const r = respondentName(intake);
  const court = intake.courthouse ? COURTHOUSES[intake.courthouse] : undefined;
  const addr = [
    intake.petitionerStreet,
    [intake.petitionerCity, intake.petitionerState, intake.petitionerZip].filter(Boolean).join(", "),
  ]
    .filter(Boolean)
    .join(", ");

  b.title("RI-FL011", "Confidential Contact Information");

  b.paragraph("CONFIDENTIAL", { bold: true });

  b.field("Party without attorney (name):", p, { labelWidth: 165 });
  b.field("Address:", addr, { labelWidth: 165 });
  b.field("Telephone:", intake.petitionerPhone, { labelWidth: 165 });
  b.field("E-mail:", intake.petitionerEmail, { labelWidth: 165 });
  b.field("Attorney for:", "Self-Represented", { labelWidth: 165, width: 160 });
  b.field(
    "Superior Court of California, County of Riverside:",
    court ? `${court.address}, ${court.cityStateZip}` : "",
    { labelWidth: 260 },
  );
  b.field("Petitioner:", p, { labelWidth: 165 });
  b.field("Respondent:", r, { labelWidth: 165 });
  b.field("Case Number:", intake.caseNumber, { labelWidth: 165, width: 200 });

  b.paragraph(
    "If you would like to receive electronic self-help information about family law services from the court please complete the following:",
  );
  b.checkbox(
    "I agree to receive self-help information from the court via email. The email address I want information sent to is:",
    rifl011.agreeEmail,
  );
  b.field("Email address:", rifl011.email, { labelWidth: 120 });

  b.paragraph(
    "The court values your privacy. At no time will the court make your email address available to any third party.",
  );

  b.paragraph(
    "If you would like to stop receiving electronic self-help information from the court please complete the following:",
  );
  b.checkbox("I no longer wish to receive self-help information from the court.", rifl011.stopEmail);

  b.paragraph(
    "Please Note: As a party to this action, if you appear without an attorney, you are required to inform the court of any changes in your mailing address and phone number for so long as your case remains active.",
  );

  b.signature(p, toCourtDate(rifl011.date), "Signature");
}
