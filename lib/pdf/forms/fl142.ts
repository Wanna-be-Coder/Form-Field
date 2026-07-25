import type { PacketFormData } from "../../types/packet.types";
import { ASSET_CATEGORIES, DEBT_CATEGORIES } from "../../constants/packet.constants";
import {
  formatCurrency,
  petitionerName,
  respondentName,
  toCourtDate,
  totalAssets,
  totalDebts,
} from "../../utils/packet-helpers";
import { PdfBuilder } from "../PdfBuilder";

export function drawFL142(b: PdfBuilder, data: PacketFormData): void {
  const { intake, fl142 } = data;
  const p = petitionerName(intake);
  const r = respondentName(intake);
  const addr = [
    intake.petitionerStreet,
    [intake.petitionerCity, intake.petitionerState, intake.petitionerZip].filter(Boolean).join(", "),
  ]
    .filter(Boolean)
    .join(", ");

  b.title("FL-142", "Schedule of Assets and Debts");

  b.field("Party without attorney (name):", p, { labelWidth: 165 });
  b.field("Address:", addr, { labelWidth: 165 });
  b.field("Telephone:", intake.petitionerPhone, { labelWidth: 165 });
  b.field("E-mail:", intake.petitionerEmail, { labelWidth: 165 });
  b.field("Attorney for:", "Self-Represented", { labelWidth: 165, width: 160 });
  b.field("Petitioner:", p, { labelWidth: 165 });
  b.field("Respondent:", r, { labelWidth: 165 });
  b.field("Case Number:", intake.caseNumber, { labelWidth: 165, width: 200 });

  b.checkboxRow([
    { label: "Petitioner's", checked: fl142.whoseSchedule === "petitioner" },
    { label: "Respondent's", checked: fl142.whoseSchedule === "respondent" },
  ]);

  b.paragraph("THIS FORM SHOULD NOT BE FILED WITH THE COURT", { bold: true });
  b.paragraph(
    "List all your known community and separate assets or debts. If separate, mark P or R.",
  );

  b.sectionHeading("Assets");
  ASSET_CATEGORIES.forEach((cat) => {
    const entry = data.fl142.assets[cat.key];
    b.paragraph(`${cat.no}. ${cat.label}`, { bold: true });
    b.checkbox("None", entry.none);
    if (!entry.none) {
      // TODO(api-integrator): replace with real data
      b.fieldStacked("Description:", entry.description, { multiline: true });
      b.field("Sep. Prop. (P/R):", entry.sepProp, { width: 60 });
      b.field("Date acquired:", entry.dateAcquired, { width: 110 });
      b.field("Current gross fair market value:", entry.grossValue, { labelWidth: 200, width: 110 });
      b.field("Amount owed / encumbrance:", entry.amountOwed, { labelWidth: 200, width: 110 });
    }
  });

  const assetTotals = totalAssets(data.fl142);
  b.field("TOTAL ASSETS — gross:", formatCurrency(assetTotals.gross));
  b.field("TOTAL ASSETS — owed:", formatCurrency(assetTotals.owed));

  b.newPage();
  b.sectionHeading("Debts — Show to Whom Owed");
  DEBT_CATEGORIES.forEach((cat) => {
    const entry = data.fl142.debts[cat.key];
    b.paragraph(`${cat.no}. ${cat.label}`, { bold: true });
    b.checkbox("None", entry.none);
    if (!entry.none) {
      // TODO(api-integrator): replace with real data
      b.fieldStacked("Description:", entry.description, { multiline: true });
      b.field("Sep. Prop. (P/R):", entry.sepProp, { width: 60 });
      b.field("Total owing:", entry.totalOwing, { width: 110 });
      b.field("Date acquired:", entry.dateAcquired, { width: 110 });
    }
  });

  b.field("TOTAL DEBTS:", formatCurrency(totalDebts(data.fl142)));
  b.field("Number of continuation sheets attached:", data.fl142.continuationPages, {
    labelWidth: 230,
    width: 80,
  });

  b.signature(petitionerName(data.intake), toCourtDate(data.fl142.date), "Signature of Declarant");
}
