"use client";

import { useEffect, useMemo, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormProvider, useForm } from "react-hook-form";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Printer,
  FileText,
  Moon,
  Sun,
  RotateCcw,
  Pencil,
  AlertCircle,
} from "lucide-react";
import { packetSchema } from "@/lib/validation/packet.schema";
import { PacketFormData } from "@/lib/types/packet.types";
import { packetDefaults } from "@/lib/utils/packet-defaults";
import { getPacketCompletion, petitionerName, respondentName } from "@/lib/utils/packet-helpers";
import { CASE_TYPE_LABELS, COURTHOUSES } from "@/lib/constants/packet.constants";

import { IntakeStep } from "./steps/IntakeStep";
import { FL100Step } from "./steps/FL100Step";
import { FL110Step } from "./steps/FL110Step";
import { FL105Step } from "./steps/FL105Step";
import { RIFL036Step } from "./steps/RIFL036Step";
import { RIFL011Step } from "./steps/RIFL011Step";
import { FL142Step } from "./steps/FL142Step";
import { FL150Step } from "./steps/FL150Step";
import { FL140Step } from "./steps/FL140Step";
import { FL115Step } from "./steps/FL115Step";
import { PacketPrint } from "./print/PacketPrint";

const STORAGE_KEY = "riverside-dissolution-packet";

type StepDef = {
  key: string;
  label: string;
  // Top-level PacketFormData keys whose validation errors belong to this step.
  errorKeys: Array<keyof PacketFormData>;
  render: () => React.ReactNode;
  requiresChildren?: boolean;
};

const STEPS: StepDef[] = [
  { key: "intake", label: "Basic Info", errorKeys: ["intake"], render: () => <IntakeStep /> },
  { key: "fl100", label: "Petition", errorKeys: ["fl100"], render: () => <FL100Step /> },
  { key: "fl110", label: "Summons", errorKeys: ["fl110"], render: () => <FL110Step /> },
  { key: "fl105", label: "Children / UCCJEA", errorKeys: ["fl105"], render: () => <FL105Step />, requiresChildren: true },
  {
    key: "residence",
    label: "Residence & Contact",
    errorKeys: ["rifl036", "rifl011"],
    render: () => (
      <div className="space-y-6">
        <RIFL036Step />
        <RIFL011Step />
      </div>
    ),
  },
  { key: "fl142", label: "Assets & Debts", errorKeys: ["fl142"], render: () => <FL142Step /> },
  { key: "fl150", label: "Income & Expense", errorKeys: ["fl150"], render: () => <FL150Step /> },
  { key: "fl140", label: "Disclosure", errorKeys: ["fl140"], render: () => <FL140Step /> },
  { key: "fl115", label: "Proof of Service", errorKeys: ["fl115"], render: () => <FL115Step /> },
];

