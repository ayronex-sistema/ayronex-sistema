"use client";

import { useEffect, useMemo, useState } from "react";
import { EmployeeTeamCard } from "@/components/employee-team-card";
import { ErpShell } from "@/components/erp-shell";
import { createId, useErpData } from "@/hooks/use-erp-data";
import { EMPLOYEE_SHEET_NAME, employeeColumns, normalizeEmployee, type EmployeeColumnKey } from "@/lib/employees";
import type { Employee, EmployeeStatus } from "@/lib/types";

type EmployeesApiResponse = {
  employees?: Employee[];
  error?: string;
  source?: "google-sheets" | "fallback";
  updatedAt?: string;
};

type StatusFilter = "TODOS" | EmployeeStatus;

const yesNoFields = new Set<EmployeeColumnKey>([
  "clt",
  "cracha",
  "cartaoVrVa",
  "nrs1035",
  "possuiNrs",
  "nrsVencido",
  "feriasVencidas",
  "podeTirarFerias",
]);

export default function FuncionariosPage() {
  const { data, empresaAtiva, addEmployee, updateEmployee } = useErpData();
  const [sheetEmployees, setSheetEmployees] = useState<Employee[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState("Carregando funcionários do Google Sheets...");
  const [formFeedback, setFormFeedback] = useState("");
  const [employeeForm, setEmployeeForm] = useState<Record<EmployeeColumnKey, string>>(() => createEmptyEmployeeForm());
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("TODOS");
  const [source, setSource] = useState<"google-sheets" | "fallback">("fallback");
  const [updatedAt, setUpdatedAt] = useState("");

  const fallbackEmployees = useMemo(
    () => data.employees.map((employee, index) => normalizeEmployee(employee, index)),
    [data.employees],
  );

  const employees = useMemo(() => {
    const sourceEmployees = sheetEmployees ?? fallbackEmployees;

    return sourceEmployees.filter((employee) => employee.empresa === empresaAtiva);
  }, [empresaAtiva, fallbackEmployees, sheetEmployees]);

  useEffect(() => {
    let active = true;

    async function loadEmployees() {
      try {
        const response = await fetch("/api/funcionarios", { cache: "no-store" });
        const payload = (await response.json()) as EmployeesApiResponse;

        if (!response.ok || !payload.employees?.length) {
          throw new Error(payload.error ?? "Não foi possível carregar a planilha.");
        }

        if (active) {
          setSheetEmployees(payload.employees.map((employee, index) => normalizeEmployee(employee, index)));
          setSource("google-sheets");
          setUpdatedAt(payload.updatedAt ?? "");
          setFeedback(`Dados carregados da aba ${EMPLOYEE_SHEET_NAME}.`);
        }
      } catch (error) {
        if (active) {
          const message = error instanceof Error ? error.message : "Falha ao carregar Google Sheets.";
          setSource("fallback");
          setFeedback(`${message} Exibindo dados locais de validação.`);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadEmployees();

    return () => {
      active = false;
    };
  }, []);

  const filteredEmployees = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return employees.filter((employee) => {
      const matchesStatus = statusFilter === "TODOS" || employee.situacao === statusFilter;
      const matchesSearch =
        !normalizedSearch ||
        [employee.re, employee.funcionario, employee.cargo, employee.seguimento, employee.equipe, employee.projeto]
          .join(" ")
          .toLowerCase()
          .includes(normalizedSearch);

      return matchesStatus && matchesSearch;
    });
  }, [employees, search, statusFilter]);

  const groupedTeams = useMemo(() => {
    const groups = new Map<string, Employee[]>();

    filteredEmployees.forEach((employee) => {
      const team = employee.equipe || "SEM EQUIPE";
      groups.set(team, [...(groups.get(team) ?? []), employee]);
    });

    return [...groups.entries()]
      .map(([team, teamEmployees]) => ({
        team,
        employees: teamEmployees,
        activeCount: teamEmployees.filter((employee) => employee.situacao === "ATIVO").length,
      }))
      .sort((first, second) => first.team.localeCompare(second.team, "pt-BR"));
  }, [filteredEmployees]);

  const activeEmployees = employees.filter((employee) => employee.situacao === "ATIVO").length;
  const inactiveEmployees = employees.filter((employee) => employee.situacao === "INATIVO").length;
  const teamCount = new Set(employees.map((employee) => employee.equipe || "SEM EQUIPE")).size;

  function handleToggleStatus(employee: Employee) {
    const updatedEmployee: Employee = {
      ...employee,
      situacao: employee.situacao === "ATIVO" ? "INATIVO" : "ATIVO",
    };

    if (sheetEmployees) {
      setSheetEmployees((current) =>
        current?.map((item) => (item.id === employee.id ? updatedEmployee : item)) ?? current,
      );
    } else {
      updateEmployee(updatedEmployee);
    }
  }

  function handleEmployeeFieldChange(key: EmployeeColumnKey, value: string) {
    setEmployeeForm((current) => ({ ...current, [key]: value }));
  }

  async function handleRegisterEmployee(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!employeeForm.re.trim() || !employeeForm.funcionario.trim() || !employeeForm.equipe.trim()) {
      setFormFeedback("Preencha pelo menos RE, Funcionário e EQUIPE para cadastrar.");
      return;
    }

    const newEmployee = normalizeEmployee(
      {
        id: createId("emp"),
        ...employeeForm,
        empresa: empresaAtiva,
        situacao: employeeForm.situacao as EmployeeStatus,
        nome: employeeForm.funcionario,
        dataAdmissao: employeeForm.admissao,
      },
      employees.length,
    );

    addEmployee(newEmployee);
    setSheetEmployees((current) => [newEmployee, ...(current ?? [])]);
    setEmployeeForm(createEmptyEmployeeForm());
    setFormFeedback(`Funcionário cadastrado em ${empresaAtiva}. Sincronizando...`);
    setSearch("");
    setStatusFilter("TODOS");

    try {
      const response = await fetch("/api/funcionarios", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newEmployee),
      });
      const payload = (await response.json().catch(() => null)) as { message?: string; persisted?: boolean } | null;

      setFormFeedback(
        payload?.persisted
          ? `Funcionário cadastrado em ${empresaAtiva} e enviado ao Google Sheets.`
          : (payload?.message ?? `Funcionário cadastrado em ${empresaAtiva} e salvo localmente neste navegador.`),
      );
    } catch {
      setFormFeedback(`Funcionário cadastrado em ${empresaAtiva}, mas a sincronização com Sheets falhou.`);
    }
  }

  return (
    <ErpShell active="funcionarios">
      <div className="space-y-6">
        <section className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-yellow-500">
              Cadastro Funcionários 2026
            </p>
            <h1 className="mt-2 text-3xl font-extrabold text-white">Funcionários por equipe</h1>
            <p className="mt-2 max-w-3xl text-sm text-slate-400">
              Visual no mesmo padrão da planilha: situação, funcionário, cargo, seguimento, equipe, projeto,
              benefícios, contrato, documentação e controles de NRS/férias.
            </p>
          </div>

          <div className="rounded-2xl border border-yellow-950/60 bg-zinc-950/80 px-4 py-3 text-sm text-slate-300">
            <p className="font-bold text-white">{source === "google-sheets" ? "Google Sheets" : "Dados locais"}</p>
            <p className="mt-1 text-xs text-slate-500">
              {updatedAt ? `Atualizado: ${formatDateTime(updatedAt)}` : EMPLOYEE_SHEET_NAME}
            </p>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-4">
          <SummaryCard label="Total na base" value={employees.length.toString()} />
          <SummaryCard label="Ativos" value={activeEmployees.toString()} tone="green" />
          <SummaryCard label="Inativos" value={inactiveEmployees.toString()} tone="slate" />
          <SummaryCard label="Equipes" value={teamCount.toString()} tone="yellow" />
        </section>

        <section className="rounded-2xl border border-yellow-950/60 bg-zinc-950/80 p-5 shadow-2xl shadow-black/30">
          <div className="border-b border-white/10 pb-4">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-yellow-500">Cadastrar</p>
            <h2 className="mt-2 text-xl font-bold text-white">Novo funcionário</h2>
            <p className="mt-1 text-sm text-slate-400">
              Formulário completo com os mesmos campos e ordem da planilha de cadastro para {empresaAtiva}.
            </p>
          </div>

          <form className="mt-5 space-y-5" onSubmit={handleRegisterEmployee}>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {employeeColumns.map((column) => (
                <label className={column.key === "enderecoCompleto" ? "md:col-span-2 xl:col-span-4" : ""} key={column.key}>
                  <span className="text-sm font-semibold text-slate-300">{column.label}</span>
                  {column.key === "situacao" ? (
                    <select
                      className="mt-2 w-full rounded-xl border border-white/10 bg-black/50 px-3 py-3 text-sm text-white outline-none transition focus:border-yellow-500/60"
                      onChange={(event) => handleEmployeeFieldChange(column.key, event.target.value)}
                      value={employeeForm[column.key]}
                    >
                      <option value="ATIVO">ATIVO</option>
                      <option value="INATIVO">INATIVO</option>
                    </select>
                  ) : yesNoFields.has(column.key) ? (
                    <select
                      className="mt-2 w-full rounded-xl border border-white/10 bg-black/50 px-3 py-3 text-sm text-white outline-none transition focus:border-yellow-500/60"
                      onChange={(event) => handleEmployeeFieldChange(column.key, event.target.value)}
                      value={employeeForm[column.key]}
                    >
                      <option value="">Selecione</option>
                      <option value="SIM">SIM</option>
                      <option value="NÃO">NÃO</option>
                      <option value="N/A">N/A</option>
                    </select>
                  ) : (
                    <input
                      className="mt-2 w-full rounded-xl border border-white/10 bg-black/50 px-3 py-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-yellow-500/60"
                      onChange={(event) => handleEmployeeFieldChange(column.key, event.target.value)}
                      placeholder={getEmployeePlaceholder(column.key)}
                      value={employeeForm[column.key]}
                    />
                  )}
                </label>
              ))}
            </div>

            {formFeedback ? (
              <p className="rounded-xl border border-yellow-500/20 bg-yellow-500/10 px-3 py-2 text-sm text-yellow-200">
                {formFeedback}
              </p>
            ) : null}

            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                className="rounded-xl bg-yellow-500 px-5 py-3 text-sm font-extrabold text-black transition hover:bg-yellow-400"
                type="submit"
              >
                Cadastrar funcionário
              </button>
              <button
                className="rounded-xl border border-white/10 px-5 py-3 text-sm font-bold text-slate-300 transition hover:border-yellow-500/40 hover:bg-yellow-500/10 hover:text-yellow-300"
                onClick={() => {
                  setEmployeeForm(createEmptyEmployeeForm());
                  setFormFeedback("");
                }}
                type="button"
              >
                Limpar formulário
              </button>
            </div>
          </form>
        </section>

        <section className="rounded-2xl border border-yellow-950/60 bg-zinc-950/80 p-5 shadow-2xl shadow-black/30">
          <div className="grid gap-4 lg:grid-cols-[1fr_180px]">
            <label>
              <span className="text-sm font-semibold text-slate-300">Buscar na planilha</span>
              <input
                className="mt-2 w-full rounded-xl border border-white/10 bg-black/50 px-3 py-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-yellow-500/60"
                onChange={(event) => setSearch(event.target.value)}
                placeholder="RE, funcionário, cargo, seguimento, equipe ou projeto..."
                value={search}
              />
            </label>

            <label>
              <span className="text-sm font-semibold text-slate-300">Situação</span>
              <select
                className="mt-2 w-full rounded-xl border border-white/10 bg-black/50 px-3 py-3 text-sm text-white outline-none transition focus:border-yellow-500/60"
                onChange={(event) => setStatusFilter(event.target.value as StatusFilter)}
                value={statusFilter}
              >
                <option value="TODOS">Todos</option>
                <option value="ATIVO">Ativo</option>
                <option value="INATIVO">Inativo</option>
              </select>
            </label>
          </div>

          <p
            className={`mt-4 rounded-xl border px-3 py-2 text-sm ${
              source === "google-sheets"
                ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-200"
                : "border-yellow-500/20 bg-yellow-500/10 text-yellow-200"
            }`}
          >
            {loading ? "Carregando..." : feedback}
          </p>
        </section>

        <section className="space-y-5">
          {groupedTeams.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-white/10 bg-zinc-950/80 p-6 text-sm text-slate-400">
              Nenhum funcionário encontrado com os filtros atuais.
            </div>
          ) : (
            groupedTeams.map(({ team, employees: teamEmployees, activeCount }) => (
              <div className="relative" key={team}>
                <EmployeeTeamCard employees={teamEmployees} onToggleStatus={handleToggleStatus} team={team} />
                <span className="absolute right-5 top-5 hidden rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-300 md:inline-flex">
                  {activeCount} ativos
                </span>
              </div>
            ))
          )}
        </section>
      </div>
    </ErpShell>
  );
}

