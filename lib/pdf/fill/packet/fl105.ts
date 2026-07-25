import type { PDFForm } from "pdf-lib";
import type { PacketFormData } from "@/lib/types/packet.types";
import { setText, check, selectChoice } from "../util";
import { courtDate } from "../helpers";

// FL-105/GC-120 Declaration Under UCCJEA (packet page indices 13-14).
//
// The caption/header, case number, and the item 2 minor-children table are
// SHARED fields already filled + propagated by `fillIntake` — skipped here.
//
// A few item-specific fields have no usable name in this flattened packet
// because their originals collided with unrelated widgets elsewhere (the
// PDF was authored with duplicate field names outside the official form's
// namespacing) and were dropped or renamed out of `packet.labeled.txt`:
//   - Item 1's "authorized representative of an agency" checkbox
//   - Item 2's "additional children" overflow checkbox
//   - Item 3's "one residence for all children" checkbox
//   - Item 4's Family/Guardianship/Juvenile/Adoption row checkboxes
//     (CheckBox16-19 — each is SHARED with an unrelated widget on another
//     packet page)
//   - Item 5's intro "any restraining/protective order?" checkbox
//   - Item 6's per-person "has physical custody"/"claims custody"/"claims
//     visitation" checkboxes for column a, and "claims visitation" for any
//     column (CheckBox33/34/35/36/38/41 are all SHARED elsewhere)
// These are intentionally left unset; see inline notes below.

// Item 3 residence-history table, rows 2-5 (row 1 = current residence,
// handled separately since it has no "to" field — it always reads "to
// present").
const RESIDENCE_ROWS: Array<{
  from: string;
  to: string;
  residence: string;
  personStreet: string;
  relationship: string;
}> = [
  {
    from: "FillText115bnm",
    to: "FillText119000",
    residence: "FillText103",
    personStreet: "FillTxt148",
    relationship: "FillText172",
  },
  {
    from: "FillText1350",
    to: "FillText143BLUE",
    residence: "FillText123x",
    personStreet: "FillText107",
    relationship: "FillText111",
  },
  {
    from: "FillText156",
    to: "FillText160000",
    residence: "FillText123111",
    personStreet: "FillText1270",
    relationship: "FillText13111",
  },
  {
    from: "Text42",
    to: "Text43",
    residence: "FillText107413561254",
    personStreet: "FillTxt127",
    relationship: "Text44",
  },
];

// Item 6's three "other person" columns (a, b, c). Only the checkboxes that
// don't collide with a shared widget elsewhere in the packet are usable.
const OTHER_PERSON_NAME_FIELDS = ["FillText6242", "Fillt62422", "FillTt6242"];
const OTHER_PERSON_CHILD_FIELDS = ["FillTxt45", "FillText455", "FillText4502"];
const OTHER_PERSON_PHYSICAL_CUSTODY_FIELDS: Array<string | undefined> = [
  undefined,
  undefined,
  "CheckBox39",
];
const OTHER_PERSON_CLAIMS_CUSTODY_FIELDS: Array<string | undefined> = [
  undefined,
  "CheckBox37",
  "CheckBox40",
];

export function fillFL105Body(form: PDFForm, data: PacketFormData): void {
  const { fl105 } = data;

  // --- 1. Role ---
  if (fl105.role === "party") check(form, "CheckBox4121");
  // role === "agencyRep": no field — skipped (see header note).

  // --- 3. Residence history ---
  const residences = fl105.residences ?? [];
  const current = residences.find((r) => r.isCurrent);
  const ordered = current
    ? [current, ...residences.filter((r) => r !== current)]
    : residences;

  const row1 = ordered[0];
  if (row1) {
    setText(form, "FillText99", courtDate(row1.fromDate));
    setText(form, "FillText1233r34231", row1.residence);
    setText(form, "FillText148fox", row1.livedWith);
    setText(form, "FillText1520001", row1.relationship);
  }

  ordered.slice(1, 5).forEach((res, i) => {
    const fields = RESIDENCE_ROWS[i];
    setText(form, fields.from, courtDate(res.fromDate));
    if (!res.isCurrent) setText(form, fields.to, courtDate(res.toDate));
    setText(form, fields.residence, res.residence);
    setText(form, fields.personStreet, res.livedWith);
    setText(form, fields.relationship, res.relationship);
  });

  if (ordered.length > 5) check(form, "CheckBox418"); // additional-page attachment marker

  // --- 4. Other custody/visitation proceedings ---
  // Two-widget Yes/No pair sharing the field name "CheckBox219" ("1" = Yes, "2" = No).
  selectChoice(form, "CheckBox219", fl105.otherProceedings ? "1" : "2");
  if (fl105.otherProceedings && fl105.otherProceedingsDetails) {
    // Row-type checkbox skipped (shared elsewhere); details go in the
    // "Other" row's court/case-name cell.
    setText(form, "opiop", fl105.otherProceedingsDetails);
  }

  // --- 5. Restraining/protective orders ---
  // No usable intro Yes/No checkbox (see header note); represented via the
  // Table 5 "d. Other" row, the only row-type checkbox not shared elsewhere.
  if (fl105.restrainingOrders) {
    check(form, "CheckBox30");
    setText(form, "FillText45", fl105.restrainingOrdersDetails);
  }

  // --- 6. Other persons with custody/visitation claims ---
  if (fl105.otherPersons) check(form, "CheckBox3177776");
  else check(form, "CheckBox31943");

  if (fl105.otherPersons) {
    fl105.persons.slice(0, 3).forEach((person, i) => {
      setText(form, OTHER_PERSON_NAME_FIELDS[i], person.nameAddress);
      setText(form, OTHER_PERSON_CHILD_FIELDS[i], person.childrenNames);
      const physical = OTHER_PERSON_PHYSICAL_CUSTODY_FIELDS[i];
      if (person.hasPhysicalCustody && physical) check(form, physical);
      const claims = OTHER_PERSON_CLAIMS_CUSTODY_FIELDS[i];
      if (person.claimsCustody && claims) check(form, claims);
      // claimsVisitation: no usable field for any column — skipped.
    });
  }

  // --- 7. Pages attached ---
  if (fl105.pagesAttached) {
    check(form, "CheckBox412");
    setText(form, "FillText62", fl105.pagesAttached);
  }

  // --- Signature date ---
  // The declaration's date on this page is the packet's single shared "date"
  // field, already filled by fillIntake from intake.todaysDate — no
  // FL-105-specific field exists to write fl105.date into.
}
