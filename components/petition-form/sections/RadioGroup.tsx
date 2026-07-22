"use client";

import { useController } from "react-hook-form";

export function RadioGroup({
  name,
  options,
  transformValue,
}: {
  name: string;
  options: Array<{ label: string; value: string | boolean }>;
  transformValue?: (value: string) => boolean;
}) {
  const { field } = useController({ name });

  return (
    <fieldset className="space-y-3">
      {options.map((option) => (
        <label key={String(option.value)} className="flex cursor-pointer items-center gap-3 rounded-lg border border-slate-200 p-3 transition hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-900">
          <input
            type="radio"
            name={name}
            value={String(option.value)}
            checked={
              transformValue
                ? String(field.value) === String(option.value)
                : field.value === option.value
            }
            onChange={(e) => {
              field.onChange(
                transformValue ? transformValue(e.target.value) : e.target.value
              );
            }}
            className="h-4 w-4 border-slate-300 text-sky-600 focus:ring-sky-500"
          />
          <span className="text-sm font-medium text-slate-900 dark:text-white">
            {option.label}
          </span>
        </label>
      ))}
    </fieldset>
  );
}
