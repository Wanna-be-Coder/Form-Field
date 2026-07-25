import type { PDFForm } from "pdf-lib";
import type { PacketFormData } from "@/lib/types/packet.types";
import { check } from "../util";

// Local, page-19-scoped helper: unchecking isn't exposed by ../util (every
// other packet filler only ever needs to turn boxes on), so it's kept here
// rather than widening the shared utility for the one field that needs it.
function uncheck(form: PDFForm, name: string): void {
  try {
    form.getCheckBox(name).uncheck();
  } catch {
    // field absent or not a checkbox — skip
  }
}

// FL-140 Declaration of Disclosure — packet page 19 (0-based).
export function fillFL140Body(form: PDFForm, data: PacketFormData): void {
  const { fl140: fl } = data;

  // --- Header/identity fields on this page (party names, address, case
  // number, self-represented line, signature printed name, and the top
  // "date" field) all reuse the same shared AcroForm fields the intake
  // cover already fills (FillText9, FillText1/2/6, FillText154/158/146,
  // FillTextcaseno, "date", "Signature" — see
  // form-templates/packet.shared-fields.json). They're propagated
  // automatically, so they're intentionally not re-set here. fl140.date in
  // particular has no field of its own on this page to bind to — the only
  // "date" widget here is the shared one already set from
  // intake.todaysDate. ---

  // --- "OTHER PARENT/PARTY:" (otherparent_party) has no corresponding
  // value anywhere in PacketFormData/FL140Data — left blank. ---

  // --- Caption checkboxes ("Petitioner's"/"Respondent's",
  // "Preliminary"/"Final") and attachment items 1-2 ("A completed Schedule
  // of Assets and Debts (FL-142)" / "A completed Income and Expense
  // Declaration (FL-150)") all share ONE merged AcroForm field on this
  // page: "CheckBox124#0you" — one field with 4 widget kids (2 in the
  // caption row, 2 in the attachment list). Checking or unchecking it flips
  // all four positions together; there is no way on this PDF to
  // independently mark "respondent" vs "petitioner", "final" vs
  // "preliminary", or attachSchedule vs attachIncomeExpense. The template
  // ships with it checked (Petitioner's + Preliminary + item 1 + item 2 all
  // on), so it's left checked only when the data matches that exact
  // combination; otherwise it's unchecked rather than leave a
  // partially-wrong combination marked under a perjury declaration. ---
  const matchesBundledDefault =
    fl.whoseDisclosure === "petitioner" &&
    fl.disclosureStage === "preliminary" &&
    fl.attachSchedule &&
    fl.attachIncomeExpense;

  if (matchesBundledDefault) {
    check(form, "CheckBox124#0you");
  } else {
    uncheck(form, "CheckBox124#0you");
  }

  // --- Items 3-6 ("All tax returns...", the two material-facts statements,
  // and the investment-opportunity disclosure) have no field of their own
  // on this page (dropped in the merge) — they can't be checked without
  // inventing a name, so attachTaxReturns / attachMaterialFactsAssets /
  // attachMaterialFactsObligations / attachInvestmentOpportunity are
  // skipped regardless of value. ---
}
