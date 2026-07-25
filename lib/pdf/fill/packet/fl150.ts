import type { PDFForm } from "pdf-lib";
import type { PacketFormData } from "@/lib/types/packet.types";
import { setText, check } from "../util";

// FL-150 Income and Expense Declaration — packet pages 15/16/17/18 (0-based).
//
// This packet is a heavily flattened AcroForm: only a subset of the official
// FL-150's fields survive as unique, fillable widgets. In particular, item 1
// (Employment), item 2 (Age & education), item 3's filing-status/exemption
// checkboxes, item 6 (Investment income), item 7 (Self-employment), item 12
// (People who live with me — the whole table), item 14 (Installment
// payments), item 15 (Attorney fees), and item 19 (Special hardships) have NO
// corresponding fields on these pages at all — they were dropped in the
// merge, so they're skipped below rather than inventing names. (This means
// data.fl150.household, employer*, age/education, and taxFilingStatus /
// taxFilingJointName currently have nowhere to go in this packet.)
export function fillFL150Body(form: PDFForm, data: PacketFormData): void {
  const { fl150: fl, intake } = data;

  // --- Page 15: item 3 (tax) tail + item 4 (other party's income) ---
  // "CheckBox24VIXEN" is item 3a's "I last filed taxes for tax year" box —
  // there's no companion text field on this page to write the year into, so
  // we can only toggle the box based on whether a year was given.
  check(form, "CheckBox24VIXEN", Boolean(fl.lastTaxYear));
  // Note: "CheckBox22#0grape" (item 3c, "I file state tax returns in
  // California") has no corresponding field in FL150Data — left unchecked.
  setText(form, "OPIncome", fl.otherPartyIncome);
  setText(form, "EstimateExplain", fl.otherPartyIncomeBasis);

  // --- Page 16: item 5 (income), item 10 (deductions), item 11 (assets) ---
  // Item 5's rows each have two columns ("Last month" / "Average monthly");
  // FL150Data's income* fields are documented as averages, so they're mapped
  // to the second (average monthly) field of each pair. The "Last month"
  // column, and rows with no matching data field (f. Partner support,
  // i. Disability, k. Workers' compensation), are left blank.
  setText(form, "FillText2901", fl.incomeSalary); // a. Salary or wages
  setText(form, "FillText2903", fl.incomeOvertime); // b. Overtime
  setText(form, "FillText2905", fl.incomeCommissions); // c. Commissions or bonuses
  setText(form, "FillText2907", fl.incomePublicAssistance); // d. Public assistance
  setText(form, "FillText2909", fl.incomeSpousalSupport); // e. Spousal support
  setText(form, "FillText2913", fl.incomePension); // g. Pension/retirement fund payments
  setText(form, "FillText2915", fl.incomeSocialSecurity); // h. Social Security retirement
  setText(form, "FillText2919", fl.incomeUnemployment); // j. Unemployment compensation
  setText(form, "FillText2923", fl.incomeOther); // l. Other

  setText(form, "FillText2935", fl.deductionUnionDues); // a. Required union dues
  setText(form, "FillText2936", fl.deductionRetirement); // b. Required retirement payments
  setText(form, "FillText2937", fl.deductionHealthInsurance); // c. Health insurance premiums
  setText(form, "FillText2938", fl.deductionChildSupportOther); // d. Child support paid (other relationships)

  setText(form, "FillText2942", fl.assetCash); // a. Cash and checking accounts, etc.
  setText(form, "FillText2943", fl.assetStocks); // b. Stocks, bonds, and other easily-sold assets
  setText(form, "FillText2944", fl.assetOtherProperty); // c. All other property

  // --- Page 17: item 13 (estimated monthly expenses) ---
  // Item 12 (People who live with me) has no fields on this page at all —
  // skipped (see file header note).
  setText(form, "FillText35034", fl.expenseHome); // a.(1) Rent or mortgage
  setText(form, "FillText35040", fl.expenseHealthCare); // b. Health-care costs not paid by insurance
  setText(form, "FillText35041", fl.expenseChildCare); // c. Child care
  setText(form, "FillText35042", fl.expenseGroceries); // d. Groceries and household supplies
  setText(form, "FillText35043", fl.expenseEatingOut); // e. Eating out
  setText(form, "FillText35044", fl.expenseUtilities); // f. Utilities
  setText(form, "FillText35045", fl.expensePhone); // g. Telephone, cell phone, and e-mail
  setText(form, "FillText35046", fl.expenseLaundry); // h. Laundry and cleaning
  setText(form, "FillText35047", fl.expenseClothes); // i. Clothes
  setText(form, "FillText35048", fl.expenseEducation); // j. Education
  setText(form, "FillText35049", fl.expenseEntertainment); // k. Entertainment, gifts, and vacation
  setText(form, "FillText35050", fl.expenseAuto); // l. Auto expenses and transportation
  setText(form, "FillText35051", fl.expenseInsurance); // m. Insurance (life, accident, etc.)
  setText(form, "FillText35052", fl.expenseSavings); // n. Savings and investments
  setText(form, "FillText35056", fl.expenseOther); // q. Other (specify)

  // --- Page 18: child support (items 16-18) — only when relevant ---
  if (intake.hasMinorChildren) {
    setText(form, "FillText4451", fl.numberChildrenUnder18); // 16a. number of children
    setText(form, "FillText4452", fl.timeWithMePercent); // 16b. percent of time with me
    // Note: 16b's second blank ("...and __ percent with the other parent")
    // has no field of its own on this page — timeWithOtherPercent is skipped.

    check(form, "CheckBox4454", fl.hasChildHealthInsurance); // 17a. "I do" have health insurance available
    setText(form, "FillText4456", fl.childInsuranceCompany); // 17b. name of insurance company
    setText(form, "FillText4458", fl.childInsuranceMonthlyCost); // 17d. monthly cost of children's health insurance
  }
}
