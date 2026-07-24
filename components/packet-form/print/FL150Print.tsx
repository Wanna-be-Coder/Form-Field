import { PacketFormData } from "@/lib/types/packet.types";
import {
  formatCurrency,
  petitionerName,
  respondentName,
  toCourtDate,
  totalMonthlyExpenses,
  totalMonthlyIncome,
} from "@/lib/utils/packet-helpers";
import { FormPage, Box, Line, Row, SectionTitle, CourtHeader, SignatureBlock } from "./print-ui";

export function FL150Print({ data }: { data: PacketFormData }) {
  const { intake, fl150 } = data;
  const p = petitionerName(intake);
  const r = respondentName(intake);
  const addr = [
    intake.petitionerStreet,
    [intake.petitionerCity, intake.petitionerState, intake.petitionerZip].filter(Boolean).join(", "),
  ]
    .filter(Boolean)
    .join(", ");

  const showChildSupportPage = intake.hasMinorChildren;
  const totalPages = showChildSupportPage ? 4 : 3;

  const pageFooter = (page: number) => (
    <div className="flex justify-between">
      <span>FL-150 [Rev. September 1, 2024]</span>
      <span>Page {page} of {totalPages}</span>
    </div>
  );

  const incomeItems: Array<[string, string]> = [
    ["Salary or wages", fl150.incomeSalary],
    ["Overtime", fl150.incomeOvertime],
    ["Commissions or bonuses", fl150.incomeCommissions],
    ["Public assistance", fl150.incomePublicAssistance],
    ["Spousal support received", fl150.incomeSpousalSupport],
    ["Pension or retirement", fl150.incomePension],
    ["Social security", fl150.incomeSocialSecurity],
    ["Unemployment compensation", fl150.incomeUnemployment],
    ["Other", fl150.incomeOther],
  ];

  const deductionItems: Array<[string, string]> = [
    ["Required union dues", fl150.deductionUnionDues],
    ["Required retirement contributions", fl150.deductionRetirement],
    ["Health insurance premiums", fl150.deductionHealthInsurance],
    ["Child/spousal support paid for other relationships", fl150.deductionChildSupportOther],
  ];

  const assetItems: Array<[string, string]> = [
    ["Cash", fl150.assetCash],
    ["Stocks, bonds, and other assets", fl150.assetStocks],
    ["Other property", fl150.assetOtherProperty],
  ];

  const expenseItems: Array<[string, string]> = [
    ["Home (rent or mortgage & maintenance)", fl150.expenseHome],
    ["Health-care costs not covered by insurance", fl150.expenseHealthCare],
    ["Child care", fl150.expenseChildCare],
    ["Groceries and household supplies", fl150.expenseGroceries],
    ["Eating out", fl150.expenseEatingOut],
    ["Utilities", fl150.expenseUtilities],
    ["Telephone, cell phone, internet", fl150.expensePhone],
    ["Laundry and cleaning", fl150.expenseLaundry],
    ["Clothes", fl150.expenseClothes],
    ["Education", fl150.expenseEducation],
    ["Entertainment and gifts", fl150.expenseEntertainment],
    ["Auto (gas, maintenance, transportation)", fl150.expenseAuto],
    ["Insurance (life, accident)", fl150.expenseInsurance],
    ["Savings and investments", fl150.expenseSavings],
    ["Other", fl150.expenseOther],
  ];

  return (
    <>
      {/* Page 1 */}
      <FormPage footer={pageFooter(1)}>
        <CourtHeader
          formNo="FL-150"
          petitioner={p}
          respondent={r}
          otherParty=""
          caseNumber={data.fl100.caseNumber}
          attorneyName={p}
          attorneyAddress={addr}
          attorneyPhone={intake.petitionerPhone}
          attorneyEmail={intake.petitionerEmail}
          titleBlock="INCOME AND EXPENSE DECLARATION"
        />

        <SectionTitle n={1}>Employment</SectionTitle>
        <Row>
          <Line label="Employer's name:" value={fl150.employer} />
          <Line label="Employer's address:" value={fl150.employerAddress} />
        </Row>
        <Row>
          <Line label="Employer's phone:" value={fl150.employerPhone} />
          <Line label="Occupation:" value={fl150.occupation} />
        </Row>
        <Row>
          <Line label="Date job started:" value={toCourtDate(fl150.dateJobStarted)} />
          <Line label="Date job ended:" value={toCourtDate(fl150.dateJobEnded)} />
        </Row>
        <Row>
          <Line label="Hours worked per week:" value={fl150.hoursPerWeek} />
          <Line label="Gross pay:" value={formatCurrency(fl150.grossPay)} />
          <Box checked={fl150.payFrequency === "month"} label="per month" />
          <Box checked={fl150.payFrequency === "week"} label="per week" />
          <Box checked={fl150.payFrequency === "hour"} label="per hour" />
        </Row>

        <SectionTitle n={2}>Age & Education</SectionTitle>
        <Row>
          <Line label="Age:" value={fl150.age} />
        </Row>
        <Row>
          <Box checked={fl150.completedHighSchool} label="I have completed high school or the equivalent." />
        </Row>
        <Row>
          <Line label="If no, highest grade completed:" value={fl150.highestGrade} />
          <Line label="Years of college completed:" value={fl150.yearsCollege} />
        </Row>
        <Row>
          <Line label="College degrees held:" value={fl150.collegeDegrees} />
        </Row>

        <SectionTitle n={3}>Tax Information</SectionTitle>
        <Row>
          <Line label="Last tax year filed:" value={fl150.lastTaxYear} />
        </Row>
        <div className="border border-black p-1.5 text-[11px]">
          <Row>
            <Box checked={fl150.taxFilingStatus === "single"} label="Single" />
            <Box checked={fl150.taxFilingStatus === "headOfHousehold"} label="Head of household" />
            <Box checked={fl150.taxFilingStatus === "marriedSeparately"} label="Married, filing separately" />
            <Box checked={fl150.taxFilingStatus === "marriedJointly"} label="Married, filing jointly" />
          </Row>
          {fl150.taxFilingStatus === "marriedJointly" ? (
            <Row><Line label="Filed jointly with:" value={fl150.taxFilingJointName} className="grow" /></Row>
          ) : null}
        </div>

        <SectionTitle n={4}>Other Party&apos;s Income</SectionTitle>
        <Row>
          <Line label="Estimate of the other party's gross monthly income:" value={formatCurrency(fl150.otherPartyIncome)} />
        </Row>
        <Row>
          <Line label="This estimate is based on:" value={fl150.otherPartyIncomeBasis} className="grow" />
        </Row>
      </FormPage>

      {/* Page 2 */}
      <FormPage footer={pageFooter(2)}>
        <div className="text-[10px]">PETITIONER: {p}&nbsp;&nbsp;&nbsp;RESPONDENT: {r}</div>

        <SectionTitle n={5}>Income (Average Monthly)</SectionTitle>
        <table className="packet-table mt-1">
          <tbody>
            {incomeItems.map(([label, value]) => (
              <tr key={label}>
                <td>{label}</td>
                <td className="text-right">{formatCurrency(value)}</td>
              </tr>
            ))}
            <tr className="font-bold">
              <td>TOTAL INCOME</td>
              <td className="text-right">{formatCurrency(totalMonthlyIncome(fl150))}</td>
            </tr>
          </tbody>
        </table>

        <SectionTitle n={10}>Deductions</SectionTitle>
        <table className="packet-table mt-1">
          <tbody>
            {deductionItems.map(([label, value]) => (
              <tr key={label}>
                <td>{label}</td>
                <td className="text-right">{formatCurrency(value)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <SectionTitle n={11}>Assets</SectionTitle>
        <table className="packet-table mt-1">
          <tbody>
            {assetItems.map(([label, value]) => (
              <tr key={label}>
                <td>{label}</td>
                <td className="text-right">{formatCurrency(value)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </FormPage>

      {/* Page 3 */}
      <FormPage footer={pageFooter(3)}>
        <div className="text-[10px]">PETITIONER: {p}&nbsp;&nbsp;&nbsp;RESPONDENT: {r}</div>

        <SectionTitle n={12}>People Who Live With Me</SectionTitle>
        {fl150.household.length > 0 ? (
          <table className="packet-table mt-1">
            <thead>
              <tr>
                <th>Name</th>
                <th>Age</th>
                <th>Relationship</th>
                <th>Gross monthly income</th>
                <th>Pays expenses</th>
              </tr>
            </thead>
            <tbody>
              {fl150.household.map((m, i) => (
                <tr key={i}>
                  <td>{m.name}</td>
                  <td>{m.age}</td>
                  <td>{m.relationship}</td>
                  <td>{formatCurrency(m.grossMonthlyIncome)}</td>
                  <td>{m.paysExpenses ? "Yes" : "No"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="text-[10px] italic">No household members listed.</p>
        )}

        <SectionTitle n={13}>Estimated Monthly Expenses</SectionTitle>
        <table className="packet-table mt-1">
          <tbody>
            {expenseItems.map(([label, value]) => (
              <tr key={label}>
                <td>{label}</td>
                <td className="text-right">{formatCurrency(value)}</td>
              </tr>
            ))}
            <tr className="font-bold">
              <td>TOTAL EXPENSES</td>
              <td className="text-right">{formatCurrency(totalMonthlyExpenses(fl150))}</td>
            </tr>
          </tbody>
        </table>

        {!showChildSupportPage ? (
          <SignatureBlock
            name={p}
            date={toCourtDate(fl150.date)}
            role="SIGNATURE OF DECLARANT"
          />
        ) : null}
      </FormPage>

      {/* Page 4 — only if there are minor children */}
      {showChildSupportPage ? (
        <FormPage footer={pageFooter(4)}>
          <div className="text-[10px]">PETITIONER: {p}&nbsp;&nbsp;&nbsp;RESPONDENT: {r}</div>

          <SectionTitle>Child Support Information</SectionTitle>
          <Row>
            <Line label="Number of children under 18:" value={fl150.numberChildrenUnder18} />
          </Row>
          <Row>
            <Line label="% time with me:" value={fl150.timeWithMePercent} />
            <Line label="% time with other parent:" value={fl150.timeWithOtherPercent} />
          </Row>
          <div className="border border-black p-1.5 text-[11px]">
            <Row>
              <Box
                checked={fl150.hasChildHealthInsurance}
                label="I have health insurance available for the children through my job."
              />
            </Row>
            <Row>
              <Line label="Insurance company:" value={fl150.childInsuranceCompany} />
              <Line label="Monthly cost to add the children:" value={formatCurrency(fl150.childInsuranceMonthlyCost)} />
            </Row>
          </div>

          <SignatureBlock
            name={p}
            date={toCourtDate(fl150.date)}
            role="SIGNATURE OF DECLARANT"
          />
        </FormPage>
      ) : null}
    </>
  );
}
