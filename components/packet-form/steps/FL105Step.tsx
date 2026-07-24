"use client";

import { useFieldArray, useFormContext, useWatch } from "react-hook-form";
import { Plus, Trash2 } from "lucide-react";
import { PacketFormData } from "@/lib/types/packet.types";
import { toCourtDate } from "@/lib/utils/packet-helpers";
import { SectionCard, SubSection, Grid, Instruction, Reveal } from "../ui";
import { Field, Text, TextArea, DateField, RadioCards, YesNo, CheckboxRow } from "../fields";

export function FL105Step() {
  const { control } = useFormContext<PacketFormData>();

  // Children are read-only here; they come from Basic Information (the intake step).
  const children = useWatch({ control, name: "intake.children" }) ?? [];

  const otherProceedings = useWatch({ control, name: "fl105.otherProceedings" });
  const restrainingOrders = useWatch({ control, name: "fl105.restrainingOrders" });
  const otherPersons = useWatch({ control, name: "fl105.otherPersons" });

  const {
    fields: residenceFields,
    append: appendResidence,
    remove: removeResidence,
  } = useFieldArray({ control, name: "fl105.residences" });

  const {
    fields: personFields,
    append: appendPerson,
    remove: removePerson,
  } = useFieldArray({ control, name: "fl105.persons" });

  return (
    <SectionCard
      title="Declaration Under UCCJEA"
      formNo="FL-105 / GC-120"
      subtitle="Required when there are minor children of this relationship. This declaration reports the residence history of the oldest child and any other custody proceedings or claims the court needs to know about."
    >
      <Instruction>
        <p>
          This form is required when there are minor children. The children listed below are the
          ones you entered in Basic Information.
        </p>
      </Instruction>

      <SubSection title="1. I am">
        <Field name="fl105.role">
          <RadioCards
            name="fl105.role"
            options={[
              {
                label: "A party to this proceeding to determine custody of a child",
                value: "party",
              },
              {
                label: "The authorized representative of an agency that is a party",
                value: "agencyRep",
              },
            ]}
          />
        </Field>
      </SubSection>

      <SubSection title="2. Minor Children">
        {children.length > 0 ? (
          <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:bg-slate-900 dark:text-slate-400">
                <tr>
                  <th className="px-3 py-2">Full name</th>
                  <th className="px-3 py-2">Date of birth</th>
                  <th className="px-3 py-2">Place of birth</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {children.map((c, i) => (
                  <tr key={i} className="text-slate-800 dark:text-slate-100">
                    <td className="px-3 py-2">
                      {[c.firstName, c.middleName, c.lastName].filter(Boolean).join(" ") || "—"}
                    </td>
                    <td className="px-3 py-2">{toCourtDate(c.dateOfBirth) || "—"}</td>
                    <td className="px-3 py-2">{c.placeOfBirth || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
            No children have been entered yet. Add them in Basic Information.
          </p>
        )}
      </SubSection>

      <SubSection title="3. Residence History (Oldest Child, Past 5 Years)">
        <div className="space-y-4">
          {residenceFields.map((item, index) => (
            <div
              key={item.id}
              className="space-y-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-950"
            >
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                  Residence {index + 1}
                </p>
                <button
                  type="button"
                  onClick={() => removeResidence(index)}
                  className="inline-flex items-center gap-1 text-xs font-medium text-rose-600 transition hover:text-rose-700 dark:text-rose-400"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Remove
                </button>
              </div>
              <Grid cols={2}>
                <Field name={`fl105.residences.${index}.fromDate`} label="From">
                  <DateField name={`fl105.residences.${index}.fromDate`} />
                </Field>
                <Field name={`fl105.residences.${index}.toDate`} label="To">
                  <DateField name={`fl105.residences.${index}.toDate`} />
                </Field>
              </Grid>
              <CheckboxRow
                name={`fl105.residences.${index}.isCurrent`}
                label="To present (current residence)"
              />
              <Field name={`fl105.residences.${index}.residence`} label="Residence (City, State)">
                <Text name={`fl105.residences.${index}.residence`} placeholder="Riverside, CA" />
              </Field>
              <Field
                name={`fl105.residences.${index}.livedWith`}
                label="Person child lived with & complete current address"
              >
                <TextArea name={`fl105.residences.${index}.livedWith`} rows={2} />
              </Field>
              <Field name={`fl105.residences.${index}.relationship`} label="Relationship">
                <Text name={`fl105.residences.${index}.relationship`} placeholder="Mother, father, guardian, etc." />
              </Field>
            </div>
          ))}

          <button
            type="button"
            onClick={() =>
              appendResidence(
                { fromDate: "", toDate: "", isCurrent: false, residence: "", livedWith: "", relationship: "" },
                { shouldFocus: false },
              )
            }
            className="inline-flex items-center gap-2 rounded-lg border border-dashed border-slate-300 bg-slate-50 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:border-sky-400 hover:bg-sky-50 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-sky-500"
          >
            <Plus className="h-4 w-4" />
            Add another residence
          </button>
        </div>

        <CheckboxRow
          name="fl105.singleResidenceForAll"
          label="There is only one child, or all children have lived together for the past five years."
        />
      </SubSection>

      <SubSection title="4. Other Custody / Visitation Proceedings">
        <Field
          name="fl105.otherProceedings"
          label="Do you have information about another custody/visitation proceeding concerning a child in this case?"
        >
          <YesNo name="fl105.otherProceedings" />
        </Field>
        {otherProceedings ? (
          <Reveal>
            <Field
              name="fl105.otherProceedingsDetails"
              label="Proceeding, case number, court, child, etc."
            >
              <TextArea name="fl105.otherProceedingsDetails" rows={3} />
            </Field>
          </Reveal>
        ) : null}
      </SubSection>

      <SubSection title="5. Domestic Violence Restraining/Protective Orders">
        <CheckboxRow
          name="fl105.restrainingOrders"
          label="One or more domestic violence restraining/protective orders are now in effect."
        />
        {restrainingOrders ? (
          <Reveal>
            <Field
              name="fl105.restrainingOrdersDetails"
              label="Court, county, state, case number, expiration"
            >
              <TextArea name="fl105.restrainingOrdersDetails" rows={3} />
            </Field>
          </Reveal>
        ) : null}
      </SubSection>

      <SubSection title="6. Other Persons with Custody or Visitation Claims">
        <Field
          name="fl105.otherPersons"
          label="Do you know any person not a party who has physical custody of, or claims custody/visitation rights to, any child?"
        >
          <YesNo name="fl105.otherPersons" />
        </Field>
        {otherPersons ? (
          <Reveal>
            <div className="space-y-4">
              {personFields.map((item, index) => (
                <div
                  key={item.id}
                  className="space-y-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-950"
                >
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                      Person {index + 1}
                    </p>
                    <button
                      type="button"
                      onClick={() => removePerson(index)}
                      className="inline-flex items-center gap-1 text-xs font-medium text-rose-600 transition hover:text-rose-700 dark:text-rose-400"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Remove
                    </button>
                  </div>
                  <Field name={`fl105.persons.${index}.nameAddress`} label="Name and address of person">
                    <TextArea name={`fl105.persons.${index}.nameAddress`} rows={2} />
                  </Field>
                  <CheckboxRow
                    name={`fl105.persons.${index}.hasPhysicalCustody`}
                    label="Has physical custody"
                  />
                  <CheckboxRow
                    name={`fl105.persons.${index}.claimsCustody`}
                    label="Claims custody rights"
                  />
                  <CheckboxRow
                    name={`fl105.persons.${index}.claimsVisitation`}
                    label="Claims visitation rights"
                  />
                  <Field name={`fl105.persons.${index}.childrenNames`} label="Name of each child">
                    <Text name={`fl105.persons.${index}.childrenNames`} />
                  </Field>
                </div>
              ))}

              <button
                type="button"
                onClick={() =>
                  appendPerson(
                    {
                      nameAddress: "",
                      hasPhysicalCustody: false,
                      claimsCustody: false,
                      claimsVisitation: false,
                      childrenNames: "",
                    },
                    { shouldFocus: false },
                  )
                }
                className="inline-flex items-center gap-2 rounded-lg border border-dashed border-slate-300 bg-slate-50 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:border-sky-400 hover:bg-sky-50 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-sky-500"
              >
                <Plus className="h-4 w-4" />
                Add another person
              </button>
            </div>
          </Reveal>
        ) : null}
      </SubSection>

      <SubSection title="7. Attachments">
        <Field name="fl105.pagesAttached" label="Number of pages attached">
          <Text name="fl105.pagesAttached" inputMode="numeric" placeholder="0" />
        </Field>
      </SubSection>

      <SubSection title="Date">
        <Field name="fl105.date" label="Date" required>
          <DateField name="fl105.date" />
        </Field>
      </SubSection>
    </SectionCard>
  );
}
