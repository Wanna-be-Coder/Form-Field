"use client";

import { useController } from "react-hook-form";

export function CheckboxGroup({
  name,
  options,
}: {
  name: string;
  options: Array<{ label: string; value: string }>;
}) {
  const { field } = useController({ name });

  return (
    <fieldset className="space-y-3">
      {options.map((option) => (
        <label key={option.value} className="flex cursor-pointer items-center gap-3 rounded-lg border border-slate-200 p-3 transition hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-900">
          <input
            type="checkbox"
            value={option.value}
            checked={Array.isArray(field.value) && field.value.includes(option.value)}
            onChange={(e) => {
              const current = Array.isArray(field.value) ? field.value : [];
              if (e.target.checked) {
                field.onChange([...current, e.target.value]);
              } else {
                field.onChange(current.filter((value) => value !== e.target.value));
              }
            }}
            className="h-4 w-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500"
          />
          <span className="text-sm font-medium text-slate-900 dark:text-white">
            {option.label}
          </span>
        </label>
      ))}
    </fieldset>
  );
}
