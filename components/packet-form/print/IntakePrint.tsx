import { PacketFormData } from "@/lib/types/packet.types";
import { COURTHOUSES } from "@/lib/constants/packet.constants";
import { fullName, petitionerName, respondentName, toCourtDate } from "@/lib/utils/packet-helpers";
import { CourthouseKey } from "@/lib/types/packet.types";
import { FormPage, Box, Line, Row, SectionTitle } from "./print-ui";

export function IntakePrint({ data }: { data: PacketFormData }) {
  const { intake } = data;

  return (
    <FormPage>
      <div className="text-center">
        <p className="text-[15px] font-bold leading-tight">Superior Court of California</p>
        <p className="text-[15px] font-bold leading-tight">County of Riverside</p>
        <p className="text-[15px] font-bold leading-tight">Dissolution, Legal Separation, or Nullity</p>
      </div>

      <SectionTitle>Your Information</SectionTitle>
      <Row><Line label="Name (First, Middle, Last):" value={petitionerName(intake)} className="grow" /></Row>
      <Row><Line label="Street Address:" value={intake.petitionerStreet} className="grow" /></Row>
      <Row>
        <Line
          label="City, State, Zip Code:"
          value={[intake.petitionerCity, intake.petitionerState, intake.petitionerZip]
            .filter(Boolean)
            .join(", ")}
          className="grow"
        />
      </Row>
      <Row><Line label="Telephone Number:" value={intake.petitionerPhone} className="grow" /></Row>

      <SectionTitle>Your Spouse / Partner&apos;s Name</SectionTitle>
      <Row><Line label="Name (First, Middle, Last):" value={respondentName(intake)} className="grow" /></Row>

      <SectionTitle>Type of Case</SectionTitle>
      <Row>
        <Box checked={intake.caseType === "dissolution"} label="Dissolution" />
        <Box checked={intake.caseType === "legalSeparation"} label="Legal Separation" />
        <Box checked={intake.caseType === "nullity"} label="Nullity" />
      </Row>

      <SectionTitle>Date of Marriage</SectionTitle>
      <Row>
        <Line value={toCourtDate(intake.marriageDate)} />
        <span className="text-[10px]">MM/DD/YYYY</span>
      </Row>

      <SectionTitle>List minor children of the relationship</SectionTitle>
      <Row>
        <span>Are there minor children?</span>
        <Box checked={!intake.hasMinorChildren} label="No" />
        <Box checked={intake.hasMinorChildren} label="Yes" />
        <Line label="How many?" value={intake.hasMinorChildren ? intake.numberOfChildren : ""} />
      </Row>
      <p className="text-[10px] italic">
        **If you have more than two minor children of this marriage, you must also complete a FL-105(a)
        for the additional children.
      </p>

      {intake.hasMinorChildren &&
        intake.children.map((child, i) => (
          <div key={i} className="mt-1">
            <Row><Line label="Name (First, Middle, Last):" value={fullName(child.firstName, child.middleName, child.lastName)} className="grow" /></Row>
            <Row><Line label="Place of Birth (City/State):" value={child.placeOfBirth} className="grow" /></Row>
            <Row>
              <Line label="Date of Birth (MM/DD/YYYY):" value={toCourtDate(child.dateOfBirth)} />
              <Line label="Age:" value={child.age} />
            </Row>
          </div>
        ))}

      <SectionTitle>Where is your case filed?</SectionTitle>
      <div className="grid grid-cols-2 gap-x-6">
        {(Object.keys(COURTHOUSES) as CourthouseKey[]).map((key) => (
          <Row key={key}>
            <Box
              checked={intake.courthouse === key}
              label={`${COURTHOUSES[key].address}, ${COURTHOUSES[key].cityStateZip}`}
            />
          </Row>
        ))}
      </div>

      <SectionTitle>Filing Options</SectionTitle>
      <Row>
        <Box
          checked={intake.filingOption === "inPerson"}
          label="I plan to print the documents and submit them in person."
        />
      </Row>
      <Row>
        <Box
          checked={intake.filingOption === "online"}
          label="I plan to electronically sign my documents and submit my paperwork online."
        />
      </Row>
      {intake.filingOption === "online" && (
        <>
          <p className="text-[10px]">
            By checking this box, I declare under penalty of perjury under the laws of the State of
            California that all the information provided for this filing is true and correct.
          </p>
          <Row>
            <Line label="Electronic signature:" value={intake.electronicSignatureName} className="grow" />
          </Row>
        </>
      )}

      <SectionTitle>Today&apos;s Date</SectionTitle>
      <Row><Line value={toCourtDate(intake.todaysDate)} /></Row>
    </FormPage>
  );
}
