"use client";

import { useController } from "react-hook-form";

export function SelectInput({
  name,
  options,
}: {
  name: string;
  options: Array<{ label: string; value: string }>;
}) {
  const { field } = useController({ name });

  return (
    <select
      {...field}
      className="block w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100 dark:border-slate-600 dark:bg-slate-900 dark:text-white dark:focus:border-sky-500 dark:focus:ring-sky-900"
    >
      <option value="">-- Select --</option>
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}
