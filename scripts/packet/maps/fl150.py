"""Field map for the official FL-150 Income and Expense Declaration. Returns
{field_name: value} where value is a string (text field) or True (check the
box). Field names copied verbatim from form-templates/fl150.fields.txt."""
from scripts.packet import helpers as H

P = "FL-150[0]."
HDR = P + "Page1[0].StdP1Header_sf[0]."
P1 = P + "Page1[0]."
P2 = P + "Page2[0]."
P3 = P + "Page3[0]."
P4 = P + "Page4[0]."
CAP2 = P2 + "PxCaption_sf[0]."
CAP3 = P3 + "PxCaption_sf[0]."
CAP4 = P4 + "PxCaption_sf[0]."

# item 12 "people who live with me" row field names (Page3.List12[0].<row>.<field>)
HOUSEHOLD_ROWS = [
    {"row": "L1[0]", "name": "FillText1[0]", "age": "TextField1[0]", "rel": "TextField2[0]", "income": "TextField3[0]", "yes": "item12a_cb[0]", "no": "item12a_cb[1]"},
    {"row": "L2[0]", "name": "FillText1[0]", "age": "TextField[0]", "rel": "TextField1[0]", "income": "TextField2[0]", "yes": "People2_cb[0]", "no": "People2_cb[1]"},
    {"row": "L3[0]", "name": "FillText1[0]", "age": "TextField[0]", "rel": "TextField1[0]", "income": "TextField6[0]", "yes": "People3_cb[0]", "no": "People3_cb[1]"},
    {"row": "L4[0]", "name": "FillText1[0]", "age": "TextField[0]", "rel": "TextField1[0]", "income": "TextField6[0]", "yes": "People4_cb[0]", "no": "People4_cb[1]"},
    {"row": "L5[0]", "name": "FillText1[0]", "age": "TextField[0]", "rel": "TextField1[0]", "income": "TextField6[0]", "yes": "People5_cb[0]", "no": "People5_cb[1]"},
]

# item 13 "estimated monthly expenses" -> Page3.List13[0].<Li>.EXPN[0], keyed by fl150 field name
EXPENSE_LINES = [
    ("Li2[0]", "expenseHealthCare"),
    ("Li3[0]", "expenseChildCare"),
    ("Li4[0]", "expenseGroceries"),
    ("Li5[0]", "expenseEatingOut"),
    ("Li6[0]", "expenseUtilities"),
    ("Li7[0]", "expensePhone"),
    ("Li8[0]", "expenseLaundry"),
    ("Li9[0]", "expenseClothes"),
    ("Li10[0]", "expenseEducation"),
    ("Li11[0]", "expenseEntertainment"),
    ("Li12[0]", "expenseAuto"),
    ("Li13[0]", "expenseInsurance"),
    ("Li14[0]", "expenseSavings"),
]


