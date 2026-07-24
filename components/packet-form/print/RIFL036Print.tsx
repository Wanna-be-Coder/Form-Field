import { CourthouseKey, PacketFormData } from "@/lib/types/packet.types";
import { COURTHOUSES } from "@/lib/constants/packet.constants";
import { petitionerName, respondentName, toCourtDate } from "@/lib/utils/packet-helpers";
import { FormPage, Box, Line, Row, CourtHeader, SignatureBlock } from "./print-ui";

const COURT_ORDER: CourthouseKey[] = ["blythe", "riverside", "indio", "menifee"];

export function RIFL036Print({ data }: { data: PacketFormData }) {
  const { intake, rifl036 } = data;
  const p = petitionerName(intake);
  const r = respondentName(intake);
  const addr = [
    intake.petitionerStreet,
    [intake.petitionerCity, intake.petitionerState, intake.petitionerZip].filter(Boolean).join(", "),
  ]
    .filter(Boolean)
    .join(", ");

  const pageFooter = (
    <div className="flex justify-between">
      <span>RI-FL036 [Rev. 01/01/13]</span>
      <span>Page 1 of 1</span>
    </div>
  );

  return (
    <FormPage footer={pageFooter}>
      <div className="text-center">
        <p className="text-[13px] font-bold leading-tight">
          SUPERIOR COURT OF CALIFORNIA, COUNTY OF RIVERSIDE
        </p>
      </div>

      <CourtHeader
        formNo="RI-FL036"
        petitioner={p}
        respondent={r}
        caseNumber={data.fl100.caseNumber}
        attorneyName={p}
        attorneyAddress={addr}
        attorneyPhone={intake.petitionerPhone}
        attorneyEmail={intake.petitionerEmail}
        titleBlock="DECLARATION OF RESIDENCE"
      />

      <p className="mt-2 text-[11px]">
        The undersigned certifies that this case should be tried or heard in the:
      </p>
      <Row>
        {COURT_ORDER.map((key) => (
          <Box
            key={key}
            checked={intake.courthouse === key}
            label={`${COURTHOUSES[key].name} Court`}
          />
        ))}
      </Row>

      <p className="mt-2 text-[11px]">for the following reasons:</p>
      <Row>
        <Box
          checked={rifl036.reason === "geographic"}
          label="The party's primary residence is located within the geographical area. The city and zip code is:"
        />
      </Row>
      <Row>
        <Line label="City" value={rifl036.city} />
        <Line label="Zip code" value={rifl036.zip} />
      </Row>

      <Row>
        <Box checked={rifl036.reason === "other"} label="Other:" />
        <span>{rifl036.reason === "other" ? rifl036.otherReason : ""}</span>
      </Row>

      <SignatureBlock name={p} date={toCourtDate(rifl036.date)} role="SIGNATURE" />
    </FormPage>
  );
}
