import { PDFDocument } from "pdf-lib";
import type { PacketFormData } from "@/lib/types/packet.types";
import { PdfBuilder } from "./PdfBuilder";
import { fillFL100 } from "./fill/fl100";
import { fillFL110 } from "./fill/fl110";
import { fillFL105 } from "./fill/fl105";
import { fillFL142 } from "./fill/fl142";
import { fillFL150 } from "./fill/fl150";
import { fillFL140 } from "./fill/fl140";
import { fillFL115 } from "./fill/fl115";
import { drawRIFL036 } from "./forms/rifl036";
import { drawRIFL011 } from "./forms/rifl011";

// Builds the combined, EDITABLE packet by filling the real Judicial Council form
// templates (bundled, pre-decrypted, XFA-dropped) in the browser with pdf-lib,
// then appending the two Riverside local forms as editable pages. Runs fully
// client-side — no server, so it deploys anywhere (e.g. Vercel).
export async function generatePacketPdf(data: PacketFormData): Promise<Uint8Array> {
  const hasChildren = data.intake.hasMinorChildren;
  const templateUrl = hasChildren
    ? "/form-templates/packet-children.pdf"
    : "/form-templates/packet-no-children.pdf";

  const res = await fetch(templateUrl);
  if (!res.ok) {
    throw new Error(`Could not load the form template (${res.status}).`);
  }
  const templateBytes = await res.arrayBuffer();

  const doc = await PDFDocument.load(templateBytes);
  const form = doc.getForm();

  // Fill the official Judicial Council forms in place.
  fillFL100(form, data);
  fillFL110(form, data);
  if (hasChildren) fillFL105(form, data);
  fillFL142(form, data);
  fillFL150(form, data);
  fillFL140(form, data);
  fillFL115(form, data);

  // Append the Riverside LOCAL forms (RI-FL036, RI-FL011) as editable pages —
  // their official PDFs aren't publicly downloadable, so we render them.
  const builder = await PdfBuilder.attach(doc);
  drawRIFL036(builder, data);
  builder.newPage();
  drawRIFL011(builder, data);

  return doc.save();
}
