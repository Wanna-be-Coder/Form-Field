import { z } from "zod";

const zipRegex = /^\d{5}(?:-\d{4})?$/;
const phoneRegex = /^(\+1\s?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}$/;

const childSchema = z.object({
  firstName: z.string(),
  middleName: z.string(),
  lastName: z.string(),
  placeOfBirth: z.string(),
  dateOfBirth: z.string(),
  age: z.string(),
});

const intakeSchema = z.object({
  petitionerFirstName: z.string().min(1, "Enter your first name"),
  petitionerMiddleName: z.string(),
  petitionerLastName: z.string().min(1, "Enter your last name"),
  petitionerStreet: z.string().min(3, "Enter your street address"),
  petitionerCity: z.string().min(1, "Enter your city"),
  petitionerState: z.string().min(2, "State"),
  petitionerZip: z.string().regex(zipRegex, "Enter a valid ZIP code"),
  petitionerPhone: z.string().regex(phoneRegex, "Enter a valid phone number"),
  petitionerEmail: z.union([z.literal(""), z.string().email("Enter a valid email")]),
  respondentFirstName: z.string().min(1, "Enter your spouse/partner's first name"),
  respondentMiddleName: z.string(),
  respondentLastName: z.string().min(1, "Enter your spouse/partner's last name"),
  caseType: z.enum(["dissolution", "legalSeparation", "nullity"]),
  relationshipType: z.enum(["marriage", "domesticPartnership"]),
  marriageDate: z.string().min(1, "Enter the date of marriage/registration"),
  hasMinorChildren: z.boolean(),
  numberOfChildren: z.string(),
  children: z.array(childSchema),
  courthouse: z.enum(["riverside", "indio", "menifee", "blythe"], {
    message: "Select where your case is filed",
  }),
  filingOption: z.enum(["inPerson", "online"], { message: "Select a filing option" }),
  electronicSignatureName: z.string(),
  todaysDate: z.string().min(1, "Enter today's date"),
});

const fl100Schema = z.object({
  amended: z.boolean(),
  caseNumber: z.string(),
  legalRelationship: z.array(z.enum(["married", "dpInCA", "dpNotInCA"])).min(1, "Select at least one"),
  residencyMet: z.boolean(),
  residencyParty: z.string(),
  residencyDpInCA: z.boolean(),
  residencySameSex: z.boolean(),
  petitionerLivesIn: z.string(),
  respondentLivesIn: z.string(),
  dateOfSeparation: z.string(),
  dpRegistrationDate: z.string(),
  minorChildrenChoice: z.string(),
  childBornBeforeMarriage: z.boolean(),
  uccjeaAttached: z.boolean(),
  voluntaryParentage: z.boolean(),
  groundsDivorceOrSeparation: z.string(),
  groundsNullityVoid: z.string(),
  groundsNullityVoidable: z.string(),
  legalCustodyTo: z.string(),
  physicalCustodyTo: z.string(),
  visitationTo: z.string(),
  childSupportOther: z.string(),
  spousalSupportTo: z.string(),
  terminateSupportTo: z.string(),
  reserveSupportTo: z.string(),
  spousalSupportOther: z.string(),
  separatePropertyNone: z.boolean(),
  separatePropertyList: z.string(),
  communityPropertyNone: z.boolean(),
  communityPropertyList: z.string(),
  attorneyFeesFrom: z.string(),
  restoreFormerName: z.boolean(),
  formerName: z.string(),
  otherRequests: z.string(),
  restrainingOrdersRead: z.boolean(),
});

const assetEntrySchema = z.object({
  none: z.boolean(),
  description: z.string(),
  sepProp: z.string(),
  dateAcquired: z.string(),
  grossValue: z.string(),
  amountOwed: z.string(),
});

const debtEntrySchema = z.object({
  none: z.boolean(),
  description: z.string(),
  sepProp: z.string(),
  totalOwing: z.string(),
  dateAcquired: z.string(),
});

const fl142Schema = z.object({
  whoseSchedule: z.enum(["petitioner", "respondent"]),
  caseNumber: z.string(),
  assets: z.record(z.string(), assetEntrySchema),
  debts: z.record(z.string(), debtEntrySchema),
  continuationPages: z.string(),
  date: z.string(),
});

const householdMemberSchema = z.object({
  name: z.string(),
  age: z.string(),
  relationship: z.string(),
  grossMonthlyIncome: z.string(),
  paysExpenses: z.boolean(),
});

const fl150Schema = z.object({
  caseNumber: z.string(),
  employer: z.string(),
  employerAddress: z.string(),
  employerPhone: z.string(),
  occupation: z.string(),
  dateJobStarted: z.string(),
  dateJobEnded: z.string(),
  hoursPerWeek: z.string(),
  grossPay: z.string(),
  payFrequency: z.string(),
  age: z.string(),
  completedHighSchool: z.boolean(),
  highestGrade: z.string(),
  yearsCollege: z.string(),
  collegeDegrees: z.string(),
  lastTaxYear: z.string(),
  taxFilingStatus: z.string(),
  taxFilingJointName: z.string(),
  otherPartyIncome: z.string(),
  otherPartyIncomeBasis: z.string(),
  incomeSalary: z.string(),
  incomeOvertime: z.string(),
  incomeCommissions: z.string(),
  incomePublicAssistance: z.string(),
  incomeSpousalSupport: z.string(),
  incomePension: z.string(),
  incomeSocialSecurity: z.string(),
  incomeUnemployment: z.string(),
  incomeOther: z.string(),
  deductionUnionDues: z.string(),
  deductionRetirement: z.string(),
  deductionHealthInsurance: z.string(),
  deductionChildSupportOther: z.string(),
  assetCash: z.string(),
  assetStocks: z.string(),
  assetOtherProperty: z.string(),
  household: z.array(householdMemberSchema),
  expenseHome: z.string(),
  expenseHealthCare: z.string(),
  expenseChildCare: z.string(),
  expenseGroceries: z.string(),
  expenseEatingOut: z.string(),
  expenseUtilities: z.string(),
  expensePhone: z.string(),
  expenseLaundry: z.string(),
  expenseClothes: z.string(),
  expenseEducation: z.string(),
  expenseEntertainment: z.string(),
  expenseAuto: z.string(),
  expenseInsurance: z.string(),
  expenseSavings: z.string(),
  expenseOther: z.string(),
  numberChildrenUnder18: z.string(),
  timeWithMePercent: z.string(),
  timeWithOtherPercent: z.string(),
  hasChildHealthInsurance: z.boolean(),
  childInsuranceCompany: z.string(),
  childInsuranceMonthlyCost: z.string(),
  date: z.string(),
});

