"use client";

import { FormEvent, useMemo, useState } from "react";
import { EmployeeTeamCard } from "@/components/employee-team-card";
import { ErpShell } from "@/components/erp-shell";
import { createId, useErpData } from "@/hooks/use-erp-data";
import type { Employee, EmployeeStatus, EmployeeTeam } from "@/lib/types";

const teams: EmployeeTeam[] = ["Operação", "Financeiro", "Vendas", "Atendimento"];
const statuses: EmployeeStatus[] = ["Ativo", "Inativo"];

const initialForm = {
  nome: "",
  cargo: "",
  equipe: "Operação" as EmployeeTeam,
  status: "Ativo" as EmployeeStatus,
  dataAdmissao: new Date().toISOString().slice(0, 10),
};

export default function FuncionariosPage() {
  const { data, addEmployee, updateEmployee } = useErpData();
  const [form, setForm] = useState(initialForm);
  const [feedback, setFeedback] = useState("");

  const groupedTeams = useMemo(
    () =>
      teams.map((team) => {
        const employees = data.employees.filter((employee) => employee.equipe === team);
        return {
          team,
          employees,
          activeCount: employees.filter((employee) => employee.status === "Ativo").length,
        };
      }),
    [data.employees],
  );

  const totalEmployees = data.employees.length;
  const activeEmployees = data.employees.filter((employee) => employee.status === "Ativo").length;
  const inactiveEmployees = totalEmployees - activeEmployees;

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!form.nome.trim() || !form.cargo.trim()) {
      setFeedback("Preencha nome e cargo para cadastrar o funcionário.");
      return;
    }

    addEmployee({
      id: createId("emp"),
      nome: form.nome.trim(),
      cargo: form.cargo.trim(),
      equipe: form.equipe,
      status: form.status,
      dataAdmissao: form.dataAdmissao,
    });

    setForm(initialForm);
    setFeedback("Funcionário cadastrado com sucesso.");
  }

  function handleToggleStatus(employee: Employee) {
    updateEmployee({
      ...employee,
      status: employee.status === "Ativo" ? "Inativo" : "Ativo",
    });
  }

  return (
    <ErpShell active="funcionarios">
      <div className="space-y-6">
        <section className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-yellow-500">Gestão de equipes</p>
            <h1 className="mt-2 text-3xl font-extrabold text-white">Funcionários</h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-400">
              Controle operacional por equipe, com dados locais prontos para futura integração com Google Sheets.
            </p>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-4">
          <SummaryCard label="Total cadastrado" value={totalEmployees.toString()} />
          <SummaryCard label="Funcionários ativos" value={activeEmployees.toString()} tone="green" />
          <SummaryCard label="Funcionários inativos" value={inactiveEmployees.toString()} tone="slate" />
          <SummaryCard label="Equipes" value={teams.length.toString()} tone="yellow" />
        </section>

        <section className="grid gap-6 xl:grid-cols-[380px_1fr]">
          <form
            className="h-fit rounded-2xl border border-yellow-950/60 bg-zinc-950/80 p-5 shadow-2xl shadow-black/30"
            onSubmit={handleSubmit}
          >
            <div className="border-b border-white/10 pb-4">
              <h2 className="text-lg font-bold text-white">Novo funcionário</h2>
              <p className="mt-1 text-sm text-slate-400">Cadastro rápido salvo no navegador para validação.</p>
            </div>

            <div className="mt-4 space-y-4">
              <label className="block">
                <span className="text-sm font-semibold text-slate-300">Nome</span>
                <input
                  className="mt-2 w-full rounded-xl border border-white/10 bg-black/50 px-3 py-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-yellow-500/60"
                  onChange={(event) => setForm((current) => ({ ...current, nome: event.target.value }))}
                  placeholder="Ex: Maria Santos"
                  value={form.nome}
                />
              </label>

              <label className="block">
                <span className="text-sm font-semibold text-slate-300">Cargo</span>
                <input
                  className="mt-2 w-full rounded-xl border border-white/10 bg-black/50 px-3 py-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-yellow-500/60"
                  onChange={(event) => setForm((current) => ({ ...current, cargo: event.target.value }))}
                  placeholder="Ex: Técnico de Fibra"
                  value={form.cargo}
                />
              </label>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="text-sm font-semibold text-slate-300">Equipe</span>
                  <select
                    className="mt-2 w-full rounded-xl border border-white/10 bg-black/50 px-3 py-3 text-sm text-white outline-none transition focus:border-yellow-500/60"
                    onChange={(event) =>
                      setForm((current) => ({ ...current, equipe: event.target.value as EmployeeTeam }))
                    }
                    value={form.equipe}
                  >
                    {teams.map((team) => (
                      <option key={team}>{team}</option>
                    ))}
                  </select>
                </label>

                <label className="block">
                  <span className="text-sm font-semibold text-slate-300">Status</span>
                  <select
                    className="mt-2 w-full rounded-xl border border-white/10 bg-black/50 px-3 py-3 text-sm text-white outline-none transition focus:border-yellow-500/60"
                    onChange={(event) =>
                      setForm((current) => ({ ...current, status: event.target.value as EmployeeStatus }))
                    }
                    value={form.status}
                  >
                    {statuses.map((status) => (
                      <option key={status}>{status}</option>
                    ))}
                  </select>
                </label>
              </div>

              <label className="block">
                <span className="text-sm font-semibold text-slate-300">Data de admissão</span>
                <input
                  className="mt-2 w-full rounded-xl border border-white/10 bg-black/50 px-3 py-3 text-sm text-white outline-none transition focus:border-yellow-500/60"
                  onChange={(event) => setForm((current) => ({ ...current, dataAdmissao: event.target.value }))}
                  type="date"
                  value={form.dataAdmissao}
                />
              </label>

              {feedback ? (
                <p className="rounded-xl border border-yellow-500/20 bg-yellow-500/10 px-3 py-2 text-sm text-yellow-200">
                  {feedback}
                </p>
              ) : null}

              <button
                className="w-full rounded-xl bg-yellow-500 px-4 py-3 text-sm font-extrabold text-black transition hover:bg-yellow-400"
                type="submit"
              >
                Cadastrar funcionário
              </button>
            </div>
          </form>

          <div className="grid gap-4">
            {groupedTeams.map(({ team, employees, activeCount }) => (
              <div key={team} className="relative">
                <EmployeeTeamCard employees={employees} onToggleStatus={handleToggleStatus} team={team} />
                <span className="absolute right-5 top-5 hidden rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-300 md:inline-flex">
                  {activeCount} ativos
                </span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </ErpShell>
  );
}

function SummaryCard({ label, value, tone = "default" }: { label: string; value: string; tone?: "default" | "green" | "slate" | "yellow" }) {
  const tones = {
    default: "text-white",
    green: "text-emerald-300",
    slate: "text-slate-300",
    yellow: "text-yellow-300",
  };

  return (
    <article className="rounded-2xl border border-yellow-950/60 bg-zinc-950/80 p-5 shadow-2xl shadow-black/30">
      <p className="text-sm font-semibold text-slate-400">{label}</p>
      <p className={`mt-3 text-3xl font-extrabold ${tones[tone]}`}>{value}</p>
    </article>
  );
}
