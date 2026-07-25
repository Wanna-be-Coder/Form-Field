import type { PacketFormData } from "../../types/packet.types";
import { CASE_TYPE_LABELS, COURTHOUSES } from "../../constants/packet.constants";
import { fullName, petitionerName, respondentName, toCourtDate } from "../../utils/packet-helpers";
import { PdfBuilder } from "../PdfBuilder";

export function drawFL100(b: PdfBuilder, data: PacketFormData): void {
  const { intake, fl100 } = data;
  const p = petitionerName(intake);
  const r = respondentName(intake);
  const rel = intake.relationshipType === "marriage" ? "Marriage" : "Domestic Partnership";
  const court = intake.courthouse ? COURTHOUSES[intake.courthouse] : undefined;
  const addr = [
    intake.petitionerStreet,
    [intake.petitionerCity, intake.petitionerState, intake.petitionerZip].filter(Boolean).join(", "),
  ]
    .filter(Boolean)
    .join(", ");

  b.title("FL-100", "Petition — Marriage / Domestic Partnership");

  b.field("Party without attorney (name):", p, { labelWidth: 165 });
  b.field("Address:", addr, { labelWidth: 165 });
  b.field("Telephone:", intake.petitionerPhone, { labelWidth: 165 });
  b.field("E-mail:", intake.petitionerEmail, { labelWidth: 165 });
  b.field("Attorney for:", "Self-Represented", { labelWidth: 165, width: 160 });
  b.field("Superior Court of California, County of Riverside:", court ? `${court.address}, ${court.cityStateZip}` : "", { labelWidth: 260 });
  b.field("Petitioner:", p, { labelWidth: 165 });
  b.field("Respondent:", r, { labelWidth: 165 });
  b.field("Case Number:", intake.caseNumber, { labelWidth: 165, width: 200 });

  b.sectionHeading("Petition For");
  b.checkbox(`Dissolution (Divorce) of ${rel}`, intake.caseType === "dissolution");
  b.checkbox(`Legal Separation of ${rel}`, intake.caseType === "legalSeparation");
  b.checkbox(`Nullity of ${rel}`, intake.caseType === "nullity");
  b.checkbox("Amended", fl100.amended);

  b.sectionHeading("1. Legal Relationship (check all that apply)");
  b.checkbox("a. We are married.", fl100.legalRelationship.includes("married"));
  b.checkbox("b. We are domestic partners and our domestic partnership was established in California.", fl100.legalRelationship.includes("dpInCA"));
  b.checkbox("c. We are domestic partners and our domestic partnership was NOT established in California.", fl100.legalRelationship.includes("dpNotInCA"));

  b.sectionHeading("2. Residence Requirements (check all that apply)");
  b.checkbox(
    "a. A party has been a resident of this state for at least six months and of this county for at least three months immediately preceding the filing of this Petition.",
    fl100.residencyMet,
  );
  if (fl100.residencyMet) {
    b.checkboxRow([
      { label: "Petitioner", checked: fl100.residencyParty === "petitioner" },
      { label: "Respondent", checked: fl100.residencyParty === "respondent" },
    ]);
  }
  b.checkbox("b. Our domestic partnership was established in California.", fl100.residencyDpInCA);
  b.checkbox("c. We are the same sex, were married in California, but currently live in a jurisdiction that does not recognize, and will not dissolve, our marriage.", fl100.residencySameSex);
  if (fl100.residencySameSex) {
    b.field("Petitioner lives in:", fl100.petitionerLivesIn, { labelWidth: 130 });
    b.field("Respondent lives in:", fl100.respondentLivesIn, { labelWidth: 130 });
  }

  b.sectionHeading("3. Statistical Facts");
  b.field("Date of marriage:", toCourtDate(intake.marriageDate), { labelWidth: 130, width: 130 });
  b.field("Date of separation:", toCourtDate(fl100.dateOfSeparation), { labelWidth: 130, width: 130 });
  if (intake.relationshipType === "domesticPartnership") {
    b.field("Registration date of domestic partnership:", toCourtDate(fl100.dpRegistrationDate), { labelWidth: 250, width: 130 });
  }

  b.sectionHeading("4. Minor Children");
  b.checkbox("a. There are no minor children.", !intake.hasMinorChildren);
  b.checkbox("b. The minor children are:", intake.hasMinorChildren);
  if (intake.hasMinorChildren) {
    intake.children.forEach((c) => {
      b.field(
        "Child:",
        `${fullName(c.firstName, c.middleName, c.lastName)}  |  DOB ${toCourtDate(c.dateOfBirth)}  |  Age ${c.age}`,
        { labelWidth: 45 },
      );
    });
    b.checkbox("c. Children born before the marriage/partnership may be determined children of the relationship.", fl100.childBornBeforeMarriage);
    b.checkbox("d. A completed Declaration Under UCCJEA (FL-105) is attached.", fl100.uccjeaAttached);
    b.checkbox("e. Petitioner and Respondent signed a voluntary declaration of parentage or paternity.", fl100.voluntaryParentage);
  }

  b.sectionHeading("5. Legal Grounds");
  if (intake.caseType === "nullity") {
    b.paragraph("b. Nullity of void marriage or domestic partnership based on:", { size: 8.5 });
    b.checkboxRow([
      { label: "(1) incest", checked: fl100.groundsNullityVoid === "incest" },
      { label: "(2) bigamy", checked: fl100.groundsNullityVoid === "bigamy" },
    ]);
    b.paragraph("c. Nullity of voidable marriage or domestic partnership based on:", { size: 8.5 });
    b.checkbox("(1) petitioner's age at time of marriage/registration", fl100.groundsNullityVoidable === "age");
    b.checkbox("(2) prior existing marriage or domestic partnership", fl100.groundsNullityVoidable === "priorMarriage");
    b.checkbox("(3) unsound mind", fl100.groundsNullityVoidable === "unsoundMind");
    b.checkbox("(4) fraud", fl100.groundsNullityVoidable === "fraud");
    b.checkbox("(5) force", fl100.groundsNullityVoidable === "force");
    b.checkbox("(6) physical incapacity", fl100.groundsNullityVoidable === "physicalIncapacity");
  } else {
    b.paragraph(`a. ${CASE_TYPE_LABELS[intake.caseType]} of the ${rel.toLowerCase()} based on (check one):`, { size: 8.5 });
    b.checkboxRow([
      { label: "(1) irreconcilable differences", checked: fl100.groundsDivorceOrSeparation === "irreconcilable" },
      { label: "(2) permanent legal incapacity to make decisions", checked: fl100.groundsDivorceOrSeparation === "incapacity" },
    ]);
  }

  if (intake.hasMinorChildren) {
    b.sectionHeading("6. Child Custody & Visitation (Parenting Time)");
    const custody: Array<[string, string]> = [
      ["Legal custody of children to:", fl100.legalCustodyTo],
      ["Physical custody of children to:", fl100.physicalCustodyTo],
      ["Child visitation (parenting time) to:", fl100.visitationTo],
    ];
    custody.forEach(([label, value]) => {
      b.paragraph(label, { size: 8.5 });
      b.checkboxRow([
        { label: "Petitioner", checked: value === "petitioner" },
        { label: "Respondent", checked: value === "respondent" },
        { label: "Joint", checked: value === "joint" },
        { label: "Other", checked: value === "other" },
      ]);
    });

    b.sectionHeading("7. Child Support");
    b.paragraph(
      "If there are minor children, the court will make orders for support upon request and submission of financial forms (FL-150). An earnings assignment may be issued. Interest accrues on overdue amounts at the legal rate (currently 10%).",
      { size: 8 },
    );
    if (fl100.childSupportOther) b.fieldStacked("Other (specify):", fl100.childSupportOther, { multiline: true });
  }

  b.sectionHeading("8. Spousal or Domestic Partner Support");
  b.paragraph("a. Support payable to:", { size: 8.5 });
  b.checkboxRow([
    { label: "Petitioner", checked: fl100.spousalSupportTo === "petitioner" },
    { label: "Respondent", checked: fl100.spousalSupportTo === "respondent" },
  ]);
  b.paragraph("b. Terminate the court's ability to award support to:", { size: 8.5 });
  b.checkboxRow([
    { label: "Petitioner", checked: fl100.terminateSupportTo === "petitioner" },
    { label: "Respondent", checked: fl100.terminateSupportTo === "respondent" },
  ]);
  b.paragraph("c. Reserve for future determination support payable to:", { size: 8.5 });
  b.checkboxRow([
    { label: "Petitioner", checked: fl100.reserveSupportTo === "petitioner" },
    { label: "Respondent", checked: fl100.reserveSupportTo === "respondent" },
  ]);
  if (fl100.spousalSupportOther) b.fieldStacked("d. Other (specify):", fl100.spousalSupportOther, { multiline: true });

  b.sectionHeading("9. Separate Property");
  b.checkbox("a. There are no such assets or debts that I know of to be confirmed by the court.", fl100.separatePropertyNone);
  if (!fl100.separatePropertyNone) {
    b.fieldStacked("b. Confirm as separate property the following assets and debts:", fl100.separatePropertyList, { multiline: true });
  }

  b.sectionHeading("10. Community & Quasi-Community Property");
  b.checkbox("a. There are no such assets or debts that I know of to be divided by the court.", fl100.communityPropertyNone);
  if (!fl100.communityPropertyNone) {
    b.fieldStacked("b. Determine rights to the following community and quasi-community assets and debts:", fl100.communityPropertyList, { multiline: true });
  }

  b.sectionHeading("11. Other Requests");
  b.paragraph("a. Attorney's fees and costs payable by:", { size: 8.5 });
  b.checkboxRow([
    { label: "Petitioner", checked: fl100.attorneyFeesFrom === "petitioner" },
    { label: "Respondent", checked: fl100.attorneyFeesFrom === "respondent" },
  ]);
  b.checkbox("b. Petitioner's former name be restored.", fl100.restoreFormerName);
  if (fl100.restoreFormerName) b.field("Restore former name to:", fl100.formerName, { labelWidth: 150 });
  if (fl100.otherRequests) b.fieldStacked("c. Other (specify):", fl100.otherRequests, { multiline: true });

  b.sectionHeading("12. Restraining Orders");
  b.checkbox(
    "I have read the restraining orders on the back of the Summons (FL-110), and I understand that they apply to me when this Petition is filed.",
    fl100.restrainingOrdersRead,
  );

  b.signature(p, toCourtDate(intake.todaysDate), "Signature of Petitioner");
}
