import type { PDFForm } from "pdf-lib";
import type { PacketFormData } from "@/lib/types/packet.types";
import { setText, check } from "./util";
import { petitionerName, respondentName, courtDate, currency, court } from "./helpers";

const P = "FL-115[0].";
const P1 = P + "Page1[0].Page1[0].";
const P2 = P + "Page2[0].Page2[0].";

export function fillFL115(form: PDFForm, data: PacketFormData): void {
  const intake = data.intake;
  const fl = data.fl115;
  const p = petitionerName(intake);
  const r = respondentName(intake);
  const c = court(intake);

  // --- Header: party without attorney (self-represented petitioner) ---
  if (p) {
    setText(form, P1 + "AddInfo[0].Phone_ft[0]", p); // Name
  }
  if (intake.petitionerStreet) {
    setText(form, P1 + "AddInfo[0].Phone_ft[2]", intake.petitionerStreet); // Street Address
  }
  if (intake.petitionerCity) {
    setText(form, P1 + "AddInfo[0].Phone_ft[3]", intake.petitionerCity); // City
  }
  if (intake.petitionerState) {
    setText(form, P1 + "AddInfo[0].Phone_ft[4]", intake.petitionerState); // State
  }
  if (intake.petitionerZip) {
    setText(form, P1 + "AddInfo[0].Phone_ft[5]", intake.petitionerZip); // Zip Code
  }
  if (intake.petitionerPhone) {
    setText(form, P1 + "AddInfo[0].Phone_ft[6]", intake.petitionerPhone); // Phone Number
  }
  if (intake.petitionerEmail) {
    setText(form, P1 + "AddInfo[0].Email_ft[0]", intake.petitionerEmail);
  }
  setText(form, P1 + "AddInfo[0].AttyFor_ft[0]", "Self-Represented");

  // --- Header: court info ---
  setText(form, P1 + "CourtInfo[0].CrtCounty_ft[0]", "RIVERSIDE");
  if (c) {
    setText(form, P1 + "CourtInfo[0].Street_ft[0]", c.address ?? "");
    setText(form, P1 + "CourtInfo[0].CityZip_ft[0]", c.cityStateZip ?? "");
    setText(form, P1 + "CourtInfo[0].Branch_ft[0]", c.name ?? "");
  }

  // --- Header: party names / case number (both pages) ---
  setText(form, P1 + "TitlePartyName[0].Petitioner_tf[0]", p);
  setText(form, P1 + "TitlePartyName[0].Respondent_tf[0]", r);
  setText(form, P1 + "CaseNumber[0].CaseNumber_ft[0]", intake.caseNumber ?? "");
  setText(form, P2 + "Party[0].Petitioner_tf[0]", p);
  setText(form, P2 + "Party[0].Respondent_tf[0]", r);
  setText(form, P2 + "CaseNumber[0].CaseNumber_ft[0]", intake.caseNumber ?? "");

  // --- Item 1: copies served ---
  check(form, P1 + "List1[0].LI1[0].Check1[0]"); // a. Family Law (FL-100/FL-110/FL-120)
  check(form, P1 + "List1[0].LI4[0].CheckBox1[0]"); // and d. (attachments)
  check(form, P1 + "List1[0].LI4[0].List1[0].LI1[0].CheckBox1[0]"); // (1) UCCJEA (FL-105)
  check(form, P1 + "List1[0].LI4[0].List1[0].LI2[0].CheckBox1[0]"); // (2) Declaration of Disclosure (FL-140)
  check(form, P1 + "List1[0].LI4[0].List1[0].LI3[0].CheckBox1[0]"); // (3) Schedule of Assets and Debts (FL-142)
  check(form, P1 + "List1[0].LI4[0].List1[0].LI4[0].CheckBox1[0]"); // (4) Income and Expense Declaration (FL-150)

  // --- Item 2: address where respondent was served ---
  if (fl.addressServed) {
    setText(form, P1 + "List2[0].LI1[0].AddressWhereServed_tf[0]", fl.addressServed);
  }

  // --- Item 3: method of service ---
  const method = fl.serviceMethod;
  const serviceDate = courtDate(fl.serviceDate ?? "");
  const serviceTime = fl.serviceTime;

  if (method === "personal") {
    check(form, P1 + "List3[0].LI1[0].CheckBox1[0]");
    if (serviceDate) {
      setText(form, P1 + "List3[0].LI1[0].DatePersonalServiceCompleted_dt[0]", serviceDate);
    }
    if (serviceTime) {
      setText(form, P1 + "List3[0].LI1[0].TimePersonalServiceCompleted_dt[0]", serviceTime);
    }
  } else if (method === "substituted") {
    check(form, P1 + "List3[0].LI2[0].CheckBox1[0]");
    if (serviceDate) {
      setText(
        form,
        P1 + "List3[0].LI2[0].List1[0].LI2[0].DateofSubstitutedService_dt[0]",
        serviceDate
      );
    }
    if (serviceTime) {
      setText(
        form,
        P1 + "List3[0].LI2[0].List1[0].LI2[0].TimeofSubstitutedService__tf[0]",
        serviceTime
      );
    }
  } else if (method === "mail") {
    check(form, P2 + "List3[0].LI3[0].CheckBox1[0]");
    if (serviceDate) {
      setText(form, P2 + "List3[0].LI3[0].DateofMail_AcknowledgmentService_dt[0]", serviceDate);
    }
  }

  // --- Item 4: person who served papers ---
  if (fl.serverName) {
    setText(form, P2 + "List4[0].NameofServer_tf[0]", fl.serverName);
  }
  if (fl.serverAddress) {
    setText(form, P2 + "List4[0].ServersAddress_tf[0]", fl.serverAddress);
  }
  if (fl.serverPhone) {
    setText(form, P2 + "List4[0].ServersTelephoneNumber_tf[0]", fl.serverPhone);
  }

  if (fl.serverIsRegistered) {
    check(form, P2 + "List4[0].LI3[0].CheckBox1[0]"); // c. a registered California process server
    if (fl.serverRegistrationNo) {
      setText(
        form,
        P2 + "List4[0].LI3[0].List1[0].LI1[0].ServersRegistrationNumber_tf[0]",
        fl.serverRegistrationNo
      );
    }
    if (fl.serverCounty) {
      setText(form, P2 + "List4[0].LI3[0].List1[0].LI2[0].ServersCounty_tf[0]", fl.serverCounty);
    }
    if (fl.serverFee) {
      setText(
        form,
        P2 + "List4[0].LI3[0].List1[0].LI3[0].FeeforService_tf[0]",
        currency(fl.serverFee)
      );
    }
  } else {
    check(form, P2 + "List4[0].LI2[0].CheckBox1[0]"); // b. not a registered California process server
  }

  // --- Item 5: declaration under penalty of perjury ---
  check(form, P2 + "List5[0].LI1[0].CheckBox1a[0]");

  // --- Signature (name of server; hand-signed on paper) ---
  if (fl.serverName) {
    setText(form, P2 + "SigSub[0].Name[0]", fl.serverName);
  }
  if (fl.date) {
    setText(form, P2 + "SigSub[0].SigDate[0]", courtDate(fl.date));
  }
}