export default function PacketForm() {
  const methods = useForm<PacketFormData>({
    resolver: zodResolver(packetSchema),
    defaultValues: packetDefaults,
    mode: "onTouched",
  });

  const { handleSubmit, watch, reset, formState } = methods;

  const [activeStep, setActiveStep] = useState(0);
  const [submitted, setSubmitted] = useState<PacketFormData | null>(null);
  const [darkMode, setDarkMode] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [showValidationBanner, setShowValidationBanner] = useState(false);

  const values = watch();
  const hasChildren = watch("intake.hasMinorChildren");
  const completion = useMemo(() => getPacketCompletion(values), [values]);

  // Steps that apply to this case (UCCJEA only when there are minor children),
  // plus a trailing Review step.
  const activeSteps = useMemo(
    () => STEPS.filter((s) => (s.requiresChildren ? hasChildren : true)),
    [hasChildren],
  );
  const totalSteps = activeSteps.length + 1; // + Review
  const isReview = activeStep === activeSteps.length;

  // Restore any saved draft.
  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved) reset({ ...packetDefaults, ...JSON.parse(saved) });
    } catch (error) {
      console.error("Could not restore saved packet draft", error);
    }
    setHydrated(true);
  }, [reset]);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
  }, [darkMode]);

  // Autosave.
  useEffect(() => {
    if (!hydrated) return;
    const sub = watch((value) => {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
    });
    return () => sub.unsubscribe();
  }, [watch, hydrated]);

  // Keep the active step index valid if the step list shrinks.
  useEffect(() => {
    if (activeStep > activeSteps.length) setActiveStep(activeSteps.length);
  }, [activeStep, activeSteps.length]);

  const goTo = (index: number) => {
    setActiveStep(index);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const onSubmit = (data: PacketFormData) => {
    setShowValidationBanner(false);
    setSubmitted(data);
    window.localStorage.removeItem(STORAGE_KEY);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const onInvalid = () => {
    setShowValidationBanner(true);
    // Jump to the first step that has an error.
    const errs = formState.errors as Record<string, unknown>;
    const firstStep = activeSteps.findIndex((s) => s.errorKeys.some((k) => errs[k]));
    if (firstStep >= 0) goTo(firstStep);
  };

  const startOver = () => {
    reset(packetDefaults);
    setSubmitted(null);
    setActiveStep(0);
    window.localStorage.removeItem(STORAGE_KEY);
  };

  // ---- Submitted: show the printable packet ----------------------------------
  if (submitted) {
    return (
      <div className="space-y-6">
        <div className="no-print rounded-2xl border border-emerald-200 bg-emerald-50 p-5 shadow-sm dark:border-emerald-900 dark:bg-emerald-950">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="mt-0.5 h-6 w-6 text-emerald-600 dark:text-emerald-300" />
              <div>
                <h2 className="text-lg font-semibold text-emerald-950 dark:text-emerald-50">
                  Your packet is ready
                </h2>
                <p className="mt-1 text-sm text-emerald-800 dark:text-emerald-200">
                  Review the forms below, then print or save them as a PDF. Use your browser&apos;s
                  &ldquo;Save as PDF&rdquo; option in the print dialog to download a copy.
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => window.print()}
                className="inline-flex items-center gap-2 rounded-full bg-sky-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-sky-700"
              >
                <Printer className="h-4 w-4" />
                Print / Save as PDF
              </button>
              <button
                type="button"
                onClick={() => setSubmitted(null)}
                className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800"
              >
                <Pencil className="h-4 w-4" />
                Back to edit
              </button>
              <button
                type="button"
                onClick={startOver}
                className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800"
              >
                <RotateCcw className="h-4 w-4" />
                Start over
              </button>
            </div>
          </div>
        </div>

        <div className="packet-preview">
          <PacketPrint data={submitted} />
        </div>
      </div>
    );
  }

  // ---- Editing: the wizard ----------------------------------------------------
  return (
    <div className="space-y-6">
      <header className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-1.5">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-700 dark:text-sky-300">
              Superior Court of California · County of Riverside
            </p>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
              Dissolution, Legal Separation, or Nullity
            </h1>
            <p className="max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-300">
              Complete the guided packet once. Your information fills every required court form
              (FL-100, FL-110, FL-105, FL-142, FL-150, FL-140, FL-115 and the Riverside local forms),
              which you can then print or save as a PDF.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setDarkMode((v) => !v)}
            aria-label="Toggle dark mode"
            className="inline-flex shrink-0 items-center gap-2 rounded-full border border-slate-300 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-800 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800"
          >
            {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            {darkMode ? "Light" : "Dark"}
          </button>
        </div>

        <div className="mt-5 rounded-xl bg-slate-50 p-4 dark:bg-slate-900">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium text-slate-700 dark:text-slate-200">Overall progress</span>
            <span className="text-slate-500 dark:text-slate-400">{completion}%</span>
          </div>
          <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
            <div
              className="h-full rounded-full bg-sky-600 transition-all duration-300"
              style={{ width: `${completion}%` }}
            />
          </div>
        </div>
      </header>

      {/* Stepper */}
      <nav className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950">
        <ol className="flex flex-wrap gap-2">
          {activeSteps.map((step, index) => {
            const state =
              index === activeStep ? "active" : index < activeStep ? "done" : "upcoming";
            return (
              <li key={step.key}>
                <button
                  type="button"
                  onClick={() => goTo(index)}
                  className={`inline-flex items-center gap-2 rounded-full px-3.5 py-2 text-xs font-medium transition sm:text-sm ${
                    state === "active"
                      ? "bg-sky-600 text-white shadow-sm"
                      : state === "done"
                        ? "bg-sky-50 text-sky-700 hover:bg-sky-100 dark:bg-sky-950/50 dark:text-sky-200"
                        : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
                  }`}
                >
                  <span
                    className={`flex h-5 w-5 items-center justify-center rounded-full text-[11px] font-semibold ${
                      state === "active"
                        ? "bg-white/25"
                        : "bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-200"
                    }`}
                  >
                    {index + 1}
                  </span>
                  {step.label}
                </button>
              </li>
            );
          })}
          <li>
            <button
              type="button"
              onClick={() => goTo(activeSteps.length)}
              className={`inline-flex items-center gap-2 rounded-full px-3.5 py-2 text-xs font-medium transition sm:text-sm ${
                isReview
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
              }`}
            >
              <FileText className="h-4 w-4" />
              Review &amp; Print
            </button>
          </li>
        </ol>
      </nav>

      {showValidationBanner && !formState.isValid ? (
        <div className="flex items-start gap-2.5 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-100">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <p>Some required fields still need attention. We&apos;ve jumped you to the first section that needs a fix — look for the fields marked in red.</p>
        </div>
      ) : null}

      <FormProvider {...methods}>
        <form onSubmit={handleSubmit(onSubmit, onInvalid)} className="space-y-6">
          {isReview ? (
            <ReviewStep values={values} steps={activeSteps} onEdit={goTo} />
          ) : (
            activeSteps[activeStep]?.render()
          )}

          {/* Navigation */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <button
              type="button"
              onClick={() => goTo(Math.max(activeStep - 1, 0))}
              disabled={activeStep === 0}
              className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800"
            >
              <ArrowLeft className="h-4 w-4" />
              Previous
            </button>

            {isReview ? (
              <button
                type="submit"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-emerald-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700"
              >
                <FileText className="h-4 w-4" />
                Generate packet
              </button>
            ) : (
              <button
                type="button"
                onClick={() => goTo(Math.min(activeStep + 1, activeSteps.length))}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-sky-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-sky-700"
              >
                Next
                <ArrowRight className="h-4 w-4" />
              </button>
            )}
          </div>
          <p className="text-center text-xs text-slate-400 dark:text-slate-500">
            Step {Math.min(activeStep + 1, totalSteps)} of {totalSteps} · Your progress is saved
            automatically on this device.
          </p>
        </form>
      </FormProvider>
    </div>
  );
}

function ReviewStep({
  values,
  steps,
  onEdit,
}: {
  values: PacketFormData;
  steps: StepDef[];
  onEdit: (index: number) => void;
}) {
  const { intake } = values;
  const court = intake.courthouse ? COURTHOUSES[intake.courthouse] : undefined;

  const summary: Array<{ label: string; value: string }> = [
    { label: "Petitioner", value: petitionerName(intake) || "—" },
    { label: "Respondent", value: respondentName(intake) || "—" },
    { label: "Case type", value: CASE_TYPE_LABELS[intake.caseType] ?? "—" },
    {
      label: "Minor children",
      value: intake.hasMinorChildren ? `Yes (${intake.children.length})` : "No",
    },
    { label: "Filing court", value: court ? `${court.name} — ${court.address}` : "—" },
    {
      label: "Filing method",
      value:
        intake.filingOption === "online"
          ? "Electronic (online)"
          : intake.filingOption === "inPerson"
            ? "In person"
            : "—",
    },
  ];

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">
      <header className="border-b border-slate-200 bg-slate-50/80 px-5 py-4 dark:border-slate-800 dark:bg-slate-900/60">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Review &amp; Generate</h2>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
          Confirm the summary below, then generate your packet to print or save as a PDF.
        </p>
      </header>
      <div className="space-y-6 p-5">
        <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {summary.map((item) => (
            <div key={item.label} className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900">
              <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                {item.label}
              </dt>
              <dd className="mt-1 text-sm font-medium text-slate-900 dark:text-white">{item.value}</dd>
            </div>
          ))}
        </dl>

        <div>
          <p className="mb-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
            Forms included in your packet
          </p>
          <ul className="grid gap-2 sm:grid-cols-2">
            {steps.map((step, index) => (
              <li
                key={step.key}
                className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-900"
              >
                <span className="flex items-center gap-2 text-slate-700 dark:text-slate-200">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  {step.label}
                </span>
                <button
                  type="button"
                  onClick={() => onEdit(index)}
                  className="text-xs font-medium text-sky-600 transition hover:text-sky-700 dark:text-sky-300"
                >
                  Edit
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-xs leading-5 text-slate-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
          This tool helps you prepare Riverside County self-help forms. It is not legal advice and
          does not create an attorney–client relationship. Review each form for accuracy before
          filing with the court.
        </div>
      </div>
    </section>
  );
}
