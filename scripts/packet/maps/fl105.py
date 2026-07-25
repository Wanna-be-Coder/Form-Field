"""Field map for the official FL-105/GC-120 (UCCJEA) declaration. Returns
{field_name: value} where value is a string (text field) or True (check the box)."""
from scripts.packet import helpers as H

P = "FL-105[0]."
P1 = P + "Page1[0]."
P2 = P + "Page2[0]."
CAP = P1 + "P1Caption[0]."
L1 = P1 + "List1[0].Li1[0]."
L2 = P1 + "List2[0].Li1[0]."
L3 = P1 + "List3[0].Li1[0]."
L4 = P2 + "Item4subformset[0].List4[0].Li1[0].Table4abc[0]."
L5 = P2 + "Item5subformset[0].List5[0].Li1[0]."
L6 = P2 + "List6[0]."
L7 = P2 + "List7[0].Li1[0]."
DEC = P2 + "PoPDec[0]."


def build(data):
    intake = data.get("intake", {})
    fl = data.get("fl105", {})
    p = H.petitioner_name(intake)
    r = H.respondent_name(intake)
    m: dict = {}

    # --- Caption / header ---
    m[CAP + "AttyInfo[0].AttyName_ft[0]"] = p
    m[CAP + "AttyInfo[0].AttyStreet_ft[0]"] = intake.get("petitionerStreet", "")
    m[CAP + "AttyInfo[0].AttyCity_ft[0]"] = intake.get("petitionerCity", "")
    m[CAP + "AttyInfo[0].AttyState_ft[0]"] = intake.get("petitionerState", "")
    m[CAP + "AttyInfo[0].AttyZip_ft[0]"] = intake.get("petitionerZip", "")
    m[CAP + "AttyInfo[0].Phone[0]"] = intake.get("petitionerPhone", "")
    m[CAP + "AttyInfo[0].Email[0]"] = intake.get("petitionerEmail", "")
    m[CAP + "AttyInfo[0].Name[0]"] = "Self-Represented"
    m[CAP + "CrtInfo[0].CrtCounty[0]"] = "RIVERSIDE"
    m[CAP + "CrtInfo[0].CrtBranch[0]"] = H.court_address_line(intake)
    m[CAP + "ProbateParty[0].Party1[0]"] = p
    m[CAP + "ProbateParty[0].Party2[0]"] = r
    m[CAP + "CaseNo[0].CaseNumber[0]"] = intake.get("caseNumber", "")

    # --- 1. Role ---
    if fl.get("role") == "party":
        m[L1 + "Party[0].PartyRepCB[0]"] = True
    elif fl.get("role") == "agencyRep":
        m[L1 + "AuthRep[0].PartyRepCB[0]"] = True

    # --- 2. Minor children (list oldest child first) ---
    children = intake.get("children", [])
    m[L2 + "NumChildren[0]"] = str(len(children))
    row_first_name_fields = ["TextField7[0]", "TextField8[0]", "TextField8[0]", "TextField8[0]"]
    for i, c in enumerate(children[:4]):
        row = i + 1
        name_field = row_first_name_fields[i]
        m[L2 + f"Table[0].Row{row}[0].{name_field}"] = H.full_name(
            c.get("firstName", ""), c.get("middleName", ""), c.get("lastName", "")
        )
        m[L2 + f"Table[0].Row{row}[0].TextField1[0]"] = H.court_date(c.get("dateOfBirth", ""))
        m[L2 + f"Table[0].Row{row}[0].TextField2[0]"] = c.get("placeOfBirth", "")
    if len(children) > 4:
        m[L2 + "CheckBox19[0]"] = True

    # --- 3. Residence history ---
    if fl.get("singleResidenceForAll"):
        m[L3 + "OneManyCB[0]"] = True

    residences = fl.get("residences", [])
    current = [res for res in residences if res.get("isCurrent")]
    others = [res for res in residences if not res.get("isCurrent")]
    ordered = (current[:1] + others) if current else residences

    if ordered:
        row1 = ordered[0]
        m[L3 + "Table3a[0].Row1[0].From1[0]"] = H.court_date(row1.get("fromDate", ""))
        m[L3 + "Table3a[0].Row1[0].Residence1[0]"] = row1.get("residence", "")
        m[L3 + "Table3a[0].Row1[0].PersonStreet1[0]"] = row1.get("livedWith", "")
        m[L3 + "Table3a[0].Row1[0].Relationship1[0]"] = row1.get("relationship", "")

    for i, res in enumerate(ordered[1:5]):
        row = i + 2
        m[L3 + f"Table3a[0].Row{row}[0].From{row}[0]"] = H.court_date(res.get("fromDate", ""))
        m[L3 + f"Table3a[0].Row{row}[0].To{row}[0]"] = H.court_date(res.get("toDate", ""))
        m[L3 + f"Table3a[0].Row{row}[0].Residence{row}[0]"] = res.get("residence", "")
        m[L3 + f"Table3a[0].Row{row}[0].PersonStreet{row}[0]"] = res.get("livedWith", "")
        m[L3 + f"Table3a[0].Row{row}[0].Relationship{row}[0]"] = res.get("relationship", "")

    if len(ordered) > 5:
        m[L3 + "AddlAddyCB[0]"] = True

    # --- 4. Other custody/visitation proceedings ---
    li4 = P2 + "Item4subformset[0].List4[0].Li1[0]."
    if fl.get("otherProceedings"):
        m[li4 + "OtherCaseYN[0]"] = True
    else:
        m[li4 + "OtherCaseYN[1]"] = True

    if fl.get("otherProceedings") and fl.get("otherProceedingsDetails"):
        m[L4 + "Row4c[0].PGCell4c[0].OtherCB[0]"] = True
        m[L4 + "Row4c[0].Court4c[0]"] = fl["otherProceedingsDetails"]

    # --- 5. Domestic violence restraining/protective orders ---
    if fl.get("restrainingOrders"):
        m[L5 + "DVROCB[0].DVRO_CB[0]"] = True
        if fl.get("restrainingOrdersDetails"):
            m[L5 + "Table5[0].Row5d[0].ROCell5d[0].OtherRO_CB5d[0]"] = True
            m[L5 + "Table5[0].Row5d[0].County5d[0]"] = fl["restrainingOrdersDetails"]

    # --- 6. Other persons with custody or visitation claims ---
    if fl.get("otherPersons"):
        m[L6 + "OtherPersonYN[0]"] = True
    else:
        m[L6 + "OtherPersonYN[1]"] = True

    if fl.get("otherPersons"):
        persons = fl.get("persons", [])
        li_keys = ["Li1[0]", "Li2[0]", "Li3[0]"]
        suffixes = ["6a", "6b", "6c"]
        for i, person in enumerate(persons[:3]):
            li = li_keys[i]
            suf = suffixes[i]
            m[L6 + f"{li}.Name{suf}[0]"] = person.get("nameAddress", "")
            if person.get("hasPhysicalCustody"):
                m[L6 + f"{li}.CheckBox{suf}1[0]"] = True
            if person.get("claimsCustody"):
                m[L6 + f"{li}.CheckBox{suf}2[0]"] = True
            if person.get("claimsVisitation"):
                m[L6 + f"{li}.CheckBox{suf}3[0]"] = True
            m[L6 + f"{li}.Child{suf}[0]"] = person.get("childrenNames", "")

    # --- 7. Attachments ---
    if fl.get("pagesAttached"):
        m[L7 + "Checkbox[0]"] = True
        m[L7 + "PPAttached[0]"] = fl["pagesAttached"]

    # --- Signature ---
    m[DEC + "SigDate[0]"] = H.court_date(fl.get("date", ""))
    m[DEC + "PrintName[0]"] = p

    return m
