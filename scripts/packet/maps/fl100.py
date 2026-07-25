"""Field map for the official FL-100 Petition. Returns {field_name: value} where
value is a string (text field) or True (check the box)."""
from scripts.packet import helpers as H

P = "FL-100[0]."
CAP = P + "Page1[0].CaptionP1_sf[0]."
P1 = P + "Page1[0]."
P2 = P + "Page2[0]."
P3 = P + "Page3[0]."


def build(data):
    intake = data.get("intake", {})
    fl = data.get("fl100", {})
    p = H.petitioner_name(intake)
    r = H.respondent_name(intake)
    court = H.court(intake) or {}
    case_type = intake.get("caseType")
    is_marriage = intake.get("relationshipType") == "marriage"
    m: dict = {}

    # --- Caption / header ---
    m[CAP + "AttyInfo[0].AttyName_ft[0]"] = p
    m[CAP + "AttyInfo[0].AttyStreet_ft[0]"] = intake.get("petitionerStreet", "")
    m[CAP + "AttyInfo[0].AttyCity_ft[0]"] = intake.get("petitionerCity", "")
    m[CAP + "AttyInfo[0].AttyState_ft[0]"] = intake.get("petitionerState", "")
    m[CAP + "AttyInfo[0].AttyZip_ft[0]"] = intake.get("petitionerZip", "")
    m[CAP + "AttyInfo[0].Phone_ft[0]"] = intake.get("petitionerPhone", "")
    m[CAP + "AttyInfo[0].Email_ft[0]"] = intake.get("petitionerEmail", "")
    m[CAP + "AttyInfo[0].AttyFor_ft[0]"] = "Self-Represented"
    m[CAP + "CourtInfo[0].CrtCounty_ft[0]"] = "RIVERSIDE"
    m[CAP + "CourtInfo[0].Branch_ft[0]"] = (court.get("cityStateZip", "") and f"{court['address']}, {court['cityStateZip']}") or ""
    m[CAP + "TitlePartyName[0].Party1_ft[0]"] = p
    m[CAP + "TitlePartyName[0].Party2_ft[0]"] = r
    for pref in (CAP + "CaseNumber[0].CaseNumber_ft[0]", P2 + "CaseNumber[0].CaseNumber_ft[0]", P3 + "CaseNumber[0].CaseNumber_ft[0]"):
        m[pref] = intake.get("caseNumber", "")
    for pref in (P2 + "Parties[0].Party1_ft[0]", P3 + "Parties[0].Party1_ft[0]"):
        m[pref] = p
    for pref in (P2 + "Parties[0].Party2_ft[0]", P3 + "Parties[0].Party2_ft[0]"):
        m[pref] = r

    # --- Petition For ---
    if fl.get("amended"):
        m[CAP + "FormTitle[0].Amended_cb[0]"] = True
    if case_type == "dissolution":
        m[CAP + "FormTitle[0].DissolutionOf_cb[0]"] = True
        m[CAP + "FormTitle[0].Marriage_cb[0]" if is_marriage else CAP + "FormTitle[0].DomesticPartnership_cb[0]"] = True
    elif case_type == "legalSeparation":
        m[CAP + "FormTitle[0].LegalSeparationOf_cb[0]"] = True
        m[CAP + "FormTitle[0].Marriage_cb[1]" if is_marriage else CAP + "FormTitle[0].DomesticPartnership_cb[1]"] = True
    elif case_type == "nullity":
        m[CAP + "FormTitle[0].NullityOf_cb[0]"] = True
        m[CAP + "FormTitle[0].Marriage_cb[2]" if is_marriage else CAP + "FormTitle[0].DomesticPartnership_cb[2]"] = True

    # --- 1. Legal relationship ---
    lr = fl.get("legalRelationship", [])
    if "married" in lr:
        m[P1 + "WeAreMarried_cb[0]"] = True
    if "dpInCA" in lr:
        m[P1 + "DPEstablishedInCalifornia[0]"] = True
    if "dpNotInCA" in lr:
        m[P1 + "DPNOTEstablishedinCA_cb[0]"] = True

    # --- 2. Residence requirements ---
    if fl.get("residencyMet"):
        if fl.get("residencyParty") == "petitioner":
            m[P1 + "PetitionerMeetsResidencyReqs_cb[0]"] = True
        elif fl.get("residencyParty") == "respondent":
            m[P1 + "RespondentMeetsResidencyReqs_cb[0]"] = True
    if fl.get("residencyDpInCA"):
        m[P1 + "DPNOTEstablishedinCA_cb[1]"] = True
    if fl.get("residencySameSex"):
        m[P1 + "SameSexMarriedInCA_cb[0]"] = True
        m[P1 + "PetitionersResidence_tf[0]"] = fl.get("petitionerLivesIn", "")
        m[P1 + "RespondentsResidence_tf[0]"] = fl.get("respondentLivesIn", "")

    # --- 3. Statistical facts ---
    m[P1 + "DateOfMarriage_dt[0]"] = H.court_date(intake.get("marriageDate", ""))
    m[P1 + "DateOfSeparation_dt[0]"] = H.court_date(fl.get("dateOfSeparation", ""))
    if intake.get("relationshipType") == "domesticPartnership":
        m[P1 + "DatePartnersSeparated_dt[0]"] = H.court_date(fl.get("dpRegistrationDate", ""))

    # --- 4. Minor children ---
    if intake.get("hasMinorChildren"):
        m[P1 + "MinorChildren_sf[0].MinorChildrenList_cb[0]"] = True
        children = intake.get("children", [])
        birth_fields = ["Child1Birthdate_dt[0]", "Child2Birthdate_dt[0]", "Child3Date_dt[0]", "Child4Birthdate_dt[0]"]
        for i, c in enumerate(children[:4]):
            n = i + 1
            m[P1 + f"MinorChildren_sf[0].Child{n}Name_tf[0]"] = H.full_name(c.get("firstName", ""), c.get("middleName", ""), c.get("lastName", ""))
            m[P1 + f"MinorChildren_sf[0].Child{n}Age_tf[0]"] = c.get("age", "")
            m[P1 + "MinorChildren_sf[0]." + birth_fields[i]] = H.court_date(c.get("dateOfBirth", ""))
        if fl.get("childBornBeforeMarriage"):
            m[P1 + "MinorChildren_sf[0].Attachment4b[0]"] = True
    else:
        m[P1 + "ThereAreNoMinorChildren_cb[0]"] = True

    if fl.get("voluntaryParentage"):
        m[P1 + "PartiesSignedVoluntaryPaternityDec_cb[0]"] = True

    # --- 5. Legal grounds ---
    if case_type == "nullity":
        if fl.get("groundsNullityVoid"):
            m[P2 + "Nullity_cb[0]"] = True
            if fl["groundsNullityVoid"] == "incest":
                m[P2 + "BasedOnIncest_cb[0]"] = True
            elif fl["groundsNullityVoid"] == "bigamy":
                m[P2 + "BasedOnBigamy_cb[0]"] = True
        if fl.get("groundsNullityVoidable"):
            m[P2 + "NullityofVoidableMarriageOrDP_cb[0]"] = True
            gv = fl["groundsNullityVoidable"]
            m[P2 + {
                "age": "BasedonAge_cb[0]",
                "priorMarriage": "PriorExistingMarriageOrDP_cb[0]",
                "unsoundMind": "BasedOnUnsoundMind_cb[0]",
                "fraud": "BasedonFraud_cb[0]",
                "force": "BasedOnForce_cb[0]",
                "physicalIncapacity": "BasedonPhysicalIncapacity_cb[0]",
            }[gv]] = True
    else:
        # Divorce vs Legal separation type selector, then (1)/(2) basis.
        if case_type == "dissolution":
            m[P2 + "SepTypeDef_cb[1]"] = True   # Divorce
        else:
            m[P2 + "SepTypeDef_cb[0]"] = True   # Legal separation
        if fl.get("groundsDivorceOrSeparation") == "irreconcilable":
            m[P2 + "SepBasis_cb[0]"] = True
        elif fl.get("groundsDivorceOrSeparation") == "incapacity":
            m[P2 + "SepBasis_cb[1]"] = True

    # --- 6. Child custody & visitation (only meaningful with children) ---
    def party_cb(value, pet, resp, joint=None, other=None):
        if value == "petitioner" and pet:
            m[P2 + pet] = True
        elif value == "respondent" and resp:
            m[P2 + resp] = True
        elif value == "joint" and joint:
            m[P2 + joint] = True
        elif value == "other" and other:
            m[P2 + other] = True

    if intake.get("hasMinorChildren"):
        party_cb(fl.get("legalCustodyTo"), "ToPetitioner_cb[0]", "ToRespondent_cb[0]", "ToBothJointly_cb[0]", "ToOther_cb[0]")
        party_cb(fl.get("physicalCustodyTo"), "ToPetitioner_cb[1]", "ToRespondent_cb[1]", "ToBothJointly_cb[1]", "ToOther_cb[1]")
        party_cb(fl.get("visitationTo"), "ForPetitioner_cb[0]", "ForRespondent_cb[0]", None, "ForOther_cb[0]")

    # --- 7. Child support (other) ---
    if fl.get("childSupportOther"):
        m[P2 + "OtherChildSupport_cb[0]"] = True
        m[P2 + "ChildSupport_ft[0]"] = fl["childSupportOther"]

    # --- 8. Spousal / partner support ---
    if fl.get("spousalSupportTo") == "petitioner":
        m[P2 + "PaySupporttoPetitioner_cb[0]"] = True
    elif fl.get("spousalSupportTo") == "respondent":
        m[P2 + "PaySupportoRespondent_cb[0]"] = True
    if fl.get("terminateSupportTo") == "petitioner":
        m[P2 + "EndJurixRePetitioner_cb[0]"] = True
    elif fl.get("terminateSupportTo") == "respondent":
        m[P2 + "EndJurixReRespondent_cb[0]"] = True
    if fl.get("reserveSupportTo") == "petitioner":
        m[P2 + "ReserveJurixSupportPet_cb[0]"] = True
    elif fl.get("reserveSupportTo") == "respondent":
        m[P2 + "ReserveJurixSupportResp_cb[0]"] = True
    if fl.get("spousalSupportOther"):
        m[P2 + "Other_cb[0]"] = True
        m[P2 + "OtherSupport_ft[0]"] = fl["spousalSupportOther"]

    # --- 9. Separate property ---
    if fl.get("separatePropertyNone"):
        m[P2 + "NoSeparateProperty_cb[0]"] = True
    elif fl.get("separatePropertyList"):
        m[P2 + "ConfirmSeparateProperty_sf[0].ConfirmSeparateProperty_cb[0]"] = True
        m[P2 + "ConfirmSeparateProperty_sf[0].SeparatePropertyList1_tf[0]"] = fl["separatePropertyList"]

    # --- 10. Community property ---
    if fl.get("communityPropertyNone"):
        m[P3 + "NoCommOrQuasiCommProperty_cb[0]"] = True
    elif fl.get("communityPropertyList"):
        m[P3 + "CommQuasiProperty_sf[0].PropertyListed_cb[0]"] = True
        m[P3 + "CommQuasiProperty_sf[0].ListProperty_ft[0]"] = fl["communityPropertyList"]

    # --- 11. Other requests ---
    if fl.get("attorneyFeesFrom"):
        m[P3 + "FeesAndCost_cb[0]"] = True
    if fl.get("restoreFormerName"):
        m[P3 + "RestoreFormerName_cb[0]"] = True
        m[P3 + "SpecifyFormerName_tf[0]"] = fl.get("formerName", "")
    if fl.get("otherRequests"):
        m[P3 + "OtherRequests_cb[0]"] = True
        m[P3 + "SpecifyOtherRequests_tf[0]"] = fl["otherRequests"]

    # --- Signature ---
    m[P3 + "SigDate[0]"] = H.court_date(intake.get("todaysDate", ""))

    return m
