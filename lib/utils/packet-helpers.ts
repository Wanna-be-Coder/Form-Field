import {
  AssetKey,
  DebtKey,
  FL142Data,
  FL150Data,
  IntakeData,
  PacketFormData,
} from "@/lib/types/packet.types";

export function fullName(first?: string, middle?: string, last?: string): string {
  return [first, middle, last].filter((p) => p && p.trim()).join(" ").trim();
}

export function petitionerName(intake: IntakeData): string {
  return fullName(
    intake.petitionerFirstName,
    intake.petitionerMiddleName,
    intake.petitionerLastName,
  );
}

export function respondentName(intake: IntakeData): string {
  return fullName(
    intake.respondentFirstName,
    intake.respondentMiddleName,
    intake.respondentLastName,
  );
}

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

const toNumber = (value: string | undefined): number => {
  if (!value) return 0;
  const n = Number(String(value).replace(/[^0-9.-]/g, ""));
  return Number.isFinite(n) ? n : 0;
};

export function formatCurrency(value: string | number | undefined): string {
  const n = typeof value === "number" ? value : toNumber(value);
  return currency.format(n);
}

// Convert a native date input (yyyy-mm-dd) to the MM/DD/YYYY the courts use.
export function toCourtDate(value: string | undefined): string {
  if (!value) return "";
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return value;
  const [, y, m, d] = match;
  return `${m}/${d}/${y}`;
}

export function totalAssets(fl142: FL142Data): { gross: number; owed: number } {
  const keys = Object.keys(fl142.assets) as AssetKey[];
  return keys.reduce(
    (acc, key) => {
      const entry = fl142.assets[key];
      if (entry.none) return acc;
      acc.gross += toNumber(entry.grossValue);
      acc.owed += toNumber(entry.amountOwed);
      return acc;
    },
    { gross: 0, owed: 0 },
  );
}

export function totalDebts(fl142: FL142Data): number {
  const keys = Object.keys(fl142.debts) as DebtKey[];
  return keys.reduce((sum, key) => {
    const entry = fl142.debts[key];
    return entry.none ? sum : sum + toNumber(entry.totalOwing);
  }, 0);
}

export function totalMonthlyIncome(fl150: FL150Data): number {
  return [
    fl150.incomeSalary,
    fl150.incomeOvertime,
    fl150.incomeCommissions,
    fl150.incomePublicAssistance,
    fl150.incomeSpousalSupport,
    fl150.incomePension,
    fl150.incomeSocialSecurity,
    fl150.incomeUnemployment,
    fl150.incomeOther,
  ].reduce((sum, v) => sum + toNumber(v), 0);
}

export function totalMonthlyExpenses(fl150: FL150Data): number {
  return [
    fl150.expenseHome,
    fl150.expenseHealthCare,
    fl150.expenseChildCare,
    fl150.expenseGroceries,
    fl150.expenseEatingOut,
    fl150.expenseUtilities,
    fl150.expensePhone,
    fl150.expenseLaundry,
    fl150.expenseClothes,
    fl150.expenseEducation,
    fl150.expenseEntertainment,
    fl150.expenseAuto,
    fl150.expenseInsurance,
    fl150.expenseSavings,
    fl150.expenseOther,
  ].reduce((sum, v) => sum + toNumber(v), 0);
}

// Overall progress across the essential intake fields — a light-touch heuristic
// so the header progress bar feels responsive without demanding every field.
export function getPacketCompletion(data: PacketFormData): number {
  const intake = data.intake;
  const checks: Array<boolean> = [
    !!intake.petitionerFirstName && !!intake.petitionerLastName,
    !!intake.petitionerStreet,
    !!intake.petitionerCity && !!intake.petitionerZip,
    !!intake.petitionerPhone,
    !!intake.respondentFirstName || !!intake.respondentLastName,
    !!intake.caseType,
    !!intake.marriageDate,
    intake.hasMinorChildren ? intake.children.length > 0 : true,
    !!intake.courthouse,
    !!intake.filingOption,
    !!data.fl100.groundsDivorceOrSeparation ||
      !!data.fl100.groundsNullityVoid ||
      !!data.fl100.groundsNullityVoidable,
    data.fl100.legalRelationship.length > 0,
    !!data.rifl036.city || data.rifl036.reason === "other",
    !!data.fl140.whoseDisclosure,
  ];
  const done = checks.filter(Boolean).length;
  return Math.round((done / checks.length) * 100);
}
