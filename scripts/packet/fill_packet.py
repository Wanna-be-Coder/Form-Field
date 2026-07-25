"""Fill the official Riverside dissolution packet forms with the user's data and
merge them into a single, still-editable PDF.

Usage:  python3 -m scripts.packet.fill_packet <data.json> <out.pdf>
   or:  python3 scripts/packet/fill_packet.py <data.json> <out.pdf>

For each Judicial Council form we load the official PDF template, decrypt it
(empty user password), drop the XFA layer so standard viewers render the
AcroForm values, fill the named fields, and append it to the combined output.
The two Riverside LOCAL forms (RI-FL036, RI-FL011) are filled from official
templates if present in form-templates/, otherwise drawn with a faithful
fallback.
"""
import io
import os
import sys
import json
import importlib

from pypdf import PdfReader, PdfWriter

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
TEMPLATES = os.path.join(ROOT, "form-templates")


def _resolve_checkbox_on(field):
    states = [s for s in (field.get("/_States_") or []) if s != "/Off"]
    return states[0] if states else "/1"


def fill_template(path, mapping):
    """Return BytesIO of the filled (decrypted, XFA-dropped) form."""
    reader = PdfReader(path)
    if reader.is_encrypted:
        reader.decrypt("")
    fields = reader.get_fields() or {}

    writer = PdfWriter(clone_from=reader)
    acro = writer._root_object.get("/AcroForm")
    if acro is not None and "/XFA" in acro.get_object():
        del acro.get_object()["/XFA"]

    resolved = {}
    for name, value in mapping.items():
        f = fields.get(name)
        if f is None:
            print(f"  WARN: field not found: {name}", file=sys.stderr)
            continue
        if value is True:
            resolved[name] = _resolve_checkbox_on(f)
        elif value in (False, None, ""):
            continue
        else:
            resolved[name] = str(value)

    for page in writer.pages:
        try:
            writer.update_page_form_field_values(page, resolved, auto_regenerate=False)
        except Exception as exc:  # keep going even if one page/field misbehaves
            print(f"  WARN: fill issue on a page: {exc}", file=sys.stderr)

    writer.set_need_appearances_writer(True)
    buf = io.BytesIO()
    writer.write(buf)
    buf.seek(0)
    return buf


def load_map(name):
    try:
        mod = importlib.import_module(f"scripts.packet.maps.{name}")
        return mod.build
    except ModuleNotFoundError:
        return None


def build_packet(data):
    master = PdfWriter()
    included = []

    # (template basename, map module, include?) in packet order.
    plan = [
        ("fl100", "fl100", True),
        ("fl110", "fl110", True),
        ("fl105", "fl105", bool(data.get("intake", {}).get("hasMinorChildren"))),
        ("rifl036", "rifl036", True),
        ("rifl011", "rifl011", True),
        ("fl142", "fl142", True),
        ("fl150", "fl150", True),
        ("fl140", "fl140", True),
        ("fl115", "fl115", True),
    ]

    for template_name, map_name, include in plan:
        if not include:
            continue
        template_path = os.path.join(TEMPLATES, f"{template_name}.pdf")
        build = load_map(map_name)

        if os.path.exists(template_path):
            mapping = build(data) if build else {}
            buf = fill_template(template_path, mapping)
            master.append(PdfReader(buf))
            included.append(template_name)
        elif template_name in ("rifl036", "rifl011"):
            # No official template available (Riverside site blocks downloads).
            from scripts.packet import ri_fallback
            drawer = getattr(ri_fallback, f"draw_{template_name}")
            master.append(PdfReader(drawer(data)))
            included.append(template_name + " (fallback)")
        else:
            print(f"  WARN: template missing, skipped: {template_name}", file=sys.stderr)

    acro = master._root_object.get("/AcroForm")
    if acro is not None:
        master.set_need_appearances_writer(True)

    return master, included


def main():
    if len(sys.argv) < 3:
        print("usage: fill_packet.py <data.json> <out.pdf>", file=sys.stderr)
        sys.exit(2)
    data = json.load(open(sys.argv[1]))
    master, included = build_packet(data)
    with open(sys.argv[2], "wb") as f:
        master.write(f)
    print("included forms:", ", ".join(included))
    print("wrote", sys.argv[2], "pages:", len(master.pages))


if __name__ == "__main__":
    # Allow running as a plain script (add repo root to path for package imports).
    if __package__ in (None, ""):
        sys.path.insert(0, ROOT)
        importlib.import_module("scripts")  # ensure namespace
    main()
