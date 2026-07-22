"use client";

import { useController } from "react-hook-form";

export function TextInput({
  name,
  placeholder,
  type = "text",
}: {
  name: string;
  placeholder?: string;
  type?: string;
}) {
  const { field } = useController({ name });

  return (
    <input
      {...field}
      type={type}
      placeholder={placeholder}
      className="block w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder-slate-500 transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100 dark:border-slate-600 dark:bg-slate-900 dark:text-white dark:placeholder-slate-400 dark:focus:border-sky-500 dark:focus:ring-sky-900"
    />
  );
}