function SummaryCard({
  label,
  value,
  tone = "default",
}: {
  label: string;
  value: string;
  tone?: "default" | "green" | "slate" | "yellow";
}) {
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

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value));
}

function createEmptyEmployeeForm(): Record<EmployeeColumnKey, string> {
  return employeeColumns.reduce(
    (form, column) => ({
      ...form,
      [column.key]: column.key === "situacao" ? "ATIVO" : "",
    }),
    {} as Record<EmployeeColumnKey, string>,
  );
}

function getEmployeePlaceholder(key: EmployeeColumnKey) {
  const placeholders: Partial<Record<EmployeeColumnKey, string>> = {
    re: "Ex: 33",
    funcionario: "Nome completo",
    cargo: "Ex: OFICIAL DE REDE",
    seguimento: "Ex: FTTA",
    equipe: "Ex: LFO-BRUNO J",
    projeto: "Ex: VIVO",
    vrDia: "Ex: 32,63",
    vt: "Ex: 0",
    salario: "Ex: R$ 2.009,11",
    carro: "Ex: GOL",
    placa: "Ex: ABC1D23",
    admissao: "Ex: 09/06/2026",
    vencimentoContrato45: "Ex: 24/07/2026",
    vencimentoContrato90: "Ex: 07/09/2026",
    eSocial: "Ex: BJ60",
    cpf: "000.000.000-00",
    rg: "00.000.000-0",
    nomeMae: "Nome da mãe",
    nomePai: "Nome do pai",
    dataNascimento: "Ex: 01/01/1990",
    enderecoCompleto: "Rua, número, complemento, bairro, cidade, CEP",
    vencimentoNrs: "Ex: 09/06/2027",
  };

  return placeholders[key] ?? "";
}
