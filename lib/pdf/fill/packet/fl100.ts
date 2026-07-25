import type { PDFForm } from "pdf-lib";
import type { PacketFormData } from "@/lib/types/packet.types";
import { setText, check } from "../util";
import { petitionerName, courtDate } from "../helpers";

// FL-100 Petition — Marriage/Domestic Partnership — packet pages 4/5/6 (0-based).
//
// Header/identity fields (names, address, case number, "type of case" via the
// shared cross-page "TypeofCase" field, minor-children yes/no + the first
// three children's name/birthdate/age, court, marriage date) are filled
// centrally by fillIntake and are NOT repeated here.
//
// A number of item sub-choices have no surviving field on these pages at all
// (this packet is a heavily flattened AcroForm) or their would-be field name
// collides with a field already claimed by packet.shared-fields.json (reused
// elsewhere in the packet for an unrelated purpose) — those are documented
// and skipped inline rather than inventing/guessing a name.
export function fillFL100Body(form: PDFForm, data: PacketFormData): void {
  const { intake, fl100: fl } = data;
  const caseType = intake.caseType;
  const isMarriage = intake.relationshipType === "marriage";

  // --- FL-100's own "PETITION FOR ... AMENDED" caption (page 4) ---
  // Distinct from the shared cross-page "TypeofCase" margin-tab field, this is
  // FL-100's own on-page caption row and has no counterpart in shared-fields.json.
  check(form, "Check Box8", fl.amended);
  if (caseType === "dissolution") {
    check(form, "Check Boxdissolution", true);
    if (isMarriage) check(form, "dp1", true);
  } else if (caseType === "legalSeparation") {
    check(form, "Check BoxLS", true);
    if (isMarriage) check(form, "ldp1", true);
  } else if (caseType === "nullity") {
    check(form, "Check BoxNullity", true);
    if (isMarriage) check(form, "nmdp1", true);
  }
  // Note: there is no separate "Domestic Partnership" checkbox alongside any
  // of the three rows above (only one box per row) — so a domesticPartnership
  // case only gets its row-level box checked, not a marriage/DP sub-choice.

  // --- 1. Legal relationship ---
  check(form, "marriedbox1a", fl.legalRelationship.includes("married"));
  check(form, "dpca", fl.legalRelationship.includes("dpInCA"));
  check(form, "dpnc", fl.legalRelationship.includes("dpNotInCA"));

  // --- 2. Residence requirements ---
  if (fl.residencyMet) {
    if (fl.residencyParty === "petitioner") check(form, "CheckBox24");
    else if (fl.residencyParty === "respondent") check(form, "CheckBox24b");
  }
  check(form, "2c", fl.residencyDpInCA); // b. domestic partnership established in CA
  check(form, "2b", fl.residencySameSex); // c. same-sex marriage, jurisdiction won't dissolve it
  // Note: "Petitioner lives in (specify)" / "Respondent lives in (specify)"
  // have no fillable text fields on this page — skipped.

  // --- 3. Statistical facts ---
  // Item 3a (marriage) and 3b (domestic partnership) are separate rows with
  // separate "date of separation" fields on this packet page (unlike the
  // official FL-100 AcroForm, which reuses one field for both).
  if (isMarriage) {
    setText(form, "FillText142", courtDate(fl.dateOfSeparation)); // a.(2) date of separation
  } else {
    setText(form, "partnershipdate", courtDate(fl.dpRegistrationDate)); // b.(1) DP registration date
    setText(form, "DOSDP", courtDate(fl.dateOfSeparation)); // b.(2) date of separation
  }
  // Note: the "Years"/"Months" time-elapsed fields (both rows) have no
  // matching data (FL100Data doesn't compute a duration) — skipped.

  // --- 4. Minor children ---
  // The child name/birthdate/age table (rows 1-3) and the no-children /
  // has-children choice are the shared header's "child list" — not repeated
  // here. Row 4 (FillText127/126/125) is likewise part of that shared list
  // concept and left to the shared filler (no 4th child is populated by it).
  check(form, "CheckBox14", fl.childBornBeforeMarriage); // "(1) continued on Attachment 4b"
  // Note: "UNBORN" ("(2) a child who is not yet born") has no corresponding
  // FL100Data field — skipped. "CheckBox15" (item 4e, voluntary declaration of
  // parentage) is in packet.shared-fields.json — skipped per instructions.

  // --- 5. Legal grounds ---
  if (caseType === "nullity") {
    // Item 5b (nullity of VOID marriage: incest/bigamy) has no surviving
    // fields at all on this page — fl.groundsNullityVoid is skipped entirely.
    // Item 5c (nullity of VOIDABLE marriage): of its six reasons, only
    // "unsound mind" survives as an unclaimed field; the other five
    // (age/priorMarriage/fraud/force/physicalIncapacity) map to
    // CheckBox41/CheckBox38/CheckBox33/CheckBox34/CheckBox35, all of which
    // are in packet.shared-fields.json — skipped per instructions.
    check(form, "CheckBox32", fl.groundsNullityVoidable === "unsoundMind");
  } else {
    check(form, "Check Boxid", caseType === "dissolution"); // Divorce
    check(form, "CheckBox44", caseType === "legalSeparation"); // Legal separation
    check(form, "CheckBox47", fl.groundsDivorceOrSeparation === "irreconcilable");
    // Note: "(2) permanent legal incapacity" is field CheckBox36, which is in
    // packet.shared-fields.json — skipped.
  }

  // --- 6. Child custody & visitation (only meaningful with children) ---
  // Only Petitioner/Respondent boxes survive per row (no Joint/Other column).
  function partyCb(value: string, petField: string, respField: string): void {
    if (value === "petitioner") check(form, petField);
    else if (value === "respondent") check(form, respField);
  }
  if (intake.hasMinorChildren) {
    partyCb(fl.legalCustodyTo, "CheckBox73", "CheckBox7300");
    partyCb(fl.physicalCustodyTo, "CheckBox69", "CheckBox69730");
    partyCb(fl.visitationTo, "CheckBox69A", "CheckBox69A567");
  }

  // --- 7. Child support ---
  // Item 7d ("Other (specify)") has no surviving checkbox/text field on this
  // page — fl.childSupportOther is skipped entirely.

  // --- 8. Spousal / partner support ---
  // Each row's Petitioner/Respondent box is the only meaningful field (the
  // row-level "a./b./c." markers have no independent purpose here, mirroring
  // the official form's own field set).
  if (fl.spousalSupportTo === "petitioner") check(form, "CheckBox621");
  else if (fl.spousalSupportTo === "respondent") check(form, "CheckBox74");
  if (fl.terminateSupportTo === "petitioner") check(form, "Check Box1");
  else if (fl.terminateSupportTo === "respondent") check(form, "CheckBox623");
  if (fl.reserveSupportTo === "petitioner") check(form, "reservepet");
  else if (fl.reserveSupportTo === "respondent") check(form, "reserveresp");
  // Note: item 8d ("Other (specify)") has no surviving field — skipped.

  // --- 9. Separate property ---
  if (fl.separatePropertyNone) {
    check(form, "nosepprop");
  } else if (fl.separatePropertyList) {
    check(form, "CheckBox62"); // b. confirm as separate property
    check(form, "CheckBoxflist"); // "...in [x] the following list"
    setText(form, "FillText119789", fl.separatePropertyList);
  }

  // --- 10. Community & quasi-community property ---
  if (fl.communityPropertyNone) {
    check(form, "CheckBox31073096");
  } else if (fl.communityPropertyList) {
    check(form, "CheckBox624");
    setText(form, "FillText160333", fl.communityPropertyList);
  }

  // --- 11. Other requests ---
  if (fl.attorneyFeesFrom) {
    check(form, "attorneyfees");
    if (fl.attorneyFeesFrom === "petitioner") check(form, "CheckBox7411");
    else if (fl.attorneyFeesFrom === "respondent") check(form, "CheckBox749");
  }
  if (fl.restoreFormerName) {
    check(form, "CheckBox60");
    setText(form, "FillText6654985", fl.formerName);
  }
  if (fl.otherRequests) {
    check(form, "CheckBox59");
    setText(form, "FillText161", fl.otherRequests);
  }
  // Note: "CheckBox48" ("Continued on Attachment 11c") has no corresponding
  // FL100Data field — skipped.

  // --- 12. Acknowledgement of restraining orders ---
  // Purely informational notice text on the official form — no checkbox
  // field exists for it on this page (confirmed: none found), so
  // fl.restrainingOrdersRead has nowhere to go.

  // --- Signature block ---
  setText(form, "TYPE_OR_PRINT_NAME1", petitionerName(intake));
  // Note: "Text37" (signature date) is in packet.shared-fields.json — skipped.
}
