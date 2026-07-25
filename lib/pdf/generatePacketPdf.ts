import type { PacketFormData } from "../types/packet.types";
import { PdfBuilder } from "./PdfBuilder";
import { drawIntake } from "./forms/intake";
import { drawFL110 } from "./forms/fl110";
import { drawFL100 } from "./forms/fl100";
import { drawFL105 } from "./forms/fl105";
import { drawRIFL036 } from "./forms/rifl036";
import { drawRIFL011 } from "./forms/rifl011";
import { drawFL142 } from "./forms/fl142";
import { drawFL150 } from "./forms/fl150";
import { drawFL140 } from "./forms/fl140";
import { drawFL115 } from "./forms/fl115";

type Drawer = (b: PdfBuilder, data: PacketFormData) => void;

// Builds the whole packet as a single editable (AcroForm) PDF. Each form starts
// on its own page; the UCCJEA (FL-105) is included only when there are children.
export async function generatePacketPdf(data: PacketFormData): Promise<Uint8Array> {
  const b = await PdfBuilder.create();

  const forms: Drawer[] = [drawIntake, drawFL110, drawFL100];
  if (data.intake.hasMinorChildren) forms.push(drawFL105);
  forms.push(drawRIFL036, drawRIFL011, drawFL142, drawFL150, drawFL140, drawFL115);

  forms.forEach((draw, index) => {
    if (index > 0) b.newPage();
    draw(b, data);
  });

  return b.save();
}