def build(data):
    intake = data.get("intake", {})
    fl = data.get("fl150", {})
    p = H.petitioner_name(intake)
    r = H.respondent_name(intake)
    m: dict = {}

    # --- Header (self-represented petitioner) ---
    m[HDR + "AttyInfo[0].AttyName_ft[0]"] = p
    m[HDR + "AttyInfo[0].AttyStreet_ft[0]"] = intake.get("petitionerStreet", "")
    m[HDR + "AttyInfo[0].AttyCity_ft[0]"] = intake.get("petitionerCity", "")
    m[HDR + "AttyInfo[0].AttyState_ft[0]"] = intake.get("petitionerState", "")
    m[HDR + "AttyInfo[0].AttyZip_ft[0]"] = intake.get("petitionerZip", "")
    m[HDR + "AttyInfo[0].Phone_ft[0]"] = intake.get("petitionerPhone", "")
    m[HDR + "AttyInfo[0].Email_ft[0]"] = intake.get("petitionerEmail", "")
    m[HDR + "AttyInfo[0].AttyFor_ft[0]"] = "Self-Represented"
    m[HDR + "CourtInfo[0].CrtCounty_ft[0]"] = "RIVERSIDE"
    court = H.court(intake)
    if court:
        m[HDR + "CourtInfo[0].Branch_ft[0]"] = f"{court['address']}, {court['cityStateZip']}"
    m[HDR + "TitlePartyName[0].Party1_ft[0]"] = p
    m[HDR + "TitlePartyName[0].Party2_ft[0]"] = r
    m[HDR + "CaseNumber[0].CaseNumber_ft[0]"] = intake.get("caseNumber", "")

    # Repeated caption on pages 2 & 3 (party1/party2/case number; leave OtherParty blank)
    for cap in (CAP2, CAP3):
        m[cap + "TitlePartyName[0].Party1_ft[0]"] = p
        m[cap + "TitlePartyName[0].Party2_ft[0]"] = r
        m[cap + "CaseNumber[0].CaseNumber_ft[0]"] = intake.get("caseNumber", "")

    # --- 1. Employment ---
    m[P1 + "List1[0].Li1[0].Employer_tf[0]"] = fl.get("employer", "")
    m[P1 + "List1[0].Li2[0].Employer_address_tf[0]"] = fl.get("employerAddress", "")
    m[P1 + "List1[0].Li3[0].Employer_phone\\.ft[0]"] = fl.get("employerPhone", "")
    m[P1 + "List1[0].Li4[0].Party_occupation_tf[0]"] = fl.get("occupation", "")
    m[P1 + "List1[0].Li5[0].Date_started_job_tf[0]"] = H.court_date(fl.get("dateJobStarted", ""))
    m[P1 + "List1[0].Li6[0].FillText1[0]"] = H.court_date(fl.get("dateJobEnded", ""))
    m[P1 + "List1[0].Li7[0].hours_tf[0]"] = fl.get("hoursPerWeek", "")
    m[P1 + "List1[0].Li8[0].gross_tf[0]"] = fl.get("grossPay", "")
    pay_freq = fl.get("payFrequency")
    if pay_freq == "month":
        m[P1 + "List1[0].Li8[0].Gross_cb[0]"] = True
    elif pay_freq == "week":
        m[P1 + "List1[0].Li8[0].Gross_cb[1]"] = True
    elif pay_freq == "hour":
        m[P1 + "List1[0].Li8[0].Gross_cb[2]"] = True

    # --- 2. Age & education ---
    m[P1 + "List2[0].Li1[0].FillText1[0]"] = fl.get("age", "")
    if fl.get("completedHighSchool"):
        m[P1 + "List2[0].Li2[0].HSchl_cb[0]"] = True
    m[P1 + "List2[0].Li2[0].FillText1[0]"] = fl.get("highestGrade", "")
    m[P1 + "List2[0].Li3[0].FillText1[0]"] = fl.get("yearsCollege", "")
    m[P1 + "List2[0].Li3[0].FillText109[0]"] = fl.get("collegeDegrees", "")

    # --- 3. Tax information ---
    if fl.get("lastTaxYear"):
        m[P1 + "List3[0].Li1[0].RB2Choices[0]"] = True
    m[P1 + "List3[0].Li1[0].FillText109[0]"] = fl.get("lastTaxYear", "")
    tax_status = fl.get("taxFilingStatus")
    if tax_status == "single":
        m[P1 + "List3[0].Li2[0].Tax_cb1[0]"] = True
    elif tax_status == "headOfHousehold":
        m[P1 + "List3[0].Li2[0].Tax_cb2[0]"] = True
    elif tax_status == "marriedSeparately":
        m[P1 + "List3[0].Li2[0].Tax_cb3[0]"] = True
    elif tax_status == "marriedJointly":
        m[P1 + "List3[0].Li2[0].RB2Choices[0]"] = True
        m[P1 + "List3[0].Li2[0].FillText109[0]"] = fl.get("taxFilingJointName", "")

    # --- 4. Other party's income ---
    m[P1 + "List4[0].Li1[0].FillTextincm[0]"] = fl.get("otherPartyIncome", "")
    m[P1 + "List4[0].Li1[0].FillText1[0]"] = fl.get("otherPartyIncomeBasis", "")

    # --- Declarant signature (Page 1) ---
    m[P1 + "Signdate[0]"] = H.court_date(fl.get("date", ""))
    m[P1 + "FillText56[0]"] = p

    # --- 5. Income (average monthly) ---
    income_lines = [
        ("Li1[0]", "TextField7[0]", "incomeSalary"),
        ("Li2[0]", "TextField8[0]", "incomeOvertime"),
        ("Li3[0]", "TextField9[0]", "incomeCommissions"),
        ("Li4[0]", "TextField10[0]", "incomePublicAssistance"),
        ("Li5[0]", "TextField11[0]", "incomeSpousalSupport"),
        ("Li7[0]", "TextField13[0]", "incomePension"),
        ("Li8[0]", "TextField14[0]", "incomeSocialSecurity"),
        ("Li10[0]", "TextField16[0]", "incomeUnemployment"),
    ]
    for li, field, key in income_lines:
        val = fl.get(key, "")
        if val:
            m[P2 + f"List5[0].{li}.{field}"] = val
    if fl.get("incomePublicAssistance"):
        m[P2 + "List5[0].Li4[0].CBChoice1_cb[0]"] = True
    if fl.get("incomeOther"):
        m[P2 + "List5[0].Li12[0].TextField18[0]"] = fl["incomeOther"]

    # --- 10. Deductions ---
    m[P2 + "List10[0].L1[0].FillText1[0]"] = fl.get("deductionUnionDues", "")
    m[P2 + "List10[0].L2[0].FillText1[0]"] = fl.get("deductionRetirement", "")
    m[P2 + "List10[0].L3[0].FillText1[0]"] = fl.get("deductionHealthInsurance", "")
    m[P2 + "List10[0].L4[0].FillText1[0]"] = fl.get("deductionChildSupportOther", "")

    # --- 11. Assets ---
    m[P2 + "List11[0].L1[0].FillText1[0]"] = fl.get("assetCash", "")
    m[P2 + "List11[0].L2[0].FillText1[0]"] = fl.get("assetStocks", "")
    m[P2 + "List11[0].L3[0].FillText1[0]"] = fl.get("assetOtherProperty", "")

    # --- 12. People who live with me ---
    household = fl.get("household", [])
    for row_def, member in zip(HOUSEHOLD_ROWS, household):
        base = P3 + f"List12[0].{row_def['row']}."
        m[base + row_def["name"]] = member.get("name", "")
        m[base + row_def["age"]] = member.get("age", "")
        m[base + row_def["rel"]] = member.get("relationship", "")
        m[base + row_def["income"]] = member.get("grossMonthlyIncome", "")
        if member.get("paysExpenses"):
            m[base + row_def["yes"]] = True
        else:
            m[base + row_def["no"]] = True

    # --- 13. Estimated monthly expenses ---
    if fl.get("expenseHome"):
        m[P3 + "List13[0].Li1[0].List[0].L1[0].EXPN[0]"] = fl["expenseHome"]
    for li, key in EXPENSE_LINES:
        val = fl.get(key, "")
        if val:
            m[P3 + f"List13[0].{li}.EXPN[0]"] = val
    if fl.get("expenseOther"):
        m[P3 + "List13[0].Li17[0].EXPN[0]"] = fl["expenseOther"]

    # --- Child support page (only if there are minor children) ---
    if intake.get("hasMinorChildren"):
        m[CAP4 + "TitlePartyName[0].Party1_ft[0]"] = p
        m[CAP4 + "TitlePartyName[0].Party2_ft[0]"] = r
        m[CAP4 + "CaseNumber[0].CaseNumber_ft[0]"] = intake.get("caseNumber", "")

        m[P4 + "List16[0].L1[0].TextField6[0]"] = fl.get("numberChildrenUnder18", "")
        m[P4 + "List16[0].L2[0].TextField[0]"] = fl.get("timeWithMePercent", "")
        m[P4 + "List16[0].L2[0].TextField1[0]"] = fl.get("timeWithOtherPercent", "")

        if fl.get("hasChildHealthInsurance"):
            m[P4 + "List17[0].L1[0].ChildHC_cb[0]"] = True
        m[P4 + "List17[0].L2[0].FillText1[0]"] = fl.get("childInsuranceCompany", "")
        m[P4 + "List17[0].L4[0].FillText1[0]"] = fl.get("childInsuranceMonthlyCost", "")

    return m
