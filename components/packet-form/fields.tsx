"use client";

import { ReactNode } from "react";
import { useController, useFormContext } from "react-hook-form";

// Read a nested error message (e.g. "intake.children.0.firstName") off RHF state.
function getNested(obj: unknown, path: string): unknown {
  return path.split(".").reduce<unknown>((acc, key) => {
    if (acc && typeof acc === "object") {
      return (acc as Record<string, unknown>)[key];
    }
    return undefined;
  }, obj);
}

function useFieldError(name: string): string | undefined {
  const {
    formState: { errors },
  } = useFormContext();
  const node = getNested(errors, name) as { message?: string } | undefined;
  return node?.message;
}

const inputClass =
  "block w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 shadow-sm transition focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-100 disabled:cursor-not-allowed disabled:bg-slate-100 dark:border-slate-600 dark:bg-slate-900 dark:text-white dark:placeholder-slate-500 dark:focus:border-sky-400 dark:focus:ring-sky-900/60";

export function Field({
  name,
  label,
  hint,
  required,
  children,
  className = "",
}: {
  name: string;
  label?: string;
  hint?: ReactNode;
  required?: boolean;
  children: ReactNode;
  className?: string;
}) {
  const error = useFieldError(name);
  return (
    <div className={`space-y-1.5 ${className}`}>
      {label ? (
        <label htmlFor={name} className="block text-sm font-medium text-slate-800 dark:text-slate-100">
          {label}
          {required ? <span className="ml-0.5 text-rose-500">*</span> : null}
        </label>
      ) : null}
      {children}
      {hint ? <p className="text-xs leading-5 text-slate-500 dark:text-slate-400">{hint}</p> : null}
      {error ? <p className="text-xs font-medium text-rose-600 dark:text-rose-400">{error}</p> : null}
    </div>
  );
}

export function Text({
  name,
  placeholder,
  type = "text",
  inputMode,
}: {
  name: string;
  placeholder?: string;
  type?: string;
  inputMode?: "text" | "numeric" | "tel" | "email" | "decimal";
}) {
  const { field } = useController({ name });
  return (
    <input
      {...field}
      id={name}
      value={field.value ?? ""}
      type={type}
      inputMode={inputMode}
      placeholder={placeholder}
      className={inputClass}
    />
  );
}

export function TextArea({
  name,
  placeholder,
  rows = 3,
}: {
  name: string;
  placeholder?: string;
  rows?: number;
}) {
  const { field } = useController({ name });
  return (
    <textarea
      {...field}
      id={name}
      value={field.value ?? ""}
      rows={rows}
      placeholder={placeholder}
      className={inputClass}
    />
  );
}

export function DateField({ name }: { name: string }) {
  const { field } = useController({ name });
  return <input {...field} id={name} value={field.value ?? ""} type="date" className={inputClass} />;
}

export function Currency({ name, placeholder = "0.00" }: { name: string; placeholder?: string }) {
  const { field } = useController({ name });
  return (
    <div className="relative">
      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-500 dark:text-slate-400">
        $
      </span>
      <input
        {...field}
        id={name}
        value={field.value ?? ""}
        type="text"
        inputMode="decimal"
        placeholder={placeholder}
        className={`${inputClass} pl-7`}
      />
    </div>
  );
}

