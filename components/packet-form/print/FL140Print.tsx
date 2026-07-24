import { PacketFormData } from "@/lib/types/packet.types";
import { COURTHOUSES } from "@/lib/constants/packet.constants";
import { petitionerName, respondentName, toCourtDate } from "@/lib/utils/packet-helpers";
import { FormPage, Box, Row, CourtHeader, SignatureBlock } from "./print-ui";

export function FL140Print({ data }: { data: PacketFormData }) {
  const { intake, fl140 } = data;
  const p = petitionerName(intake);
  const r = respondentName(intake);
  const court = intake.courthouse ? COURTHOUSES[intake.courthouse] : undefined;
  const courtAddress = court ? `${court.address}, ${court.cityStateZip}` : "";
  const addr = [
    intake.petitionerStreet,
    [intake.petitionerCity, intake.petitionerState, intake.petitionerZip].filter(Boolean).join(", "),
  ]
    .filter(Boolean)
    .join(", ");

  const pageFooter = (
    <div className="flex justify-between">
      <span>FL-140 [Rev. July 1, 2013]</span>
      <span>Page 1 of 1</span>
    </div>
  );

  const attachments: Array<{ checked: boolean; label: string }> = [
    { checked: fl140.attachSchedule, label: "A completed Schedule of Assets and Debts (form FL-142)." },
    { checked: fl140.attachIncomeExpense, label: "A completed Income and Expense Declaration (form FL-150)." },
    {
      checked: fl140.attachTaxReturns,
      label: "All tax returns filed by the party in the two years before serving the disclosure documents.",
    },
    {
      checked: fl140.attachMaterialFactsAssets,
      label:
        "A statement of all material facts and information regarding valuation of all community-property assets.",
    },
    {
      checked: fl140.attachMaterialFactsObligations,
      label:
        "A statement of all material facts and information regarding obligations for which the community is liable.",
    },
    {
      checked: fl140.attachInvestmentOpportunity,
      label:
        "An accurate and complete written disclosure of any investment/business/income-producing opportunity since the date of separation.",
    },
  ];

  return (
    <FormPage formNo="FL-140" footer={pageFooter}>
      <CourtHeader
        formNo="FL-140"
        courtAddress={courtAddress}
        petitioner={p}
        respondent={r}
        otherParty=""
        caseNumber={data.fl100.caseNumber}
        attorneyName={p}
        attorneyAddress={addr}
        attorneyPhone={intake.petitionerPhone}
        attorneyEmail={intake.petitionerEmail}
        titleBlock="DECLARATION OF DISCLOSURE (Family Law)"
      />

      <Row>
        <Box checked={fl140.whoseDisclosure === "petitioner"} label="Petitioner's" />
        <Box checked={fl140.whoseDisclosure === "respondent"} label="Respondent's" />
        <Box checked={fl140.disclosureStage === "preliminary"} label="Preliminary" />
        <Box checked={fl140.disclosureStage === "final"} label="Final" />
      </Row>

      <p className="mt-2 text-center text-[11px] font-bold uppercase">
        Do not file declarations of disclosure or financial attachments with the court
      </p>
      <p className="mt-1 text-[10px]">
        Declarations of disclosure and the financial forms attached to them are served on the other
        party — they are not filed with the court. Only a Proof of Service of Declaration of
        Disclosure (form FL-141) is filed to show that the required documents were exchanged.
      </p>

      <p className="mt-2 text-[11px] font-bold">Attached are the following:</p>
      {attachments.map((item, i) => (
        <Row key={i} className="mt-0.5">
          <Box checked={item.checked} label={`${i + 1}. ${item.label}`} />
        </Row>
      ))}

      <SignatureBlock name={p} date={toCourtDate(fl140.date)} role="SIGNATURE" />
    </FormPage>
  );
}
