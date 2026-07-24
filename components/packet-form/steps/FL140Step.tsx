"use client";

import { useFormContext } from "react-hook-form";
import { PacketFormData } from "@/lib/types/packet.types";
import { SectionCard, SubSection, Instruction } from "../ui";
import { Field, DateField, RadioCards, CheckboxRow } from "../fields";

export function FL140Step() {
  useFormContext<PacketFormData>();

  return (
    <SectionCard
      title="Declaration of Disclosure"
      formNo="FL-140"
      subtitle="In a dissolution, legal separation, or nullity action, both a preliminary and a final declaration of disclosure must be served on the other party, with certain exceptions."
    >
      <Instruction>
        <p>
          <strong>Do not file</strong> Declarations of Disclosure or financial attachments with the
          court — these documents are served on the other party, not filed. Only a Proof of Service
          (form FL-141) is filed. The petitioner must serve a preliminary declaration of disclosure
          at the same time as, or within 60 days of, filing the Petition.
        </p>
      </Instruction>

      <SubSection>
        <Field name="fl140.whoseDisclosure">
          <RadioCards
            name="fl140.whoseDisclosure"
            columns={2}
            options={[
              { label: "Petitioner's", value: "petitioner" },
              { label: "Respondent's", value: "respondent" },
            ]}
          />
        </Field>

        <Field name="fl140.disclosureStage">
          <RadioCards
            name="fl140.disclosureStage"
            columns={2}
            options={[
              { label: "Preliminary", value: "preliminary" },
              { label: "Final", value: "final" },
            ]}
          />
        </Field>
      </SubSection>

      <SubSection title="Attached are the following:">
        <CheckboxRow
          name="fl140.attachSchedule"
          label="A completed Schedule of Assets and Debts (form FL-142)."
        />
        <CheckboxRow
          name="fl140.attachIncomeExpense"
          label="A completed Income and Expense Declaration (form FL-150)."
        />
        <CheckboxRow
          name="fl140.attachTaxReturns"
          label="All tax returns filed by the party in the two years before serving the disclosure documents."
        />
        <CheckboxRow
          name="fl140.attachMaterialFactsAssets"
          label="A statement of all material facts and information regarding valuation of all community-property assets."
        />
        <CheckboxRow
          name="fl140.attachMaterialFactsObligations"
          label="A statement of all material facts and information regarding obligations for which the community is liable."
        />
        <CheckboxRow
          name="fl140.attachInvestmentOpportunity"
          label="An accurate and complete written disclosure of any investment/business/income-producing opportunity since the date of separation."
        />
      </SubSection>

      <SubSection>
        <Field name="fl140.date" label="Date" required>
          <DateField name="fl140.date" />
        </Field>
      </SubSection>
    </SectionCard>
  );
}
