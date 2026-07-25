import type { PacketFormData, CourthouseKey } from "../../types/packet.types";
import { COURTHOUSES } from "../../constants/packet.constants";
import { fullName, petitionerName, respondentName, toCourtDate } from "../../utils/packet-helpers";
import { PdfBuilder } from "../PdfBuilder";

export function drawIntake(b: PdfBuilder, data: PacketFormData): void {
  const { intake } = data;

  b.title("", "Superior Court of California, County of Riverside", "Dissolution, Legal Separation, or Nullity");

  b.sectionHeading("Your Information");
  b.field("Name (First, Middle, Last):", petitionerName(intake), { labelWidth: 150 });
  b.field("Street Address:", intake.petitionerStreet, { labelWidth: 150 });
  b.field(
    "City, State, Zip Code:",
    [intake.petitionerCity, intake.petitionerState, intake.petitionerZip].filter(Boolean).join(", "),
    { labelWidth: 150 },
  );
  b.field("Telephone Number:", intake.petitionerPhone, { labelWidth: 150 });

  b.sectionHeading("Your Spouse / Partner's Name");
  b.field("Name (First, Middle, Last):", respondentName(intake), { labelWidth: 150 });

  b.sectionHeading("Type of Case");
  b.checkboxRow([
    { label: "Dissolution", checked: intake.caseType === "dissolution" },
    { label: "Legal Separation", checked: intake.caseType === "legalSeparation" },
    { label: "Nullity", checked: intake.caseType === "nullity" },
  ]);

  b.sectionHeading("Date of Marriage");
  b.field("Date of Marriage:", toCourtDate(intake.marriageDate), { labelWidth: 120, width: 150 });

  b.sectionHeading("List minor children of the relationship");
  b.checkboxRow([
    { label: "No", checked: !intake.hasMinorChildren },
    { label: "Yes", checked: intake.hasMinorChildren },
  ]);
  b.field("How many?", intake.hasMinorChildren ? intake.numberOfChildren : "", { labelWidth: 70, width: 60 });
  b.paragraph(
    "**If you have more than two minor children of this marriage, you must also complete a FL-105(a) for the additional children.",
    { size: 8 },
  );

  if (intake.hasMinorChildren) {
    intake.children.forEach((child, i) => {
      b.space(3);
      b.paragraph(`Child ${i + 1}`, { size: 8.5, bold: true });
      b.field("Name (First, Middle, Last):", fullName(child.firstName, child.middleName, child.lastName), {
        labelWidth: 150,
      });
      b.field("Place of Birth (City / State):", child.placeOfBirth, { labelWidth: 150 });
      b.field("Date of Birth:", toCourtDate(child.dateOfBirth), { labelWidth: 150, width: 110 });
      b.field("Age:", child.age, { labelWidth: 150, width: 60 });
    });
  }

  b.sectionHeading("Where is your case filed?");
  (Object.keys(COURTHOUSES) as CourthouseKey[]).forEach((key) => {
    b.checkbox(
      `${COURTHOUSES[key].address}, ${COURTHOUSES[key].cityStateZip}`,
      intake.courthouse === key,
    );
  });

  b.sectionHeading("Filing Options");
  b.checkbox("I plan to print the documents and submit them in person.", intake.filingOption === "inPerson");
  b.checkbox(
    "I plan to electronically sign my documents and submit my paperwork online.",
    intake.filingOption === "online",
  );
  if (intake.filingOption === "online") {
    b.paragraph(
      "By checking this box, I declare under penalty of perjury under the laws of the State of California that all the information provided for this filing is true and correct. Type your name to serve as your electronic signature to the oath above.",
      { size: 8 },
    );
    b.field("Electronic signature:", intake.electronicSignatureName, { labelWidth: 120 });
  }

  b.sectionHeading("Case Number");
  b.field("Case Number:", intake.caseNumber, { labelWidth: 120, width: 200 });

  b.sectionHeading("Today's Date");
  b.field("Today's Date:", toCourtDate(intake.todaysDate), { labelWidth: 120, width: 150 });
}
