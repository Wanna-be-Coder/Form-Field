"""Shared helpers for filling the official Judicial Council / Riverside forms.

`data` throughout is the PacketFormData object as posted by the web app,
i.e. nested dicts: data["intake"], data["fl100"], etc.
"""

COURTHOUSES = {
    "riverside": {"name": "Riverside", "address": "4175 Main St.", "cityStateZip": "Riverside, CA 92501"},
    "indio": {"name": "Indio", "address": "46-200 Oasis St.", "cityStateZip": "Indio, CA 92201"},
    "menifee": {"name": "Menifee", "address": "27401 Menifee Center Drive", "cityStateZip": "Menifee, CA 92584"},
    "blythe": {"name": "Blythe", "address": "265 N. Broadway", "cityStateZip": "Blythe, CA 92225"},
}

CASE_TYPE_LABELS = {
    "dissolution": "Dissolution (Divorce)",
    "legalSeparation": "Legal Separation",
    "nullity": "Nullity",
}


def full_name(first="", middle="", last=""):
    return " ".join(p for p in [first, middle, last] if p and p.strip()).strip()


def petitioner_name(intake):
    return full_name(intake.get("petitionerFirstName", ""), intake.get("petitionerMiddleName", ""), intake.get("petitionerLastName", ""))


def respondent_name(intake):
    return full_name(intake.get("respondentFirstName", ""), intake.get("respondentMiddleName", ""), intake.get("respondentLastName", ""))


def court_date(value):
    """yyyy-mm-dd (native date input) -> MM/DD/YYYY. Pass through anything else."""
    if not value:
        return ""
    parts = value.split("-")
    if len(parts) == 3 and len(parts[0]) == 4:
        y, m, d = parts
        return f"{m}/{d}/{y}"
    return value


def currency(value):
    try:
        n = float(str(value).replace(",", "").replace("$", "").strip() or 0)
    except ValueError:
        return ""
    return f"${n:,.2f}"


def petitioner_address(intake):
    return ", ".join(
        p for p in [
            intake.get("petitionerStreet", ""),
            ", ".join(x for x in [intake.get("petitionerCity", ""), intake.get("petitionerState", ""), intake.get("petitionerZip", "")] if x),
        ] if p
    )


def court(intake):
    key = intake.get("courthouse", "")
    return COURTHOUSES.get(key)


def court_address_line(intake):
    c = court(intake)
    return f"{c['address']}, {c['cityStateZip']}" if c else ""
