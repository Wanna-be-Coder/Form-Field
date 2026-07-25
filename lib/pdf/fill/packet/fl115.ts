import type { PDFForm } from "pdf-lib";
import type { PacketFormData } from "@/lib/types/packet.types";
import { setText, check } from "../util";
import { courtDate, currency } from "../helpers";

// FL-115 Proof of Service of Summons — packet pages 20/21 (0-based).
//
// Several of this form's checkboxes (the item 3 "personal" / "substituted" /
// "mail" method selectors, plus the item 5 perjury declaration box) share
// their AcroForm field name with an unrelated widget elsewhere in the packet
// (see form-templates/packet.shared-fields.json: CheckBox15/16/17/18/19/33).
// Checking them here would also check whatever they're reused for elsewhere,
// so — per the header/shared-field rule — they are intentionally left alone.
// Only the fields that are unique to pages 20/21 are filled below.
export function fillFL115Body(form: PDFForm, data: PacketFormData): void {
  const { fl115: fl } = data;

  // --- Item 1: copies served (always Family Law petition + the standard
  // attachments this packet produces: FL-140/FL-142/FL-150). ---
  check(form, "CheckBox13121375"); // a. Family Law (FL-100/FL-110/FL-120)
  check(form, "CheckBox9121375"); // d. (attachments follow)
  check(form, "CheckBox7777777777777777"); // (2) Declaration of Disclosure (FL-140)
  check(form, "CheckBox6"); // (3) Schedule of Assets and Debts (FL-142)
  check(form, "CheckBox5"); // (4) Income and Expense Declaration (FL-150)
  // Note: sub-item (1) UCCJEA (FL-105) has no field of its own on this page
  // (dropped in the merge) so it can't be checked without inventing a name.
  // Sub-items (5)-(8) (FL-155/FL-160/FL-300/Other) aren't part of this
  // packet's document set and are left unchecked.

  // --- Item 2: address where respondent was served. ---
  setText(form, "FillText53", fl.addressServed);

  // --- Item 3: method of service. Method checkboxes are shared fields
  // (skipped, see comment above) — only the date/time fields are unique. ---
  if (fl.serviceMethod === "personal") {
    setText(form, "FillText55121379", fl.serviceTime); // at (time)
    // Personal service's date field (FillText54) is also shared — skipped.
  } else if (fl.serviceMethod === "substituted") {
    setText(form, "FillText60", courtDate(fl.serviceDate)); // on (date)
    setText(form, "FillText61", fl.serviceTime); // at (time)
  } else if (fl.serviceMethod === "mail") {
    setText(form, "FillText63", courtDate(fl.serviceDate)); // on (date)
    // Mail service's "from (city)" field (FillText64) isn't in FL115Data.
  }

  // --- Item 4: person who served papers. ---
  setText(form, "FillText66", fl.serverName);
  setText(form, "FillText67", fl.serverAddress);
  setText(form, "FillText69", fl.serverPhone);

  if (fl.serverIsRegistered) {
    check(form, "CheckBoxregistered"); // c. a registered California process server
    setText(form, "FillText72", fl.serverRegistrationNo);
    setText(form, "FillText73", fl.serverCounty);
    setText(form, "FillText74", currency(fl.serverFee));
  } else {
    check(form, "CheckBoxnot registered"); // b. not a registered California process server
  }

  // --- Item 5 (declaration) checkbox is shared (skipped, see comment above). ---

  // --- Signature block: the SERVER's name (not the petitioner) + date. ---
  setText(form, "NAME_OF_PERSON_WHO_SERVED_PAPERS", fl.serverName);
  setText(form, "FillText75newbox", courtDate(fl.date));
}
