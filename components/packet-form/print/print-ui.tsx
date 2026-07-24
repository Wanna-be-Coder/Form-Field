import { ReactNode } from "react";

// Building blocks that make the on-screen preview and the printed output look
// like the Judicial Council / Riverside court forms. Deliberately plain: black
// text on white, serif type, boxes and underlines — not the app's design system.

export function FormPage({
  formNo,
  title,
  footer,
  children,
}: {
  formNo?: string;
  title?: string;
  footer?: ReactNode;
  children: ReactNode;
}) {
  return (
    <article className="packet-page">
      <div className="packet-page__inner">
        {(formNo || title) && (
          <div className="mb-2 flex items-start justify-between gap-4">
            <h3 className="text-[13px] font-bold uppercase tracking-wide">{title}</h3>
            {formNo ? <span className="text-[13px] font-bold">{formNo}</span> : null}
          </div>
        )}
        {children}
        {footer ? <div className="packet-page__footer">{footer}</div> : null}
      </div>
    </article>
  );
}

export function Box({ checked, label }: { checked?: boolean; label?: ReactNode }) {
  return (
    <span className="packet-box">
      <span className="packet-box__mark" aria-hidden>
        {checked ? "☒" : "☐"}
      </span>
      {label ? <span>{label}</span> : null}
    </span>
  );
}

// A labeled value on an underlined line, e.g. "Date of marriage: __01/02/2020__".
export function Line({
  label,
  value,
  className = "",
}: {
  label?: ReactNode;
  value?: ReactNode;
  className?: string;
}) {
  return (
    <span className={`packet-line ${className}`}>
      {label ? <span className="packet-line__label">{label}</span> : null}
      <span className="packet-line__value">{value || " "}</span>
    </span>
  );
}

export function Row({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`packet-row ${className}`}>{children}</div>;
}

export function Rule() {
  return <hr className="packet-rule" />;
}

export function SectionTitle({ n, children }: { n?: string | number; children: ReactNode }) {
  return (
    <p className="packet-section-title">
      {n != null ? <span className="mr-1 font-bold">{n}.</span> : null}
      <span className="font-bold uppercase">{children}</span>
    </p>
  );
}

// Bordered header block used at the top of the Judicial Council forms.
export function CourtHeader({
  formNo,
  county = "SUPERIOR COURT OF CALIFORNIA, COUNTY OF RIVERSIDE",
  courtAddress,
  petitioner,
  respondent,
  otherParty,
  caseNumber,
  attorneyName,
  attorneyAddress,
  attorneyPhone,
  attorneyEmail,
  titleBlock,
  confidential,
}: {
  formNo: string;
  county?: string;
  courtAddress?: string;
  petitioner?: string;
  respondent?: string;
  otherParty?: string;
  caseNumber?: string;
  attorneyName?: string;
  attorneyAddress?: string;
  attorneyPhone?: string;
  attorneyEmail?: string;
  titleBlock?: ReactNode;
  confidential?: boolean;
}) {
  return (
    <div className="packet-header">
      <div className="flex justify-end text-[13px] font-bold">{formNo}</div>
      <div className="grid grid-cols-2 border border-black">
        <div className="border-r border-black p-1.5 text-[10px] leading-tight">
          <div className="font-semibold">PARTY WITHOUT ATTORNEY OR ATTORNEY:</div>
          <div className="mt-0.5 min-h-[42px] whitespace-pre-line">
            {attorneyName || ""}
            {attorneyAddress ? `\n${attorneyAddress}` : ""}
          </div>
          <div>TELEPHONE NO.: {attorneyPhone || ""}</div>
          <div>E-MAIL ADDRESS: {attorneyEmail || ""}</div>
          <div>ATTORNEY FOR (name): Self-Represented</div>
        </div>
        <div className="p-1.5 text-[10px]">
          <div className="text-center font-semibold italic">FOR COURT USE ONLY</div>
          {confidential ? (
            <div className="mt-6 inline-block bg-black px-2 py-0.5 font-bold text-white">
              CONFIDENTIAL
            </div>
          ) : null}
        </div>
      </div>
      <div className="border border-t-0 border-black p-1.5 text-[10px] leading-tight">
        <div className="font-semibold">{county}</div>
        {courtAddress ? <div>{courtAddress}</div> : null}
      </div>
      <div className="grid grid-cols-2 border border-t-0 border-black">
        <div className="border-r border-black p-1.5 text-[10px] leading-tight">
          <div>PETITIONER: {petitioner || ""}</div>
          <div>RESPONDENT: {respondent || ""}</div>
          {otherParty !== undefined ? <div>OTHER PARTY: {otherParty}</div> : null}
        </div>
        <div className="p-1.5 text-[10px]">CASE NUMBER: {caseNumber || ""}</div>
      </div>
      {titleBlock ? (
        <div className="border border-t-0 border-black p-1.5 text-center text-[12px] font-bold uppercase">
          {titleBlock}
        </div>
      ) : null}
    </div>
  );
}

// Signature block with typed name, date, and the penalty-of-perjury declaration.
export function SignatureBlock({
  name,
  date,
  role = "SIGNATURE",
  declaration = true,
}: {
  name?: string;
  date?: string;
  role?: string;
  declaration?: boolean;
}) {
  return (
    <div className="packet-signature">
      {declaration ? (
        <p className="mt-3 text-[11px]">
          I declare under penalty of perjury under the laws of the State of California that the
          foregoing is true and correct.
        </p>
      ) : null}
      <div className="mt-3 grid grid-cols-2 gap-6 text-[11px]">
        <div>
          <div>Date: {date || ""}</div>
          <div className="mt-4 border-t border-black pt-0.5 text-center text-[9px] uppercase">
            {name ? <span className="text-[12px] normal-case">{name}</span> : " "}
            <div>(Type or print name)</div>
          </div>
        </div>
        <div className="self-end">
          <div className="mt-4 border-t border-black pt-0.5 text-center text-[9px] uppercase">
            {name ? <span className="text-[12px] normal-case italic">{name}</span> : " "}
            <div>({role})</div>
          </div>
        </div>
      </div>
    </div>
  );
}
