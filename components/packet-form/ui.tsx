"use client";

import { ReactNode } from "react";
import { Info } from "lucide-react";

// Presentational containers for the interactive (screen) side of the wizard.

export function SectionCard({
  title,
  formNo,
  subtitle,
  children,
}: {
  title: string;
  formNo?: string;
  subtitle?: string;
  children: ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">
      <header className="border-b border-slate-200 bg-slate-50/80 px-5 py-4 dark:border-slate-800 dark:bg-slate-900/60">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">{title}</h2>
            {subtitle ? (
              <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-400">{subtitle}</p>
            ) : null}
          </div>
          {formNo ? (
            <span className="shrink-0 rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold text-white dark:bg-slate-100 dark:text-slate-900">
              {formNo}
            </span>
          ) : null}
        </div>
      </header>
      <div className="space-y-6 p-5">{children}</div>
    </section>
  );
}

export function SubSection({ title, children }: { title?: string; children: ReactNode }) {
  return (
    <div className="space-y-4">
      {title ? (
        <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
          {title}
        </h3>
      ) : null}
      {children}
    </div>
  );
}

export function Grid({
  children,
  cols = 2,
}: {
  children: ReactNode;
  cols?: 1 | 2 | 3;
}) {
  const cls = {
    1: "grid-cols-1",
    2: "grid-cols-1 sm:grid-cols-2",
    3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
  }[cols];
  return <div className={`grid gap-4 ${cls}`}>{children}</div>;
}

// A quoted instruction lifted verbatim from the court form.
export function Instruction({ children }: { children: ReactNode }) {
  return (
    <div className="flex gap-2.5 rounded-xl border border-sky-200 bg-sky-50 p-3.5 text-sm leading-6 text-sky-900 dark:border-sky-900/60 dark:bg-sky-950/40 dark:text-sky-100">
      <Info className="mt-0.5 h-4 w-4 shrink-0" />
      <div className="space-y-1">{children}</div>
    </div>
  );
}

// A visually distinct container for fields revealed by a conditional answer.
export function Reveal({ children }: { children: ReactNode }) {
  return (
    <div className="space-y-4 rounded-xl border border-slate-200 border-l-4 border-l-sky-400 bg-slate-50/70 p-4 dark:border-slate-800 dark:border-l-sky-500 dark:bg-slate-900/50">
      {children}
    </div>
  );
}