const uccjeaResidenceSchema = z.object({
  fromDate: z.string(),
  toDate: z.string(),
  isCurrent: z.boolean(),
  residence: z.string(),
  livedWith: z.string(),
  relationship: z.string(),
});

const otherPersonSchema = z.object({
  nameAddress: z.string(),
  hasPhysicalCustody: z.boolean(),
  claimsCustody: z.boolean(),
  claimsVisitation: z.boolean(),
  childrenNames: z.string(),
});

const fl105Schema = z.object({
  role: z.string(),
  residences: z.array(uccjeaResidenceSchema),
  singleResidenceForAll: z.boolean(),
  otherProceedings: z.boolean(),
  otherProceedingsDetails: z.string(),
  restrainingOrders: z.boolean(),
  restrainingOrdersDetails: z.string(),
  otherPersons: z.boolean(),
  persons: z.array(otherPersonSchema),
  pagesAttached: z.string(),
  date: z.string(),
});

export const packetSchema = z
  .object({
    intake: intakeSchema,
    fl100: fl100Schema,
    fl110: z.object({ caseNumber: z.string(), acknowledgeRestraining: z.boolean() }),
    rifl036: z.object({
      reason: z.enum(["geographic", "other"]),
      city: z.string(),
      zip: z.string(),
      otherReason: z.string(),
      date: z.string(),
    }),
    rifl011: z.object({
      agreeEmail: z.boolean(),
      email: z.string(),
      stopEmail: z.boolean(),
      date: z.string(),
    }),
    fl105: fl105Schema,
    fl142: fl142Schema,
    fl150: fl150Schema,
    fl140: z.object({
      whoseDisclosure: z.enum(["petitioner", "respondent"]),
      disclosureStage: z.enum(["preliminary", "final"]),
      attachSchedule: z.boolean(),
      attachIncomeExpense: z.boolean(),
      attachTaxReturns: z.boolean(),
      attachMaterialFactsAssets: z.boolean(),
      attachMaterialFactsObligations: z.boolean(),
      attachInvestmentOpportunity: z.boolean(),
      date: z.string(),
    }),
    fl115: z.object({
      caseNumber: z.string(),
      addressServed: z.string(),
      serviceMethod: z.string(),
      serviceDate: z.string(),
      serviceTime: z.string(),
      serverName: z.string(),
      serverAddress: z.string(),
      serverPhone: z.string(),
      serverIsRegistered: z.boolean(),
      serverRegistrationNo: z.string(),
      serverCounty: z.string(),
      serverFee: z.string(),
      date: z.string(),
    }),
  })
  .superRefine((data, ctx) => {
    const { intake, fl100, rifl036, rifl011 } = data;

    // Minor children: if yes, require a count and at least one child with a name.
    if (intake.hasMinorChildren) {
      if (!intake.numberOfChildren || Number(intake.numberOfChildren) < 1) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["intake", "numberOfChildren"],
          message: "How many minor children?",
        });
      }
      if (intake.children.length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["intake", "children"],
          message: "Add at least one child",
        });
      }
      intake.children.forEach((child, index) => {
        if (!child.firstName.trim() && !child.lastName.trim()) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["intake", "children", index, "firstName"],
            message: "Enter the child's name",
          });
        }
      });
    }

    // Online filing requires a typed electronic signature.
    if (intake.filingOption === "online" && !intake.electronicSignatureName.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["intake", "electronicSignatureName"],
        message: "Type your name to serve as your electronic signature",
      });
    }

    // FL-100 legal grounds depend on the case type.
    if (
      (intake.caseType === "dissolution" || intake.caseType === "legalSeparation") &&
      !fl100.groundsDivorceOrSeparation
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["fl100", "groundsDivorceOrSeparation"],
        message: "Select the legal ground for your case",
      });
    }
    if (
      intake.caseType === "nullity" &&
      !fl100.groundsNullityVoid &&
      !fl100.groundsNullityVoidable
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["fl100", "groundsNullityVoidable"],
        message: "Select a ground for nullity",
      });
    }

    // Declaration of Residence: geographic reason needs city + ZIP; other needs text.
    if (rifl036.reason === "geographic") {
      if (!rifl036.city.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["rifl036", "city"],
          message: "Enter the city of your primary residence",
        });
      }
      if (!rifl036.zip.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["rifl036", "zip"],
          message: "Enter the ZIP code",
        });
      }
    } else if (rifl036.reason === "other" && !rifl036.otherReason.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["rifl036", "otherReason"],
        message: "Explain the reason",
      });
    }

    // Confidential contact: opting into email requires an address.
    if (rifl011.agreeEmail && !rifl011.email.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["rifl011", "email"],
        message: "Enter the email address for self-help information",
      });
    }
  });
