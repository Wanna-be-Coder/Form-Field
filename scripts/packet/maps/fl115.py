"""Field map for the official FL-115 Proof of Service of Summons. Returns
{field_name: value} where value is a string (text field) or True (check the
box).

Note: the field named "PartyAttyAddInfo_ft[0]" is (per the PDF's /TU tooltip)
actually "State Bar Number" -- the header's Name/Street/City/State/Zip fields
are the numbered "Phone_ft[n]" widgets below it (a quirk of this form's
AcroForm field naming). Verified against form-templates/fl115.pdf field
tooltips.
"""
from scripts.packet import helpers as H

P = "FL-115[0]."
P1 = P + "Page1[0].Page1[0]."
P2 = P + "Page2[0].Page2[0]."


def build(data):
    intake = data.get("intake", {})
    fl = data.get("fl115", {})
    p = H.petitioner_name(intake)
    r = H.respondent_name(intake)
    court = H.court(intake) or {}
    m: dict = {}

    # --- Header: party without attorney (self-represented petitioner) ---
    if p:
        m[P1 + "AddInfo[0].Phone_ft[0]"] = p  # Name
    if intake.get("petitionerStreet"):
        m[P1 + "AddInfo[0].Phone_ft[2]"] = intake["petitionerStreet"]  # Street Address
    if intake.get("petitionerCity"):
        m[P1 + "AddInfo[0].Phone_ft[3]"] = intake["petitionerCity"]  # City
    if intake.get("petitionerState"):
        m[P1 + "AddInfo[0].Phone_ft[4]"] = intake["petitionerState"]  # State
    if intake.get("petitionerZip"):
        m[P1 + "AddInfo[0].Phone_ft[5]"] = intake["petitionerZip"]  # Zip Code
    if intake.get("petitionerPhone"):
        m[P1 + "AddInfo[0].Phone_ft[6]"] = intake["petitionerPhone"]  # Phone Number
    if intake.get("petitionerEmail"):
        m[P1 + "AddInfo[0].Email_ft[0]"] = intake["petitionerEmail"]
    m[P1 + "AddInfo[0].AttyFor_ft[0]"] = "Self-Represented"

    # --- Header: court info ---
    m[P1 + "CourtInfo[0].CrtCounty_ft[0]"] = "RIVERSIDE"
    if court:
        m[P1 + "CourtInfo[0].Street_ft[0]"] = court.get("address", "")
        m[P1 + "CourtInfo[0].CityZip_ft[0]"] = court.get("cityStateZip", "")
        m[P1 + "CourtInfo[0].Branch_ft[0]"] = court.get("name", "")

    # --- Header: party names / case number (both pages) ---
    m[P1 + "TitlePartyName[0].Petitioner_tf[0]"] = p
    m[P1 + "TitlePartyName[0].Respondent_tf[0]"] = r
    m[P1 + "CaseNumber[0].CaseNumber_ft[0]"] = intake.get("caseNumber", "")
    m[P2 + "Party[0].Petitioner_tf[0]"] = p
    m[P2 + "Party[0].Respondent_tf[0]"] = r
    m[P2 + "CaseNumber[0].CaseNumber_ft[0]"] = intake.get("caseNumber", "")

    # --- Item 1: copies served ---
    m[P1 + "List1[0].LI1[0].Check1[0]"] = True  # a. Family Law (FL-100/FL-110/FL-120)
    m[P1 + "List1[0].LI4[0].CheckBox1[0]"] = True  # and d. (attachments)
    m[P1 + "List1[0].LI4[0].List1[0].LI1[0].CheckBox1[0]"] = True  # (1) UCCJEA (FL-105)
    m[P1 + "List1[0].LI4[0].List1[0].LI2[0].CheckBox1[0]"] = True  # (2) Declaration of Disclosure (FL-140)
    m[P1 + "List1[0].LI4[0].List1[0].LI3[0].CheckBox1[0]"] = True  # (3) Schedule of Assets and Debts (FL-142)
    m[P1 + "List1[0].LI4[0].List1[0].LI4[0].CheckBox1[0]"] = True  # (4) Income and Expense Declaration (FL-150)

    # --- Item 2: address where respondent was served ---
    if fl.get("addressServed"):
        m[P1 + "List2[0].LI1[0].AddressWhereServed_tf[0]"] = fl["addressServed"]

    # --- Item 3: method of service ---
    method = fl.get("serviceMethod")
    service_date = H.court_date(fl.get("serviceDate", ""))
    service_time = fl.get("serviceTime", "")

    if method == "personal":
        m[P1 + "List3[0].LI1[0].CheckBox1[0]"] = True
        if service_date:
            m[P1 + "List3[0].LI1[0].DatePersonalServiceCompleted_dt[0]"] = service_date
        if service_time:
            m[P1 + "List3[0].LI1[0].TimePersonalServiceCompleted_dt[0]"] = service_time
    elif method == "substituted":
        m[P1 + "List3[0].LI2[0].CheckBox1[0]"] = True
        if service_date:
            m[P1 + "List3[0].LI2[0].List1[0].LI2[0].DateofSubstitutedService_dt[0]"] = service_date
        if service_time:
            m[P1 + "List3[0].LI2[0].List1[0].LI2[0].TimeofSubstitutedService__tf[0]"] = service_time
    elif method == "mail":
        m[P2 + "List3[0].LI3[0].CheckBox1[0]"] = True
        if service_date:
            m[P2 + "List3[0].LI3[0].DateofMail_AcknowledgmentService_dt[0]"] = service_date

    # --- Item 4: person who served papers ---
    if fl.get("serverName"):
        m[P2 + "List4[0].NameofServer_tf[0]"] = fl["serverName"]
    if fl.get("serverAddress"):
        m[P2 + "List4[0].ServersAddress_tf[0]"] = fl["serverAddress"]
    if fl.get("serverPhone"):
        m[P2 + "List4[0].ServersTelephoneNumber_tf[0]"] = fl["serverPhone"]

    if fl.get("serverIsRegistered"):
        m[P2 + "List4[0].LI3[0].CheckBox1[0]"] = True  # c. a registered California process server
        if fl.get("serverRegistrationNo"):
            m[P2 + "List4[0].LI3[0].List1[0].LI1[0].ServersRegistrationNumber_tf[0]"] = fl["serverRegistrationNo"]
        if fl.get("serverCounty"):
            m[P2 + "List4[0].LI3[0].List1[0].LI2[0].ServersCounty_tf[0]"] = fl["serverCounty"]
        if fl.get("serverFee"):
            m[P2 + "List4[0].LI3[0].List1[0].LI3[0].FeeforService_tf[0]"] = H.currency(fl["serverFee"])
    else:
        m[P2 + "List4[0].LI2[0].CheckBox1[0]"] = True  # b. not a registered California process server

    # --- Item 5: declaration under penalty of perjury ---
    m[P2 + "List5[0].LI1[0].CheckBox1a[0]"] = True

    # --- Signature (name of server; hand-signed on paper) ---
    if fl.get("serverName"):
        m[P2 + "SigSub[0].Name[0]"] = fl["serverName"]
    if fl.get("date"):
        m[P2 + "SigSub[0].SigDate[0]"] = H.court_date(fl["date"])

    return m
