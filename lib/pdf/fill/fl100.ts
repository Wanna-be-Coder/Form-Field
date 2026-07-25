import type { PDFForm } from "pdf-lib";
import type { PacketFormData } from "@/lib/types/packet.types";
import { setText, check } from "./util";
import { fullName, petitionerName, respondentName, courtDate, court } from "./helpers";

const P = "FL-100[0].";
const CAP = P + "Page1[0].CaptionP1_sf[0].";
const P1 = P + "Page1[0].";
const P2 = P + "Page2[0].";
const P3 = P + "Page3[0].";

export function fillFL100(form: PDFForm, data: PacketFormData): void {
  const intake = data.intake;
  const fl = data.fl100;
  const p = petitionerName(intake);
  const r = respondentName(intake);
  const caseType = intake.caseType;
  const isMarriage = intake.relationshipType === "marriage";

  // --- Caption / header ---
  setText(form, CAP + "AttyInfo[0].AttyName_ft[0]", p);
  setText(form, CAP + "AttyInfo[0].AttyStreet_ft[0]", intake.petitionerStreet ?? "");
  setText(form, CAP + "AttyInfo[0].AttyCity_ft[0]", intake.petitionerCity ?? "");
  setText(form, CAP + "AttyInfo[0].AttyState_ft[0]", intake.petitionerState ?? "");
  setText(form, CAP + "AttyInfo[0].AttyZip_ft[0]", intake.petitionerZip ?? "");
  setText(form, CAP + "AttyInfo[0].Phone_ft[0]", intake.petitionerPhone ?? "");
  setText(form, CAP + "AttyInfo[0].Email_ft[0]", intake.petitionerEmail ?? "");
  setText(form, CAP + "AttyInfo[0].AttyFor_ft[0]", "Self-Represented");
  setText(form, CAP + "CourtInfo[0].CrtCounty_ft[0]", "RIVERSIDE");
  const courtInfo = court(intake);
  setText(
    form,
    CAP + "CourtInfo[0].Branch_ft[0]",
    (courtInfo?.cityStateZip && `${courtInfo.address}, ${courtInfo.cityStateZip}`) || "",
  );
  setText(form, CAP + "TitlePartyName[0].Party1_ft[0]", p);
  setText(form, CAP + "TitlePartyName[0].Party2_ft[0]", r);
  for (const pref of [
    CAP + "CaseNumber[0].CaseNumber_ft[0]",
    P2 + "CaseNumber[0].CaseNumber_ft[0]",
    P3 + "CaseNumber[0].CaseNumber_ft[0]",
  ]) {
    setText(form, pref, intake.caseNumber ?? "");
  }
  for (const pref of [P2 + "Parties[0].Party1_ft[0]", P3 + "Parties[0].Party1_ft[0]"]) {
    setText(form, pref, p);
  }
  for (const pref of [P2 + "Parties[0].Party2_ft[0]", P3 + "Parties[0].Party2_ft[0]"]) {
    setText(form, pref, r);
  }

  // --- Petition For ---
  if (fl.amended) {
    check(form, CAP + "FormTitle[0].Amended_cb[0]");
  }
  if (caseType === "dissolution") {
    check(form, CAP + "FormTitle[0].DissolutionOf_cb[0]");
    check(
      form,
      isMarriage ? CAP + "FormTitle[0].Marriage_cb[0]" : CAP + "FormTitle[0].DomesticPartnership_cb[0]",
    );
  } else if (caseType === "legalSeparation") {
    check(form, CAP + "FormTitle[0].LegalSeparationOf_cb[0]");
    check(
      form,
      isMarriage ? CAP + "FormTitle[0].Marriage_cb[1]" : CAP + "FormTitle[0].DomesticPartnership_cb[1]",
    );
  } else if (caseType === "nullity") {
    check(form, CAP + "FormTitle[0].NullityOf_cb[0]");
    check(
      form,
      isMarriage ? CAP + "FormTitle[0].Marriage_cb[2]" : CAP + "FormTitle[0].DomesticPartnership_cb[2]",
    );
  }

  // --- 1. Legal relationship ---
  const lr = fl.legalRelationship;
  if (lr.includes("married")) {
    check(form, P1 + "WeAreMarried_cb[0]");
  }
  if (lr.includes("dpInCA")) {
    check(form, P1 + "DPEstablishedInCalifornia[0]");
  }
  if (lr.includes("dpNotInCA")) {
    check(form, P1 + "DPNOTEstablishedinCA_cb[0]");
  }

  // --- 2. Residence requirements ---
  if (fl.residencyMet) {
    if (fl.residencyParty === "petitioner") {
      check(form, P1 + "PetitionerMeetsResidencyReqs_cb[0]");
    } else if (fl.residencyParty === "respondent") {
      check(form, P1 + "RespondentMeetsResidencyReqs_cb[0]");
    }
  }
  if (fl.residencyDpInCA) {
    check(form, P1 + "DPNOTEstablishedinCA_cb[1]");
  }
  if (fl.residencySameSex) {
    check(form, P1 + "SameSexMarriedInCA_cb[0]");
    setText(form, P1 + "PetitionersResidence_tf[0]", fl.petitionerLivesIn ?? "");
    setText(form, P1 + "RespondentsResidence_tf[0]", fl.respondentLivesIn ?? "");
  }

  // --- 3. Statistical facts ---
  setText(form, P1 + "DateOfMarriage_dt[0]", courtDate(intake.marriageDate ?? ""));
  setText(form, P1 + "DateOfSeparation_dt[0]", courtDate(fl.dateOfSeparation ?? ""));
  if (intake.relationshipType === "domesticPartnership") {
    setText(form, P1 + "DatePartnersSeparated_dt[0]", courtDate(fl.dpRegistrationDate ?? ""));
  }

  // --- 4. Minor children ---
  if (intake.hasMinorChildren) {
    check(form, P1 + "MinorChildren_sf[0].MinorChildrenList_cb[0]");
    const children = intake.children ?? [];
    const birthFields = [
      "Child1Birthdate_dt[0]",
      "Child2Birthdate_dt[0]",
      "Child3Date_dt[0]",
      "Child4Birthdate_dt[0]",
    ];
    children.slice(0, 4).forEach((c, i) => {
      const n = i + 1;
      setText(
        form,
        P1 + `MinorChildren_sf[0].Child${n}Name_tf[0]`,
        fullName(c.firstName ?? "", c.middleName ?? "", c.lastName ?? ""),
      );
      setText(form, P1 + `MinorChildren_sf[0].Child${n}Age_tf[0]`, c.age ?? "");
      setText(form, P1 + "MinorChildren_sf[0]." + birthFields[i], courtDate(c.dateOfBirth ?? ""));
    });
    if (fl.childBornBeforeMarriage) {
      check(form, P1 + "MinorChildren_sf[0].Attachment4b[0]");
    }
  } else {
    check(form, P1 + "ThereAreNoMinorChildren_cb[0]");
  }

  if (fl.voluntaryParentage) {
    check(form, P1 + "PartiesSignedVoluntaryPaternityDec_cb[0]");
  }

  // --- 5. Legal grounds ---
  if (caseType === "nullity") {
    if (fl.groundsNullityVoid) {
      check(form, P2 + "Nullity_cb[0]");
      if (fl.groundsNullityVoid === "incest") {
        check(form, P2 + "BasedOnIncest_cb[0]");
      } else if (fl.groundsNullityVoid === "bigamy") {
        check(form, P2 + "BasedOnBigamy_cb[0]");
      }
    }
    if (fl.groundsNullityVoidable) {
      check(form, P2 + "NullityofVoidableMarriageOrDP_cb[0]");
      const gv = fl.groundsNullityVoidable;
      const voidableFields: Record<string, string> = {
        age: "BasedonAge_cb[0]",
        priorMarriage: "PriorExistingMarriageOrDP_cb[0]",
        unsoundMind: "BasedOnUnsoundMind_cb[0]",
        fraud: "BasedonFraud_cb[0]",
        force: "BasedOnForce_cb[0]",
        physicalIncapacity: "BasedonPhysicalIncapacity_cb[0]",
      };
      check(form, P2 + voidableFields[gv]);
    }
  } else {
    // Divorce vs Legal separation type selector, then (1)/(2) basis.
    if (caseType === "dissolution") {
      check(form, P2 + "SepTypeDef_cb[1]"); // Divorce
    } else {
      check(form, P2 + "SepTypeDef_cb[0]"); // Legal separation
    }
    if (fl.groundsDivorceOrSeparation === "irreconcilable") {
      check(form, P2 + "SepBasis_cb[0]");
    } else if (fl.groundsDivorceOrSeparation === "incapacity") {
      check(form, P2 + "SepBasis_cb[1]");
    }
  }

  // --- 6. Child custody & visitation (only meaningful with children) ---
  function partyCb(
    value: string,
    pet: string | null,
    resp: string | null,
    joint: string | null = null,
    other: string | null = null,
  ): void {
    if (value === "petitioner" && pet) {
      check(form, P2 + pet);
    } else if (value === "respondent" && resp) {
      check(form, P2 + resp);
    } else if (value === "joint" && joint) {
      check(form, P2 + joint);
    } else if (value === "other" && other) {
      check(form, P2 + other);
    }
  }

  if (intake.hasMinorChildren) {
    partyCb(fl.legalCustodyTo, "ToPetitioner_cb[0]", "ToRespondent_cb[0]", "ToBothJointly_cb[0]", "ToOther_cb[0]");
    partyCb(fl.physicalCustodyTo, "ToPetitioner_cb[1]", "ToRespondent_cb[1]", "ToBothJointly_cb[1]", "ToOther_cb[1]");
    partyCb(fl.visitationTo, "ForPetitioner_cb[0]", "ForRespondent_cb[0]", null, "ForOther_cb[0]");
  }

  // --- 7. Child support (other) ---
  if (fl.childSupportOther) {
    check(form, P2 + "OtherChildSupport_cb[0]");
    setText(form, P2 + "ChildSupport_ft[0]", fl.childSupportOther);
  }

  // --- 8. Spousal / partner support ---
  if (fl.spousalSupportTo === "petitioner") {
    check(form, P2 + "PaySupporttoPetitioner_cb[0]");
  } else if (fl.spousalSupportTo === "respondent") {
    check(form, P2 + "PaySupportoRespondent_cb[0]");
  }
  if (fl.terminateSupportTo === "petitioner") {
    check(form, P2 + "EndJurixRePetitioner_cb[0]");
  } else if (fl.terminateSupportTo === "respondent") {
    check(form, P2 + "EndJurixReRespondent_cb[0]");
  }
  if (fl.reserveSupportTo === "petitioner") {
    check(form, P2 + "ReserveJurixSupportPet_cb[0]");
  } else if (fl.reserveSupportTo === "respondent") {
    check(form, P2 + "ReserveJurixSupportResp_cb[0]");
  }
  if (fl.spousalSupportOther) {
    check(form, P2 + "Other_cb[0]");
    setText(form, P2 + "OtherSupport_ft[0]", fl.spousalSupportOther);
  }

  // --- 9. Separate property ---
  if (fl.separatePropertyNone) {
    check(form, P2 + "NoSeparateProperty_cb[0]");
  } else if (fl.separatePropertyList) {
    check(form, P2 + "ConfirmSeparateProperty_sf[0].ConfirmSeparateProperty_cb[0]");
    setText(form, P2 + "ConfirmSeparateProperty_sf[0].SeparatePropertyList1_tf[0]", fl.separatePropertyList);
  }

  // --- 10. Community property ---
  if (fl.communityPropertyNone) {
    check(form, P3 + "NoCommOrQuasiCommProperty_cb[0]");
  } else if (fl.communityPropertyList) {
    check(form, P3 + "CommQuasiProperty_sf[0].PropertyListed_cb[0]");
    setText(form, P3 + "CommQuasiProperty_sf[0].ListProperty_ft[0]", fl.communityPropertyList);
  }

  // --- 11. Other requests ---
  if (fl.attorneyFeesFrom) {
    check(form, P3 + "FeesAndCost_cb[0]");
  }
  if (fl.restoreFormerName) {
    check(form, P3 + "RestoreFormerName_cb[0]");
    setText(form, P3 + "SpecifyFormerName_tf[0]", fl.formerName ?? "");
  }
  if (fl.otherRequests) {
    check(form, P3 + "OtherRequests_cb[0]");
    setText(form, P3 + "SpecifyOtherRequests_tf[0]", fl.otherRequests);
  }

  // --- Signature ---
  setText(form, P3 + "SigDate[0]", courtDate(intake.todaysDate ?? ""));
}
