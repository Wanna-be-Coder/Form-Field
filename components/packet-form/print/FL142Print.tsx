import { PacketFormData } from "@/lib/types/packet.types";
import { ASSET_CATEGORIES, COURTHOUSES, DEBT_CATEGORIES } from "@/lib/constants/packet.constants";
import {
  formatCurrency,
  petitionerName,
  respondentName,
  toCourtDate,
  totalAssets,
  totalDebts,
} from "@/lib/utils/packet-helpers";
import { FormPage, Row, Box, Line, CourtHeader, SignatureBlock } from "./print-ui";

export function FL142Print({ data }: { data: PacketFormData }) {
  const { intake, fl142 } = data;
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
  const caseNumber = data.fl100.caseNumber;

  const assetTotals = totalAssets(fl142);
  const debtTotal = totalDebts(fl142);

  const pageFooter = (page: number) => (
    <div className="flex justify-between">
      <span>FL-142 [Rev. July 1, 2025]</span>
      <span>Page {page} of 2</span>
    </div>
  );

  return (
    <>
      {/* Page 1 — Assets */}
      <FormPage footer={pageFooter(1)}>
        <CourtHeader
          formNo="FL-142"
          courtAddress={courtAddress}
          petitioner={p}
          respondent={r}
          caseNumber={caseNumber}
          attorneyName={p}
          attorneyAddress={addr}
          attorneyPhone={intake.petitionerPhone}
          attorneyEmail={intake.petitionerEmail}
          titleBlock="Schedule of Assets and Debts"
        />

        <Row>
          <Box checked={fl142.whoseSchedule === "petitioner"} label="Petitioner's" />
          <Box checked={fl142.whoseSchedule === "respondent"} label="Respondent's" />
          <span>Schedule of Assets and Debts</span>
        </Row>

        <p className="mt-1 text-center text-[10px] font-bold uppercase">
          This form should not be filed with the court
        </p>

        <table className="packet-table mt-2">
          <thead>
            <tr>
              <th>Item No.</th>
              <th>Assets Description</th>
              <th>Sep. Prop.</th>
              <th>Date Acquired</th>
              <th>Current Gross Fair Market Value</th>
              <th>Amount Owed or Encumbrance</th>
            </tr>
          </thead>
          <tbody>
            {ASSET_CATEGORIES.map((cat) => {
              const entry = fl142.assets[cat.key];
              return (
                <tr key={cat.key}>
                  <td>
                    {cat.no}. {cat.label}
                  </td>
                  <td>{entry.none ? "NONE" : entry.description}</td>
                  <td>{entry.sepProp}</td>
                  <td>{entry.dateAcquired}</td>
                  <td>{entry.none ? "" : formatCurrency(entry.grossValue)}</td>
                  <td>{entry.none ? "" : formatCurrency(entry.amountOwed)}</td>
                </tr>
              );
            })}
            <tr>
              <td colSpan={4} className="text-right font-bold">
                TOTAL ASSETS
              </td>
              <td className="font-bold">{formatCurrency(assetTotals.gross)}</td>
              <td className="font-bold">{formatCurrency(assetTotals.owed)}</td>
            </tr>
          </tbody>
        </table>
      </FormPage>

      {/* Page 2 — Debts */}
      <FormPage footer={pageFooter(2)}>
        <div className="text-[10px]">
          PETITIONER: {p}&nbsp;&nbsp;&nbsp;RESPONDENT: {r}&nbsp;&nbsp;&nbsp;CASE NUMBER: {caseNumber}
        </div>

        <table className="packet-table mt-2">
          <thead>
            <tr>
              <th>Item No.</th>
              <th>Debts — Show to Whom Owed</th>
              <th>Sep. Prop.</th>
              <th>Total Owing</th>
              <th>Date Acquired</th>
            </tr>
          </thead>
          <tbody>
            {DEBT_CATEGORIES.map((cat) => {
              const entry = fl142.debts[cat.key];
              return (
                <tr key={cat.key}>
                  <td>
                    {cat.no}. {cat.label}
                  </td>
                  <td>{entry.none ? "NONE" : entry.description}</td>
                  <td>{entry.sepProp}</td>
                  <td>{entry.none ? "" : formatCurrency(entry.totalOwing)}</td>
                  <td>{entry.dateAcquired}</td>
                </tr>
              );
            })}
            <tr>
              <td colSpan={3} className="text-right font-bold">
                TOTAL DEBTS
              </td>
              <td className="font-bold">{formatCurrency(debtTotal)}</td>
              <td />
            </tr>
          </tbody>
        </table>

        <Row className="mt-2">
          <Line label="Number of continuation sheets attached:" value={fl142.continuationPages} />
        </Row>

        <SignatureBlock
          name={petitionerName(intake)}
          date={toCourtDate(fl142.date)}
          role="SIGNATURE OF DECLARANT"
        />
      </FormPage>
    </>
  );
}
