import { PacketFormData } from "@/lib/types/packet.types";
import { COURTHOUSES } from "@/lib/constants/packet.constants";
import { petitionerName, respondentName, toCourtDate } from "@/lib/utils/packet-helpers";
import { FormPage, Box, Line, Row, CourtHeader, SignatureBlock } from "./print-ui";

export function RIFL011Print({ data }: { data: PacketFormData }) {
  const { intake, fl100, rifl011 } = data;
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
      <span>RI-FL011 [Rev. 1/1/13]</span>
      <span>Page 1 of 1</span>
    </div>
  );

  return (
    <FormPage formNo="RI-FL011" footer={pageFooter}>
      <div className="text-center">
        <p className="text-[15px] font-bold leading-tight">Superior Court of California</p>
        <p className="text-[15px] font-bold leading-tight">County of Riverside</p>
      </div>

      <CourtHeader
        formNo="RI-FL011"
        confidential
        courtAddress={courtAddress}
        petitioner={p}
        respondent={r}
        caseNumber={fl100.caseNumber}
        attorneyName={p}
        attorneyAddress={addr}
        attorneyPhone={intake.petitionerPhone}
        attorneyEmail={intake.petitionerEmail}
        titleBlock="Confidential Contact Information"
      />

      <p className="mt-2 text-[11px]">
        If you would like to receive electronic self-help information about family law services
        from the court please complete the following:
      </p>
      <Row>
        <Box
          checked={rifl011.agreeEmail}
          label="I agree to receive self-help information from the court via email. The email address I want information sent to is:"
        />
        <Line value={rifl011.email} className="grow" />
      </Row>

      <p className="mt-2 text-[11px]">
        The court values your privacy. At no time will the court make your email address
        available to any third party.
      </p>

      <p className="mt-2 text-[11px]">
        If you would like to stop receiving electronic self-help information from the court
        please complete the following:
      </p>
      <Row>
        <Box
          checked={rifl011.stopEmail}
          label="I no longer wish to receive self-help information from the court."
        />
      </Row>

      <p className="mt-2 text-[10px] italic">
        Please Note: As a party to this action, if you appear without an attorney, you are
        required to inform the court of any changes in your mailing address and phone number for
        so long as your case remains active.
      </p>

      <SignatureBlock name={p} date={toCourtDate(rifl011.date)} role="SIGNATURE" />
    </FormPage>
  );
}
