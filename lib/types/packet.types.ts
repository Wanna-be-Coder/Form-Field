// Data model for the Riverside County "Dissolution, Legal Separation, or Nullity"
// self-help packet. The intake page (page 2 of the packet) collects the core
// applicant data once; that data flows into every downstream Judicial Council
// form (FL-100, FL-110, FL-142, FL-150, FL-105/GC-120, FL-140, FL-115) plus the
// two local Riverside forms (RI-FL036, RI-FL011).

export type CaseType = "dissolution" | "legalSeparation" | "nullity";
export type RelationshipType = "marriage" | "domesticPartnership";
export type FilingOption = "inPerson" | "online";

// The four Riverside Superior Court filing locations used across the packet.
export type CourthouseKey = "riverside" | "indio" | "menifee" | "blythe";

export type Child = {
  firstName: string;
  middleName: string;
  lastName: string;
  placeOfBirth: string; // City / State
  dateOfBirth: string; // MM/DD/YYYY (native date input -> yyyy-mm-dd)
  age: string;
};

// ---------------------------------------------------------------------------
// Intake — the interactive page 2 of the packet ("Print/Clear These Forms")
// ---------------------------------------------------------------------------
export type IntakeData = {
  // Your information (Petitioner)
  petitionerFirstName: string;
  petitionerMiddleName: string;
  petitionerLastName: string;
  petitionerStreet: string;
  petitionerCity: string;
  petitionerState: string;
  petitionerZip: string;
  petitionerPhone: string;
  petitionerEmail: string;

  // Your spouse / partner (Respondent)
  respondentFirstName: string;
  respondentMiddleName: string;
  respondentLastName: string;

  caseType: CaseType;
  relationshipType: RelationshipType;

  marriageDate: string;

  hasMinorChildren: boolean;
  numberOfChildren: string;
  children: Child[];

  courthouse: CourthouseKey | "";

  filingOption: FilingOption | "";
  electronicSignatureName: string; // typed name = e-signature (online option)

  todaysDate: string;
};

// ---------------------------------------------------------------------------
// FL-100 Petition — Marriage/Domestic Partnership
// ---------------------------------------------------------------------------
export type FL100Data = {
  amended: boolean;
  caseNumber: string;

  // 1. Legal relationship (check all that apply)
  legalRelationship: Array<"married" | "dpInCA" | "dpNotInCA">;

  // 2. Residence requirements
  residencyMet: boolean;
  residencyParty: "petitioner" | "respondent" | "";
  residencyDpInCA: boolean;
  residencySameSex: boolean;
  petitionerLivesIn: string;
  respondentLivesIn: string;

  // 3. Statistical facts
  dateOfSeparation: string;
  dpRegistrationDate: string;

  // 4. Minor children
  minorChildrenChoice: "none" | "listed" | "";
  childBornBeforeMarriage: boolean;
  uccjeaAttached: boolean;
  voluntaryParentage: boolean;

  // 5. Legal grounds
  groundsDivorceOrSeparation: "" | "irreconcilable" | "incapacity";
  groundsNullityVoid: "" | "incest" | "bigamy";
  groundsNullityVoidable:
    | ""
    | "age"
    | "priorMarriage"
    | "unsoundMind"
    | "fraud"
    | "force"
    | "physicalIncapacity";

  // 6. Child custody & visitation
  legalCustodyTo: "" | "petitioner" | "respondent" | "joint" | "other";
  physicalCustodyTo: "" | "petitioner" | "respondent" | "joint" | "other";
  visitationTo: "" | "petitioner" | "respondent" | "joint" | "other";

  // 7. Child support
  childSupportOther: string;

  // 8. Spousal / partner support
  spousalSupportTo: "" | "petitioner" | "respondent";
  terminateSupportTo: "" | "petitioner" | "respondent";
  reserveSupportTo: "" | "petitioner" | "respondent";
  spousalSupportOther: string;

  // 9. Separate property
  separatePropertyNone: boolean;
  separatePropertyList: string;

  // 10. Community & quasi-community property
  communityPropertyNone: boolean;
  communityPropertyList: string;

  // 11. Other requests
  attorneyFeesFrom: "" | "petitioner" | "respondent";
  restoreFormerName: boolean;
  formerName: string;
  otherRequests: string;

  // 12. Acknowledgement of restraining orders
  restrainingOrdersRead: boolean;
};

// ---------------------------------------------------------------------------
// FL-110 Summons (Family Law)
// ---------------------------------------------------------------------------
export type FL110Data = {
  caseNumber: string;
  acknowledgeRestraining: boolean;
};

// ---------------------------------------------------------------------------
// RI-FL036 Declaration of Residence
// ---------------------------------------------------------------------------
export type RIFL036Data = {
  reason: "geographic" | "other";
  city: string;
  zip: string;
  otherReason: string;
  date: string;
};

// ---------------------------------------------------------------------------
// RI-FL011 Confidential Contact Information
// ---------------------------------------------------------------------------
export type RIFL011Data = {
  agreeEmail: boolean;
  email: string;
  stopEmail: boolean;
  date: string;
};

// ---------------------------------------------------------------------------
// FL-105 / GC-120 UCCJEA
// ---------------------------------------------------------------------------
export type UCCJEAResidence = {
  fromDate: string;
  toDate: string;
  isCurrent: boolean;
  residence: string; // City, State
  livedWith: string; // person + address
  relationship: string;
};

export type OtherPersonClaim = {
  nameAddress: string;
  hasPhysicalCustody: boolean;
  claimsCustody: boolean;
  claimsVisitation: boolean;
  childrenNames: string;
};

