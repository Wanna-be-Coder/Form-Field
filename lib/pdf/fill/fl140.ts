import type { PDFForm } from "pdf-lib";
import type { PacketFormData } from "@/lib/types/packet.types";
import { setText, check } from "./util";
import { petitionerName, respondentName, courtDate, court } from "./helpers";

const HDR = "form1[0].Page1[0].StdP1Header_sf[0].";
const DIS = "form1[0].Page1[0].Disclose_cb[0].";
const P1 = "form1[0].Page1[0].";

export function fillFL140(form: PDFForm, data: PacketFormData): void {
  const intake = data.intake;
  const fl = data.fl140;
  const p = petitionerName(intake);
  const r = respondentName(intake);
  const c = court(intake);

  // --- Header: party without attorney (self-represented petitioner) ---
  const addrBlock = [
    p,
    intake.petitionerStreet ?? "",
    [intake.petitionerCity ?? "", intake.petitionerState ?? "", intake.petitionerZip ?? ""]
      .filter((x) => x)
      .join(", "),
  ]
    .filter((part) => part)
    .join("\n");
  if (addrBlock) {
    setText(form, HDR + "AddInfo[0].PartyAttyAddInfo_ft[0]", addrBlock);
  }
  if (intake.petitionerPhone) {
    setText(form, HDR + "OtherContact[0].Phone_ft[0]", intake.petitionerPhone);
  }
  if (intake.petitionerEmail) {
    setText(form, HDR + "OtherContact[0].Email_ft[0]", intake.petitionerEmail);
  }
  setText(form, HDR + "OtherContact[0].AttyFor_ft[0]", "Self-Represented");

  // --- Header: court info ---
  setText(form, HDR + "CourtInfo[0].CrtCounty_ft[0]", "RIVERSIDE");
  if (c) {
    setText(form, HDR + "CourtInfo[0].Street_ft[0]", c.address ?? "");
    setText(form, HDR + "CourtInfo[0].CityZip_ft[0]", c.cityStateZip ?? "");
    setText(form, HDR + "CourtInfo[0].Branch_ft[0]", c.name ?? "");
  }

  // --- Header: party names / case number ---
  setText(form, HDR + "TitlePartyName[0].Party1_ft[0]", p);
  setText(form, HDR + "TitlePartyName[0].Party2_ft[0]", r);
  setText(form, HDR + "CaseNumber[0].CaseNumber_ft[0]", intake.caseNumber ?? "");

  // --- Header: whose disclosure / stage ---
  if (fl.whoseDisclosure === "petitioner") {
    check(form, HDR + "FormTitle[0].caption_cb[0].CheckBox61[0]");
  } else if (fl.whoseDisclosure === "respondent") {
    check(form, HDR + "FormTitle[0].caption_cb[1].respondent_cb[0]");
  }
  if (fl.disclosureStage === "preliminary") {
    check(form, HDR + "FormTitle[0].caption_cb[2].preliminary_cb[0]");
  } else if (fl.disclosureStage === "final") {
    check(form, HDR + "FormTitle[0].caption_cb[3].final_cb[0]");
  }

  // --- Attached items 1-6 ---
  if (fl.attachSchedule) {
    check(form, DIS + "#area[2].Schedule_or_Prop_cb[0]");
  }
  if (fl.attachIncomeExpense) {
    check(form, P1 + "Date_name_gp[0].IandE_cb[0]");
  }
  if (fl.attachTaxReturns) {
    check(form, DIS + "#area[3].taxreturns_cb[0]");
  }
  if (fl.attachMaterialFactsAssets) {
    check(form, DIS + "#area[6].CheckBox61[0]");
  }
  if (fl.attachMaterialFactsObligations) {
    check(form, DIS + "#area[4].obligations_stmt_cb[0]");
  }
  if (fl.attachInvestmentOpportunity) {
    check(form, DIS + "#area[4].#area[5].investment_opp_db[0]");
  }

  // --- Signature ---
  setText(form, P1 + "print_name_ft[0]", p);
  if (fl.date) {
    setText(form, P1 + "Date[0]", courtDate(fl.date));
  }
}
