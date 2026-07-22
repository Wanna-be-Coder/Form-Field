import { PetitionFormData } from "@/lib/types/petition.types";

export function getCompletionPercent(data: Partial<PetitionFormData>): number {
  const fields: (keyof PetitionFormData)[] = [
    "petitionerName",
    "respondentName",
    "streetAddress",
    "city",
    "state",
    "zip",
    "email",
    "phone",
    "relationshipStatus",
    "residenceCounty",
    "jurisdictionFacts",
    "marriageDate",
    "legalGrounds",
    "custodyRequest",
  ];

  const completed = fields.filter((field) => {
    const value = data[field];
    if (Array.isArray(value)) {
      return value.length > 0;
    }
    return value && String(value).trim() !== "";
  }).length;

  return Math.round((completed / fields.length) * 100);
}

export function formatPhoneNumber(value: string): string {
  const digits = value.replace(/\D/g, "");
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
}

export function parsePetitionData(data: PetitionFormData): string {
  const sections = [
    `PETITIONER: ${data.petitionerName}`,
    `RESPONDENT: ${data.respondentName}`,
    `ADDRESS: ${data.streetAddress}, ${data.city}, ${data.state} ${data.zip}`,
    `EMAIL: ${data.email}`,
    `PHONE: ${data.phone}`,
    `RELATIONSHIP: ${data.relationshipStatus}`,
    `COUNTY: ${data.residenceCounty}`,
    `MARRIAGE DATE: ${data.marriageDate}`,
    `SEPARATION DATE: ${data.separationDate || "N/A"}`,
    `LEGAL GROUNDS: ${data.legalGrounds.join(", ")}`,
    `CUSTODY REQUEST: ${data.custodyRequest}`,
    `MINOR CHILDREN: ${data.hasMinorChildren ? `Yes (${data.numberOfChildren})` : "No"}`,
    `CHILD SUPPORT: ${data.childSupportRequested ? "Requested" : "Not requested"}`,
    `SPOUSAL SUPPORT: ${data.spousalSupportRequested ? "Requested" : "Not requested"}`,
  ];

  return sections.join("\n");
}
