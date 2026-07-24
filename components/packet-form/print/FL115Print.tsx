import { PacketFormData } from "@/lib/types/packet.types";
import { COURTHOUSES } from "@/lib/constants/packet.constants";
import { petitionerName, respondentName, toCourtDate } from "@/lib/utils/packet-helpers";
import { FormPage, Box, Line, Row, SectionTitle, CourtHeader, SignatureBlock } from "./print-ui";

export function FL115Print({ data }: { data: PacketFormData }) {
  const { intake, fl115, fl100 } = data;
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
  const caseNumber = fl115.caseNumber || fl100.caseNumber;

  const pageFooter = (page: number) => (
    <div className="flex justify-between">
      <span>FL-115 [Rev. January 1, 2021]</span>
      <span>Page {page} of 2</span>
    </div>
  );

  return (
    <>
      {/* Page 1 */}
      <FormPage footer={pageFooter(1)}>
        <CourtHeader
          formNo="FL-115"
          courtAddress={courtAddress}
          petitioner={p}
          respondent={r}
          caseNumber={caseNumber}
          attorneyName={p}
          attorneyAddress={addr}
          attorneyPhone={intake.petitionerPhone}
          attorneyEmail={intake.petitionerEmail}
          titleBlock="Proof of Service of Summons"
        />

        <SectionTitle n={1}>
          At the time of service I was at least 18 years of age and not a party to this action. I
          served the respondent with copies of:
        </SectionTitle>
        <Row>
          <Box
            checked
            label="a. Family Law: Petition—Marriage/Domestic Partnership (FL-100), Summons (FL-110), and blank Response (FL-120)"
          />
        </Row>
        <Row>
          <span>and d. (attachments)</span>
        </Row>
        <Row className="ml-6">
          <Box checked label="Completed and blank UCCJEA (FL-105)" />
        </Row>
        <Row className="ml-6">
          <Box checked label="Declaration of Disclosure (FL-140)" />
        </Row>
        <Row className="ml-6">
          <Box checked label="Schedule of Assets and Debts (FL-142)" />
        </Row>
        <Row className="ml-6">
          <Box checked label="Income and Expense Declaration (FL-150)" />
        </Row>

        <SectionTitle n={2}>Address where respondent was served</SectionTitle>
        <Row>
          <Line label="Address where respondent was served:" value={fl115.addressServed} className="grow" />
        </Row>

        <SectionTitle n={3}>I served the respondent by the following means</SectionTitle>
        <Row>
          <Box
            checked={fl115.serviceMethod === "personal"}
            label={`a. Personal service. I personally delivered the copies to the respondent on ${
              toCourtDate(fl115.serviceDate) || "____"
            } at ${fl115.serviceTime || "____"}.`}
          />
        </Row>
        <Row>
          <Box
            checked={fl115.serviceMethod === "substituted"}
            label="b. Substituted service. I left the copies with a competent member of the household or a person apparently in charge of the respondent's office or place of business, and thereafter mailed a copy to the respondent at the place where the copies were left."
          />
        </Row>
        {fl115.serviceMethod === "substituted" ? (
          <Row className="ml-6">
            <Line label="Date left:" value={toCourtDate(fl115.serviceDate)} />
            <Line label="Time left:" value={fl115.serviceTime} />
          </Row>
        ) : null}
        <Row>
          <Box
            checked={fl115.serviceMethod === "mail"}
            label="c. Mail and acknowledgment service. I mailed the copies to the respondent, along with two copies of a Notice and Acknowledgment of Receipt and a postage-paid return envelope."
          />
        </Row>
        {fl115.serviceMethod === "mail" ? (
          <Row className="ml-6">
            <Line label="Date mailed:" value={toCourtDate(fl115.serviceDate)} />
          </Row>
        ) : null}
      </FormPage>

      {/* Page 2 */}
      <FormPage footer={pageFooter(2)}>
        <div className="text-[10px]">
          PETITIONER: {p}&nbsp;&nbsp;&nbsp;RESPONDENT: {r}&nbsp;&nbsp;&nbsp;CASE NUMBER: {caseNumber}
        </div>

        <SectionTitle n={4}>Person who served papers</SectionTitle>
        <Row>
          <Line label="Name:" value={fl115.serverName} className="grow" />
        </Row>
        <Row>
          <Line label="Address:" value={fl115.serverAddress} className="grow" />
        </Row>
        <Row>
          <Line label="Telephone:" value={fl115.serverPhone} />
        </Row>

        <p className="mt-2 text-[11px] font-bold">This person is:</p>
        <Row>
          <Box
            checked={fl115.serverIsRegistered}
            label="a registered California process server"
          />
        </Row>
        {fl115.serverIsRegistered ? (
          <Row className="ml-6">
            <Line label="Registration no.:" value={fl115.serverRegistrationNo} />
            <Line label="County:" value={fl115.serverCounty} />
            <Line label="Fee for service:" value={fl115.serverFee} />
          </Row>
        ) : (
          <Row>
            <Box checked={!fl115.serverIsRegistered} label="not a registered California process server" />
          </Row>
        )}

        <SectionTitle n={5}>Declaration</SectionTitle>
        <Row>
          <Box
            checked
            label="I declare under penalty of perjury under the laws of the State of California that the foregoing is true and correct."
          />
        </Row>

        <SignatureBlock
          name={fl115.serverName}
          date={toCourtDate(fl115.date)}
          role="SIGNATURE OF PERSON WHO SERVED PAPERS"
          declaration={false}
        />
      </FormPage>
    </>
  );
}
