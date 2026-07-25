import type { PacketFormData, CourthouseKey } from "../../types/packet.types";
import { COURTHOUSES } from "../../constants/packet.constants";
import { petitionerName, respondentName } from "../../utils/packet-helpers";
import { PdfBuilder } from "../PdfBuilder";
import { FL110_RESTRAINING_ORDERS } from "../../../components/packet-form/steps/FL110Step";

export function drawFL110(b: PdfBuilder, data: PacketFormData): void {
  const { intake, fl110 } = data;
  const p = petitionerName(intake);
  const r = respondentName(intake);
  const addr = [
    intake.petitionerStreet,
    [intake.petitionerCity, intake.petitionerState, intake.petitionerZip].filter(Boolean).join(", "),
  ]
    .filter(Boolean)
    .join(", ");

  b.title("FL-110", "Summons (Family Law)");

  b.field("Notice to Respondent (name):", r, { labelWidth: 165 });
  b.paragraph("You have been sued. Read the information below and on the next page.", { bold: true });
  b.field("Petitioner's name is:", p, { labelWidth: 165 });

  b.paragraph(
    "You have 30 calendar days after this Summons and Petition are served on you to file a Response (form FL-120) at the court and have a copy served on the petitioner. A letter, phone call, or court appearance will not protect you.",
  );
  b.paragraph(
    "If you do not file your Response on time, the court may make orders affecting your marriage or domestic partnership, your property, and custody of your children. You may be ordered to pay support and attorney fees and costs.",
  );
  b.paragraph(
    "For legal advice, contact a lawyer immediately. You can get information about finding a lawyer at the California Courts Online Self-Help Center, the county bar association, or a legal aid office.",
  );
  b.paragraph(
    "NOTICE—RESTRAINING ORDERS ARE ON PAGE 2: These restraining orders are effective against both spouses or domestic partners until the petition is dismissed, a judgment is entered, or the court makes further orders. They are enforceable anywhere in California by any law enforcement officer who has received or seen a copy of them.",
    { bold: true },
  );
  b.paragraph(
    "FEE WAIVER: If you cannot pay the filing fee, ask the clerk for a fee waiver form. The court may order you to pay back all or part of the fee and costs the court waived for you or the other party.",
  );

  b.sectionHeading("1. The name and address of the court are:");
  (Object.keys(COURTHOUSES) as CourthouseKey[]).forEach((key) => {
    b.checkbox(
      `${COURTHOUSES[key].address}, ${COURTHOUSES[key].cityStateZip}`,
      intake.courthouse === key,
    );
  });

  b.sectionHeading("2. The name, address, and telephone number of the petitioner (self-represented) are:");
  b.field("Name:", p, { labelWidth: 100 });
  b.field("Address:", addr, { labelWidth: 100 });
  b.field("Telephone:", intake.petitionerPhone, { labelWidth: 100 });

  b.field("Case Number:", intake.caseNumber, { width: 200 });

  b.newPage();
  b.title("FL-110", "Standard Family Law Restraining Orders");
  b.paragraph("Starting immediately, you and your spouse or domestic partner are restrained from:");
  FL110_RESTRAINING_ORDERS.forEach((item, i) => {
    b.paragraph(`${i + 1}. ${item}`);
  });
  b.paragraph(
    "You must notify each other of any proposed extraordinary expenditures at least five business days before incurring them and account to the court for all extraordinary expenditures made after these orders are effective.",
  );
  b.paragraph("WARNING—IMPORTANT INFORMATION", { bold: true });
  b.paragraph(
    "California law provides that, for purposes of division of property upon dissolution of a marriage or domestic partnership or upon legal separation, property acquired by the parties during the marriage or domestic partnership in joint form is presumed to be community property. If either party to this action should die before the jointly held community property is divided, the language in the deed with which the parties took title does not necessarily determine the character of the property.",
  );

  b.checkbox(
    "I have read the Standard Family Law Restraining Orders (page 2) and understand they apply when the Petition is filed.",
    fl110.acknowledgeRestraining,
  );
}
