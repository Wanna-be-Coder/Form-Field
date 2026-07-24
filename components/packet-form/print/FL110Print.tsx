import { PacketFormData, CourthouseKey } from "@/lib/types/packet.types";
import { COURTHOUSES } from "@/lib/constants/packet.constants";
import { petitionerName, respondentName } from "@/lib/utils/packet-helpers";
import { FL110_RESTRAINING_ORDERS } from "../steps/FL110Step";
import { FormPage, Box, Line, Row, SectionTitle } from "./print-ui";

export function FL110Print({ data }: { data: PacketFormData }) {
  const { intake, fl110 } = data;
  const p = petitionerName(intake);
  const r = respondentName(intake);
  const addr = [
    intake.petitionerStreet,
    [intake.petitionerCity, intake.petitionerState, intake.petitionerZip].filter(Boolean).join(", "),
  ]
    .filter(Boolean)
    .join(", ");

  const pageFooter = (page: number) => (
    <div className="flex justify-between">
      <span>FL-110 [Rev. January 1, 2015]</span>
      <span>Page {page} of 2</span>
    </div>
  );

  return (
    <>
      {/* Page 1 */}
      <FormPage title="SUMMONS (Family Law)" formNo="FL-110" footer={pageFooter(1)}>
        <Row><Line label="NOTICE TO RESPONDENT (Name):" value={r} className="grow" /></Row>
        <p className="mt-1 text-[11px] font-bold">
          You have been sued. Read the information below and on the next page.
        </p>
        <Row className="mt-1"><Line label="Petitioner's name is:" value={p} className="grow" /></Row>

        <div className="mt-2 space-y-2 text-[10.5px] leading-relaxed">
          <p>
            You have 30 calendar days after this Summons and Petition are served on you to file a
            Response (form FL-120) at the court and have a copy served on the petitioner. A letter,
            phone call, or court appearance will not protect you.
          </p>
          <p>
            If you do not file your Response on time, the court may make orders affecting your
            marriage or domestic partnership, your property, and custody of your children. You may be
            ordered to pay support and attorney fees and costs.
          </p>
          <p>
            For legal advice, contact a lawyer immediately. You can get information about finding a
            lawyer at the California Courts Online Self-Help Center, the county bar association, or a
            legal aid office.
          </p>
          <p className="font-bold">
            NOTICE—RESTRAINING ORDERS ARE ON PAGE 2: These restraining orders are effective against
            both spouses or domestic partners until the petition is dismissed, a judgment is entered,
            or the court makes further orders. They are enforceable anywhere in California by any law
            enforcement officer who has received or seen a copy of them.
          </p>
          <p>
            FEE WAIVER: If you cannot pay the filing fee, ask the clerk for a fee waiver form. The
            court may order you to pay back all or part of the fee and costs the court waived for you
            or the other party.
          </p>
        </div>

        <SectionTitle n={1}>The name and address of the court are:</SectionTitle>
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

        <SectionTitle n={2}>
          The name, address, and telephone number of the petitioner&apos;s attorney, or the petitioner
          without an attorney, are:
        </SectionTitle>
        <Row><Line label="Name:" value={p} className="grow" /></Row>
        <Row><Line label="Address:" value={addr} className="grow" /></Row>
        <Row><Line label="Telephone:" value={intake.petitionerPhone} /></Row>

        <Row className="mt-2"><Line label="CASE NUMBER:" value={fl110.caseNumber} /></Row>
      </FormPage>

      {/* Page 2 */}
      <FormPage footer={pageFooter(2)}>
        <p className="text-center text-[13px] font-bold uppercase">
          Standard Family Law Restraining Orders
        </p>
        <p className="mt-2 text-[10.5px] leading-relaxed">
          Starting immediately, you and your spouse or domestic partner are restrained from:
        </p>
        <ol className="mt-1 list-decimal space-y-1.5 pl-5 text-[10.5px] leading-relaxed">
          {FL110_RESTRAINING_ORDERS.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ol>
        <p className="mt-2 text-[10.5px] leading-relaxed">
          You must notify each other of any proposed extraordinary expenditures at least five business
          days before incurring them and account to the court for all extraordinary expenditures made
          after these orders are effective.
        </p>
        <p className="mt-2 text-[10.5px] font-bold">WARNING—IMPORTANT INFORMATION</p>
        <p className="text-[10.5px] leading-relaxed">
          California law provides that, for purposes of division of property upon dissolution of a
          marriage or domestic partnership or upon legal separation, property acquired by the parties
          during the marriage or domestic partnership in joint form is presumed to be community
          property. If either party to this action should die before the jointly held community
          property is divided, the language in the deed with which the parties took title does not
          necessarily determine the character of the property.
        </p>
      </FormPage>
    </>
  );
}
