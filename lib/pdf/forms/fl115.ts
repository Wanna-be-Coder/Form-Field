import type { PacketFormData } from "../../types/packet.types";
import { COURTHOUSES } from "../../constants/packet.constants";
import { petitionerName, respondentName, toCourtDate } from "../../utils/packet-helpers";
import { PdfBuilder } from "../PdfBuilder";

export function drawFL115(b: PdfBuilder, data: PacketFormData): void {
  const { intake, fl115 } = data;
  const p = petitionerName(intake);
  const r = respondentName(intake);
  const court = intake.courthouse ? COURTHOUSES[intake.courthouse] : undefined;
  const addr = [
    intake.petitionerStreet,
    [intake.petitionerCity, intake.petitionerState, intake.petitionerZip].filter(Boolean).join(", "),
  ]
    .filter(Boolean)
    .join(", ");

  b.title("FL-115", "Proof of Service of Summons");

  b.field("Petitioner:", p, { labelWidth: 165 });
  b.field("Respondent:", r, { labelWidth: 165 });
  b.field("Case Number:", intake.caseNumber, { labelWidth: 165, width: 200 });
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

  b.sectionHeading("1. Copies Served");
  b.paragraph(
    "At the time of service I was at least 18 years of age and not a party to this action. I served the respondent with copies of:",
  );
  b.checkbox(
    "a. Family Law: Petition—Marriage/Domestic Partnership (FL-100), Summons (FL-110), and blank Response (FL-120)",
    true,
  );
  b.paragraph("and:", { size: 8.5 });
  b.checkbox("Completed and blank UCCJEA (FL-105)", true);
  b.checkbox("Declaration of Disclosure (FL-140)", true);
  b.checkbox("Schedule of Assets and Debts (FL-142)", true);
  b.checkbox("Income and Expense Declaration (FL-150)", true);

  b.sectionHeading("2. Address Where Served");
  b.fieldStacked("Address where respondent was served:", fl115.addressServed, { multiline: true });

  b.sectionHeading("3. Method of Service");
  b.paragraph("I served the respondent by the following means:");
  b.checkbox(
    "a. Personal service — I personally delivered the copies to the respondent.",
    fl115.serviceMethod === "personal",
  );
  b.checkbox(
    "b. Substituted service — left with a competent adult and mailed a copy.",
    fl115.serviceMethod === "substituted",
  );
  b.checkbox("c. Mail and acknowledgment service.", fl115.serviceMethod === "mail");
  b.field("Date served:", toCourtDate(fl115.serviceDate), { labelWidth: 100, width: 130 });
  b.field("Time served:", fl115.serviceTime, { labelWidth: 100, width: 130 });

  b.newPage();

  b.sectionHeading("4. Person who served papers");
  b.field("Name:", fl115.serverName, { labelWidth: 100 });
  b.field("Address:", fl115.serverAddress, { labelWidth: 100 });
  b.field("Telephone:", fl115.serverPhone, { labelWidth: 100 });
  b.checkbox("Registered California process server", fl115.serverIsRegistered);
  if (fl115.serverIsRegistered) {
    b.field("Registration no.:", fl115.serverRegistrationNo, { labelWidth: 100 });
    b.field("County:", fl115.serverCounty, { labelWidth: 100 });
    b.field("Fee for service:", fl115.serverFee, { labelWidth: 100 });
  }

  b.sectionHeading("5. Declaration");
  b.checkbox(
    "I declare under penalty of perjury under the laws of the State of California that the foregoing is true and correct.",
    true,
  );

  b.signature(
    data.fl115.serverName,
    toCourtDate(data.fl115.date),
    "Signature of Person Who Served Papers",
    false,
  );
}
