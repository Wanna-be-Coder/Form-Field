import type { PacketFormData } from "../../types/packet.types";
import { COURTHOUSES } from "../../constants/packet.constants";
import { fullName, petitionerName, respondentName, toCourtDate } from "../../utils/packet-helpers";
import { PdfBuilder } from "../PdfBuilder";

export function drawFL105(b: PdfBuilder, data: PacketFormData): void {
  const { intake, fl105 } = data;
  const p = petitionerName(intake);
  const r = respondentName(intake);
  const court = intake.courthouse ? COURTHOUSES[intake.courthouse] : undefined;
  const addr = [
    intake.petitionerStreet,
    [intake.petitionerCity, intake.petitionerState, intake.petitionerZip].filter(Boolean).join(", "),
  ]
    .filter(Boolean)
    .join(", ");

  // Children come read-only from Basic Information (the intake step).
  const children = intake.children ?? [];

  b.title("FL-105 / GC-120", "Declaration Under UCCJEA");

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

  b.sectionHeading("1. I am (check one):");
  b.checkbox("A party to this proceeding to determine custody of a child", fl105.role === "party");
  b.checkbox("The authorized representative of an agency that is a party", fl105.role === "agencyRep");

  b.sectionHeading("2. Minor Children");
  b.paragraph(
    `There are ${children.length} minor children who are subject to this proceeding (list oldest first):`,
  );
  children.forEach((c) => {
    b.field(
      "Child:",
      `${fullName(c.firstName, c.middleName, c.lastName)} | DOB ${toCourtDate(c.dateOfBirth)} | ${c.placeOfBirth}`,
      { labelWidth: 45 },
    );
  });

  b.sectionHeading("3. Residence history of the child (or oldest child) for the past five years");
  fl105.residences.forEach((res) => {
    b.field("From:", toCourtDate(res.fromDate), { labelWidth: 100, width: 150 });
    b.field("To:", res.isCurrent ? "present" : toCourtDate(res.toDate), { labelWidth: 100, width: 150 });
    b.field("Residence (City, State):", res.residence, { labelWidth: 150 });
    b.fieldStacked("Person child lived with & current address:", res.livedWith, { multiline: true });
    b.field("Relationship:", res.relationship, { labelWidth: 150 });
  });
  b.checkbox(
    "There is only one child, or all children have lived together for the past five years.",
    fl105.singleResidenceForAll,
  );

  b.sectionHeading("4. Other Custody / Visitation Proceedings");
  b.checkboxRow([
    { label: "Yes", checked: fl105.otherProceedings },
    { label: "No", checked: !fl105.otherProceedings },
  ]);
  if (fl105.otherProceedings) {
    b.fieldStacked("Details:", fl105.otherProceedingsDetails, { multiline: true });
  }

  b.sectionHeading("5. Domestic Violence Restraining/Protective Orders");
  b.checkbox(
    "One or more domestic violence restraining/protective orders are now in effect.",
    fl105.restrainingOrders,
  );
  if (fl105.restrainingOrders) {
    b.fieldStacked("Court, county, state, case number, expiration:", fl105.restrainingOrdersDetails, {
      multiline: true,
    });
  }

  b.sectionHeading("6. Other Persons with Custody or Visitation Claims");
  b.checkboxRow([
    { label: "Yes", checked: fl105.otherPersons },
    { label: "No", checked: !fl105.otherPersons },
  ]);
  if (fl105.otherPersons) {
    fl105.persons.forEach((person) => {
      b.fieldStacked("Name and address:", person.nameAddress, { multiline: true });
      b.checkbox("Has physical custody", person.hasPhysicalCustody);
      b.checkbox("Claims custody rights", person.claimsCustody);
      b.checkbox("Claims visitation rights", person.claimsVisitation);
      b.field("Name of each child:", person.childrenNames, { labelWidth: 150 });
    });
  }

  b.sectionHeading("7. Attachments");
  b.field("Number of pages attached:", fl105.pagesAttached, { labelWidth: 165, width: 100 });

  b.signature(p, toCourtDate(fl105.date), "Signature of Declarant");
}
