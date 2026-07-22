"use client";

import { ReactNode } from "react";
import { Icon } from "lucide-react";

export function FormSection({
  title,
  description,
  icon: IconComponent,
  children,
}: {
  title: string;
  description: string;
  icon: Icon;
  children: ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-3xl border border-slate-200 bg-slate-50 shadow-sm transition dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-center gap-3 border-b border-slate-200 bg-white px-6 py-4 dark:border-slate-800 dark:bg-slate-950">
        <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-sky-100 text-sky-700 dark:bg-sky-800 dark:text-sky-100">
          <IconComponent className="h-5 w-5" />
        </span>
        <div>
          <h3 className="text-lg font-semibold text-slate-950 dark:text-white">{title}</h3>
          <p className="text-sm leading-6 text-slate-600 dark:text-slate-400">{description}</p>
        </div>
      </div>
      <div className="p-6">{children}</div>
    </section>
  );
}
