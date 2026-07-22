import type { Metadata } from "next";
import { ReactNode } from "react";

export const metadata: Metadata = {
  title: "California Dissolution Petition | FL-100",
  description: "Responsive California dissolution petition form built with Next.js, React Hook Form, Zod, and Tailwind CSS.",
};

export default function PetitionLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="h-full bg-slate-50 text-slate-900 antialiased">
      <body className="min-h-full bg-slate-50 text-slate-900">{children}</body>
    </html>
  );
}
