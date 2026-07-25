import type { PacketFormData } from "../../types/packet.types";
import {
  formatCurrency,
  petitionerName,
  respondentName,
  toCourtDate,
  totalMonthlyExpenses,
  totalMonthlyIncome,
} from "../../utils/packet-helpers";
import { PdfBuilder } from "../PdfBuilder";

export function drawFL150(b: PdfBuilder, data: PacketFormData): void {
  const { intake, fl150 } = data;
  const p = petitionerName(intake);
  const r = respondentName(intake);
  const addr = [
    intake.petitionerStreet,
    [intake.petitionerCity, intake.petitionerState, intake.petitionerZip].filter(Boolean).join(", "),
  ]
    .filter(Boolean)
    .join(", ");

  b.title("FL-150", "Income and Expense Declaration");

  b.field("Party without attorney (name):", p, { labelWidth: 165 });
  b.field("Address:", addr, { labelWidth: 165 });
  b.field("Telephone:", intake.petitionerPhone, { labelWidth: 165 });
  b.field("E-mail:", intake.petitionerEmail, { labelWidth: 165 });
  b.field("Attorney for:", "Self-Represented", { labelWidth: 165, width: 160 });
  b.field("Petitioner:", p, { labelWidth: 165 });
  b.field("Respondent:", r, { labelWidth: 165 });
  b.field("Other Party:", "", { labelWidth: 165 });
  b.field("Case Number:", intake.caseNumber, { labelWidth: 165, width: 200 });

  b.sectionHeading("1. Employment");
  b.field("Employer's name:", fl150.employer, { labelWidth: 150 });
  b.field("Employer's address:", fl150.employerAddress, { labelWidth: 150 });
  b.field("Employer's phone:", fl150.employerPhone, { labelWidth: 150 });
  b.field("Occupation:", fl150.occupation, { labelWidth: 150 });
  b.field("Date job started:", toCourtDate(fl150.dateJobStarted), { labelWidth: 150, width: 110 });
  b.field("Date job ended:", toCourtDate(fl150.dateJobEnded), { labelWidth: 150, width: 110 });
  b.field("Hours worked per week:", fl150.hoursPerWeek, { labelWidth: 150, width: 80 });
  b.field("Gross pay:", fl150.grossPay, { labelWidth: 150, width: 100 });
  b.checkboxRow([
    { label: "per month", checked: fl150.payFrequency === "month" },
    { label: "per week", checked: fl150.payFrequency === "week" },
    { label: "per hour", checked: fl150.payFrequency === "hour" },
  ]);

  b.sectionHeading("2. Age & Education");
  b.field("Age:", fl150.age, { labelWidth: 150, width: 60 });
  b.checkbox("I have completed high school or the equivalent.", fl150.completedHighSchool);
  b.field("If no, highest grade completed:", fl150.highestGrade, { labelWidth: 190, width: 60 });
  b.field("Years of college completed:", fl150.yearsCollege, { labelWidth: 190, width: 60 });
  b.field("College degrees held:", fl150.collegeDegrees, { labelWidth: 150 });

  b.sectionHeading("3. Tax Information");
  b.field("Last tax year filed:", fl150.lastTaxYear, { labelWidth: 150, width: 80 });
  b.checkboxRow([
    { label: "Single", checked: fl150.taxFilingStatus === "single" },
    { label: "Head of household", checked: fl150.taxFilingStatus === "headOfHousehold" },
    { label: "Married, filing separately", checked: fl150.taxFilingStatus === "marriedSeparately" },
    { label: "Married, filing jointly", checked: fl150.taxFilingStatus === "marriedJointly" },
  ]);
  if (fl150.taxFilingStatus === "marriedJointly") {
    b.field("Filed jointly with:", fl150.taxFilingJointName, { labelWidth: 150 });
  }

  b.sectionHeading("4. Other Party's Income");
  b.field("Estimated other party's gross monthly income:", fl150.otherPartyIncome, { labelWidth: 260, width: 100 });
  b.fieldStacked("This estimate is based on:", fl150.otherPartyIncomeBasis, { multiline: true });

  b.sectionHeading("5. Income (Average Monthly)");
  b.field("Salary or wages:", fl150.incomeSalary, { labelWidth: 180, width: 100 });
  b.field("Overtime:", fl150.incomeOvertime, { labelWidth: 180, width: 100 });
  b.field("Commissions or bonuses:", fl150.incomeCommissions, { labelWidth: 180, width: 100 });
  b.field("Public assistance:", fl150.incomePublicAssistance, { labelWidth: 180, width: 100 });
  b.field("Spousal support received:", fl150.incomeSpousalSupport, { labelWidth: 180, width: 100 });
  b.field("Pension or retirement:", fl150.incomePension, { labelWidth: 180, width: 100 });
  b.field("Social security:", fl150.incomeSocialSecurity, { labelWidth: 180, width: 100 });
  b.field("Unemployment compensation:", fl150.incomeUnemployment, { labelWidth: 180, width: 100 });
  b.field("Other:", fl150.incomeOther, { labelWidth: 180, width: 100 });
  b.field("TOTAL INCOME:", formatCurrency(totalMonthlyIncome(fl150)), { labelWidth: 180, width: 100 });

  b.sectionHeading("10. Deductions");
  b.field("Required union dues:", fl150.deductionUnionDues, { labelWidth: 200, width: 100 });
  b.field("Required retirement contributions:", fl150.deductionRetirement, { labelWidth: 200, width: 100 });
  b.field("Health insurance premiums:", fl150.deductionHealthInsurance, { labelWidth: 200, width: 100 });
  b.field(
    "Child/spousal support paid for other relationships:",
    fl150.deductionChildSupportOther,
    { labelWidth: 260, width: 100 },
  );

  b.sectionHeading("11. Assets");
  b.field("Cash:", fl150.assetCash, { labelWidth: 180, width: 100 });
  b.field("Stocks, bonds, and other assets:", fl150.assetStocks, { labelWidth: 200, width: 100 });
  b.field("Other property:", fl150.assetOtherProperty, { labelWidth: 180, width: 100 });

  b.sectionHeading("12. People Who Live With Me");
  if (fl150.household.length > 0) {
    fl150.household.forEach((member, i) => {
      b.paragraph(`Household member ${i + 1}`, { size: 8.5, bold: true });
      b.field("Name:", member.name, { labelWidth: 150 });
      b.field("Age:", member.age, { labelWidth: 150, width: 60 });
      b.field("Relationship:", member.relationship, { labelWidth: 150 });
      b.field("Gross monthly income:", member.grossMonthlyIncome, { labelWidth: 150, width: 100 });
      b.checkbox("Pays some household expenses", member.paysExpenses);
    });
  } else {
    b.paragraph("No household members listed.", { size: 8.5 });
  }

  b.sectionHeading("13. Estimated Monthly Expenses");
  b.field("Home (rent or mortgage & maintenance):", fl150.expenseHome, { labelWidth: 240, width: 100 });
  b.field("Health-care costs not covered by insurance:", fl150.expenseHealthCare, { labelWidth: 240, width: 100 });
  b.field("Child care:", fl150.expenseChildCare, { labelWidth: 240, width: 100 });
  b.field("Groceries and household supplies:", fl150.expenseGroceries, { labelWidth: 240, width: 100 });
  b.field("Eating out:", fl150.expenseEatingOut, { labelWidth: 240, width: 100 });
  b.field("Utilities:", fl150.expenseUtilities, { labelWidth: 240, width: 100 });
  b.field("Telephone, cell phone, internet:", fl150.expensePhone, { labelWidth: 240, width: 100 });
  b.field("Laundry and cleaning:", fl150.expenseLaundry, { labelWidth: 240, width: 100 });
  b.field("Clothes:", fl150.expenseClothes, { labelWidth: 240, width: 100 });
  b.field("Education:", fl150.expenseEducation, { labelWidth: 240, width: 100 });
  b.field("Entertainment and gifts:", fl150.expenseEntertainment, { labelWidth: 240, width: 100 });
  b.field("Auto (gas, maintenance, transportation):", fl150.expenseAuto, { labelWidth: 240, width: 100 });
  b.field("Insurance (life, accident):", fl150.expenseInsurance, { labelWidth: 240, width: 100 });
  b.field("Savings and investments:", fl150.expenseSavings, { labelWidth: 240, width: 100 });
  b.field("Other:", fl150.expenseOther, { labelWidth: 240, width: 100 });
  b.field("TOTAL EXPENSES:", formatCurrency(totalMonthlyExpenses(fl150)), { labelWidth: 240, width: 100 });

  if (intake.hasMinorChildren) {
    b.sectionHeading("Child Support Information");
    b.field("Number of children under 18:", fl150.numberChildrenUnder18, { labelWidth: 200, width: 60 });
    b.field("% time with me:", fl150.timeWithMePercent, { labelWidth: 150, width: 60 });
    b.field("% time with other parent:", fl150.timeWithOtherPercent, { labelWidth: 180, width: 60 });
    b.checkbox(
      "I have health insurance available for the children through my job.",
      fl150.hasChildHealthInsurance,
    );
    b.field("Insurance company:", fl150.childInsuranceCompany, { labelWidth: 150 });
    b.field("Monthly cost to add the children:", fl150.childInsuranceMonthlyCost, { labelWidth: 220, width: 100 });
  }

  b.signature(petitionerName(intake), toCourtDate(fl150.date), "Signature of Declarant");
}
