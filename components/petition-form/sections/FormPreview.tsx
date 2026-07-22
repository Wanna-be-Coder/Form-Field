"use client";

import { CheckCircle2, Download } from "lucide-react";
import { PetitionFormData } from "@/lib/types/petition.types";

export function FormPreview({ data }: { data: PetitionFormData | null }) {
  if (!data) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <section className="rounded-3xl border border-emerald-200 bg-emerald-50 p-6 shadow-sm dark:border-emerald-900 dark:bg-emerald-950">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900">
              <CheckCircle2 className="h-6 w-6 text-emerald-600 dark:text-emerald-300" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-emerald-950 dark:text-emerald-50">Petition Form Complete</h3>
              <p className="text-sm text-emerald-800 dark:text-emerald-200">Your dissolution petition is ready for review and submission.</p>
            </div>
          </div>

          <div className="mt-6 space-y-3 rounded-2xl border border-emerald-300 bg-white/50 p-4 text-sm text-slate-900 dark:border-emerald-700 dark:bg-slate-900 dark:text-white">
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
              <div className="space-y-1">
                <p className="font-semibold text-emerald-700 dark:text-emerald-300">Petitioner</p>
                <p className="truncate text-xs">{data.petitionerName}</p>
              </div>
              <div className="space-y-1">
                <p className="font-semibold text-emerald-700 dark:text-emerald-300">Respondent</p>
                <p className="truncate text-xs">{data.respondentName}</p>
              </div>
              <div className="space-y-1">
                <p className="font-semibold text-emerald-700 dark:text-emerald-300">County</p>
                <p className="truncate text-xs">{data.residenceCounty}</p>
              </div>
              <div className="space-y-1">
                <p className="font-semibold text-emerald-700 dark:text-emerald-300">Marriage Date</p>
                <p className="truncate text-xs">{data.marriageDate}</p>
              </div>
              <div className="space-y-1">
                <p className="font-semibold text-emerald-700 dark:text-emerald-300">Email</p>
                <p className="truncate text-xs">{data.email}</p>
              </div>
              <div className="space-y-1">
                <p className="font-semibold text-emerald-700 dark:text-emerald-300">Phone</p>
                <p className="truncate text-xs">{data.phone}</p>
              </div>
              <div className="space-y-1">
                <p className="font-semibold text-emerald-700 dark:text-emerald-300">Legal Grounds</p>
                <p className="truncate text-xs">{data.legalGrounds.join(", ")}</p>
              </div>
              <div className="space-y-1">
                <p className="font-semibold text-emerald-700 dark:text-emerald-300">Children</p>
                <p className="truncate text-xs">{data.hasMinorChildren ? `${data.numberOfChildren}` : "No"}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-3 font-semibold text-white transition hover:bg-emerald-700 dark:hover:bg-emerald-700"
          >
            <Download className="h-4 w-4" />
            Print / Save as PDF
          </button>
          <button
            type="button"
            onClick={() => {
              window.location.href = "/petition";
              window.location.reload();
            }}
            className="inline-flex items-center justify-center rounded-lg border border-emerald-300 bg-white px-4 py-3 font-semibold text-emerald-700 transition hover:bg-emerald-50 dark:border-emerald-700 dark:bg-slate-900 dark:text-emerald-300 dark:hover:bg-slate-800"
          >
            New form
          </button>
        </div>
      </div>
    </section>
  );
}
