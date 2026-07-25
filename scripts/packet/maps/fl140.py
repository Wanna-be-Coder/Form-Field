"""Field map for the official FL-140 Declaration of Disclosure. Returns
{field_name: value} where value is a string (text field) or True (check the
box)."""
from scripts.packet import helpers as H

HDR = "form1[0].Page1[0].StdP1Header_sf[0]."
DIS = "form1[0].Page1[0].Disclose_cb[0]."
P1 = "form1[0].Page1[0]."


def build(data):
    intake = data.get("intake", {})
    fl = data.get("fl140", {})
    p = H.petitioner_name(intake)
    r = H.respondent_name(intake)
    court = H.court(intake) or {}
    m: dict = {}

    # --- Header: party without attorney (self-represented petitioner) ---
    addr_block = "\n".join(
        part for part in [
            p,
            intake.get("petitionerStreet", ""),
            ", ".join(x for x in [intake.get("petitionerCity", ""), intake.get("petitionerState", ""), intake.get("petitionerZip", "")] if x),
        ] if part
    )
    if addr_block:
        m[HDR + "AddInfo[0].PartyAttyAddInfo_ft[0]"] = addr_block
    if intake.get("petitionerPhone"):
        m[HDR + "OtherContact[0].Phone_ft[0]"] = intake["petitionerPhone"]
    if intake.get("petitionerEmail"):
        m[HDR + "OtherContact[0].Email_ft[0]"] = intake["petitionerEmail"]
    m[HDR + "OtherContact[0].AttyFor_ft[0]"] = "Self-Represented"

    # --- Header: court info ---
    m[HDR + "CourtInfo[0].CrtCounty_ft[0]"] = "RIVERSIDE"
    if court:
        m[HDR + "CourtInfo[0].Street_ft[0]"] = court.get("address", "")
        m[HDR + "CourtInfo[0].CityZip_ft[0]"] = court.get("cityStateZip", "")
        m[HDR + "CourtInfo[0].Branch_ft[0]"] = court.get("name", "")

    # --- Header: party names / case number ---
    m[HDR + "TitlePartyName[0].Party1_ft[0]"] = p
    m[HDR + "TitlePartyName[0].Party2_ft[0]"] = r
    m[HDR + "CaseNumber[0].CaseNumber_ft[0]"] = intake.get("caseNumber", "")

    # --- Header: whose disclosure / stage ---
    if fl.get("whoseDisclosure") == "petitioner":
        m[HDR + "FormTitle[0].caption_cb[0].CheckBox61[0]"] = True
    elif fl.get("whoseDisclosure") == "respondent":
        m[HDR + "FormTitle[0].caption_cb[1].respondent_cb[0]"] = True
    if fl.get("disclosureStage") == "preliminary":
        m[HDR + "FormTitle[0].caption_cb[2].preliminary_cb[0]"] = True
    elif fl.get("disclosureStage") == "final":
        m[HDR + "FormTitle[0].caption_cb[3].final_cb[0]"] = True

    # --- Attached items 1-6 ---
    if fl.get("attachSchedule"):
        m[DIS + "#area[2].Schedule_or_Prop_cb[0]"] = True
    if fl.get("attachIncomeExpense"):
        m[P1 + "Date_name_gp[0].IandE_cb[0]"] = True
    if fl.get("attachTaxReturns"):
        m[DIS + "#area[3].taxreturns_cb[0]"] = True
    if fl.get("attachMaterialFactsAssets"):
        m[DIS + "#area[6].CheckBox61[0]"] = True
    if fl.get("attachMaterialFactsObligations"):
        m[DIS + "#area[4].obligations_stmt_cb[0]"] = True
    if fl.get("attachInvestmentOpportunity"):
        m[DIS + "#area[4].#area[5].investment_opp_db[0]"] = True

    # --- Signature ---
    m[P1 + "print_name_ft[0]"] = p
    if fl.get("date"):
        m[P1 + "Date[0]"] = H.court_date(fl["date"])

    return m
