// Generate the full editable packet PDF with sample data, write it to /public
// as a demo, and report page/field counts so we can confirm it's fillable.
import { writeFileSync, mkdirSync } from "node:fs";
import { PDFDocument } from "pdf-lib";
import { generatePacketPdf } from "../lib/pdf/generatePacketPdf";
import { sampleData } from "../lib/pdf/sampleData";

async function main() {
  const bytes = await generatePacketPdf(sampleData);

  mkdirSync("public", { recursive: true });
  const out = "public/demo-editable-packet.pdf";
  writeFileSync(out, bytes);

  const reloaded = await PDFDocument.load(bytes);
  const fields = reloaded.getForm().getFields();
  const texts = fields.filter((f) => f.constructor.name === "PDFTextField");
  const boxes = fields.filter((f) => f.constructor.name === "PDFCheckBox");
  const filled = texts.filter((f) => (f as unknown as { getText(): string }).getText?.()).length;
  const checked = boxes.filter((f) => (f as unknown as { isChecked(): boolean }).isChecked()).length;

  console.log("wrote", out);
  console.log("pages:", reloaded.getPageCount());
  console.log("total editable fields:", fields.length);
  console.log("text fields:", texts.length, "(pre-filled:", filled + ")");
  console.log("checkboxes:", boxes.length, "(checked:", checked + ")");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
