"use client";

export function FormStepper({
  steps,
  activeStep,
  onStepChange,
}: {
  steps: string[];
  activeStep: number;
  onStepChange: (index: number) => void;
}) {
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {steps.map((step, index) => (
          <button
            key={index}
            type="button"
            onClick={() => onStepChange(index)}
            className={`rounded-full px-4 py-2 text-sm font-medium transition ${
              index === activeStep
                ? "bg-sky-600 text-white shadow-md"
                : "border border-slate-300 bg-white text-slate-900 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-900 dark:text-white dark:hover:bg-slate-800"
            }`}
          >
            <span className="flex items-center gap-2">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-200 text-xs font-semibold dark:bg-slate-700">
                {index + 1}
              </span>
              {step}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
