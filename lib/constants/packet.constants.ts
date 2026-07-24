import { CourthouseKey } from "@/lib/types/packet.types";

// The four Riverside Superior Court filing locations, exactly as printed on the
// packet's Summons (FL-110) and cover forms.
export const COURTHOUSES: Record<
  CourthouseKey,
  { name: string; address: string; cityStateZip: string }
> = {
  riverside: {
    name: "Riverside",
    address: "4175 Main St.",
    cityStateZip: "Riverside, CA 92501",
  },
  indio: {
    name: "Indio",
    address: "46-200 Oasis St.",
    cityStateZip: "Indio, CA 92201",
  },
  menifee: {
    name: "Menifee",
    address: "27401 Menifee Center Drive",
    cityStateZip: "Menifee, CA 92584",
  },
  blythe: {
    name: "Blythe",
    address: "265 N. Broadway",
    cityStateZip: "Blythe, CA 92225",
  },
};

export const COURTHOUSE_OPTIONS = (
  Object.keys(COURTHOUSES) as CourthouseKey[]
).map((key) => ({
  value: key,
  label: `${COURTHOUSES[key].address}, ${COURTHOUSES[key].cityStateZip}`,
}));

export const CASE_TYPE_LABELS: Record<string, string> = {
  dissolution: "Dissolution (Divorce)",
  legalSeparation: "Legal Separation",
  nullity: "Nullity (Annulment)",
};

export const RELATIONSHIP_LABELS: Record<string, string> = {
  marriage: "Marriage",
  domesticPartnership: "Domestic Partnership",
};

export const US_STATES = [
  "AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA", "HI", "ID", "IL",
  "IN", "IA", "KS", "KY", "LA", "ME", "MD", "MA", "MI", "MN", "MS", "MO", "MT",
  "NE", "NV", "NH", "NJ", "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI",
  "SC", "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY",
];

// Assets on FL-142, in the order they appear on the form.
export const ASSET_CATEGORIES: Array<{
  key: keyof import("@/lib/types/packet.types").FL142Data["assets"];
  no: number;
  label: string;
  hint: string;
}> = [
  { key: "realEstate", no: 1, label: "Real estate", hint: "Give street addresses; attach copies of deeds and latest lender's statement." },
  { key: "household", no: 2, label: "Household furniture, furnishings, appliances", hint: "Identify." },
  { key: "jewelry", no: 3, label: "Jewelry, antiques, art, coin collections, etc.", hint: "Identify." },
  { key: "vehicles", no: 4, label: "Vehicles, boats, trailers", hint: "Describe and attach copy of title document." },
  { key: "savings", no: 5, label: "Savings accounts", hint: "Account name and number, bank, and branch." },
  { key: "checking", no: 6, label: "Checking accounts", hint: "Account name and number, bank, and branch." },
  { key: "creditUnion", no: 7, label: "Credit union, other deposit accounts", hint: "Account name and number, bank, and branch." },
  { key: "cash", no: 8, label: "Cash", hint: "Give location." },
  { key: "taxRefund", no: 9, label: "Tax refund", hint: "" },
  { key: "lifeInsurance", no: 10, label: "Life insurance with cash surrender or loan value", hint: "Attach copy of declaration page for each policy." },
  { key: "stocks", no: 11, label: "Stocks, bonds, secured notes, mutual funds", hint: "Give certificate number; attach copy of certificate or latest statement." },
  { key: "retirement", no: 12, label: "Retirement and pensions", hint: "Attach copy of latest summary plan documents and benefit statement." },
  { key: "profitSharing", no: 13, label: "Profit-sharing, annuities, IRAs, deferred compensation", hint: "Attach copy of latest statement." },
  { key: "receivables", no: 14, label: "Accounts receivable and unsecured notes", hint: "Attach copy of each." },
  { key: "partnerships", no: 15, label: "Partnerships and other business interests", hint: "Attach copy of most current K-1 and Schedule C." },
  { key: "otherAssets", no: 16, label: "Other assets", hint: "" },
];

export const DEBT_CATEGORIES: Array<{
  key: keyof import("@/lib/types/packet.types").FL142Data["debts"];
  no: number;
  label: string;
  hint: string;
}> = [
  { key: "studentLoans", no: 19, label: "Student loans", hint: "Give details." },
  { key: "taxes", no: 20, label: "Taxes", hint: "Give details." },
  { key: "supportArrears", no: 21, label: "Support arrearages", hint: "Attach copies of orders and statements." },
  { key: "unsecuredLoans", no: 22, label: "Loans — unsecured", hint: "Give bank name and loan number; attach latest statement." },
  { key: "creditCards", no: 23, label: "Credit cards", hint: "Give creditor's name and address and account number; attach latest statement." },
  { key: "otherDebts", no: 24, label: "Other debts", hint: "Specify." },
];
