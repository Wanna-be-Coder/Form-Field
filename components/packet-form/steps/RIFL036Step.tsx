"use client";

import { useFormContext, useWatch } from "react-hook-form";
import { PacketFormData } from "@/lib/types/packet.types";
import { COURTHOUSES } from "@/lib/constants/packet.constants";
import { SectionCard, SubSection, Grid, Instruction, Reveal } from "../ui";
import { Field, Text, TextArea, DateField, RadioCards } from "../fields";

export function RIFL036Step() {
  const { control } = useFormContext<PacketFormData>();
  const courthouse = useWatch({ control, name: "intake.courthouse" });
  const reason = useWatch({ control, name: "rifl036.reason" });

  const courtName = courthouse ? `${COURTHOUSES[courthouse].name} Court` : "";

  return (
    <SectionCard
      title="Declaration of Residence"
      formNo="RI-FL036"
      subtitle="Certifies which Riverside County courthouse has jurisdiction to hear this case."
    >
      <Instruction>
        {courtName ? (
          <p>
            Based on the courthouse you chose in Basic Information, this declaration certifies
            that your case should be heard in the <strong>{courtName}</strong>.
          </p>
        ) : (
          <p>
            Choose a courthouse in <strong>Basic Information → Where is Your Case Filed?</strong>{" "}
            first — this declaration will certify that location automatically.
          </p>
        )}
      </Instruction>

      <SubSection title="Reason for This Court">
        <Field name="rifl036.reason">
          <RadioCards
            name="rifl036.reason"
            options={[
              {
                label: "My primary residence is within this court's geographical area",
                value: "geographic",
              },
              { label: "Other reason", value: "other" },
            ]}
          />
        </Field>

        {reason === "geographic" ? (
          <Reveal>
            <Grid cols={2}>
              <Field
                name="rifl036.city"
                label="City"
                required
                hint="Should match the petitioner's residence in Basic Information."
              >
                <Text name="rifl036.city" placeholder="Riverside" />
              </Field>
              <Field name="rifl036.zip" label="Zip code" required>
                <Text name="rifl036.zip" placeholder="92501" inputMode="numeric" />
              </Field>
            </Grid>
          </Reveal>
        ) : null}

        {reason === "other" ? (
          <Reveal>
            <Field name="rifl036.otherReason" label="Explain">
              <TextArea name="rifl036.otherReason" placeholder="Describe why this court is the correct location for this case." />
            </Field>
          </Reveal>
        ) : null}
      </SubSection>

      <SubSection title="Declaration Date">
        <Field name="rifl036.date" label="Date" required>
          <DateField name="rifl036.date" />
        </Field>
      </SubSection>
    </SectionCard>
  );
}