export function Select({
  name,
  options,
  placeholder = "— Select —",
}: {
  name: string;
  options: Array<{ label: string; value: string }>;
  placeholder?: string;
}) {
  const { field } = useController({ name });
  return (
    <select {...field} id={name} value={field.value ?? ""} className={inputClass}>
      <option value="">{placeholder}</option>
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}

type Primitive = string | boolean;

// Single-select radio rendered as tappable cards. Works for string or boolean
// values (booleans are matched by identity so "No" = false stays selectable).
export function RadioCards({
  name,
  options,
  columns = 1,
}: {
  name: string;
  options: Array<{ label: string; value: Primitive; description?: string }>;
  columns?: 1 | 2 | 3 | 4;
}) {
  const { field } = useController({ name });
  const colClass = {
    1: "grid-cols-1",
    2: "grid-cols-1 sm:grid-cols-2",
    3: "grid-cols-1 sm:grid-cols-3",
    4: "grid-cols-2 sm:grid-cols-4",
  }[columns];

  return (
    <fieldset className={`grid gap-2.5 ${colClass}`}>
      {options.map((option) => {
        const selected = field.value === option.value;
        return (
          <label
            key={String(option.value)}
            className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3 text-sm transition ${
              selected
                ? "border-sky-500 bg-sky-50 ring-1 ring-sky-500 dark:border-sky-400 dark:bg-sky-950/40"
                : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:hover:border-slate-600"
            }`}
          >
            <input
              type="radio"
              name={name}
              checked={selected}
              onChange={() => field.onChange(option.value)}
              className="mt-0.5 h-4 w-4 shrink-0 border-slate-300 text-sky-600 focus:ring-sky-500"
            />
            <span>
              <span className="block font-medium text-slate-900 dark:text-white">{option.label}</span>
              {option.description ? (
                <span className="mt-0.5 block text-xs text-slate-500 dark:text-slate-400">
                  {option.description}
                </span>
              ) : null}
            </span>
          </label>
        );
      })}
    </fieldset>
  );
}

// Multi-select array of string values.
export function CheckList({
  name,
  options,
  columns = 1,
}: {
  name: string;
  options: Array<{ label: string; value: string; description?: string }>;
  columns?: 1 | 2;
}) {
  const { field } = useController({ name });
  const current: string[] = Array.isArray(field.value) ? field.value : [];
  const colClass = columns === 2 ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-1";

  const toggle = (value: string, checked: boolean) => {
    if (checked) field.onChange([...current, value]);
    else field.onChange(current.filter((v) => v !== value));
  };

  return (
    <fieldset className={`grid gap-2.5 ${colClass}`}>
      {options.map((option) => {
        const checked = current.includes(option.value);
        return (
          <label
            key={option.value}
            className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3 text-sm transition ${
              checked
                ? "border-sky-500 bg-sky-50 dark:border-sky-400 dark:bg-sky-950/40"
                : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:hover:border-slate-600"
            }`}
          >
            <input
              type="checkbox"
              checked={checked}
              onChange={(e) => toggle(option.value, e.target.checked)}
              className="mt-0.5 h-4 w-4 shrink-0 rounded border-slate-300 text-sky-600 focus:ring-sky-500"
            />
            <span>
              <span className="block font-medium text-slate-900 dark:text-white">{option.label}</span>
              {option.description ? (
                <span className="mt-0.5 block text-xs text-slate-500 dark:text-slate-400">
                  {option.description}
                </span>
              ) : null}
            </span>
          </label>
        );
      })}
    </fieldset>
  );
}

// A single boolean checkbox with an inline label (form "check this box" items).
export function CheckboxRow({
  name,
  label,
  hint,
}: {
  name: string;
  label: ReactNode;
  hint?: ReactNode;
}) {
  const { field } = useController({ name });
  return (
    <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 bg-white p-3 text-sm transition hover:border-slate-300 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:hover:border-slate-600">
      <input
        type="checkbox"
        checked={!!field.value}
        onChange={(e) => field.onChange(e.target.checked)}
        className="mt-0.5 h-4 w-4 shrink-0 rounded border-slate-300 text-sky-600 focus:ring-sky-500"
      />
      <span>
        <span className="block font-medium text-slate-900 dark:text-white">{label}</span>
        {hint ? <span className="mt-0.5 block text-xs text-slate-500 dark:text-slate-400">{hint}</span> : null}
      </span>
    </label>
  );
}

// A Yes/No boolean control (used for "Are there minor children?" style toggles).
export function YesNo({ name }: { name: string }) {
  return (
    <RadioCards
      name={name}
      columns={2}
      options={[
        { label: "Yes", value: true },
        { label: "No", value: false },
      ]}
    />
  );
}
