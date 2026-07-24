"use client";

import { useFormContext, useWatch } from "react-hook-form";
import { PacketFormData } from "@/lib/types/packet.types";
import { SectionCard, SubSection, Instruction, Reveal } from "../ui";
import { Field, Text, DateField, CheckboxRow } from "../fields";

export function RIFL011Step() {
  const { control } = useFormContext<PacketFormData>();
  const agreeEmail = useWatch({ control, name: "rifl011.agreeEmail" });

  return (
    <SectionCard
      title="Confidential Contact Information"
      formNo="RI-FL011"
      subtitle="Optional. Tell the court whether you'd like self-help information emailed to you."
    >
      <SubSection>
        <Instruction>
          <p>
            This form is <strong>optional</strong>. If you would like to receive electronic
            self-help information about family law services from the court, complete the email
            section below. The court values your privacy — at no time will the court make your
            email address available to any third party.
          </p>
        </Instruction>

        <CheckboxRow
          name="rifl011.agreeEmail"
          label="I agree to receive self-help information from the court via email."
        />

        {agreeEmail ? (
          <Reveal>
            <Field
              name="rifl011.email"
              label="Email address"
              required
              hint="This can be the same email you entered in Basic Information."
            >
              <Text name="rifl011.email" type="email" inputMode="email" placeholder="jane@example.com" />
            </Field>
          </Reveal>
        ) : null}

        <CheckboxRow
          name="rifl011.stopEmail"
          label="I no longer wish to receive self-help information from the court."
        />

        <Field name="rifl011.date" label="Date" required>
          <DateField name="rifl011.date" />
        </Field>
      </SubSection>
    </SectionCard>
  );
}
