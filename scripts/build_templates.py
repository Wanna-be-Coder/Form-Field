"""One-time offline build of the combined blank, fillable packet templates.

Reads the official (encrypted, XFA) Judicial Council PDFs from form-templates/,
decrypts them (empty user password), drops the XFA layer so standard viewers and
pdf-lib render the AcroForm, and merges them into two combined templates that the
browser fills at runtime with pdf-lib:

  public/form-templates/packet-children.pdf     (includes FL-105 UCCJEA)
  public/form-templates/packet-no-children.pdf  (no FL-105)

The two Riverside LOCAL forms (RI-FL036, RI-FL011) are NOT here — their official
PDFs are download-blocked, so they are drawn (editable) at runtime by pdf-lib.

Run:  python3 scripts/build_templates.py
"""
import io
import os

from pypdf import PdfReader, PdfWriter

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, "form-templates")
OUT = os.path.join(ROOT, "public", "form-templates")


def clean(path):
    r = PdfReader(path)
    if r.is_encrypted:
        r.decrypt("")
    w = PdfWriter(clone_from=r)
    acro = w._root_object.get("/AcroForm")
    if acro is not None and "/XFA" in acro.get_object():
        del acro.get_object()["/XFA"]
    buf = io.BytesIO()
    w.write(buf)
    buf.seek(0)
    return buf


def build(order, out_name):
    master = PdfWriter()
    for f in order:
        master.append(PdfReader(clean(os.path.join(SRC, f + ".pdf"))))
    master.set_need_appearances_writer(True)
    os.makedirs(OUT, exist_ok=True)
    out_path = os.path.join(OUT, out_name)
    with open(out_path, "wb") as fo:
        master.write(fo)
    print(f"wrote {out_path}  pages={len(master.pages)}")


if __name__ == "__main__":
    build(["fl100", "fl110", "fl105", "fl142", "fl150", "fl140", "fl115"], "packet-children.pdf")
    build(["fl100", "fl110", "fl142", "fl150", "fl140", "fl115"], "packet-no-children.pdf")
