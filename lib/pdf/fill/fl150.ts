import type { PDFForm } from "pdf-lib";
import type { PacketFormData } from "@/lib/types/packet.types";
import { setText, check } from "./util";
import { petitionerName, respondentName, courtDate, courtAddressLine } from "./helpers";

type FL150Key = keyof PacketFormData["fl150"];

const P = "FL-150[0].";
const HDR = P + "Page1[0].StdP1Header_sf[0].";
const P1 = P + "Page1[0].";
const P2 = P + "Page2[0].";
const P3 = P + "Page3[0].";
const P4 = P + "Page4[0].";
const CAP2 = P2 + "PxCaption_sf[0].";
const CAP3 = P3 + "PxCaption_sf[0].";
const CAP4 = P4 + "PxCaption_sf[0].";

// item 12 "people who live with me" row field names (Page3.List12[0].<row>.<field>)
const HOUSEHOLD_ROWS = [
  { row: "L1[0]", name: "FillText1[0]", age: "TextField1[0]", rel: "TextField2[0]", income: "TextField3[0]", yes: "item12a_cb[0]", no: "item12a_cb[1]" },
  { row: "L2[0]", name: "FillText1[0]", age: "TextField[0]", rel: "TextField1[0]", income: "TextField2[0]", yes: "People2_cb[0]", no: "People2_cb[1]" },
  { row: "L3[0]", name: "FillText1[0]", age: "TextField[0]", rel: "TextField1[0]", income: "TextField6[0]", yes: "People3_cb[0]", no: "People3_cb[1]" },
  { row: "L4[0]", name: "FillText1[0]", age: "TextField[0]", rel: "TextField1[0]", income: "TextField6[0]", yes: "People4_cb[0]", no: "People4_cb[1]" },
  { row: "L5[0]", name: "FillText1[0]", age: "TextField[0]", rel: "TextField1[0]", income: "TextField6[0]", yes: "People5_cb[0]", no: "People5_cb[1]" },
];

// item 13 "estimated monthly expenses" -> Page3.List13[0].<Li>.EXPN[0], keyed by fl150 field name
const EXPENSE_LINES: Array<[string, FL150Key]> = [
  ["Li2[0]", "expenseHealthCare"],
  ["Li3[0]", "expenseChildCare"],
  ["Li4[0]", "expenseGroceries"],
  ["Li5[0]", "expenseEatingOut"],
  ["Li6[0]", "expenseUtilities"],
  ["Li7[0]", "expensePhone"],
  ["Li8[0]", "expenseLaundry"],
  ["Li9[0]", "expenseClothes"],
  ["Li10[0]", "expenseEducation"],
  ["Li11[0]", "expenseEntertainment"],
  ["Li12[0]", "expenseAuto"],
  ["Li13[0]", "expenseInsurance"],
  ["Li14[0]", "expenseSavings"],
];

