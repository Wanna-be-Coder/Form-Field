"use client";

import { useEffect, useMemo, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, FormProvider } from "react-hook-form";
import {
  ArrowRight,
  ShieldCheck,
  Home,
  Users,
  HeartHandshake,
  FileText,
  Scale,
  BookOpen,
  CheckCircle2,
  Printer,
  Sparkles,
  Calendar,
} from "lucide-react";
import { petitionSchema } from "@/lib/validation/petition.schema";
import { PetitionFormData } from "@/lib/types/petition.types";
import { getCompletionPercent } from "@/lib/utils/form-helpers";
import { FormStateProvider } from "./form-context";
import { FormWrapper } from "./sections/FormWrapper";
import { FormSection } from "./sections/FormSection";
import { FormField } from "./sections/FormField";
import { TextInput } from "./sections/TextInput";
import { TextArea } from "./sections/TextArea";
import { SelectInput } from "./sections/SelectInput";
import { RadioGroup } from "./sections/RadioGroup";
import { CheckboxGroup } from "./sections/CheckboxGroup";
import { DatePicker } from "./sections/DatePicker";
import { FileUpload } from "./sections/FileUpload";
import { FormStepper } from "./sections/FormStepper";
import { FormPreview } from "./sections/FormPreview";

const defaultValues: PetitionFormData = {
  petitionerName: "",
  respondentName: "",
  streetAddress: "",
  city: "",
  state: "",
  zip: "",
  email: "",
  phone: "",
  relationshipStatus: "married",
  residenceCounty: "",
  jurisdictionFacts: "",
  marriageDate: "",
  separationDate: "",
  hasMinorChildren: false,
  numberOfChildren: undefined,
  childrenAges: "",
  legalGrounds: [],
  custodyRequest: "joint",
  visitationPlan: "",
  childSupportRequested: false,
  childSupportDetails: "",
  spousalSupportRequested: false,
  spousalSupportDetails: "",
  separatePropertyClaims: "",
  communityPropertyClaims: "",
  otherRequests: "",
  attachments: [],
};

const sectionDefinitions = [
  {
    key: "party",
    label: "Party Information",
    description: "Enter petitioner and respondent contact details for the dissolution petition.",
    icon: Users,
  },
  {
    key: "relationship",
    label: "Legal Relationship",
    description: "Document the current relationship status and dates required by California Family Law.",
    icon: HeartHandshake,
  },
  {
    key: "residence",
    label: "Residence & Jurisdiction",
    description: "Confirm residency and jurisdiction facts for filing in Riverside County.",
    icon: Home,
  },
  {
    key: "statistics",
    label: "Statistical Facts",
    description: "Provide marriage, partnership, and separation dates used by the court.",
    icon: Calendar,
  },
  {
    key: "children",
    label: "Minor Children",
    description: "Capture minor child information and custody details if applicable.",
    icon: ShieldCheck,
  },
  {
    key: "grounds",
    label: "Legal Grounds",
    description: "Select the legal grounds for the petition.",
    icon: FileText,
  },
  {
    key: "custody",
    label: "Child Custody & Visitation",
    description: "Describe custody preferences and visitation arrangements.",
    icon: Scale,
  },
  {
    key: "support",
    label: "Support Requests",
    description: "Request child support or spousal support if needed.",
    icon: BookOpen,
  },
  {
    key: "property",
    label: "Property & Assets",
    description: "Detail separate and community property claims.",
    icon: Sparkles,
  },
  {
    key: "other",
    label: "Other Requests & Declarations",
    description: "Add any additional court requests and attach supporting documents.",
    icon: CheckCircle2,
  },
];

