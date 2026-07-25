import type { PacketFormData } from "../../types/packet.types";
import { COURTHOUSES } from "../../constants/packet.constants";
import { petitionerName, respondentName, toCourtDate } from "../../utils/packet-helpers";
import { PdfBuilder } from "../PdfBuilder";

export function drawFL140(b: PdfBuilder, data: PacketFormData): void {
  const { intake, fl140 } = data;
  const p = petitionerName(intake);
  const r = respondentName(intake);
  const court = intake.courthouse ? COURTHOUSES[intake.courthouse] : undefined;
  const addr = [
    intake.petitionerStreet,
    [intake.petitionerCity, intake.petitionerState, intake.petitionerZip].filter(Boolean).join(", "),
  ]
    .filter(Boolean)
    .join(", ");

  b.title("FL-140", "Declaration of Disclosure");

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

  b.checkboxRow([
    { label: "Petitioner's", checked: fl140.whoseDisclosure === "petitioner" },
    { label: "Respondent's", checked: fl140.whoseDisclosure === "respondent" },
    { label: "Preliminary", checked: fl140.disclosureStage === "preliminary" },
    { label: "Final", checked: fl140.disclosureStage === "final" },
  ]);

  b.paragraph("DO NOT FILE DECLARATIONS OF DISCLOSURE OR FINANCIAL ATTACHMENTS WITH THE COURT", {
    bold: true,
  });
  b.paragraph(
    "Declarations of disclosure and the financial forms attached to them are served on the other party — they are not filed with the court. Only a Proof of Service of Declaration of Disclosure (form FL-141) is filed to show that the required documents were exchanged.",
  );

  b.paragraph("Attached are the following:", { bold: true });
  b.checkbox("1. A completed Schedule of Assets and Debts (form FL-142).", fl140.attachSchedule);
  b.checkbox("2. A completed Income and Expense Declaration (form FL-150).", fl140.attachIncomeExpense);
  b.checkbox(
    "3. All tax returns filed by the party in the two years before serving the disclosure documents.",
    fl140.attachTaxReturns,
  );
  b.checkbox(
    "4. A statement of all material facts and information regarding valuation of all community-property assets.",
    fl140.attachMaterialFactsAssets,
  );
  b.checkbox(
    "5. A statement of all material facts and information regarding obligations for which the community is liable.",
    fl140.attachMaterialFactsObligations,
  );
  b.checkbox(
    "6. An accurate and complete written disclosure of any investment/business/income-producing opportunity since the date of separation.",
    fl140.attachInvestmentOpportunity,
  );

  b.signature(p, toCourtDate(fl140.date), "Signature");
}
