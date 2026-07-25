"use client";

import { useEffect } from "react";
import { useFieldArray, useFormContext, useWatch } from "react-hook-form";
import { Plus, Trash2 } from "lucide-react";
import { PacketFormData } from "@/lib/types/packet.types";
import { COURTHOUSE_OPTIONS, US_STATES } from "@/lib/constants/packet.constants";
import { emptyChild } from "@/lib/utils/packet-defaults";
import { SectionCard, SubSection, Grid, Instruction, Reveal } from "../ui";
import { Field, Text, DateField, Select, RadioCards, YesNo } from "../fields";

export function IntakeStep() {
  const { control } = useFormContext<PacketFormData>();
  const { fields, append, remove } = useFieldArray({ control, name: "intake.children" });

  const hasChildren = useWatch({ control, name: "intake.hasMinorChildren" });
  const filingOption = useWatch({ control, name: "intake.filingOption" });

  // Keep at least one child row visible once "Yes" is selected.
  useEffect(() => {
    if (hasChildren && fields.length === 0) {
      append(emptyChild(), { shouldFocus: false });
    }
  }, [hasChildren, fields.length, append]);

  return (
    <SectionCard
      title="Basic Information"
      subtitle="This information is entered once and used to prepare every form in your packet. Superior Court of California, County of Riverside — Dissolution, Legal Separation, or Nullity."
    >
      <SubSection title="Your Information">
        <Grid cols={3}>
          <Field name="intake.petitionerFirstName" label="First name" required>
            <Text name="intake.petitionerFirstName" placeholder="Jane" />
          </Field>
          <Field name="intake.petitionerMiddleName" label="Middle name">
            <Text name="intake.petitionerMiddleName" placeholder="A." />
          </Field>
          <Field name="intake.petitionerLastName" label="Last name" required>
            <Text name="intake.petitionerLastName" placeholder="Doe" />
          </Field>
        </Grid>
        <Field name="intake.petitionerStreet" label="Street address" required>
          <Text name="intake.petitionerStreet" placeholder="123 Example Street" />
        </Field>
        <Grid cols={3}>
          <Field name="intake.petitionerCity" label="City" required>
            <Text name="intake.petitionerCity" placeholder="Riverside" />
          </Field>
          <Field name="intake.petitionerState" label="State" required>
            <Select
              name="intake.petitionerState"
              options={US_STATES.map((s) => ({ label: s, value: s }))}
            />
          </Field>
          <Field name="intake.petitionerZip" label="ZIP code" required>
            <Text name="intake.petitionerZip" placeholder="92501" inputMode="numeric" />
          </Field>
        </Grid>
        <Grid cols={2}>
          <Field name="intake.petitionerPhone" label="Telephone number" required>
            <Text name="intake.petitionerPhone" placeholder="(951) 555-1234" type="tel" inputMode="tel" />
          </Field>
          <Field
            name="intake.petitionerEmail"
            label="Email address"
            hint="Used for the Confidential Contact Information form (RI-FL011)."
          >
            <Text name="intake.petitionerEmail" placeholder="jane@example.com" type="email" inputMode="email" />
          </Field>
        </Grid>
      </SubSection>

      <SubSection title="Your Spouse / Partner's Name">
        <Grid cols={3}>
          <Field name="intake.respondentFirstName" label="First name" required>
            <Text name="intake.respondentFirstName" placeholder="John" />
          </Field>
          <Field name="intake.respondentMiddleName" label="Middle name">
            <Text name="intake.respondentMiddleName" placeholder="B." />
          </Field>
          <Field name="intake.respondentLastName" label="Last name" required>
            <Text name="intake.respondentLastName" placeholder="Doe" />
          </Field>
        </Grid>
      </SubSection>

      <SubSection title="Type of Case">
        <Field name="intake.caseType">
          <RadioCards
            name="intake.caseType"
            columns={3}
            options={[
              { label: "Dissolution", value: "dissolution", description: "Divorce" },
              { label: "Legal Separation", value: "legalSeparation" },
              { label: "Nullity", value: "nullity", description: "Annulment" },
            ]}
          />
        </Field>
        <Field name="intake.relationshipType" label="This case concerns our:">
          <RadioCards
            name="intake.relationshipType"
            columns={2}
            options={[
              { label: "Marriage", value: "marriage" },
              { label: "Domestic Partnership", value: "domesticPartnership" },
            ]}
          />
        </Field>
      </SubSection>

      <SubSection title="Date of Marriage">
        <Field name="intake.marriageDate" label="Date of marriage / registration" required hint="MM/DD/YYYY">
          <DateField name="intake.marriageDate" />
        </Field>
      </SubSection>

      <SubSection title="Minor Children of the Relationship">
        <Field name="intake.hasMinorChildren" label="Are there minor children?">
          <YesNo name="intake.hasMinorChildren" />
        </Field>

        {hasChildren ? (
          <Reveal>
            <Instruction>
              <p>
                <strong>List minor children of the relationship.</strong> If you have more than two
                minor children of this marriage, you must also complete a <strong>FL-105(a)</strong>{" "}
                for the additional children.
              </p>
            </Instruction>

            <Field name="intake.numberOfChildren" label="How many minor children?" required>
              <Text name="intake.numberOfChildren" placeholder="2" inputMode="numeric" />
            </Field>

            <div className="space-y-4">
              {fields.map((item, index) => (
                <div
                  key={item.id}
                  className="space-y-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-950"
                >
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                      Child {index + 1}
                    </p>
                    <button
                      type="button"
                      onClick={() => remove(index)}
                      className="inline-flex items-center gap-1 text-xs font-medium text-rose-600 transition hover:text-rose-700 dark:text-rose-400"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Remove
                    </button>
                  </div>
                  <Grid cols={3}>
                    <Field name={`intake.children.${index}.firstName`} label="First name">
                      <Text name={`intake.children.${index}.firstName`} placeholder="First" />
                    </Field>
                    <Field name={`intake.children.${index}.middleName`} label="Middle name">
                      <Text name={`intake.children.${index}.middleName`} placeholder="Middle" />
                    </Field>
                    <Field name={`intake.children.${index}.lastName`} label="Last name">
                      <Text name={`intake.children.${index}.lastName`} placeholder="Last" />
                    </Field>
                  </Grid>
                  <Grid cols={3}>
                    <Field name={`intake.children.${index}.placeOfBirth`} label="Place of birth (City/State)">
                      <Text name={`intake.children.${index}.placeOfBirth`} placeholder="Riverside, CA" />
                    </Field>
                    <Field name={`intake.children.${index}.dateOfBirth`} label="Date of birth">
                      <DateField name={`intake.children.${index}.dateOfBirth`} />
                    </Field>
                    <Field name={`intake.children.${index}.age`} label="Age">
                      <Text name={`intake.children.${index}.age`} placeholder="8" inputMode="numeric" />
                    </Field>
                  </Grid>
                </div>
              ))}

              <button
                type="button"
                onClick={() => append(emptyChild(), { shouldFocus: false })}
                className="inline-flex items-center gap-2 rounded-lg border border-dashed border-slate-300 bg-slate-50 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:border-sky-400 hover:bg-sky-50 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-sky-500 dark:hover:bg-slate-800"
              >
                <Plus className="h-4 w-4" />
                Add another child
              </button>
            </div>
          </Reveal>
        ) : null}
      </SubSection>

      <SubSection title="Where is Your Case Filed?">
        <Field name="intake.courthouse" required>
          <RadioCards
            name="intake.courthouse"
            columns={2}
            options={COURTHOUSE_OPTIONS.map((o) => ({ label: o.label, value: o.value }))}
          />
        </Field>
      </SubSection>

      <SubSection title="Filing Options">
        <Field name="intake.filingOption" required>
          <RadioCards
            name="intake.filingOption"
            options={[
              {
                label: "I plan to print the documents and submit them in person.",
                value: "inPerson",
              },
              {
                label: "I plan to electronically sign my documents and submit my paperwork online.",
                value: "online",
              },
            ]}
          />
        </Field>

        {filingOption === "online" ? (
          <Reveal>
            <Instruction>
              <p>
                By choosing to file online, you declare under penalty of perjury under the laws of
                the State of California that all the information provided for this filing is true and
                correct. Type your name below to serve as your electronic signature to the oath
                above.
              </p>
            </Instruction>
            <Field
              name="intake.electronicSignatureName"
              label="Electronic signature (type your full legal name)"
              required
            >
              <Text name="intake.electronicSignatureName" placeholder="Jane A. Doe" />
            </Field>
          </Reveal>
        ) : null}
      </SubSection>

      <SubSection title="Today's Date">
        <Field name="intake.todaysDate" label="Today's date" required>
          <DateField name="intake.todaysDate" />
        </Field>
      </SubSection>
    </SectionCard>
  );
}
