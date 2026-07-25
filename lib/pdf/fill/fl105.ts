import type { PDFForm } from "pdf-lib";
import type { PacketFormData } from "@/lib/types/packet.types";
import { setText, check } from "./util";
import { fullName, petitionerName, respondentName, courtDate, courtAddressLine } from "./helpers";

const P = "FL-105[0].";
const P1 = P + "Page1[0].";
const P2 = P + "Page2[0].";
const CAP = P1 + "P1Caption[0].";
const L1 = P1 + "List1[0].Li1[0].";
const L2 = P1 + "List2[0].Li1[0].";
const L3 = P1 + "List3[0].Li1[0].";
const L4 = P2 + "Item4subformset[0].List4[0].Li1[0].Table4abc[0].";
const L5 = P2 + "Item5subformset[0].List5[0].Li1[0].";
const L6 = P2 + "List6[0].";
const L7 = P2 + "List7[0].Li1[0].";
const DEC = P2 + "PoPDec[0].";

export function fillFL105(form: PDFForm, data: PacketFormData): void {
  const intake = data.intake;
  const fl = data.fl105;
  const p = petitionerName(intake);
  const r = respondentName(intake);

  // --- Caption / header ---
  setText(form, CAP + "AttyInfo[0].AttyName_ft[0]", p);
  setText(form, CAP + "AttyInfo[0].AttyStreet_ft[0]", intake.petitionerStreet ?? "");
  setText(form, CAP + "AttyInfo[0].AttyCity_ft[0]", intake.petitionerCity ?? "");
  setText(form, CAP + "AttyInfo[0].AttyState_ft[0]", intake.petitionerState ?? "");
  setText(form, CAP + "AttyInfo[0].AttyZip_ft[0]", intake.petitionerZip ?? "");
  setText(form, CAP + "AttyInfo[0].Phone[0]", intake.petitionerPhone ?? "");
  setText(form, CAP + "AttyInfo[0].Email[0]", intake.petitionerEmail ?? "");
  setText(form, CAP + "AttyInfo[0].Name[0]", "Self-Represented");
  setText(form, CAP + "CrtInfo[0].CrtCounty[0]", "RIVERSIDE");
  setText(form, CAP + "CrtInfo[0].CrtBranch[0]", courtAddressLine(intake));
  setText(form, CAP + "ProbateParty[0].Party1[0]", p);
  setText(form, CAP + "ProbateParty[0].Party2[0]", r);
  setText(form, CAP + "CaseNo[0].CaseNumber[0]", intake.caseNumber ?? "");

  // --- 1. Role ---
  if (fl.role === "party") {
    check(form, L1 + "Party[0].PartyRepCB[0]");
  } else if (fl.role === "agencyRep") {
    check(form, L1 + "AuthRep[0].PartyRepCB[0]");
  }

  // --- 2. Minor children (list oldest child first) ---
  const children = intake.children ?? [];
  setText(form, L2 + "NumChildren[0]", String(children.length));
  const rowFirstNameFields = ["TextField7[0]", "TextField8[0]", "TextField8[0]", "TextField8[0]"];
  children.slice(0, 4).forEach((c, i) => {
    const row = i + 1;
    const nameField = rowFirstNameFields[i];
    setText(
      form,
      L2 + `Table[0].Row${row}[0].${nameField}`,
      fullName(c.firstName ?? "", c.middleName ?? "", c.lastName ?? "")
    );
    setText(form, L2 + `Table[0].Row${row}[0].TextField1[0]`, courtDate(c.dateOfBirth ?? ""));
    setText(form, L2 + `Table[0].Row${row}[0].TextField2[0]`, c.placeOfBirth ?? "");
  });
  if (children.length > 4) {
    check(form, L2 + "CheckBox19[0]");
  }

  // --- 3. Residence history ---
  if (fl.singleResidenceForAll) {
    check(form, L3 + "OneManyCB[0]");
  }

  const residences = fl.residences ?? [];
  const current = residences.filter((res) => res.isCurrent);
  const others = residences.filter((res) => !res.isCurrent);
  const ordered = current.length ? current.slice(0, 1).concat(others) : residences;

  if (ordered.length) {
    const row1 = ordered[0];
    setText(form, L3 + "Table3a[0].Row1[0].From1[0]", courtDate(row1.fromDate ?? ""));
    setText(form, L3 + "Table3a[0].Row1[0].Residence1[0]", row1.residence ?? "");
    setText(form, L3 + "Table3a[0].Row1[0].PersonStreet1[0]", row1.livedWith ?? "");
    setText(form, L3 + "Table3a[0].Row1[0].Relationship1[0]", row1.relationship ?? "");
  }

  ordered.slice(1, 5).forEach((res, i) => {
    const row = i + 2;
    setText(form, L3 + `Table3a[0].Row${row}[0].From${row}[0]`, courtDate(res.fromDate ?? ""));
    setText(form, L3 + `Table3a[0].Row${row}[0].To${row}[0]`, courtDate(res.toDate ?? ""));
    setText(form, L3 + `Table3a[0].Row${row}[0].Residence${row}[0]`, res.residence ?? "");
    setText(form, L3 + `Table3a[0].Row${row}[0].PersonStreet${row}[0]`, res.livedWith ?? "");
    setText(form, L3 + `Table3a[0].Row${row}[0].Relationship${row}[0]`, res.relationship ?? "");
  });

  if (ordered.length > 5) {
    check(form, L3 + "AddlAddyCB[0]");
  }

  // --- 4. Other custody/visitation proceedings ---
  const li4 = P2 + "Item4subformset[0].List4[0].Li1[0].";
  if (fl.otherProceedings) {
    check(form, li4 + "OtherCaseYN[0]");
  } else {
    check(form, li4 + "OtherCaseYN[1]");
  }

  if (fl.otherProceedings && fl.otherProceedingsDetails) {
    check(form, L4 + "Row4c[0].PGCell4c[0].OtherCB[0]");
    setText(form, L4 + "Row4c[0].Court4c[0]", fl.otherProceedingsDetails);
  }

  // --- 5. Domestic violence restraining/protective orders ---
  if (fl.restrainingOrders) {
    check(form, L5 + "DVROCB[0].DVRO_CB[0]");
    if (fl.restrainingOrdersDetails) {
      check(form, L5 + "Table5[0].Row5d[0].ROCell5d[0].OtherRO_CB5d[0]");
      setText(form, L5 + "Table5[0].Row5d[0].County5d[0]", fl.restrainingOrdersDetails);
    }
  }

  // --- 6. Other persons with custody or visitation claims ---
  if (fl.otherPersons) {
    check(form, L6 + "OtherPersonYN[0]");
  } else {
    check(form, L6 + "OtherPersonYN[1]");
  }

  if (fl.otherPersons) {
    const persons = fl.persons ?? [];
    const liKeys = ["Li1[0]", "Li2[0]", "Li3[0]"];
    const suffixes = ["6a", "6b", "6c"];
    persons.slice(0, 3).forEach((person, i) => {
      const li = liKeys[i];
      const suf = suffixes[i];
      setText(form, L6 + `${li}.Name${suf}[0]`, person.nameAddress ?? "");
      if (person.hasPhysicalCustody) {
        check(form, L6 + `${li}.CheckBox${suf}1[0]`);
      }
      if (person.claimsCustody) {
        check(form, L6 + `${li}.CheckBox${suf}2[0]`);
      }
      if (person.claimsVisitation) {
        check(form, L6 + `${li}.CheckBox${suf}3[0]`);
      }
      setText(form, L6 + `${li}.Child${suf}[0]`, person.childrenNames ?? "");
    });
  }

  // --- 7. Attachments ---
  if (fl.pagesAttached) {
    check(form, L7 + "Checkbox[0]");
    setText(form, L7 + "PPAttached[0]", fl.pagesAttached);
  }

  // --- Signature ---
  setText(form, DEC + "SigDate[0]", courtDate(fl.date ?? ""));
  setText(form, DEC + "PrintName[0]", p);
}