export type FL105Data = {
  role: "party" | "agencyRep" | "";
  residences: UCCJEAResidence[];
  singleResidenceForAll: boolean;
  otherProceedings: boolean;
  otherProceedingsDetails: string;
  restrainingOrders: boolean;
  restrainingOrdersDetails: string;
  otherPersons: boolean;
  persons: OtherPersonClaim[];
  pagesAttached: string;
  date: string;
};

// ---------------------------------------------------------------------------
// FL-142 Schedule of Assets and Debts
// ---------------------------------------------------------------------------
export type AssetEntry = {
  none: boolean;
  description: string;
  sepProp: "" | "P" | "R";
  dateAcquired: string;
  grossValue: string;
  amountOwed: string;
};

export type DebtEntry = {
  none: boolean;
  description: string;
  sepProp: "" | "P" | "R";
  totalOwing: string;
  dateAcquired: string;
};

// Keys map to the numbered categories on the form.
export type AssetKey =
  | "realEstate"
  | "household"
  | "jewelry"
  | "vehicles"
  | "savings"
  | "checking"
  | "creditUnion"
  | "cash"
  | "taxRefund"
  | "lifeInsurance"
  | "stocks"
  | "retirement"
  | "profitSharing"
  | "receivables"
  | "partnerships"
  | "otherAssets";

export type DebtKey =
  | "studentLoans"
  | "taxes"
  | "supportArrears"
  | "unsecuredLoans"
  | "creditCards"
  | "otherDebts";

export type FL142Data = {
  whoseSchedule: "petitioner" | "respondent";
  caseNumber: string;
  assets: Record<AssetKey, AssetEntry>;
  debts: Record<DebtKey, DebtEntry>;
  continuationPages: string;
  date: string;
};

// ---------------------------------------------------------------------------
// FL-150 Income and Expense Declaration
// ---------------------------------------------------------------------------
export type HouseholdMember = {
  name: string;
  age: string;
  relationship: string;
  grossMonthlyIncome: string;
  paysExpenses: boolean;
};

export type FL150Data = {
  caseNumber: string;

  // 1. Employment
  employer: string;
  employerAddress: string;
  employerPhone: string;
  occupation: string;
  dateJobStarted: string;
  dateJobEnded: string;
  hoursPerWeek: string;
  grossPay: string;
  payFrequency: "" | "month" | "week" | "hour";

  // 2. Age & education
  age: string;
  completedHighSchool: boolean;
  highestGrade: string;
  yearsCollege: string;
  collegeDegrees: string;

  // 3. Tax info
  lastTaxYear: string;
  taxFilingStatus:
    | ""
    | "single"
    | "headOfHousehold"
    | "marriedSeparately"
    | "marriedJointly";
  taxFilingJointName: string;

  // 4. Other party income
  otherPartyIncome: string;
  otherPartyIncomeBasis: string;

  // 5. Income (average monthly)
  incomeSalary: string;
  incomeOvertime: string;
  incomeCommissions: string;
  incomePublicAssistance: string;
  incomeSpousalSupport: string;
  incomePension: string;
  incomeSocialSecurity: string;
  incomeUnemployment: string;
  incomeOther: string;

  // 10. Deductions
  deductionUnionDues: string;
  deductionRetirement: string;
  deductionHealthInsurance: string;
  deductionChildSupportOther: string;

  // 11. Assets
  assetCash: string;
  assetStocks: string;
  assetOtherProperty: string;

  // 12. People who live with me
  household: HouseholdMember[];

  // 13. Estimated monthly expenses
  expenseHome: string;
  expenseHealthCare: string;
  expenseChildCare: string;
  expenseGroceries: string;
  expenseEatingOut: string;
  expenseUtilities: string;
  expensePhone: string;
  expenseLaundry: string;
  expenseClothes: string;
  expenseEducation: string;
  expenseEntertainment: string;
  expenseAuto: string;
  expenseInsurance: string;
  expenseSavings: string;
  expenseOther: string;

  // Child support page (only if children)
  numberChildrenUnder18: string;
  timeWithMePercent: string;
  timeWithOtherPercent: string;
  hasChildHealthInsurance: boolean;
  childInsuranceCompany: string;
  childInsuranceMonthlyCost: string;

  date: string;
};

// ---------------------------------------------------------------------------
// FL-140 Declaration of Disclosure
// ---------------------------------------------------------------------------
export type FL140Data = {
  whoseDisclosure: "petitioner" | "respondent";
  disclosureStage: "preliminary" | "final";
  attachSchedule: boolean;
  attachIncomeExpense: boolean;
  attachTaxReturns: boolean;
  attachMaterialFactsAssets: boolean;
  attachMaterialFactsObligations: boolean;
  attachInvestmentOpportunity: boolean;
  date: string;
};

// ---------------------------------------------------------------------------
// FL-115 Proof of Service of Summons
// ---------------------------------------------------------------------------
export type FL115Data = {
  caseNumber: string;
  addressServed: string;
  serviceMethod: "" | "personal" | "substituted" | "mail";
  serviceDate: string;
  serviceTime: string;
  serverName: string;
  serverAddress: string;
  serverPhone: string;
  serverIsRegistered: boolean;
  serverRegistrationNo: string;
  serverCounty: string;
  serverFee: string;
  date: string;
};

// ---------------------------------------------------------------------------
// Full packet
// ---------------------------------------------------------------------------
export type PacketFormData = {
  intake: IntakeData;
  fl100: FL100Data;
  fl110: FL110Data;
  rifl036: RIFL036Data;
  rifl011: RIFL011Data;
  fl105: FL105Data;
  fl142: FL142Data;
  fl150: FL150Data;
  fl140: FL140Data;
  fl115: FL115Data;
};