export function fillFL150(form: PDFForm, data: PacketFormData): void {
  const intake = data.intake;
  const fl = data.fl150;
  const p = petitionerName(intake);
  const r = respondentName(intake);

  // --- Header (self-represented petitioner) ---
  setText(form, HDR + "AttyInfo[0].AttyName_ft[0]", p);
  setText(form, HDR + "AttyInfo[0].AttyStreet_ft[0]", intake.petitionerStreet);
  setText(form, HDR + "AttyInfo[0].AttyCity_ft[0]", intake.petitionerCity);
  setText(form, HDR + "AttyInfo[0].AttyState_ft[0]", intake.petitionerState);
  setText(form, HDR + "AttyInfo[0].AttyZip_ft[0]", intake.petitionerZip);
  setText(form, HDR + "AttyInfo[0].Phone_ft[0]", intake.petitionerPhone);
  setText(form, HDR + "AttyInfo[0].Email_ft[0]", intake.petitionerEmail);
  setText(form, HDR + "AttyInfo[0].AttyFor_ft[0]", "Self-Represented");
  setText(form, HDR + "CourtInfo[0].CrtCounty_ft[0]", "RIVERSIDE");
  const courtAddr = courtAddressLine(intake);
  if (courtAddr) {
    setText(form, HDR + "CourtInfo[0].Branch_ft[0]", courtAddr);
  }
  setText(form, HDR + "TitlePartyName[0].Party1_ft[0]", p);
  setText(form, HDR + "TitlePartyName[0].Party2_ft[0]", r);
  setText(form, HDR + "CaseNumber[0].CaseNumber_ft[0]", intake.caseNumber);

  // Repeated caption on pages 2 & 3 (party1/party2/case number; leave OtherParty blank)
  for (const cap of [CAP2, CAP3]) {
    setText(form, cap + "TitlePartyName[0].Party1_ft[0]", p);
    setText(form, cap + "TitlePartyName[0].Party2_ft[0]", r);
    setText(form, cap + "CaseNumber[0].CaseNumber_ft[0]", intake.caseNumber);
  }

  // --- 1. Employment ---
  setText(form, P1 + "List1[0].Li1[0].Employer_tf[0]", fl.employer);
  setText(form, P1 + "List1[0].Li2[0].Employer_address_tf[0]", fl.employerAddress);
  setText(form, P1 + "List1[0].Li3[0].Employer_phone\\.ft[0]", fl.employerPhone);
  setText(form, P1 + "List1[0].Li4[0].Party_occupation_tf[0]", fl.occupation);
  setText(form, P1 + "List1[0].Li5[0].Date_started_job_tf[0]", courtDate(fl.dateJobStarted));
  setText(form, P1 + "List1[0].Li6[0].FillText1[0]", courtDate(fl.dateJobEnded));
  setText(form, P1 + "List1[0].Li7[0].hours_tf[0]", fl.hoursPerWeek);
  setText(form, P1 + "List1[0].Li8[0].gross_tf[0]", fl.grossPay);
  const payFreq = fl.payFrequency;
  if (payFreq === "month") {
    check(form, P1 + "List1[0].Li8[0].Gross_cb[0]");
  } else if (payFreq === "week") {
    check(form, P1 + "List1[0].Li8[0].Gross_cb[1]");
  } else if (payFreq === "hour") {
    check(form, P1 + "List1[0].Li8[0].Gross_cb[2]");
  }

  // --- 2. Age & education ---
  setText(form, P1 + "List2[0].Li1[0].FillText1[0]", fl.age);
  if (fl.completedHighSchool) {
    check(form, P1 + "List2[0].Li2[0].HSchl_cb[0]");
  }
  setText(form, P1 + "List2[0].Li2[0].FillText1[0]", fl.highestGrade);
  setText(form, P1 + "List2[0].Li3[0].FillText1[0]", fl.yearsCollege);
  setText(form, P1 + "List2[0].Li3[0].FillText109[0]", fl.collegeDegrees);

  // --- 3. Tax information ---
  if (fl.lastTaxYear) {
    check(form, P1 + "List3[0].Li1[0].RB2Choices[0]");
  }
  setText(form, P1 + "List3[0].Li1[0].FillText109[0]", fl.lastTaxYear);
  const taxStatus = fl.taxFilingStatus;
  if (taxStatus === "single") {
    check(form, P1 + "List3[0].Li2[0].Tax_cb1[0]");
  } else if (taxStatus === "headOfHousehold") {
    check(form, P1 + "List3[0].Li2[0].Tax_cb2[0]");
  } else if (taxStatus === "marriedSeparately") {
    check(form, P1 + "List3[0].Li2[0].Tax_cb3[0]");
  } else if (taxStatus === "marriedJointly") {
    check(form, P1 + "List3[0].Li2[0].RB2Choices[0]");
    setText(form, P1 + "List3[0].Li2[0].FillText109[0]", fl.taxFilingJointName);
  }

  // --- 4. Other party's income ---
  setText(form, P1 + "List4[0].Li1[0].FillTextincm[0]", fl.otherPartyIncome);
  setText(form, P1 + "List4[0].Li1[0].FillText1[0]", fl.otherPartyIncomeBasis);

  // --- Declarant signature (Page 1) ---
  setText(form, P1 + "Signdate[0]", courtDate(fl.date));
  setText(form, P1 + "FillText56[0]", p);

  // --- 5. Income (average monthly) ---
  const incomeLines: Array<[string, string, FL150Key]> = [
    ["Li1[0]", "TextField7[0]", "incomeSalary"],
    ["Li2[0]", "TextField8[0]", "incomeOvertime"],
    ["Li3[0]", "TextField9[0]", "incomeCommissions"],
    ["Li4[0]", "TextField10[0]", "incomePublicAssistance"],
    ["Li5[0]", "TextField11[0]", "incomeSpousalSupport"],
    ["Li7[0]", "TextField13[0]", "incomePension"],
    ["Li8[0]", "TextField14[0]", "incomeSocialSecurity"],
    ["Li10[0]", "TextField16[0]", "incomeUnemployment"],
  ];
  for (const [li, field, key] of incomeLines) {
    const val = fl[key];
    if (val) {
      setText(form, P2 + `List5[0].${li}.${field}`, val);
    }
  }
  if (fl.incomePublicAssistance) {
    check(form, P2 + "List5[0].Li4[0].CBChoice1_cb[0]");
  }
  if (fl.incomeOther) {
    setText(form, P2 + "List5[0].Li12[0].TextField18[0]", fl.incomeOther);
  }

  // --- 10. Deductions ---
  setText(form, P2 + "List10[0].L1[0].FillText1[0]", fl.deductionUnionDues);
  setText(form, P2 + "List10[0].L2[0].FillText1[0]", fl.deductionRetirement);
  setText(form, P2 + "List10[0].L3[0].FillText1[0]", fl.deductionHealthInsurance);
  setText(form, P2 + "List10[0].L4[0].FillText1[0]", fl.deductionChildSupportOther);

  // --- 11. Assets ---
  setText(form, P2 + "List11[0].L1[0].FillText1[0]", fl.assetCash);
  setText(form, P2 + "List11[0].L2[0].FillText1[0]", fl.assetStocks);
  setText(form, P2 + "List11[0].L3[0].FillText1[0]", fl.assetOtherProperty);

  // --- 12. People who live with me ---
  const household = fl.household;
  for (let i = 0; i < HOUSEHOLD_ROWS.length && i < household.length; i++) {
    const rowDef = HOUSEHOLD_ROWS[i];
    const member = household[i];
    const base = P3 + `List12[0].${rowDef.row}.`;
    setText(form, base + rowDef.name, member.name);
    setText(form, base + rowDef.age, member.age);
    setText(form, base + rowDef.rel, member.relationship);
    setText(form, base + rowDef.income, member.grossMonthlyIncome);
    if (member.paysExpenses) {
      check(form, base + rowDef.yes);
    } else {
      check(form, base + rowDef.no);
    }
  }

  // --- 13. Estimated monthly expenses ---
  if (fl.expenseHome) {
    setText(form, P3 + "List13[0].Li1[0].List[0].L1[0].EXPN[0]", fl.expenseHome);
  }
  for (const [li, key] of EXPENSE_LINES) {
    const val = fl[key];
    if (val) {
      setText(form, P3 + `List13[0].${li}.EXPN[0]`, val);
    }
  }
  if (fl.expenseOther) {
    setText(form, P3 + "List13[0].Li17[0].EXPN[0]", fl.expenseOther);
  }

  // --- Child support page (only if there are minor children) ---
  if (intake.hasMinorChildren) {
    setText(form, CAP4 + "TitlePartyName[0].Party1_ft[0]", p);
    setText(form, CAP4 + "TitlePartyName[0].Party2_ft[0]", r);
    setText(form, CAP4 + "CaseNumber[0].CaseNumber_ft[0]", intake.caseNumber);

    setText(form, P4 + "List16[0].L1[0].TextField6[0]", fl.numberChildrenUnder18);
    setText(form, P4 + "List16[0].L2[0].TextField[0]", fl.timeWithMePercent);
    setText(form, P4 + "List16[0].L2[0].TextField1[0]", fl.timeWithOtherPercent);

    if (fl.hasChildHealthInsurance) {
      check(form, P4 + "List17[0].L1[0].ChildHC_cb[0]");
    }
    setText(form, P4 + "List17[0].L2[0].FillText1[0]", fl.childInsuranceCompany);
    setText(form, P4 + "List17[0].L4[0].FillText1[0]", fl.childInsuranceMonthlyCost);
  }
}
