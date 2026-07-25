import { PacketFormData } from "@/lib/types/packet.types";
import { CASE_TYPE_LABELS, COURTHOUSES } from "@/lib/constants/packet.constants";
import { fullName, petitionerName, respondentName, toCourtDate } from "@/lib/utils/packet-helpers";
import { FormPage, Box, Line, Row, SectionTitle, CourtHeader, SignatureBlock } from "./print-ui";

export function FL100Print({ data }: { data: PacketFormData }) {
  const { intake, fl100 } = data;
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
  const rel = intake.relationshipType === "marriage" ? "Marriage" : "Domestic Partnership";
  const pageFooter = (page: number) => (
    <div className="flex justify-between">
      <span>FL-100 [Rev. January 1, 2020]</span>
      <span>Page {page} of 3</span>
    </div>
  );

  const lr = fl100.legalRelationship;

  return (
    <>
      {/* Page 1 */}
      <FormPage footer={pageFooter(1)}>
        <CourtHeader
          formNo="FL-100"
          courtAddress={courtAddress}
          petitioner={p}
          respondent={r}
          caseNumber={intake.caseNumber}
          attorneyName={p}
          attorneyAddress={addr}
          attorneyPhone={intake.petitionerPhone}
          attorneyEmail={intake.petitionerEmail}
        />

        <div className="border border-black p-1.5">
          <div className="flex items-center gap-3 text-[11px] font-bold">
            <span>PETITION FOR:</span>
            {fl100.amended ? <Box checked label="AMENDED" /> : null}
          </div>
          <Row>
            <Box checked={intake.caseType === "dissolution"} label="Dissolution (Divorce) of:" />
            <Box checked={intake.caseType === "dissolution" && rel === "Marriage"} label="Marriage" />
            <Box checked={intake.caseType === "dissolution" && rel !== "Marriage"} label="Domestic Partnership" />
          </Row>
          <Row>
            <Box checked={intake.caseType === "legalSeparation"} label="Legal Separation of:" />
            <Box checked={intake.caseType === "legalSeparation" && rel === "Marriage"} label="Marriage" />
            <Box checked={intake.caseType === "legalSeparation" && rel !== "Marriage"} label="Domestic Partnership" />
          </Row>
          <Row>
            <Box checked={intake.caseType === "nullity"} label="Nullity of:" />
            <Box checked={intake.caseType === "nullity" && rel === "Marriage"} label="Marriage" />
            <Box checked={intake.caseType === "nullity" && rel !== "Marriage"} label="Domestic Partnership" />
          </Row>
        </div>

        <SectionTitle n={1}>Legal Relationship (check all that apply)</SectionTitle>
        <Row><Box checked={lr.includes("married")} label="a. We are married." /></Row>
        <Row><Box checked={lr.includes("dpInCA")} label="b. We are domestic partners and our domestic partnership was established in California." /></Row>
        <Row><Box checked={lr.includes("dpNotInCA")} label="c. We are domestic partners and our domestic partnership was NOT established in California." /></Row>

        <SectionTitle n={2}>Residence Requirements</SectionTitle>
        <Row>
          <Box checked={fl100.residencyMet} />
          <Box checked={fl100.residencyParty === "petitioner"} label="Petitioner" />
          <Box checked={fl100.residencyParty === "respondent"} label="Respondent" />
          <span>has been a resident of this state for at least six months and of this county for at least three months.</span>
        </Row>
        <Row><Box checked={fl100.residencyDpInCA} label="b. Our domestic partnership was established in California." /></Row>
        <Row><Box checked={fl100.residencySameSex} label="c. Same sex, married in California, but living in a non-recognizing jurisdiction." /></Row>
        {fl100.residencySameSex ? (
          <Row>
            <Line label="Petitioner lives in:" value={fl100.petitionerLivesIn} />
            <Line label="Respondent lives in:" value={fl100.respondentLivesIn} />
          </Row>
        ) : null}

        <SectionTitle n={3}>Statistical Facts</SectionTitle>
        <Row>
          <Line label="Date of marriage:" value={toCourtDate(intake.marriageDate)} />
          <Line label="Date of separation:" value={toCourtDate(fl100.dateOfSeparation)} />
        </Row>
        {intake.relationshipType === "domesticPartnership" ? (
          <Row><Line label="Registration date of domestic partnership:" value={toCourtDate(fl100.dpRegistrationDate)} /></Row>
        ) : null}

        <SectionTitle n={4}>Minor Children</SectionTitle>
        <Row><Box checked={!intake.hasMinorChildren} label="a. There are no minor children." /></Row>
        <Row><Box checked={intake.hasMinorChildren} label="b. The minor children are:" /></Row>
        {intake.hasMinorChildren ? (
          <table className="packet-table mt-1">
            <thead>
              <tr><th>Child&apos;s name</th><th>Birthdate</th><th>Age</th></tr>
            </thead>
            <tbody>
              {intake.children.map((c, i) => (
                <tr key={i}>
                  <td>{fullName(c.firstName, c.middleName, c.lastName)}</td>
                  <td>{toCourtDate(c.dateOfBirth)}</td>
                  <td>{c.age}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : null}
        {intake.hasMinorChildren ? (
          <>
            <Row><Box checked={fl100.childBornBeforeMarriage} label="c. Children born before the marriage/partnership may be determined children of the relationship." /></Row>
            <Row><Box checked={fl100.uccjeaAttached} label="d. A completed UCCJEA (FL-105) is attached." /></Row>
            <Row><Box checked={fl100.voluntaryParentage} label="e. Petitioner and Respondent signed a voluntary declaration of parentage or paternity." /></Row>
          </>
        ) : null}
      </FormPage>

      {/* Page 2 */}
      <FormPage footer={pageFooter(2)}>
        <div className="text-[10px]">PETITIONER: {p}&nbsp;&nbsp;&nbsp;RESPONDENT: {r}</div>
        <p className="mt-1 text-[11px] font-bold">Petitioner requests that the court make the following orders:</p>

        <SectionTitle n={5}>Legal Grounds (Family Code §§ 2200–2210, 2310–2312)</SectionTitle>
        <Row>
          <Box
            checked={intake.caseType !== "nullity"}
            label={`a. ${CASE_TYPE_LABELS[intake.caseType]} of the ${rel.toLowerCase()} based on:`}
          />
        </Row>
        <Row className="ml-6">
          <Box checked={fl100.groundsDivorceOrSeparation === "irreconcilable"} label="(1) irreconcilable differences." />
          <Box checked={fl100.groundsDivorceOrSeparation === "incapacity"} label="(2) permanent legal incapacity to make decisions." />
        </Row>
        <Row><Box checked={intake.caseType === "nullity" && !!fl100.groundsNullityVoid} label="b. Nullity of void marriage/partnership based on:" /></Row>
        <Row className="ml-6">
          <Box checked={fl100.groundsNullityVoid === "incest"} label="(1) incest." />
          <Box checked={fl100.groundsNullityVoid === "bigamy"} label="(2) bigamy." />
        </Row>
        <Row><Box checked={intake.caseType === "nullity" && !!fl100.groundsNullityVoidable} label="c. Nullity of voidable marriage/partnership based on:" /></Row>
        <Row className="ml-6">
          <Box checked={fl100.groundsNullityVoidable === "age"} label="(1) age" />
          <Box checked={fl100.groundsNullityVoidable === "priorMarriage"} label="(2) prior marriage" />
          <Box checked={fl100.groundsNullityVoidable === "unsoundMind"} label="(3) unsound mind" />
          <Box checked={fl100.groundsNullityVoidable === "fraud"} label="(4) fraud" />
          <Box checked={fl100.groundsNullityVoidable === "force"} label="(5) force" />
          <Box checked={fl100.groundsNullityVoidable === "physicalIncapacity"} label="(6) physical incapacity" />
        </Row>

        <SectionTitle n={6}>Child Custody & Visitation (Parenting Time)</SectionTitle>
        {(["legalCustodyTo", "physicalCustodyTo", "visitationTo"] as const).map((key, i) => {
          const val = fl100[key];
          const label = ["Legal custody of children to", "Physical custody of children to", "Child visitation (parenting time) be granted to"][i];
          return (
            <Row key={key}>
              <span className="w-64">{label}</span>
              <Box checked={val === "petitioner"} label="Petitioner" />
              <Box checked={val === "respondent"} label="Respondent" />
              <Box checked={val === "joint"} label="Joint" />
              <Box checked={val === "other"} label="Other" />
            </Row>
          );
        })}

        <SectionTitle n={7}>Child Support</SectionTitle>
        <p className="text-[10px]">Child support may be ordered upon request and submission of financial forms. An earnings assignment may be issued. Interest accrues on overdue amounts at the legal rate (currently 10%).</p>
        {fl100.childSupportOther ? <Row><Line label="Other:" value={fl100.childSupportOther} className="grow" /></Row> : null}

        <SectionTitle n={8}>Spousal or Domestic Partner Support</SectionTitle>
        <Row><Box checked={!!fl100.spousalSupportTo} label="a. Support payable to" /><Box checked={fl100.spousalSupportTo === "petitioner"} label="Petitioner" /><Box checked={fl100.spousalSupportTo === "respondent"} label="Respondent" /></Row>
        <Row><Box checked={!!fl100.terminateSupportTo} label="b. Terminate the court's ability to award support to" /><Box checked={fl100.terminateSupportTo === "petitioner"} label="Petitioner" /><Box checked={fl100.terminateSupportTo === "respondent"} label="Respondent" /></Row>
        <Row><Box checked={!!fl100.reserveSupportTo} label="c. Reserve for future determination support to" /><Box checked={fl100.reserveSupportTo === "petitioner"} label="Petitioner" /><Box checked={fl100.reserveSupportTo === "respondent"} label="Respondent" /></Row>
        {fl100.spousalSupportOther ? <Row><Line label="d. Other:" value={fl100.spousalSupportOther} className="grow" /></Row> : null}

        <SectionTitle n={9}>Separate Property</SectionTitle>
        <Row><Box checked={fl100.separatePropertyNone} label="a. There are no such assets or debts to be confirmed by the court." /></Row>
        {!fl100.separatePropertyNone && fl100.separatePropertyList ? (
          <Row><Box checked label="b. Confirm as separate property:" /> <span>{fl100.separatePropertyList}</span></Row>
        ) : null}
      </FormPage>

      {/* Page 3 */}
      <FormPage footer={pageFooter(3)}>
        <div className="text-[10px]">PETITIONER: {p}&nbsp;&nbsp;&nbsp;RESPONDENT: {r}</div>

        <SectionTitle n={10}>Community & Quasi-Community Property</SectionTitle>
        <Row><Box checked={fl100.communityPropertyNone} label="a. There are no such assets or debts to be divided by the court." /></Row>
        {!fl100.communityPropertyNone && fl100.communityPropertyList ? (
          <Row><Box checked label="b. Determine rights to:" /> <span>{fl100.communityPropertyList}</span></Row>
        ) : null}

        <SectionTitle n={11}>Other Requests</SectionTitle>
        <Row><Box checked={!!fl100.attorneyFeesFrom} label="a. Attorney's fees and costs payable by" /><Box checked={fl100.attorneyFeesFrom === "petitioner"} label="Petitioner" /><Box checked={fl100.attorneyFeesFrom === "respondent"} label="Respondent" /></Row>
        <Row><Box checked={fl100.restoreFormerName} label="b. Petitioner's former name be restored to:" /> <span>{fl100.formerName}</span></Row>
        {fl100.otherRequests ? <Row><Line label="c. Other:" value={fl100.otherRequests} className="grow" /></Row> : null}

        <SectionTitle n={12}>Restraining Orders Acknowledgement</SectionTitle>
        <Row>
          <Box checked={fl100.restrainingOrdersRead} label="I have read the restraining orders on the back of the Summons, and I understand that they apply to me when this Petition is filed." />
        </Row>

        <SignatureBlock
          name={p}
          date={toCourtDate(intake.todaysDate)}
          role="SIGNATURE OF PETITIONER"
        />
      </FormPage>
    </>
  );
}
