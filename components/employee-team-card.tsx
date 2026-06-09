import type { Employee, EmployeeTeam } from "@/lib/types";

type EmployeeTeamCardProps = {
  team: EmployeeTeam;
  employees: Employee[];
  onToggleStatus: (employee: Employee) => void;
};

const teamAccent: Record<EmployeeTeam, string> = {
  Operação: "from-emerald-400/20 to-emerald-950/20 text-emerald-300 ring-emerald-500/20",
  Financeiro: "from-yellow-400/20 to-yellow-950/20 text-yellow-300 ring-yellow-500/20",
  Vendas: "from-sky-400/20 to-sky-950/20 text-sky-300 ring-sky-500/20",
  Atendimento: "from-purple-400/20 to-purple-950/20 text-purple-300 ring-purple-500/20",
};

export function EmployeeTeamCard({ team, employees, onToggleStatus }: EmployeeTeamCardProps) {
  const activeEmployees = employees.filter((employee) => employee.status === "Ativo").length;

  return (
    <section className="rounded-2xl border border-yellow-950/60 bg-zinc-950/80 p-5 shadow-2xl shadow-black/30">
      <div className="flex flex-col gap-3 border-b border-white/10 pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Equipe</p>
          <h2 className="mt-1 text-xl font-bold text-white">{team}</h2>
        </div>

        <div className={`rounded-xl bg-gradient-to-br px-4 py-2 text-sm font-bold ring-1 ${teamAccent[team]}`}>
          {activeEmployees} ativos / {employees.length} total
        </div>
      </div>

      <div className="mt-4 space-y-3">
        {employees.length === 0 ? (
          <div className="rounded-xl border border-dashed border-white/10 bg-black/30 p-4 text-sm text-slate-500">
            Nenhum funcionário cadastrado nesta equipe.
          </div>
        ) : (
          employees.map((employee) => (
            <article
              className="flex flex-col gap-3 rounded-xl border border-white/10 bg-black/35 p-4 sm:flex-row sm:items-center sm:justify-between"
              key={employee.id}
            >
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-bold text-slate-100">{employee.nome}</h3>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${
                      employee.status === "Ativo"
                        ? "bg-emerald-500/10 text-emerald-300"
                        : "bg-slate-500/10 text-slate-400"
                    }`}
                  >
                    {employee.status}
                  </span>
                </div>
                <p className="mt-1 text-sm text-slate-400">{employee.cargo}</p>
                <p className="mt-1 text-xs text-slate-500">Admissão: {formatDate(employee.dataAdmissao)}</p>
              </div>

              <button
                className="rounded-lg border border-white/10 px-3 py-2 text-xs font-bold text-slate-300 transition hover:border-yellow-500/40 hover:bg-yellow-500/10 hover:text-yellow-300"
                onClick={() => onToggleStatus(employee)}
                type="button"
              >
                {employee.status === "Ativo" ? "Inativar" : "Ativar"}
              </button>
            </article>
          ))
        )}
      </div>
    </section>
  );
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat("pt-BR", { timeZone: "UTC" }).format(new Date(`${date}T00:00:00Z`));
}
