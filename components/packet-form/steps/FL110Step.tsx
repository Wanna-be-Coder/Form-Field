"use client";

import { useFormContext, useWatch } from "react-hook-form";
import { PacketFormData } from "@/lib/types/packet.types";
import { COURTHOUSES } from "@/lib/constants/packet.constants";
import { petitionerName, respondentName } from "@/lib/utils/packet-helpers";
import { SectionCard, SubSection, Instruction } from "../ui";
import { Field, Text, CheckboxRow } from "../fields";

// The four Standard Family Law Restraining Orders, printed verbatim on page 2
// of the Summons (FL-110). Kept in one place so the step's review panel and
// the print output stay in sync.
export const FL110_RESTRAINING_ORDERS = [
  "removing the minor children of the parties from the state or applying for a new or replacement passport for those minor children without the prior written consent of the other party or an order of the court;",
  "cashing, borrowing against, canceling, transferring, disposing of, or changing the beneficiaries of any insurance or other coverage, including life, health, automobile, and disability, held for the benefit of the parties and their minor children;",
  "transferring, encumbering, hypothecating, concealing, or in any way disposing of any property, real or personal, whether community, quasi-community, or separate, without the written consent of the other party or an order of the court, except in the usual course of business or for the necessities of life; and",
  "creating a nonprobate transfer or modifying a nonprobate transfer in a manner that affects the disposition of property subject to the transfer, without the written consent of the other party or an order of the court.",
];

export function FL110Step() {
  const { control } = useFormContext<PacketFormData>();
  const intake = useWatch({ control, name: "intake" });

  const petitioner = petitionerName(intake);
  const respondent = respondentName(intake);
  const court = intake.courthouse ? COURTHOUSES[intake.courthouse] : undefined;

  return (
    <SectionCard
      title="Summons"
      formNo="FL-110"
      subtitle="Notifies your spouse or domestic partner that a case has been filed and that they must respond. Most of this form is auto-prepared from Basic Information."
    >
      <SubSection title="Who Is Being Served">
        <Instruction>
          <p>
            The Summons is addressed to the person being served — your <strong>Respondent</strong>,{" "}
            <strong>{respondent || "—"}</strong> — and identifies you as the <strong>Petitioner</strong>,{" "}
            <strong>{petitioner || "—"}</strong>. It gives the Respondent 30 calendar days to file a
            Response (FL-120) once served.
          </p>
          <p>
            Court location: <strong>{court ? `${court.address}, ${court.cityStateZip}` : "Not yet selected — choose one in Basic Information."}</strong>
          </p>
        </Instruction>
      </SubSection>

      <SubSection title="Case Number">
        <Field
          name="intake.caseNumber"
          label="Case number (if assigned)"
          hint="Shared across every form in the packet. Leave blank if the court has not yet assigned one — the clerk will stamp it in when you file."
        >
          <Text name="intake.caseNumber" placeholder="e.g. RID1234567" />
        </Field>
      </SubSection>

      <SubSection title="Standard Family Law Restraining Orders">
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
          <p className="mb-2 font-medium text-slate-800 dark:text-slate-100">
            Starting immediately upon filing, you and your spouse or domestic partner are restrained
            from:
          </p>
          <ol className="list-decimal space-y-2 pl-5">
            {FL110_RESTRAINING_ORDERS.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ol>
        </div>

        <CheckboxRow
          name="fl110.acknowledgeRestraining"
          label="I have read the Standard Family Law Restraining Orders (page 2 of the Summons) and understand they apply to both parties when the Petition is filed."
        />
      </SubSection>
    </SectionCard>
  );
}
