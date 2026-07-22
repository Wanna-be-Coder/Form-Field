import PetitionForm from "@/components/petition-form";

export default function PetitionPage() {
  return (
    <main className="min-h-screen bg-slate-100 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-7xl">
        <PetitionForm />
      </div>
    </main>
  );
}
