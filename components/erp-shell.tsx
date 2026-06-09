import Link from "next/link";
import type { ReactNode } from "react";

type ErpShellProps = {
  active: "dashboard" | "operacao" | "funcionarios" | "financeiro";
  children: ReactNode;
};

const navigation = [
  { key: "dashboard", label: "Dashboard", href: "/dashboard" },
  { key: "operacao", label: "Operação", href: "/operacao" },
  { key: "funcionarios", label: "Funcionários", href: "/funcionarios" },
  { key: "financeiro", label: "Financeiro", href: "/financeiro" },
] as const;

export function ErpShell({ active, children }: ErpShellProps) {
  return (
    <main className="min-h-screen bg-black text-slate-50">
      <div className="flex min-h-screen">
        <aside className="hidden w-64 shrink-0 border-r border-yellow-950/70 bg-zinc-950 lg:flex lg:flex-col">
          <div className="flex h-16 items-center gap-3 border-b border-yellow-950/70 px-4">
            <div className="grid size-10 place-items-center rounded-lg bg-gradient-to-br from-yellow-300 to-yellow-700 text-black">
              <SignalIcon className="size-5" />
            </div>
            <div>
              <p className="text-lg font-extrabold leading-none text-yellow-400">AYRONEX</p>
              <p className="mt-1.5 text-[10px] tracking-[0.18em] text-slate-400">ERP OPERACIONAL</p>
            </div>
          </div>

          <nav className="flex flex-1 flex-col gap-1 px-3 py-4">
            {navigation.map((item) => (
              <Link
                className={`rounded-lg px-3 py-3 text-sm font-semibold transition ${
                  active === item.key
                    ? "border border-yellow-500/30 bg-yellow-500/10 text-yellow-400"
                    : "text-slate-400 hover:bg-white/5 hover:text-slate-100"
                }`}
                href={item.href}
                key={item.key}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <form action="/api/auth/logout" method="post" className="px-3 pb-4">
            <button className="w-full rounded-lg px-3 py-3 text-left text-sm font-semibold text-slate-400 transition hover:bg-white/5 hover:text-slate-100">
              Sair
            </button>
          </form>
        </aside>

        <section className="min-w-0 flex-1">
          <header className="sticky top-0 z-20 flex min-h-16 flex-col gap-3 border-b border-yellow-950/70 bg-black/90 px-4 py-3 backdrop-blur-xl md:flex-row md:items-center md:justify-between lg:px-6">
            <div className="flex items-center gap-3 lg:hidden">
              <div className="grid size-10 place-items-center rounded-lg bg-gradient-to-br from-yellow-300 to-yellow-700 text-black">
                <SignalIcon className="size-5" />
              </div>
              <div>
                <p className="text-lg font-extrabold leading-none text-yellow-400">AYRONEX</p>
                <p className="mt-1 text-[10px] tracking-[0.18em] text-slate-400">ERP OPERACIONAL</p>
              </div>
            </div>

            <nav className="flex flex-wrap gap-2 lg:hidden">
              {navigation.map((item) => (
                <Link
                  className={`rounded-lg px-3 py-2 text-xs font-semibold ${
                    active === item.key
                      ? "bg-yellow-500/10 text-yellow-400"
                      : "bg-white/5 text-slate-300"
                  }`}
                  href={item.href}
                  key={item.key}
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            <div className="hidden text-right md:block">
              <p className="text-sm font-bold">Administrador</p>
              <p className="mt-1 text-xs text-slate-400">admin@ayronex.com</p>
            </div>
          </header>

          <div className="px-4 py-6 lg:px-6">{children}</div>
        </section>
      </div>
    </main>
  );
}

function SignalIcon({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.8"
      viewBox="0 0 24 24"
    >
      <path d="M5 13a10 10 0 0 1 14 0" />
      <path d="M8.5 16.5a5 5 0 0 1 7 0" />
      <path d="M12 20h.01" />
    </svg>
  );
}
