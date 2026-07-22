import { z } from "zod";

const phoneRegex = /^(\+1\s?)?(\(?\d{3}\)?[-.\s]?)\d{3}[-.\s]?\d{4}$/;
const zipRegex = /^\d{5}(?:[-\s]\d{4})?$/;

export const petitionSchema = z
  .object({
    petitionerName: z.string().min(2, "Enter petitioner full name"),
    respondentName: z.string().min(2, "Enter respondent full name"),
    streetAddress: z.string().min(5, "Street address is required"),
    city: z.string().min(2, "City is required"),
    state: z.string().min(2, "State is required"),
    zip: z.string().regex(zipRegex, "Enter a valid ZIP code"),
    email: z.string().email("Enter a valid email address"),
    phone: z.string().regex(phoneRegex, "Enter a valid U.S. phone number"),
    relationshipStatus: z.enum(["married", "domesticPartnership", "registeredPartnership", "separated", "other"]),
    residenceCounty: z.string().min(2, "County is required"),
    jurisdictionFacts: z.string().min(10, "Provide jurisdiction facts"),
    marriageDate: z.string().min(1, "Marriage or partnership date is required"),
    separationDate: z.string().optional(),
    hasMinorChildren: z.boolean(),
    numberOfChildren: z.number().int().positive().optional(),
    childrenAges: z.string().optional(),
    legalGrounds: z.array(z.enum(["irreconcilableDifferences", "legalSeparation", "nullity", "other"]).describe("Legal grounds"))
      .min(1, "Select at least one legal ground"),
    custodyRequest: z.enum(["joint", "sole", "other"]),
    visitationPlan: z.string().optional(),
    childSupportRequested: z.boolean(),
    childSupportDetails: z.string().optional(),
    spousalSupportRequested: z.boolean(),
    spousalSupportDetails: z.string().optional(),
    separatePropertyClaims: z.string().optional(),
    communityPropertyClaims: z.string().optional(),
    otherRequests: z.string().optional(),
    attachments: z.array(z.string()).optional(),
  })
  .superRefine((data, ctx) => {
    if (data.hasMinorChildren) {
      if (!data.numberOfChildren || data.numberOfChildren < 1) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["numberOfChildren"],
          message: "Enter the number of minor children",
        });
      }
      if (!data.childrenAges?.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["childrenAges"],
          message: "Provide ages or a short summary for children",
        });
      }
    }

    if (data.childSupportRequested && !data.childSupportDetails?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["childSupportDetails"],
        message: "Provide child support details",
      });
    }

    if (data.spousalSupportRequested && !data.spousalSupportDetails?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["spousalSupportDetails"],
        message: "Provide spousal support details",
      });
    }
  });
