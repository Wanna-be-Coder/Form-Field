import { PDFBool, PDFDocument, PDFName } from "pdf-lib";
import type { PacketFormData } from "@/lib/types/packet.types";
import { fillPacket } from "./fill/packet";

// Fills a copy of the actual Riverside dissolution packet (the exact official
// 22-page fillable PDF) with the user's data, entirely in the browser, and
// returns the bytes. No server — deploys anywhere (e.g. Vercel).
export async function generatePacketPdf(data: PacketFormData): Promise<Uint8Array> {
  const res = await fetch("/form-templates/packet-source.pdf");
  if (!res.ok) {
    throw new Error(`Could not load the packet template (${res.status}).`);
  }
  const doc = await PDFDocument.load(await res.arrayBuffer());
  const form = doc.getForm();

  fillPacket(form, data);

  // Ask viewers to (re)generate field appearances so values — including the
  // choice fields we set via /V — render everywhere. Keeps the form editable.
  try {
    form.acroForm.dict.set(PDFName.of("NeedAppearances"), PDFBool.True);
  } catch {
    // non-fatal
  }

  return doc.save();
}