export default function PetitionForm() {
  const methods = useForm<PetitionFormData>({
    resolver: zodResolver(petitionSchema),
    defaultValues,
    mode: "onTouched",
  });

  const [activeStep, setActiveStep] = useState(0);
  const [isMultiStep, setIsMultiStep] = useState(false);
  const [submittedData, setSubmittedData] = useState<PetitionFormData | null>(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [darkMode, setDarkMode] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);

  const { handleSubmit, watch, reset, formState } = methods;
  const watchedValues = watch();
  const completion = useMemo(() => getCompletionPercent(watchedValues), [watchedValues]);

  useEffect(() => {
    const draft = window.localStorage.getItem("riverside-petition-draft");
    if (draft) {
      try {
        reset(JSON.parse(draft));
      } catch (error) {
        console.error("Failed to parse saved draft", error);
      }
    }
    setIsHydrated(true);
  },[reset]);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
  }, [darkMode]);

  useEffect(() => {
    if (!isHydrated) {
      return;
    }

    const subscription = watch((value) => {
      window.localStorage.setItem("riverside-petition-draft", JSON.stringify(value));
    });

    return () => subscription.unsubscribe();
  }, [watch, isHydrated]);


  const onSubmit = async (data: PetitionFormData) => {
    setSuccessMessage("");
    setSubmittedData(null);
    await new Promise((resolve) => setTimeout(resolve, 800));
    setSubmittedData(data);
    setSuccessMessage("Your petition submission has been prepared. You may print or review the completed form.");
    window.localStorage.removeItem("riverside-petition-draft");
  };

  const stepIndex = isMultiStep ? activeStep : 0;
  const visibleStep = isMultiStep ? sectionDefinitions[stepIndex] : null;
  const totalSteps = sectionDefinitions.length;

  const handleNextStep = () => setActiveStep((current) => Math.min(current + 1, totalSteps - 1));
  const handlePreviousStep = () => setActiveStep((current) => Math.max(current - 1, 0));

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-2">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-sky-700 dark:text-sky-300">Riverside County Petition</p>
            <h1 className="text-3xl font-semibold tracking-tight text-slate-950 dark:text-white">California Dissolution / Legal Separation Petition</h1>
            <p className="max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-300">
              Responsive FL-100 petition form with guided sections, autosave, validation, and a print-ready confirmation experience.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => setIsMultiStep((value) => !value)}
              className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-900 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800"
            >
              {isMultiStep ? "Switch to single page" : "Use multi-step mode"}
              <ArrowRight className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => setDarkMode((value) => !value)}
              className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-900 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800"
            >
              {darkMode ? "Light mode" : "Dark mode"}
            </button>
          </div>
        </div>

        <div className="mt-6 rounded-2xl bg-sky-50 p-4 text-slate-700 dark:bg-slate-900 dark:text-slate-200">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <span className="text-sm font-semibold">Form completion</span>
            <span className="text-sm text-slate-500 dark:text-slate-300">{completion}% complete</span>
          </div>
          <div className="mt-3 h-3 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
            <div className="h-full rounded-full bg-sky-600 transition-all duration-300" style={{ width: `${completion}%` }} />
          </div>
        </div>
      </div>

      <FormProvider {...methods}>
        <FormStateProvider value={{ activeStep, setActiveStep, isMultiStep, setIsMultiStep }}>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {successMessage ? (
              <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-5 text-emerald-900 shadow-sm dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-100">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="mt-1 h-6 w-6" />
                  <div>
                    <p className="font-semibold">Submission prepared</p>
                    <p className="mt-1 text-sm text-emerald-800 dark:text-emerald-200">{successMessage}</p>
                  </div>
                </div>
              </div>
            ) : null}

            <FormWrapper
              title="FL-100 Petition Details"
              description="Complete each section of the dissolution petition. Required fields are validated as you go."
              controls={
                <div className="flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-950 dark:hover:bg-slate-200"
                  >
                    <Printer className="h-4 w-4" />
                    Print form
                  </button>
                </div>
              }
            >
              <div className="space-y-5">
                <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">
                  <div className="border-b border-slate-200 bg-slate-50 px-5 py-4 dark:border-slate-800 dark:bg-slate-900">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="text-sm font-medium uppercase tracking-[0.24em] text-sky-700 dark:text-sky-300">Form mode</p>
                        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                          {isMultiStep ? "Multi-step experience" : "Single-page experience"}
                        </p>
                      </div>
                      <div className="rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                        {isMultiStep ? `Step ${activeStep + 1} of ${totalSteps}` : "All sections visible"}
                      </div>
                    </div>
                  </div>

                  {isMultiStep ? (
                    <div className="p-5">
                      <FormStepper
                        steps={sectionDefinitions.map((section) => section.label)}
                        activeStep={activeStep}
                        onStepChange={(index) => setActiveStep(index)}
                      />
                    </div>
                  ) : null}
                </div>

                {(isMultiStep ? [visibleStep] : sectionDefinitions).map((section, index) => {
                  if (!section) return null;
                  const sectionIndex = isMultiStep ? activeStep : index;
                  const hidden = isMultiStep && visibleStep?.key !== section.key;
                  return (
                    <div key={section.key} className={hidden ? "hidden" : ""}>
                      <FormSection
                        title={section.label}
                        description={section.description}
                        icon={section.icon}
                      >
                        {section.key === "party" ? (
                          <div className="grid gap-4 md:grid-cols-2">
                            <FormField name="petitionerName" label="Petitioner full name" hint="Name as it appears on official documents.">
                              <TextInput name="petitionerName" placeholder="Jane Doe" />
                            </FormField>
                            <FormField name="respondentName" label="Respondent full name" hint="Name of the other party in the petition.">
                              <TextInput name="respondentName" placeholder="John Doe" />
                            </FormField>
                            <FormField name="streetAddress" label="Street address">
                              <TextInput name="streetAddress" placeholder="123 Example Street" />
                            </FormField>
                            <FormField name="city" label="City">
                              <TextInput name="city" placeholder="Riverside" />
                            </FormField>
                            <FormField name="state" label="State">
                              <SelectInput name="state" options={[{ label: "CA", value: "CA" }, { label: "Other", value: "Other" }]} />
                            </FormField>
                            <FormField name="zip" label="ZIP code">
                              <TextInput name="zip" placeholder="92501" />
                            </FormField>
                            <FormField name="email" label="Email address" hint="Use an email you check daily.">
                              <TextInput name="email" placeholder="jane@example.com" type="email" />
                            </FormField>
                            <FormField name="phone" label="Phone number">
                              <TextInput name="phone" placeholder="(951) 555-1234" type="tel" />
                            </FormField>
                          </div>
                        ) : section.key === "relationship" ? (
                          <div className="grid gap-4 md:grid-cols-2">
                            <FormField name="relationshipStatus" label="Relationship status">
                              <RadioGroup
                                name="relationshipStatus"
                                options={[
                                  { label: "Married", value: "married" },
                                  { label: "Domestic partnership", value: "domesticPartnership" },
                                  { label: "Registered domestic partnership", value: "registeredPartnership" },
                                  { label: "Separated", value: "separated" },
                                  { label: "Other", value: "other" },
                                ]}
                              />
                            </FormField>
                            <FormField name="marriageDate" label="Marriage / registration date">
                              <DatePicker name="marriageDate" />
                            </FormField>
                            <FormField name="separationDate" label="Date of separation" hint="If applicable, leave blank if not separated.">
                              <DatePicker name="separationDate" />
                            </FormField>
                          </div>
                        ) : section.key === "residence" ? (
                          <div className="grid gap-4">
                            <FormField name="residenceCounty" label="County of residence">
                              <SelectInput
                                name="residenceCounty"
                                options={[
                                  { label: "Riverside", value: "Riverside" },
                                  { label: "San Bernardino", value: "San Bernardino" },
                                  { label: "Los Angeles", value: "Los Angeles" },
                                  { label: "Other", value: "Other" },
                                ]}
                              />
                            </FormField>
                            <FormField name="jurisdictionFacts" label="Residency and jurisdiction facts" hint="Explain where the petitioner has lived for the last 6 months and whether the court has jurisdiction.">
                              <TextArea name="jurisdictionFacts" placeholder="E.g., Petitioner has lived in Riverside County for 6 months and the respondent is subject to jurisdiction." />
                            </FormField>
                          </div>
                        ) : section.key === "statistics" ? (
                          <div className="grid gap-4 md:grid-cols-2">
                            <FormField name="marriageDate" label="Marriage or registration date">
                              <DatePicker name="marriageDate" />
                            </FormField>
                            <FormField name="separationDate" label="Date of separation">
                              <DatePicker name="separationDate" />
                            </FormField>
                          </div>
                        ) : section.key === "children" ? (
                          <div className="grid gap-4">
                            <FormField name="hasMinorChildren" label="Minor children under 18?">
                              <RadioGroup
                                name="hasMinorChildren"
                                options={[{ label: "Yes", value: "true" }, { label: "No", value: "false" }]}
                                transformValue={(value) => value === "true"}
                              />
                            </FormField>
                            {watchedValues.hasMinorChildren ? (
                              <div className="grid gap-4 md:grid-cols-2">
                                <FormField name="numberOfChildren" label="Number of minor children">
                                  <TextInput name="numberOfChildren" placeholder="2" type="number" />
                                </FormField>
                                <FormField name="childrenAges" label="Children ages or summary">
                                  <TextArea name="childrenAges" placeholder="E.g. 8 and 11, currently living with petitioner." />
                                </FormField>
                              </div>
                            ) : (
                              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
                                Use the question above to expand child-related fields if there are minor children.
                              </div>
                            )}
                          </div>
                        ) : section.key === "grounds" ? (
                          <div className="grid gap-4">
                            <FormField name="legalGrounds" label="Select the legal ground(s) for your petition">
                              <CheckboxGroup
                                name="legalGrounds"
                                options={[
                                  { label: "Irreconcilable differences", value: "irreconcilableDifferences" },
                                  { label: "Legal separation", value: "legalSeparation" },
                                  { label: "Nullity", value: "nullity" },
                                  { label: "Other legal ground", value: "other" },
                                ]}
                              />
                            </FormField>
                          </div>
                        ) : section.key === "custody" ? (
                          <div className="grid gap-4">
                            <FormField name="custodyRequest" label="Custody request">
                              <RadioGroup
                                name="custodyRequest"
                                options={[
                                  { label: "Joint custody", value: "joint" },
                                  { label: "Sole custody", value: "sole" },
                                  { label: "Other custody plan", value: "other" },
                                ]}
                              />
                            </FormField>
                            <FormField name="visitationPlan" label="Visitation plan" hint="Summarize the proposed parenting time schedule.">
                              <TextArea name="visitationPlan" placeholder="E.g. weekends with respondent, holidays alternating." />
                            </FormField>
                            <FormField name="childSupportRequested" label="Request child support?">
                              <RadioGroup
                                name="childSupportRequested"
                                options={[{ label: "Yes", value: "true" }, { label: "No", value: "false" }]}
                                transformValue={(value) => value === "true"}
                              />
                            </FormField>
                            {watchedValues.childSupportRequested ? (
                              <FormField name="childSupportDetails" label="Child support details">
                                <TextArea name="childSupportDetails" placeholder="E.g. request California guideline support and healthcare coverage." />
                              </FormField>
                            ) : null}
                          </div>
                        ) : section.key === "support" ? (
                          <div className="grid gap-4">
                            <FormField name="spousalSupportRequested" label="Request spousal/domestic partner support?">
                              <RadioGroup
                                name="spousalSupportRequested"
                                options={[{ label: "Yes", value: "true" }, { label: "No", value: "false" }]}
                                transformValue={(value) => value === "true"}
                              />
                            </FormField>
                            {watchedValues.spousalSupportRequested ? (
                              <FormField name="spousalSupportDetails" label="Spousal support details">
                                <TextArea name="spousalSupportDetails" placeholder="E.g. request support for 24 months with review after 12 months." />
                              </FormField>
                            ) : null}
                          </div>
                        ) : section.key === "property" ? (
                          <div className="grid gap-4">
                            <FormField name="separatePropertyClaims" label="Separate property claims" hint="Identify property you claim as separate.">
                              <TextArea name="separatePropertyClaims" placeholder="E.g. inheritance, premarital assets, or gifts to one spouse." />
                            </FormField>
                            <FormField name="communityPropertyClaims" label="Community / quasi-community property">
                              <TextArea name="communityPropertyClaims" placeholder="E.g. joint bank accounts, retirement savings, household goods." />
                            </FormField>
                          </div>
                        ) : section.key === "other" ? (
                          <div className="grid gap-4">
                            <FormField name="otherRequests" label="Other requests or declarations" hint="Use this field for temporary orders or additional court requests.">
                              <TextArea name="otherRequests" placeholder="E.g. request a domestic violence restraining order, attorney fees, or other relief." />
                            </FormField>
                            <FormField name="attachments" label="Attachment names" hint="Upload supporting documents or list attachment names.">
                              <FileUpload name="attachments" />
                            </FormField>
                          </div>
                        ) : null}
                      </FormSection>
                    </div>
                  );
                })}

                <div className="grid gap-4 rounded-3xl border border-slate-200 bg-slate-50 p-5 text-sm text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
                  <p className="font-semibold">Section navigation</p>
                  {isMultiStep ? (
                    <div className="flex flex-wrap items-center gap-3">
                      <button
                        type="button"
                        disabled={activeStep === 0}
                        onClick={handlePreviousStep}
                        className="inline-flex items-center justify-center rounded-full bg-white px-4 py-2 text-sm font-medium text-slate-900 shadow-sm transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-slate-950 dark:text-slate-100 dark:hover:bg-slate-800"
                      >
                        Previous section
                      </button>
                      <button
                        type="button"
                        onClick={handleNextStep}
                        disabled={activeStep === totalSteps - 1}
                        className="inline-flex items-center justify-center rounded-full bg-sky-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        Next section
                      </button>
                    </div>
                  ) : (
                    <p className="text-slate-600 dark:text-slate-400">Use multi-step mode to focus on one section at a time, or complete the form as a single page.</p>
                  )}
                </div>

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                    <p className="font-medium">Review before submitting</p>
                    <p>All required fields are validated. Be sure to confirm your entries before submitting.</p>
                  </div>
                  <button
                    type="button"
                    onClick={()=>reset(defaultValues)}
                    className="inline-flex items-center justify-center rounded-full bg-slate-950 px-6 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-slate-100 dark:text-slate-950 dark:hover:bg-slate-200"
                  >
                    Reset Form
                  </button>
                  <button
                    type="submit"
                    disabled={formState.isSubmitting}
                    className="inline-flex items-center justify-center rounded-full bg-slate-950 px-6 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-slate-100 dark:text-slate-950 dark:hover:bg-slate-200"
                  >
                    {formState.isSubmitting ? "Submitting..." : "Submit petition"}
                  </button>
                </div>
              </div>
            </FormWrapper>
          </form>
        </FormStateProvider>
      </FormProvider>

      <FormPreview data={submittedData} />
    </div>
  );
}
