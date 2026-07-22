"use client";

import { ReactNode } from "react";

export function FormWrapper({
  title,
  description,
  controls,
  children,
}: {
  title: string;
  description: string;
  controls?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="space-y-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="max-w-2xl space-y-3">
          <h2 className="text-2xl font-semibold tracking-tight text-slate-950 dark:text-white">{title}</h2>
          <p className="text-sm leading-6 text-slate-600 dark:text-slate-300">{description}</p>
        </div>
        {controls ? <div className="flex items-center">{controls}</div> : null}
      </div>
      {children}
    </section>
  );
}
