"use client";

import { ReactNode } from "react";
import { useFormContext } from "react-hook-form";

export function FormField({
  name,
  label,
  hint,
  children,
}: {
  name: string;
  label: string;
  hint?: string;
  children: ReactNode;
}) {
  const {
    formState: { errors },
  } = useFormContext();
  const error = errors[name as keyof typeof errors]?.message as string | undefined;

  return (
    <div className="space-y-2">
      <label htmlFor={name} className="block text-sm font-medium text-slate-900 dark:text-slate-100">
        {label}
      </label>
      {children}
      {hint ? <p className="text-sm text-slate-500 dark:text-slate-400">{hint}</p> : null}
      {error ? <p className="text-sm text-red-600 dark:text-red-400">{error}</p> : null}
    </div>
  );
}
