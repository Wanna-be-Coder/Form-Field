import PacketForm from "@/components/packet-form";

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-100 px-4 py-6 dark:bg-slate-950 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-5xl">
        <PacketForm />
      </div>
    </main>
  );
}
