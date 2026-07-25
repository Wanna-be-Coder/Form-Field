import type { PDFForm } from "pdf-lib";
import type { PacketFormData } from "@/lib/types/packet.types";
import { setText, check } from "./util";
import { petitionerName, respondentName, courtDate } from "./helpers";
import { ASSET_CATEGORIES, DEBT_CATEGORIES } from "@/lib/constants/packet.constants";

const P = "FL-142[0].";
const CAP = P + "Page1[0].P1Caption[0].";

// List numbers whose "amount owed" widget is named TextField5 instead of TextField6.
const ASSET_AMOUNT_OWED_OVERRIDE: Record<number, string> = { 4: "TextField5", 11: "TextField5" };
// Debt list numbers whose "date acquired" widget is named TextField4 instead of TextField6.
const DEBT_DATE_ACQUIRED_OVERRIDE: Record<number, string> = { 19: "TextField4" };

function pageForList(n: number): string {
  if (n <= 3) return "Page1";
  if (n <= 10) return "Page2";
  if (n <= 18) return "Page3";
  return "Page4";
}

function listPrefix(n: number): string {
  return `${P}${pageForList(n)}[0].List${n}[0].Li1[0].`;
}

export function fillFL142(form: PDFForm, data: PacketFormData): void {
  const intake = data.intake;
  const fl = data.fl142;
  const p = petitionerName(intake);
  const r = respondentName(intake);

  // --- Header ---
  const addrLine1 = intake.petitionerStreet || "";
  const addrLine2 = [intake.petitionerCity, intake.petitionerState, intake.petitionerZip]
    .filter((x) => x)
    .join(", ");
  const attyBlock = [p, addrLine1, addrLine2, "Attorney for: Self-Represented"]
    .filter((part) => part)
    .join("\n");
  setText(form, CAP + "AttyPartyInfo[0].TextField1[0]", attyBlock);
  setText(form, CAP + "AttyPartyInfo[0].Phone[0]", intake.petitionerPhone || "");
  setText(form, CAP + "AttyPartyInfo[0].Email[0]", intake.petitionerEmail || "");
  setText(form, CAP + "CourtInfo[0].CrtCounty[0]", "RIVERSIDE");
  setText(form, CAP + "TitlePartyName[0].Party1[0]", p);
  setText(form, CAP + "TitlePartyName[0].Party2[0]", r);
  setText(form, CAP + "CaseNumber[0].CaseNumber[0]", intake.caseNumber || "");

  // --- Whose schedule ---
  const whose = fl.whoseSchedule;
  if (whose === "petitioner") {
    check(form, CAP + "FormTitle[0].RB2Choice2[0]");
  } else if (whose === "respondent") {
    check(form, CAP + "FormTitle[0].RB2Choice2[1]");
  }

  // --- Assets ---
  const assets = fl.assets;
  for (const { key, no } of ASSET_CATEGORIES) {
    const entry = assets[key];
    if (!entry) continue;
    const prefix = listPrefix(no);
    if (entry.none) {
      setText(form, prefix + "TextField1[0]", "NONE");
      continue;
    }
    if (entry.description) {
      setText(form, prefix + "TextField1[0]", entry.description);
    }
    if (entry.sepProp) {
      setText(form, prefix + "TextField2[0]", entry.sepProp);
    }
    if (entry.dateAcquired) {
      setText(form, prefix + "TextField3[0]", entry.dateAcquired);
    }
    if (entry.grossValue) {
      setText(form, prefix + "TextField4[0]", entry.grossValue);
    }
    if (entry.amountOwed) {
      const owedField = ASSET_AMOUNT_OWED_OVERRIDE[no] ?? "TextField6";
      setText(form, prefix + `${owedField}[0]`, entry.amountOwed);
    }
  }

  // --- Debts ---
  const debts = fl.debts;
  for (const { key, no } of DEBT_CATEGORIES) {
    const entry = debts[key];
    if (!entry) continue;
    const prefix = listPrefix(no);
    if (entry.none) {
      setText(form, prefix + "TextField1[0]", "NONE");
      continue;
    }
    if (entry.description) {
      setText(form, prefix + "TextField1[0]", entry.description);
    }
    if (entry.sepProp) {
      setText(form, prefix + "TextField2[0]", entry.sepProp);
    }
    if (entry.totalOwing) {
      setText(form, prefix + "TextField3[0]", entry.totalOwing);
    }
    if (entry.dateAcquired) {
      const dateField = DEBT_DATE_ACQUIRED_OVERRIDE[no] ?? "TextField6";
      setText(form, prefix + `${dateField}[0]`, entry.dateAcquired);
    }
  }

  // --- Continuation pages ---
  const continuation = fl.continuationPages;
  if (continuation) {
    setText(form, P + "Page4[0].List27[0].Li1[0].FillText1[0]", continuation);
    if (String(continuation).trim() !== "" && String(continuation).trim() !== "0") {
      check(form, P + "Page4[0].List27[0].Li1[0].ChoiceNumber[0]");
    }
  }

  // --- Signature ---
  if (fl.date) {
    setText(form, P + "Page4[0].SignSub[0].SigDate[0]", courtDate(fl.date));
  }
  setText(form, P + "Page4[0].SignSub[0].SigName[0]", p);
}
