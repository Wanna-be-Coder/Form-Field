"use client";

import { useFormContext, useWatch } from "react-hook-form";
import { PacketFormData } from "@/lib/types/packet.types";
import { SectionCard, SubSection, Grid, Instruction, Reveal } from "../ui";
import { Field, Text, TextArea, DateField, RadioCards, CheckboxRow } from "../fields";

export function FL115Step() {
  const { control } = useFormContext<PacketFormData>();
  const serverIsRegistered = useWatch({ control, name: "fl115.serverIsRegistered" });

  return (
    <SectionCard
      title="Proof of Service of Summons"
      formNo="FL-115"
      subtitle="Filed after the Respondent has been served with the Summons and Petition, to prove service happened."
    >
      <Instruction>
        <p>
          This is filled out by the person who served the papers — someone 18 or older who is{" "}
          <strong>not a party</strong> to the case. It proves the Respondent received the Summons
          (FL-110), Petition (FL-100), and a blank Response (FL-120), plus the completed and blank
          UCCJEA (FL-105), Declaration of Disclosure (FL-140), Schedule of Assets and Debts
          (FL-142), and Income and Expense Declaration (FL-150).
        </p>
        <p>Wait 30 days after service before moving on to the next step.</p>
      </Instruction>

      <SubSection>
        <Field name="fl115.caseNumber" label="Case number">
          <Text name="fl115.caseNumber" />
        </Field>
        <Field name="fl115.addressServed" label="Address where the Respondent was served">
          <TextArea name="fl115.addressServed" rows={2} />
        </Field>
      </SubSection>

      <SubSection title="Method of service">
        <Field name="fl115.serviceMethod">
          <RadioCards
            name="fl115.serviceMethod"
            options={[
              {
                label: "Personal service — I personally delivered the copies to the respondent",
                value: "personal",
              },
              {
                label:
                  "Substituted service — left with a competent adult at home/business, then mailed",
                value: "substituted",
              },
              { label: "Mail and acknowledgment service", value: "mail" },
            ]}
          />
        </Field>
        <Grid cols={2}>
          <Field name="fl115.serviceDate" label="Date served">
            <DateField name="fl115.serviceDate" />
          </Field>
          <Field name="fl115.serviceTime" label="Time served">
            <Text name="fl115.serviceTime" placeholder="e.g. 2:30 PM" />
          </Field>
        </Grid>
      </SubSection>

      <SubSection title="Person who served papers">
        <Grid cols={2}>
          <Field name="fl115.serverName" label="Server's name">
            <Text name="fl115.serverName" />
          </Field>
          <Field name="fl115.serverPhone" label="Server's phone">
            <Text name="fl115.serverPhone" type="tel" />
          </Field>
        </Grid>
        <Field name="fl115.serverAddress" label="Server's address">
          <TextArea name="fl115.serverAddress" rows={2} />
        </Field>

        <CheckboxRow
          name="fl115.serverIsRegistered"
          label="The server is a registered California process server."
        />
        {serverIsRegistered ? (
          <Reveal>
            <Grid cols={3}>
              <Field name="fl115.serverRegistrationNo" label="Registration no.">
                <Text name="fl115.serverRegistrationNo" />
              </Field>
              <Field name="fl115.serverCounty" label="County">
                <Text name="fl115.serverCounty" />
              </Field>
              <Field name="fl115.serverFee" label="Fee for service">
                <Text name="fl115.serverFee" />
              </Field>
            </Grid>
          </Reveal>
        ) : null}
      </SubSection>

      <SubSection>
        <Field name="fl115.date" label="Date of this declaration" required>
          <DateField name="fl115.date" />
        </Field>
      </SubSection>
    </SectionCard>
  );
}
