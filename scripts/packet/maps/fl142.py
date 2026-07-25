"""Field map for the official FL-142 Schedule of Assets and Debts. Returns
{field_name: value} where value is a string (text field) or True (check the box)."""
from scripts.packet import helpers as H

P = "FL-142[0]."
CAP = P + "Page1[0].P1Caption[0]."

# Item-number -> which List{n} on which page holds it.
ASSET_LIST_NO = {
    "realEstate": 1, "household": 2, "jewelry": 3, "vehicles": 4, "savings": 5,
    "checking": 6, "creditUnion": 7, "cash": 8, "taxRefund": 9, "lifeInsurance": 10,
    "stocks": 11, "retirement": 12, "profitSharing": 13, "receivables": 14,
    "partnerships": 15, "otherAssets": 16,
}
DEBT_LIST_NO = {
    "studentLoans": 19, "taxes": 20, "supportArrears": 21, "unsecuredLoans": 22,
    "creditCards": 23, "otherDebts": 24,
}

# List numbers whose "amount owed" widget is named TextField5 instead of TextField6.
ASSET_AMOUNT_OWED_OVERRIDE = {4: "TextField5", 11: "TextField5"}
# Debt list numbers whose "date acquired" widget is named TextField4 instead of TextField6.
DEBT_DATE_ACQUIRED_OVERRIDE = {19: "TextField4"}


def _page_for_list(n: int) -> str:
    if n <= 3:
        return "Page1"
    if n <= 10:
        return "Page2"
    if n <= 18:
        return "Page3"
    return "Page4"


def _list_prefix(n: int) -> str:
    return f"{P}{_page_for_list(n)}[0].List{n}[0].Li1[0]."


def build(data):
    intake = data.get("intake", {})
    fl = data.get("fl142", {})
    p = H.petitioner_name(intake)
    r = H.respondent_name(intake)
    m: dict = {}

    # --- Header ---
    addr_line1 = intake.get("petitionerStreet", "")
    addr_line2 = ", ".join(
        x for x in [intake.get("petitionerCity", ""), intake.get("petitionerState", ""), intake.get("petitionerZip", "")] if x
    )
    atty_block = "\n".join(
        part for part in [p, addr_line1, addr_line2, "Attorney for: Self-Represented"] if part
    )
    m[CAP + "AttyPartyInfo[0].TextField1[0]"] = atty_block
    m[CAP + "AttyPartyInfo[0].Phone[0]"] = intake.get("petitionerPhone", "")
    m[CAP + "AttyPartyInfo[0].Email[0]"] = intake.get("petitionerEmail", "")
    m[CAP + "CourtInfo[0].CrtCounty[0]"] = "RIVERSIDE"
    m[CAP + "TitlePartyName[0].Party1[0]"] = p
    m[CAP + "TitlePartyName[0].Party2[0]"] = r
    m[CAP + "CaseNumber[0].CaseNumber[0]"] = intake.get("caseNumber", "")

    # --- Whose schedule ---
    whose = fl.get("whoseSchedule")
    if whose == "petitioner":
        m[CAP + "FormTitle[0].RB2Choice2[0]"] = True
    elif whose == "respondent":
        m[CAP + "FormTitle[0].RB2Choice2[1]"] = True

    # --- Assets ---
    assets = fl.get("assets", {})
    for key, no in ASSET_LIST_NO.items():
        entry = assets.get(key)
        if not entry:
            continue
        prefix = _list_prefix(no)
        if entry.get("none"):
            m[prefix + "TextField1[0]"] = "NONE"
            continue
        if entry.get("description"):
            m[prefix + "TextField1[0]"] = entry["description"]
        if entry.get("sepProp"):
            m[prefix + "TextField2[0]"] = entry["sepProp"]
        if entry.get("dateAcquired"):
            m[prefix + "TextField3[0]"] = entry["dateAcquired"]
        if entry.get("grossValue"):
            m[prefix + "TextField4[0]"] = entry["grossValue"]
        if entry.get("amountOwed"):
            owed_field = ASSET_AMOUNT_OWED_OVERRIDE.get(no, "TextField6")
            m[prefix + f"{owed_field}[0]"] = entry["amountOwed"]

    # --- Debts ---
    debts = fl.get("debts", {})
    for key, no in DEBT_LIST_NO.items():
        entry = debts.get(key)
        if not entry:
            continue
        prefix = _list_prefix(no)
        if entry.get("none"):
            m[prefix + "TextField1[0]"] = "NONE"
            continue
        if entry.get("description"):
            m[prefix + "TextField1[0]"] = entry["description"]
        if entry.get("sepProp"):
            m[prefix + "TextField2[0]"] = entry["sepProp"]
        if entry.get("totalOwing"):
            m[prefix + "TextField3[0]"] = entry["totalOwing"]
        if entry.get("dateAcquired"):
            date_field = DEBT_DATE_ACQUIRED_OVERRIDE.get(no, "TextField6")
            m[prefix + f"{date_field}[0]"] = entry["dateAcquired"]

    # --- Continuation pages ---
    continuation = fl.get("continuationPages", "")
    if continuation:
        m[P + "Page4[0].List27[0].Li1[0].FillText1[0]"] = continuation
        if str(continuation).strip() not in ("", "0"):
            m[P + "Page4[0].List27[0].Li1[0].ChoiceNumber[0]"] = True

    # --- Signature ---
    if fl.get("date"):
        m[P + "Page4[0].SignSub[0].SigDate[0]"] = H.court_date(fl["date"])
    m[P + "Page4[0].SignSub[0].SigName[0]"] = p

    return m
