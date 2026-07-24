"use client";

import { useFormContext, useWatch } from "react-hook-form";
import { PacketFormData } from "@/lib/types/packet.types";
import { CASE_TYPE_LABELS } from "@/lib/constants/packet.constants";
import { petitionerName, respondentName, toCourtDate } from "@/lib/utils/packet-helpers";
import { SectionCard, SubSection, Grid, Instruction, Reveal } from "../ui";
import { Field, Text, TextArea, DateField, RadioCards, CheckList, CheckboxRow } from "../fields";

const PARTY_OPTIONS = [
  { label: "Petitioner", value: "petitioner" },
  { label: "Respondent", value: "respondent" },
];

const PARTY_JOINT_OPTIONS = [
  { label: "Petitioner", value: "petitioner" },
  { label: "Respondent", value: "respondent" },
  { label: "Joint", value: "joint" },
  { label: "Other", value: "other" },
];

export function FL100Step() {
  const { control } = useFormContext<PacketFormData>();
  const caseType = useWatch({ control, name: "intake.caseType" });
  const relationshipType = useWatch({ control, name: "intake.relationshipType" });
  const hasChildren = useWatch({ control, name: "intake.hasMinorChildren" });
  const marriageDate = useWatch({ control, name: "intake.marriageDate" });
  const intake = useWatch({ control, name: "intake" });

  const residencyMet = useWatch({ control, name: "fl100.residencyMet" });
  const sameSex = useWatch({ control, name: "fl100.residencySameSex" });
  const sepNone = useWatch({ control, name: "fl100.separatePropertyNone" });
  const commNone = useWatch({ control, name: "fl100.communityPropertyNone" });
  const restoreName = useWatch({ control, name: "fl100.restoreFormerName" });

  return (
    <SectionCard
      title="Petition — Marriage / Domestic Partnership"
      formNo="FL-100"
      subtitle="The formal request to the court. Party names, addresses, and dates carry over automatically from Basic Information."
    >
      <div className="rounded-xl bg-slate-50 p-4 text-sm text-slate-600 dark:bg-slate-900 dark:text-slate-300">
        <p><span className="font-semibold text-slate-800 dark:text-slate-100">Petitioner:</span> {petitionerName(intake) || "—"}</p>
        <p><span className="font-semibold text-slate-800 dark:text-slate-100">Respondent:</span> {respondentName(intake) || "—"}</p>
        <p><span className="font-semibold text-slate-800 dark:text-slate-100">Petition for:</span> {CASE_TYPE_LABELS[caseType]} of {relationshipType === "marriage" ? "Marriage" : "Domestic Partnership"}</p>
      </div>

      <SubSection title="1. Legal Relationship">
        <Field name="fl100.legalRelationship" label="Check all that apply:">
          <CheckList
            name="fl100.legalRelationship"
            options={[
              { label: "We are married.", value: "married" },
              { label: "We are domestic partners and our domestic partnership was established in California.", value: "dpInCA" },
              { label: "We are domestic partners and our domestic partnership was NOT established in California.", value: "dpNotInCA" },
            ]}
          />
        </Field>
      </SubSection>

      <SubSection title="2. Residence Requirements">
        <CheckboxRow
          name="fl100.residencyMet"
          label="A party has been a resident of California for at least 6 months and of this county for at least 3 months immediately preceding the filing of this Petition."
        />
        {residencyMet ? (
          <Reveal>
            <Field name="fl100.residencyParty" label="Which party meets this requirement?">
              <RadioCards name="fl100.residencyParty" columns={2} options={PARTY_OPTIONS} />
            </Field>
          </Reveal>
        ) : null}
        <CheckboxRow
          name="fl100.residencyDpInCA"
          label="Our domestic partnership was established in California. Neither of us has to be a resident or have a domicile in California to dissolve our partnership here."
        />
        <CheckboxRow
          name="fl100.residencySameSex"
          label="We are the same sex, were married in California, but currently live in a jurisdiction that does not recognize, and will not dissolve, our marriage. This Petition is filed in the county where we married."
        />
        {sameSex ? (
          <Reveal>
            <Grid cols={2}>
              <Field name="fl100.petitionerLivesIn" label="Petitioner lives in">
                <Text name="fl100.petitionerLivesIn" placeholder="City, State" />
              </Field>
              <Field name="fl100.respondentLivesIn" label="Respondent lives in">
                <Text name="fl100.respondentLivesIn" placeholder="City, State" />
              </Field>
            </Grid>
          </Reveal>
        ) : null}
      </SubSection>

      <SubSection title="3. Statistical Facts">
        <Grid cols={2}>
          <Field name="intake.marriageDate" label="Date of marriage" hint="Carried over from Basic Information.">
            <div className="rounded-lg border border-slate-200 bg-slate-100 px-3.5 py-2.5 text-sm text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
              {toCourtDate(marriageDate) || "—"}
            </div>
          </Field>
          <Field name="fl100.dateOfSeparation" label="Date of separation">
            <DateField name="fl100.dateOfSeparation" />
          </Field>
        </Grid>
        {relationshipType === "domesticPartnership" ? (
          <Reveal>
            <Field
              name="fl100.dpRegistrationDate"
              label="Registration date of domestic partnership with the California Secretary of State or other state equivalent"
            >
              <DateField name="fl100.dpRegistrationDate" />
            </Field>
          </Reveal>
        ) : null}
      </SubSection>

      <SubSection title="4. Minor Children">
        {hasChildren ? (
          <>
            <Instruction>
              <p>
                Because there are minor children, a completed <strong>Declaration Under UCCJEA
                (FL-105/GC-120)</strong> must be attached. Complete it in the &ldquo;Children / UCCJEA&rdquo; step.
              </p>
            </Instruction>
            <CheckboxRow
              name="fl100.childBornBeforeMarriage"
              label="One or more children listed were born before the marriage or domestic partnership; the court has authority to determine them to be children of the relationship."
            />
            <CheckboxRow name="fl100.uccjeaAttached" label="A completed UCCJEA (FL-105/GC-120) is attached." />
            <CheckboxRow
              name="fl100.voluntaryParentage"
              label="Petitioner and Respondent signed a voluntary declaration of parentage or paternity. (Attach a copy if available.)"
            />
          </>
        ) : (
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
            <Box /> There are no minor children. (Based on your answer in Basic Information.)
          </div>
        )}
      </SubSection>

      <SubSection title="5. Legal Grounds">
        {caseType === "nullity" ? (
          <>
            <Field name="fl100.groundsNullityVoid" label="Nullity of a VOID marriage or domestic partnership based on:">
              <RadioCards
                name="fl100.groundsNullityVoid"
                columns={2}
                options={[
                  { label: "Incest", value: "incest" },
                  { label: "Bigamy", value: "bigamy" },
                ]}
              />
            </Field>
            <Field name="fl100.groundsNullityVoidable" label="— or — Nullity of a VOIDABLE marriage or domestic partnership based on:">
              <RadioCards
                name="fl100.groundsNullityVoidable"
                columns={2}
                options={[
                  { label: "Petitioner's age at time of marriage/registration", value: "age" },
                  { label: "Prior existing marriage or domestic partnership", value: "priorMarriage" },
                  { label: "Unsound mind", value: "unsoundMind" },
                  { label: "Fraud", value: "fraud" },
                  { label: "Force", value: "force" },
                  { label: "Physical incapacity", value: "physicalIncapacity" },
                ]}
              />
            </Field>
          </>
        ) : (
          <Field
            name="fl100.groundsDivorceOrSeparation"
            label={`${caseType === "legalSeparation" ? "Legal separation" : "Divorce"} of the marriage or domestic partnership based on (check one):`}
          >
            <RadioCards
              name="fl100.groundsDivorceOrSeparation"
              columns={2}
              options={[
                { label: "Irreconcilable differences", value: "irreconcilable" },
                { label: "Permanent legal incapacity to make decisions", value: "incapacity" },
              ]}
            />
          </Field>
        )}
      </SubSection>

      {hasChildren ? (
        <>
          <SubSection title="6. Child Custody & Visitation (Parenting Time)">
            <Field name="fl100.legalCustodyTo" label="Legal custody of children to">
              <RadioCards name="fl100.legalCustodyTo" columns={4} options={PARTY_JOINT_OPTIONS} />
            </Field>
            <Field name="fl100.physicalCustodyTo" label="Physical custody of children to">
              <RadioCards name="fl100.physicalCustodyTo" columns={4} options={PARTY_JOINT_OPTIONS} />
            </Field>
            <Field name="fl100.visitationTo" label="Child visitation (parenting time) be granted to">
              <RadioCards name="fl100.visitationTo" columns={4} options={PARTY_JOINT_OPTIONS} />
            </Field>
          </SubSection>

          <SubSection title="7. Child Support">
            <Instruction>
              <p>
                If there are minor children, the court will make orders for the support of the
                children upon request and submission of financial forms (FL-150). An earnings
                assignment may be issued, and interest accrues on overdue amounts at the legal rate.
              </p>
            </Instruction>
            <Field name="fl100.childSupportOther" label="Other (specify)">
              <TextArea name="fl100.childSupportOther" placeholder="Any additional child support request." />
            </Field>
          </SubSection>
        </>
      ) : null}

      <SubSection title="8. Spousal or Domestic Partner Support">
        <Field name="fl100.spousalSupportTo" label="Spousal or domestic partner support payable to">
          <RadioCards name="fl100.spousalSupportTo" columns={2} options={PARTY_OPTIONS} />
        </Field>
        <Field name="fl100.terminateSupportTo" label="Terminate (end) the court's ability to award support to">
          <RadioCards name="fl100.terminateSupportTo" columns={2} options={PARTY_OPTIONS} />
        </Field>
        <Field name="fl100.reserveSupportTo" label="Reserve for future determination the issue of support payable to">
          <RadioCards name="fl100.reserveSupportTo" columns={2} options={PARTY_OPTIONS} />
        </Field>
        <Field name="fl100.spousalSupportOther" label="Other (specify)">
          <TextArea name="fl100.spousalSupportOther" />
        </Field>
      </SubSection>

      <SubSection title="9. Separate Property">
        <CheckboxRow
          name="fl100.separatePropertyNone"
          label="There are no such assets or debts that I know of to be confirmed by the court."
        />
        {!sepNone ? (
          <Reveal>
            <Field
              name="fl100.separatePropertyList"
              label="Confirm as separate property the following assets and debts:"
              hint="A detailed Schedule of Assets and Debts (FL-142) can be completed later in the packet."
            >
              <TextArea name="fl100.separatePropertyList" rows={3} />
            </Field>
          </Reveal>
        ) : null}
      </SubSection>

      <SubSection title="10. Community & Quasi-Community Property">
        <CheckboxRow
          name="fl100.communityPropertyNone"
          label="There are no such assets or debts that I know of to be divided by the court."
        />
        {!commNone ? (
          <Reveal>
            <Field
              name="fl100.communityPropertyList"
              label="Determine rights to the following community and quasi-community assets and debts:"
            >
              <TextArea name="fl100.communityPropertyList" rows={3} />
            </Field>
          </Reveal>
        ) : null}
      </SubSection>

      <SubSection title="11. Other Requests">
        <Field name="fl100.attorneyFeesFrom" label="Attorney's fees and costs payable by">
          <RadioCards name="fl100.attorneyFeesFrom" columns={2} options={PARTY_OPTIONS} />
        </Field>
        <CheckboxRow name="fl100.restoreFormerName" label="Petitioner's former name be restored." />
        {restoreName ? (
          <Reveal>
            <Field name="fl100.formerName" label="Restore former name to (specify)">
              <Text name="fl100.formerName" placeholder="Former legal name" />
            </Field>
          </Reveal>
        ) : null}
        <Field name="fl100.otherRequests" label="Other (specify)">
          <TextArea name="fl100.otherRequests" />
        </Field>
      </SubSection>

      <SubSection title="12. Restraining Orders">
        <CheckboxRow
          name="fl100.restrainingOrdersRead"
          label="I have read the restraining orders on the back of the Summons (FL-110), and I understand that they apply to me when this Petition is filed."
        />
      </SubSection>
    </SectionCard>
  );
}

function Box() {
  return <span aria-hidden>☐</span>;
}
