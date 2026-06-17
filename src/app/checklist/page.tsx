import { ChecklistForm } from "@/components/checklist-form";

export default function ChecklistPage() {
  return (
    <main className="mx-auto min-h-screen max-w-7xl px-6 py-8">
      <header className="mb-8 flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-zinc-800 bg-zinc-900/70 px-6 py-5">
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-amber-400">Ayronex Checklist</p>
          <h1 className="mt-2 text-2xl font-semibold text-white">Portal do fiscal</h1>
          <p className="mt-1 text-sm text-zinc-400">Acesso protegido por autenticação básica.</p>
        </div>
      </header>

      <ChecklistForm />
    </main>
  );
}
