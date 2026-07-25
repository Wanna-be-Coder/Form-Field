import { COURTHOUSES } from "@/lib/constants/packet.constants";
import type { IntakeData } from "@/lib/types/packet.types";
import {
  fullName,
  petitionerName,
  respondentName,
  toCourtDate,
  formatCurrency,
} from "@/lib/utils/packet-helpers";

// Re-export the shared helpers under the names the fillers use (mirrors the
// Python helpers module so the ports read 1:1).
export { fullName, petitionerName, respondentName };
export const courtDate = toCourtDate;
export const currency = formatCurrency;

export function court(intake: IntakeData) {
  return intake.courthouse ? COURTHOUSES[intake.courthouse] : undefined;
}

export function courtAddressLine(intake: IntakeData): string {
  const c = court(intake);
  return c ? `${c.address}, ${c.cityStateZip}` : "";
}

export function petitionerAddress(intake: IntakeData): string {
  const cityStateZip = [intake.petitionerCity, intake.petitionerState, intake.petitionerZip]
    .filter(Boolean)
    .join(", ");
  return [intake.petitionerStreet, cityStateZip].filter(Boolean).join(", ");
}
