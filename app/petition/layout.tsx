import type { Metadata } from "next";
import { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Riverside Dissolution / Legal Separation / Nullity Packet",
  description:
    "Guided Superior Court of California, County of Riverside self-help packet (FL-100, FL-110, FL-105, FL-142, FL-150, FL-140, FL-115 and local forms) built with Next.js, React Hook Form, and Zod. Print or save as PDF.",
};

export default function PetitionLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
