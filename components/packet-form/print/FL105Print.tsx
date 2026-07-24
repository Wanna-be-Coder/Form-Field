import { PacketFormData } from "@/lib/types/packet.types";
import { COURTHOUSES } from "@/lib/constants/packet.constants";
import { fullName, petitionerName, respondentName, toCourtDate } from "@/lib/utils/packet-helpers";
import { FormPage, Box, Line, Row, SectionTitle, CourtHeader, SignatureBlock } from "./print-ui";

export function FL105Print({ data }: { data: PacketFormData }) {
  const { intake, fl105 } = data;
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

  const pageFooter = (page: number) => (
    <div className="flex justify-between">
      <span>FL-105/GC-120 [Rev. January 1, 2025]</span>
      <span>Page {page} of 2</span>
    </div>
  );

  // Children come read-only from Basic Information (the intake step).
  const children = intake.children ?? [];

  return (
    <>
      {/* Page 1 */}
      <FormPage footer={pageFooter(1)}>
        <CourtHeader
          formNo="FL-105/GC-120"
          courtAddress={courtAddress}
          petitioner={p}
          respondent={r}
          otherParty=""
          caseNumber={data.fl100.caseNumber}
          attorneyName={p}
          attorneyAddress={addr}
          attorneyPhone={intake.petitionerPhone}
          attorneyEmail={intake.petitionerEmail}
          titleBlock="Declaration Under Uniform Child Custody Jurisdiction and Enforcement Act (UCCJEA)"
        />

        <SectionTitle n={1}>I am (check one):</SectionTitle>
        <Row><Box checked={fl105.role === "party"} label="A party to this proceeding to determine custody of a child." /></Row>
        <Row><Box checked={fl105.role === "agencyRep"} label="The authorized representative of an agency that is a party." /></Row>

        <SectionTitle n={2}>Minor Children</SectionTitle>
        <p className="text-[10px]">
          There are (specify number): {children.length} minor children who are subject to this
          proceeding, as follows (list oldest child first):
        </p>
        <table className="packet-table mt-1">
          <thead>
            <tr>
              <th>Full Name</th>
              <th>Date of birth</th>
              <th>Place of birth (city and state)</th>
            </tr>
          </thead>
          <tbody>
            {children.map((c, i) => (
              <tr key={i}>
                <td>{fullName(c.firstName, c.middleName, c.lastName)}</td>
                <td>{toCourtDate(c.dateOfBirth)}</td>
                <td>{c.placeOfBirth}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <SectionTitle n={3}>
          Residence History of the child named above (or the oldest child if more than one) for the
          past five years
        </SectionTitle>
        <table className="packet-table mt-1">
          <thead>
            <tr>
              <th>Dates of residence (Month/Year)</th>
              <th>Residence (City, State)</th>
              <th>Person child lived with and complete current address</th>
              <th>Relationship</th>
            </tr>
          </thead>
          <tbody>
            {fl105.residences.map((res, i) => (
              <tr key={i}>
                <td>
                  {toCourtDate(res.fromDate)} to {res.isCurrent ? "present" : toCourtDate(res.toDate)}
                </td>
                <td>{res.residence}</td>
                <td>{res.livedWith}</td>
                <td>{res.relationship}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <Row>
          <Box
            checked={fl105.singleResidenceForAll}
            label="There is only one child, or all children have lived together for the past five years."
          />
        </Row>
      </FormPage>

      {/* Page 2 */}
      <FormPage footer={pageFooter(2)}>
        <div className="text-[10px]">
          PETITIONER: {p}&nbsp;&nbsp;&nbsp;RESPONDENT: {r}
        </div>

        <SectionTitle n={4}>Other Custody / Visitation Proceedings</SectionTitle>
        <p className="text-[10px]">
          Do you have information about another custody/visitation proceeding concerning a child in
          this case?
        </p>
        <Row>
          <Box checked={fl105.otherProceedings} label="Yes" />
          <Box checked={!fl105.otherProceedings} label="No" />
        </Row>
        {fl105.otherProceedings && fl105.otherProceedingsDetails ? (
          <Row>
            <Line label="Details:" value={fl105.otherProceedingsDetails} className="grow" />
          </Row>
        ) : null}

        <SectionTitle n={5}>Domestic Violence Restraining/Protective Orders</SectionTitle>
        <Row>
          <Box
            checked={fl105.restrainingOrders}
            label="One or more domestic violence restraining/protective orders are now in effect."
          />
        </Row>
        {fl105.restrainingOrders && fl105.restrainingOrdersDetails ? (
          <Row>
            <Line label="Court, county, state, case number, expiration:" value={fl105.restrainingOrdersDetails} className="grow" />
          </Row>
        ) : null}

        <SectionTitle n={6}>Other Persons with Custody or Visitation Claims</SectionTitle>
        <p className="text-[10px]">
          Do you know of any person not a party to this case who has physical custody of, or claims to
          have custody or visitation rights with, any child?
        </p>
        <Row>
          <Box checked={fl105.otherPersons} label="Yes" />
          <Box checked={!fl105.otherPersons} label="No" />
        </Row>
        {fl105.otherPersons
          ? fl105.persons.map((person, i) => (
              <div key={i} className="mt-1 border border-black p-1.5 text-[10px]">
                <div>Name and address: {person.nameAddress}</div>
                <Row>
                  <Box checked={person.hasPhysicalCustody} label="Has physical custody" />
                  <Box checked={person.claimsCustody} label="Claims custody rights" />
                  <Box checked={person.claimsVisitation} label="Claims visitation rights" />
                </Row>
                <div>Name of each child: {person.childrenNames}</div>
              </div>
            ))
          : null}

        <SectionTitle n={7}>Attachments</SectionTitle>
        <Row>
          <Line label="Number of pages attached:" value={fl105.pagesAttached} />
        </Row>

        <SignatureBlock
          name={p}
          date={toCourtDate(fl105.date)}
          role="SIGNATURE OF DECLARANT"
        />
      </FormPage>
    </>
  );
}
