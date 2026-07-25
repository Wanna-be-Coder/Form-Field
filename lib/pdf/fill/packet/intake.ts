import type { PDFForm } from "pdf-lib";
import type { PacketFormData } from "@/lib/types/packet.types";
import { setText, check, selectChoice } from "../util";
import { petitionerName, respondentName, fullName, courtDate } from "../helpers";

// The packet's intake cover (page 2). Most of these fields are SHARED across the
// downstream forms (e.g. FillText9 = petitioner name appears on 18 pages), so
// filling them here propagates the common data into every form automatically.
const CASE_TYPE_CHOICE: Record<string, string> = {
  dissolution: "Choice1",
  legalSeparation: "Choice2",
  nullity: "Choice3",
};

// Courthouse checkbox names (the packet predates the Menifee rename — its 3rd
// box is still named "Hemet").
const COURT_CB: Record<string, string> = {
  riverside: "Check BoxRiverside",
  indio: "Check BoxIndio",
  menifee: "Check BoxHemet",
  blythe: "Check BoxBlythe",
};

export function fillIntake(form: PDFForm, data: PacketFormData): void {
  const { intake } = data;

  // Your information (shared everywhere).
  setText(form, "FillText9", petitionerName(intake));
  setText(form, "FillText1", intake.petitionerStreet);
  setText(
    form,
    "FillText2",
    [intake.petitionerCity, intake.petitionerState, intake.petitionerZip].filter(Boolean).join(", "),
  );
  setText(form, "FillText155", intake.petitionerPhone);
  setText(form, "FillText6", respondentName(intake));
  setText(form, "FillTextcaseno", intake.caseNumber);

  // Attorney/self-represented block repeated in the downstream form headers.
  setText(form, "FillText154", "Self-Represented");
  setText(form, "FillText158", intake.petitionerPhone);
  setText(form, "FillText146", intake.petitionerEmail);

  // Type of case (cross-page choice → also checks FL-100 "Petition For").
  selectChoice(form, "TypeofCase", CASE_TYPE_CHOICE[intake.caseType] ?? "");

  // Date of marriage.
  setText(form, "FillText143", courtDate(intake.marriageDate));

  // Minor children: Yes = Choice1, No = Choice2.
  selectChoice(form, "MinorChildrenYesNo", intake.hasMinorChildren ? "Choice1" : "Choice2");
  if (intake.hasMinorChildren) {
    setText(form, "HowManyChildren", intake.numberOfChildren);
    const c = intake.children;
    const slots: Array<[string, string, string, string]> = [
      ["FillText139", "FillText87", "FillText138", "FillText137"],
      ["FillText135", "FillText6different", "FillText134", "FillText133"],
      ["NameChild3", "POBChild3", "DOBChild3", "AgeChild3"],
    ];
    slots.forEach(([nm, pob, dob, age], i) => {
      const child = c[i];
      if (!child) return;
      setText(form, nm, fullName(child.firstName, child.middleName, child.lastName));
      setText(form, pob, child.placeOfBirth);
      setText(form, dob, courtDate(child.dateOfBirth));
      setText(form, age, child.age);
    });
  }

  // Where is your case filed?
  const cb = intake.courthouse ? COURT_CB[intake.courthouse] : undefined;
  if (cb) check(form, cb);

  // Filing options: in person = Choice1, online = Choice2.
  if (intake.filingOption === "inPerson") selectChoice(form, "Group1", "Choice1");
  else if (intake.filingOption === "online") {
    selectChoice(form, "Group1", "Choice2");
    setText(form, "Signature", intake.electronicSignatureName);
  }

  // Today's date.
  setText(form, "date", courtDate(intake.todaysDate));
}
