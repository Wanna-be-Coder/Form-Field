"use client";

import { useFormContext, useWatch } from "react-hook-form";
import { PacketFormData } from "@/lib/types/packet.types";
import { ASSET_CATEGORIES, DEBT_CATEGORIES } from "@/lib/constants/packet.constants";
import { totalAssets, totalDebts, formatCurrency } from "@/lib/utils/packet-helpers";
import { SectionCard, SubSection, Grid, Instruction } from "../ui";
import { Field, Text, TextArea, DateField, Select, Currency, RadioCards, CheckboxRow } from "../fields";

const SEP_PROP_OPTIONS = [
  { label: "—", value: "" },
  { label: "P (Petitioner)", value: "P" },
  { label: "R (Respondent)", value: "R" },
];

export function FL142Step() {
  const { control } = useFormContext<PacketFormData>();
  const fl142 = useWatch({ control, name: "fl142" });

  const assetTotals = totalAssets(fl142);
  const debtTotals = totalDebts(fl142);

  return (
    <SectionCard
      title="Schedule of Assets and Debts"
      formNo="FL-142"
      subtitle="A detailed inventory of everything owned and owed, community and separate. Served on the other party — not filed with the court."
    >
      <Instruction>
        <p>
          List all your known community and separate assets or debts. Include assets even if they
          are in the possession of another person, including your spouse. If you contend an asset
          or debt is separate, mark P (Petitioner) or R (Respondent). All values should be as of
          the date of signing.
        </p>
        <p>This form is served on the other party — it is not filed with the court.</p>
      </Instruction>

      <Field name="fl142.whoseSchedule" label="Whose Schedule of Assets and Debts is this?">
        <RadioCards
          name="fl142.whoseSchedule"
          columns={2}
          options={[
            { label: "Petitioner's", value: "petitioner" },
            { label: "Respondent's", value: "respondent" },
          ]}
        />
      </Field>

      <SubSection title="Assets">
        <div className="space-y-4">
          {ASSET_CATEGORIES.map((cat) => {
            const entry = fl142.assets[cat.key];
            return (
              <div
                key={cat.key}
                className="rounded-xl border border-slate-200 p-4 dark:border-slate-700"
              >
                <div className="mb-3">
                  <h4 className="text-sm font-semibold text-slate-900 dark:text-white">
                    {cat.no}. {cat.label}
                  </h4>
                  {cat.hint ? (
                    <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{cat.hint}</p>
                  ) : null}
                </div>

                <CheckboxRow name={`fl142.assets.${cat.key}.none`} label="None" />

                {!entry.none ? (
                  <div className="mt-3 space-y-3">
                    <Field name={`fl142.assets.${cat.key}.description`} label="Description">
                      <TextArea name={`fl142.assets.${cat.key}.description`} rows={2} />
                    </Field>
                    <Grid cols={3}>
                      <Field name={`fl142.assets.${cat.key}.sepProp`} label="Separate property">
                        <Select
                          name={`fl142.assets.${cat.key}.sepProp`}
                          options={SEP_PROP_OPTIONS}
                        />
                      </Field>
                      <Field name={`fl142.assets.${cat.key}.dateAcquired`} label="Date acquired">
                        <Text name={`fl142.assets.${cat.key}.dateAcquired`} placeholder="MM/YYYY" />
                      </Field>
                      <Field
                        name={`fl142.assets.${cat.key}.grossValue`}
                        label="Current gross fair market value"
                      >
                        <Currency name={`fl142.assets.${cat.key}.grossValue`} />
                      </Field>
                    </Grid>
                    <Field
                      name={`fl142.assets.${cat.key}.amountOwed`}
                      label="Amount owed / encumbrance"
                    >
                      <Currency name={`fl142.assets.${cat.key}.amountOwed`} />
                    </Field>
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>

        <div className="rounded-xl bg-slate-50 p-4 text-sm dark:bg-slate-900">
          <div className="flex flex-wrap justify-between gap-2 font-medium text-slate-800 dark:text-slate-100">
            <span>Total gross fair market value</span>
            <span>{formatCurrency(assetTotals.gross)}</span>
          </div>
          <div className="mt-1 flex flex-wrap justify-between gap-2 text-slate-600 dark:text-slate-300">
            <span>Total amount owed / encumbrances</span>
            <span>{formatCurrency(assetTotals.owed)}</span>
          </div>
        </div>
      </SubSection>

      <SubSection title="Debts">
        <div className="space-y-4">
          {DEBT_CATEGORIES.map((cat) => {
            const entry = fl142.debts[cat.key];
            return (
              <div
                key={cat.key}
                className="rounded-xl border border-slate-200 p-4 dark:border-slate-700"
              >
                <div className="mb-3">
                  <h4 className="text-sm font-semibold text-slate-900 dark:text-white">
                    {cat.no}. {cat.label}
                  </h4>
                  {cat.hint ? (
                    <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{cat.hint}</p>
                  ) : null}
                </div>

                <CheckboxRow name={`fl142.debts.${cat.key}.none`} label="None" />

                {!entry.none ? (
                  <div className="mt-3 space-y-3">
                    <Field
                      name={`fl142.debts.${cat.key}.description`}
                      label="Description — show to whom owed"
                    >
                      <TextArea name={`fl142.debts.${cat.key}.description`} rows={2} />
                    </Field>
                    <Grid cols={3}>
                      <Field name={`fl142.debts.${cat.key}.sepProp`} label="Separate property">
                        <Select
                          name={`fl142.debts.${cat.key}.sepProp`}
                          options={SEP_PROP_OPTIONS}
                        />
                      </Field>
                      <Field name={`fl142.debts.${cat.key}.totalOwing`} label="Total owing">
                        <Currency name={`fl142.debts.${cat.key}.totalOwing`} />
                      </Field>
                      <Field name={`fl142.debts.${cat.key}.dateAcquired`} label="Date acquired">
                        <Text name={`fl142.debts.${cat.key}.dateAcquired`} placeholder="MM/YYYY" />
                      </Field>
                    </Grid>
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>

        <div className="rounded-xl bg-slate-50 p-4 text-sm dark:bg-slate-900">
          <div className="flex flex-wrap justify-between gap-2 font-medium text-slate-800 dark:text-slate-100">
            <span>Total debts</span>
            <span>{formatCurrency(debtTotals)}</span>
          </div>
        </div>
      </SubSection>

      <SubSection>
        <Grid cols={2}>
          <Field name="fl142.continuationPages" label="Number of continuation sheets attached">
            <Text name="fl142.continuationPages" inputMode="numeric" />
          </Field>
          <Field name="fl142.date" label="Date" required>
            <DateField name="fl142.date" />
          </Field>
        </Grid>
      </SubSection>
    </SectionCard>
  );
}
