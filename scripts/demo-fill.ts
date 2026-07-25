// Mirrors lib/pdf/generatePacketPdf.ts but reads the bundled packet from disk
// (Node has no fetch to /public). Fills it, writes a demo, verifies values.
import { readFileSync, writeFileSync } from "node:fs";
import { PDFBool, PDFDocument, PDFName } from "pdf-lib";
import { sampleData } from "../lib/pdf/sampleData";
import { fillPacket } from "../lib/pdf/fill/packet";

async function main() {
  const doc = await PDFDocument.load(readFileSync("public/form-templates/packet-source.pdf"));
  const form = doc.getForm();
  fillPacket(form, sampleData);
  try { form.acroForm.dict.set(PDFName.of("NeedAppearances"), PDFBool.True); } catch {}
  const out = await doc.save();
  writeFileSync("public/demo-official-filled-packet.pdf", out);

  const re = await PDFDocument.load(out);
  const fields = re.getForm().getFields();
  let textFilled = 0, checked = 0;
  for (const f of fields) {
    const t = f.constructor.name;
    if (t === "PDFTextField") { try { if ((f as unknown as { getText(): string }).getText()) textFilled++; } catch {} }
  }
  console.log("wrote public/demo-official-filled-packet.pdf");
  console.log("pages:", re.getPageCount(), "| fields:", fields.length, "| text pre-filled:", textFilled);
}
main().catch((e) => { console.error(e); process.exit(1); });
