import { PacketFormData } from "@/lib/types/packet.types";
import { IntakePrint } from "./IntakePrint";
import { FL100Print } from "./FL100Print";
import { FL110Print } from "./FL110Print";
import { FL105Print } from "./FL105Print";
import { RIFL036Print } from "./RIFL036Print";
import { RIFL011Print } from "./RIFL011Print";
import { FL142Print } from "./FL142Print";
import { FL150Print } from "./FL150Print";
import { FL140Print } from "./FL140Print";
import { FL115Print } from "./FL115Print";

// Assembles every form of the packet into a single print/preview surface.
// Order follows the flow of the Riverside self-help packet.
export function PacketPrint({ data }: { data: PacketFormData }) {
  const hasChildren = data.intake.hasMinorChildren;

  return (
    <div className="packet-print">
      <IntakePrint data={data} />
      <FL110Print data={data} />
      <FL100Print data={data} />
      {hasChildren ? <FL105Print data={data} /> : null}
      <RIFL036Print data={data} />
      <RIFL011Print data={data} />
      <FL142Print data={data} />
      <FL150Print data={data} />
      <FL140Print data={data} />
      <FL115Print data={data} />
    </div>
  );
}
