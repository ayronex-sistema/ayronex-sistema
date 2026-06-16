"use client";

import Link from "next/link";
import { type ReactNode, useMemo, useState } from "react";
import { ErpShell } from "@/components/erp-shell";
import { ModuleSpreadsheetActions } from "@/components/module-spreadsheet-actions";
import { useErpData } from "@/hooks/use-erp-data";
import { calcularResumoERP, formatCurrency } from "@/lib/calculator";
import { companies, filterErpDataByCompany } from "@/lib/companies";
import type { CompanyName, ErpData, ProductionRecord } from "@/lib/types";

type ComparisonMetric = "lucro" | "faturamento" | "despesas" | "producao" | "pendencias";

type CompanyRow = {
  name: CompanyName;
  producao: number;
  faturamento: number;
  despesas: number;
  lucro: number;
  pendencias: number;
};

type AlertItem = {
  title: string;
  detail: string;
  count: number;
  href: string;
  tone: "red" | "yellow" | "blue";
};

type QuickItem = {
  title: string;
  href: string;
  description: string;
  badge: number;
  icon: "production" | "finance" | "chat" | "users" | "materials" | "vr";
};

const comparisonMetrics: Array<{ metric: ComparisonMetric; label: string }> = [
  { metric: "lucro", label: "Lucro" },
  { metric: "faturamento", label: "Faturamento" },
  { metric: "despesas", label: "Despesas" },
  { metric: "producao", label: "Produção" },
  { metric: "pendencias", label: "Pendências" },
];

const weekLabels = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
const defaultDailyProduction = [28, 46, 38, 57, 49, 72];

export default function DashboardPage() {
  const { data, dataByCompany, empresaAtiva } = useErpData();
  const [comparisonMetric, setComparisonMetric] = useState<ComparisonMetric>("lucro");

  const resumo = useMemo(() => calcularResumoERP(dataByCompany), [dataByCompany]);
  const dailyProduction = useMemo(() => buildDailySeries(resumo.productionMonth), [resumo.productionMonth]);
  const productionByType = useMemo(() => buildProductionByType(resumo.productionMonth), [resumo.productionMonth]);
  const statusData = useMemo(() => buildStatusData(resumo.productionMonth), [resumo.productionMonth]);
  const companyRows = useMemo(() => buildCompanyRows(data), [data]);
  const orderedRows = useMemo(() => sortCompanyRows(companyRows, comparisonMetric), [companyRows, comparisonMetric]);
  const alerts = useMemo(() => buildAlerts(data), [data]);
  const quickItems = useMemo(() => buildQuickItems(dataByCompany, resumo), [dataByCompany, resumo]);

  return (
    <ErpShell active="dashboard">
      <section className="space-y-6 font-sans">
        <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.28em] text-yellow-500">Dashboard gerencial</p>
            <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-white">Central de comando da operação</h1>
            <p className="mt-4 max-w-3xl text-sm text-slate-400">
              Painel de {empresaAtiva}. Alertas, comparação entre empresas e atalhos com pendências em um único lugar.
            </p>
          </div>
          <div className="rounded-2xl border border-yellow-950/60 bg-zinc-950 px-4 py-3 text-sm shadow-2xl shadow-black/20">
            <p className="text-slate-400">Resultado previsto</p>
            <p className={resumo.resultadoPrevisto === "positivo" ? "font-bold text-emerald-300" : "font-bold text-red-300"}>
              {resumo.resultadoPrevisto.toUpperCase()}
            </p>
          </div>
        </header>

        <AlertCenter alerts={alerts} />

        <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <MetricButton active={comparisonMetric === "faturamento"} helper="Clique para ordenar a tabela" icon="revenue" label="Faturamento estimado" onClick={() => setComparisonMetric("faturamento")} tone="blue" value={formatCurrency(resumo.faturamentoEstimado)} />
          <MetricButton active={comparisonMetric === "despesas"} helper="Clique para ordenar a tabela" icon="cost" label="Custo total" onClick={() => setComparisonMetric("despesas")} tone="green" value={formatCurrency(resumo.despesas)} />
          <MetricButton active={comparisonMetric === "lucro"} helper="Clique para ordenar a tabela" icon="profit" label="Lucro projetado" onClick={() => setComparisonMetric("lucro")} tone="purple" value={formatCurrency(resumo.saldoFinalPrevisto)} />
          <MetricButton active={comparisonMetric === "producao"} helper="Clique para ordenar a tabela" icon="production" label="Produção do mês" onClick={() => setComparisonMetric("producao")} tone="orange" value={`${sumPoints(resumo.productionMonth)} pontos`} />
        </section>

        <section className="rounded-[1.75rem] border border-white/10 bg-black p-4 shadow-2xl shadow-black/40 md:p-6">
          <div className="grid gap-4 xl:grid-cols-2">
            <Panel title="Produção por dia" note={`Meta: ${formatPoints(average(dailyProduction) * 1.15)} pontos | Média: ${formatPoints(average(dailyProduction))} pontos`}>
              <LineChart values={dailyProduction} />
            </Panel>
            <Panel title="Produção por tipo" note={`Meta: ${formatPoints(average(productionByType.map((item) => item.value)) * 1.2)} itens | Média: ${formatPoints(average(productionByType.map((item) => item.value)))}`}>
              <DonutChart emptyLabel="Sem produção" items={productionByType} />
            </Panel>
            <Panel title="Produção por equipe" note={`Meta: ${formatPoints(average(teamEntries(resumo.productionByTeam).map((entry) => entry[1].count)) * 1.1)} registros`}>
              <BarChart entries={teamEntries(resumo.productionByTeam)} />
            </Panel>
            <Panel title="Status de lançamentos" note={`Média: ${formatPoints(average(statusData.map((item) => item.value)))} lançamentos por status`}>
              <DonutChart emptyLabel="Sem lançamentos" items={statusData} />
            </Panel>
          </div>
        </section>

        <section className="rounded-[1.75rem] border border-white/10 bg-[#050505] p-4 shadow-2xl shadow-black/30 md:p-6">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.24em] text-yellow-500">Tabela comparativa</p>
              <h2 className="mt-2 text-xl font-black tracking-tight text-white">Empresas ordenadas por {comparisonMetrics.find((item) => item.metric === comparisonMetric)?.label.toLowerCase()}</h2>
              <p className="mt-2 text-sm text-slate-400">Toque nos cards de resumo para reorganizar o comparativo.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {comparisonMetrics.map((item) => {
                const selected = comparisonMetric === item.metric;
                return (
                  <button
                    className={`rounded-full border px-3 py-2 text-xs font-bold transition ${selected ? "border-yellow-500 bg-yellow-500 text-black" : "border-white/10 bg-white/[0.03] text-slate-300 hover:border-yellow-500/40 hover:text-yellow-200"}`}
                    key={item.metric}
                    onClick={() => setComparisonMetric(item.metric)}
                    type="button"
                  >
                    {item.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-5 overflow-hidden rounded-2xl border border-white/10">
            <table className="w-full min-w-[900px] text-left text-sm">
              <thead className="bg-white/[0.04] text-xs uppercase tracking-[0.14em] text-slate-400">
                <tr>
                  <th className="px-4 py-4">Empresa</th>
                  <th className="px-4 py-4 text-right">Produção</th>
                  <th className="px-4 py-4 text-right">Faturamento</th>
                  <th className="px-4 py-4 text-right">Despesas</th>
                  <th className="px-4 py-4 text-right">Lucro</th>
                  <th className="px-4 py-4 text-right">Pendências</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10 bg-black">
                {orderedRows.map((row) => (
                  <tr className={row.name === empresaAtiva ? "bg-yellow-500/5" : ""} key={row.name}>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className="grid size-10 place-items-center rounded-xl border border-white/10 bg-white/[0.04] text-sm font-black text-yellow-300">
                          {row.name.slice(0, 1)}
                        </div>
                        <div>
                          <p className="font-bold text-white">{row.name}</p>
                          <p className="text-xs text-slate-500">{row.pendencias} pendências • ordenado por {comparisonMetrics.find((item) => item.metric === comparisonMetric)?.label.toLowerCase()}</p>
                        </div>
                      </div>
                    </td>
                    <td className={`px-4 py-4 text-right font-semibold ${highlightForMetric(comparisonMetric, "producao")}`}>{formatPoints(row.producao)}</td>
                    <td className={`px-4 py-4 text-right font-semibold ${highlightForMetric(comparisonMetric, "faturamento")}`}>{formatCurrency(row.faturamento)}</td>
                    <td className={`px-4 py-4 text-right font-semibold ${highlightForMetric(comparisonMetric, "despesas")}`}>{formatCurrency(row.despesas)}</td>
                    <td className={`px-4 py-4 text-right font-semibold ${highlightForMetric(comparisonMetric, "lucro")}`}>{formatCurrency(row.lucro)}</td>
                    <td className={`px-4 py-4 text-right font-semibold ${highlightForMetric(comparisonMetric, "pendencias")}`}>{row.pendencias}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <ModuleSpreadsheetActions
          description="Exporta um resumo gerencial somente da empresa selecionada."
          empresa={empresaAtiva}
          moduleKey="dashboard"
          moduleLabel="Dashboard"
          rows={[
            {
              empresa: empresaAtiva,
              faturamentoEstimado: resumo.faturamentoEstimado,
              custoTotal: resumo.despesas,
              lucroProjetado: resumo.saldoFinalPrevisto,
              producaoDoMes: resumo.productionMonth.length,
              aPagar: resumo.aPagar,
              resultadoPrevisto: resumo.resultadoPrevisto,
            },
          ]}
        />

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {quickItems.map((item) => (
            <AccessCard key={item.title} {...item} />
          ))}
        </section>
      </section>
    </ErpShell>
  );
}

type MetricIconName = "revenue" | "cost" | "profit" | "production";

function AlertCenter({ alerts }: { alerts: AlertItem[] }) {
  const total = alerts.reduce((sum, item) => sum + item.count, 0);

  return (
    <section className="rounded-[1.75rem] border border-red-500/15 bg-[#050505] p-4 shadow-2xl shadow-black/30 md:p-6">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-red-400">Central de alertas</p>
          <h2 className="mt-2 text-xl font-black tracking-tight text-white">Pendências críticas de todos os módulos</h2>
          <p className="mt-2 text-sm text-slate-400">Problemas consolidados para agir rapidamente.</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm">
          <p className="text-slate-400">Total crítico</p>
          <strong className="block text-2xl font-black text-white">{total}</strong>
        </div>
      </div>
      <div className="mt-5 grid gap-3 md:grid-cols-3">
        {alerts.map((alert) => (
          <Link
            className={`rounded-2xl border p-4 transition hover:-translate-y-0.5 ${alertToneClass(alert.tone)}`}
            href={alert.href}
            key={alert.title}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-bold text-white">{alert.title}</p>
                <p className="mt-1 text-xs text-slate-400">{alert.detail}</p>
              </div>
              <span className="rounded-full bg-black/30 px-3 py-1 text-xs font-black text-white">{alert.count}</span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

function MetricButton({
  helper,
  icon,
  label,
  value,
  tone,
  active,
  onClick,
}: {
  helper: string;
  icon: MetricIconName;
  label: string;
  value: string;
  tone: "blue" | "green" | "purple" | "orange";
  active: boolean;
  onClick: () => void;
}) {
  const tones = {
    blue: "from-blue-500 to-blue-800 text-blue-100",
    green: "from-emerald-500 to-emerald-800 text-emerald-100",
    purple: "from-purple-500 to-purple-800 text-purple-100",
    orange: "from-orange-500 to-orange-800 text-orange-100",
  };

  return (
    <button
      className={`flex items-start gap-4 rounded-2xl border p-4 text-left shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] transition hover:-translate-y-0.5 ${active ? "border-yellow-500/70 bg-yellow-500/10" : "border-white/10 bg-[#050505]"}`}
      onClick={onClick}
      type="button"
    >
      <div className={`grid size-12 shrink-0 place-items-center rounded-xl bg-gradient-to-br ${tones[tone]}`}>
        <MetricIcon name={icon} />
      </div>
      <div>
        <p className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-slate-500">{label}</p>
        <strong className="mt-2 block text-xl tracking-tight text-white md:text-[1.7rem]">{value}</strong>
        <p className="mt-2 text-xs text-emerald-300">{helper}</p>
      </div>
    </button>
  );
}

function Panel({ title, note, children }: { title: string; note: string; children: ReactNode }) {
  return (
    <section className="min-h-72 rounded-2xl border border-white/10 bg-[#050505] p-5">
      <div className="flex flex-col gap-2">
        <h2 className="text-sm font-extrabold uppercase tracking-[0.12em] text-white">{title}</h2>
        <p className="text-xs text-slate-500">{note}</p>
      </div>
      <div className="mt-5">{children}</div>
    </section>
  );
}

function MetricIcon({ name }: { name: MetricIconName }) {
  const icons: Record<MetricIconName, ReactNode> = {
    revenue: <path d="M4 17h16M6 13l4-4 4 2 4-6" />,
    cost: <path d="M12 3v18m4-14H10a3 3 0 0 0 0 6h4a3 3 0 0 1 0 6H6" />,
    profit: <path d="m5 19 14-14M9 5h10v10" />,
    production: <path d="M4 19V5m0 14h16M8 16v-5m4 5V8m4 8v-7" />,
  };

  return (
    <svg aria-hidden="true" className="size-5" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24">
      {icons[name]}
    </svg>
  );
}

function AccessCard({ href, icon, title, description, badge }: QuickItem) {
  return (
    <Link className="group rounded-2xl border border-white/10 bg-[#050505] p-5 transition hover:-translate-y-0.5 hover:border-yellow-500/40 hover:bg-yellow-500/8" href={href}>
      <div className="flex items-start justify-between gap-4">
        <div className="grid size-12 place-items-center rounded-xl border border-white/10 bg-white/[0.03] text-yellow-300">
          <QuickIcon name={icon} />
        </div>
        <span className="rounded-full border border-yellow-500/20 bg-yellow-500/10 px-3 py-1 text-xs font-black text-yellow-300">{badge}</span>
      </div>
      <p className="mt-4 text-sm font-bold text-white group-hover:text-yellow-200">{title}</p>
      <p className="mt-2 text-xs text-slate-500">{description}</p>
    </Link>
  );
}

type QuickIconName = QuickItem["icon"];

function QuickIcon({ name }: { name: QuickIconName }) {
  const icons: Record<QuickIconName, ReactNode> = {
    production: <path d="M4 16h3l2-8 4 12 2-7h5" />,
    finance: <path d="M12 4v16m4-12H10a3 3 0 0 0 0 6h4a3 3 0 0 1 0 6H6" />,
    chat: <path d="M4 5h16v11H7l-3 3z" />,
    users: <path d="M16 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2m8-10a4 4 0 1 0 0-8 4 4 0 0 0 0 8m10 10v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />,
    materials: <path d="M21 8.5 12 4 3 8.5v7L12 20l9-4.5z" />,
    vr: <path d="M3 7h18v13H3zM16 12h3M5 7V5a2 2 0 0 1 2-2h10v4" />,
  };

  return (
    <svg aria-hidden="true" className="size-5" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24">
      {icons[name]}
    </svg>
  );
}

function LineChart({ values }: { values: number[] }) {
  const averageValue = average(values);
  const metaValue = Math.max(averageValue * 1.15, Math.max(...values, 1) * 0.9);
  const maxValue = Math.max(...values, averageValue, metaValue, 1);
  const width = 620;
  const height = 180;
  const paddingX = 26;
  const paddingTop = 24;
  const paddingBottom = 18;
  const points = values.map((value, index) => {
    const x = paddingX + (index / Math.max(values.length - 1, 1)) * (width - paddingX * 2);
    const y = paddingTop + (1 - value / maxValue) * (height - paddingTop - paddingBottom);
    return `${x},${y}`;
  }).join(" ");
  const averageY = chartY(averageValue, maxValue, height, paddingTop, paddingBottom);
  const metaY = chartY(metaValue, maxValue, height, paddingTop, paddingBottom);

  return (
    <div>
      <div className="mb-4 flex flex-wrap gap-2 text-[11px] font-semibold text-slate-400">
        <span className="rounded-full border border-slate-700 bg-slate-900 px-3 py-1">Meta: {formatPoints(metaValue)} pontos</span>
        <span className="rounded-full border border-slate-700 bg-slate-900 px-3 py-1">Média: {formatPoints(averageValue)} pontos</span>
      </div>
      <svg className="h-44 w-full overflow-visible" viewBox={`0 0 ${width} ${height}`}>
        <line x1={paddingX} x2={width - paddingX} y1={averageY} y2={averageY} stroke="#475569" strokeDasharray="6 6" strokeWidth="1.5" />
        <line x1={paddingX} x2={width - paddingX} y1={metaY} y2={metaY} stroke="#22c55e" strokeDasharray="4 5" strokeWidth="1.5" />
        <polyline fill="none" points={points} stroke="#22d3ee" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" />
        {points.split(" ").map((point, index) => {
          const [cx, cy] = point.split(",");
          return (
            <g key={point}>
              <circle className="fill-cyan-200" cx={cx} cy={cy} r="3.5" />
              <text className="fill-white text-[11px] font-bold" textAnchor="middle" x={cx} y={Number(cy) - 10}>
                {formatPoints(values[index])}
              </text>
            </g>
          );
        })}
      </svg>
      <div className="mt-2 grid grid-cols-6 text-center text-xs text-slate-500">
        {weekLabels.map((label) => (
          <span key={label}>{label}</span>
        ))}
      </div>
    </div>
  );
}

function BarChart({ entries }: { entries: Array<[string, { count: number; points: number; revenue: number }]> }) {
  const data = entries.length > 0 ? entries : [["Sem equipe", { count: 1, points: 1, revenue: 0 }] as const];
  const counts = data.map(([, value]) => value.count);
  const averageCount = average(counts);
  const metaCount = Math.max(averageCount * 1.2, 1);
  const maxCount = Math.max(...counts, averageCount, metaCount, 1);
  const chartHeight = 160;
  const chartWidth = 520;
  const averageY = chartY(averageCount, maxCount, chartHeight, 16, 18);
  const metaY = chartY(metaCount, maxCount, chartHeight, 16, 18);

  return (
    <div>
      <div className="mb-4 flex flex-wrap gap-2 text-[11px] font-semibold text-slate-400">
        <span className="rounded-full border border-slate-700 bg-slate-900 px-3 py-1">Meta: {formatPoints(metaCount)} equipes</span>
        <span className="rounded-full border border-slate-700 bg-slate-900 px-3 py-1">Média: {formatPoints(averageCount)} equipes</span>
      </div>
      <div className="relative h-56 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02] p-3">
        <svg className="absolute inset-3 h-[calc(100%-1.5rem)] w-[calc(100%-1.5rem)]" viewBox={`0 0 ${chartWidth} ${chartHeight}`} preserveAspectRatio="none">
          <line x1="0" x2={chartWidth} y1={averageY} y2={averageY} stroke="#475569" strokeDasharray="6 6" strokeWidth="1.3" />
          <line x1="0" x2={chartWidth} y1={metaY} y2={metaY} stroke="#22c55e" strokeDasharray="4 5" strokeWidth="1.3" />
        </svg>
        <div className="relative flex h-full items-end gap-3">
          {data.slice(0, 6).map(([team, value]) => (
            <div className="flex flex-1 flex-col items-center gap-2" key={team}>
              <div className="flex h-40 w-full items-end rounded-t-xl bg-white/[0.03]">
                <div className="w-full rounded-t-xl bg-gradient-to-t from-blue-800 to-cyan-400" style={{ height: `${Math.max((value.count / maxCount) * 100, 14)}%` }} />
              </div>
              <span className="max-w-20 truncate text-xs text-slate-500">{team}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function DonutChart({ items, emptyLabel }: { items: ChartItem[]; emptyLabel: string }) {
  const total = items.reduce((sum, item) => sum + item.value, 0);
  const conic = total
    ? items.reduce(
        (acc, item) => {
          const start = acc.offset;
          const end = start + (item.value / total) * 100;
          acc.parts.push(`${item.color} ${start}% ${end}%`);
          acc.offset = end;
          return acc;
        },
        { offset: 0, parts: [] as string[] },
      ).parts.join(", ")
    : "#1f2937 0% 100%";

  const averageValue = average(items.map((item) => item.value));

  return (
    <div className="grid gap-5 md:grid-cols-[180px_1fr] md:items-center">
      <div className="mx-auto grid size-40 place-items-center rounded-full" style={{ background: `conic-gradient(${conic})` }}>
        <div className="grid size-24 place-items-center rounded-full bg-[#0b171a] text-center text-xs font-bold text-slate-400">
          {total || emptyLabel}
        </div>
      </div>
      <div className="space-y-3">
        {items.length === 0 ? (
          <p className="text-sm text-slate-500">{emptyLabel}</p>
        ) : (
          items.map((item) => (
            <div className="flex items-center justify-between gap-3 text-sm" key={item.label}>
              <span className="flex items-center gap-2 text-slate-300">
                <span className="size-3 rounded-full" style={{ backgroundColor: item.color }} />
                {item.label}
              </span>
              <strong className="text-white">{item.value}</strong>
            </div>
          ))
        )}
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3 text-xs text-slate-400">
          <p className="font-bold text-slate-200">Referência</p>
          <p className="mt-1">Meta visual comparada à média atual: {formatPoints(averageValue)} itens.</p>
        </div>
      </div>
    </div>
  );
}

type ChartItem = {
  label: string;
  value: number;
  color: string;
};

function buildCompanyRows(data: ErpData): CompanyRow[] {
  return companies.map((company) => {
    const companyData = filterErpDataByCompany(data, company);
    const resumo = calcularResumoERP(companyData);
    const productionPoints = resumo.productionMonth.reduce((sum, record) => sum + record.points, 0);
    const financePending = companyData.finance.filter((entry) => entry.type.toLowerCase().includes("sa") && !entry.paid).length;
    const whatsappPending = companyData.whatsappMessages.filter((message) => !message.launchedConecta || message.confidence < 0.75).length;

    return {
      name: company,
      producao: productionPoints,
      faturamento: resumo.faturamentoEstimado,
      despesas: resumo.despesas,
      lucro: resumo.saldoFinalPrevisto,
      pendencias: resumo.pendingLaunches.length + financePending + whatsappPending,
    };
  });
}

function sortCompanyRows(rows: CompanyRow[], metric: ComparisonMetric) {
  const sorted = [...rows];

  sorted.sort((left, right) => {
    if (metric === "pendencias") return right.pendencias - left.pendencias || right.lucro - left.lucro;
    if (metric === "producao") return right.producao - left.producao || right.lucro - left.lucro;
    if (metric === "despesas") return right.despesas - left.despesas || right.pendencias - left.pendencias;
    if (metric === "faturamento") return right.faturamento - left.faturamento || right.lucro - left.lucro;
    return right.lucro - left.lucro || right.pendencias - left.pendencias;
  });

  return sorted;
}

function buildAlerts(data: ErpData): AlertItem[] {
  const productionPending = data.production.filter((record) => !record.launchedConecta || record.status !== "OK").length;
  const financePending = data.finance.filter((entry) => entry.type.toLowerCase().includes("sa") && !entry.paid).length;
  const whatsappPending = data.whatsappMessages.filter((message) => !message.launchedConecta || message.confidence < 0.75).length;

  return [
    { title: "Produção pendente", detail: productionPending > 0 ? `${productionPending} registros aguardando lançamento no Conecta.` : "Sem pendências operacionais críticas.", count: productionPending, href: "/operacao", tone: productionPending > 0 ? "red" : "blue" },
    { title: "Financeiro em aberto", detail: financePending > 0 ? `${financePending} contas a pagar ainda não quitadas.` : "Não há contas em aberto no momento.", count: financePending, href: "/financeiro", tone: financePending > 0 ? "yellow" : "blue" },
    { title: "WhatsApp e comunicação", detail: whatsappPending > 0 ? `${whatsappPending} mensagens pedindo conferência ou lançamento.` : "Comunicação sem pendências críticas.", count: whatsappPending, href: "/whatsapp", tone: whatsappPending > 0 ? "yellow" : "blue" },
  ];
}

function buildQuickItems(dataByCompany: ErpData, resumo: ReturnType<typeof calcularResumoERP>): QuickItem[] {
  const productionPending = resumo.pendingLaunches.length;
  const financePending = dataByCompany.finance.filter((entry) => entry.type.toLowerCase().includes("sa") && !entry.paid).length;
  const whatsappPending = dataByCompany.whatsappMessages.filter((message) => !message.launchedConecta || message.confidence < 0.75).length;
  const employeesPending = dataByCompany.employees.filter(
    (employee) => employee.situacao !== "ATIVO" || employee.feriasVencidas.toUpperCase() === "SIM" || employee.nrsVencido.toUpperCase() === "SIM",
  ).length;
  const materialPending = dataByCompany.materials.filter((material) => material.status !== "Disponivel").length;
  const vrPending = Math.max(dataByCompany.employees.filter((employee) => employee.situacao === "ATIVO").length - dataByCompany.vr.length, 0);

  return [
    { title: "Produção", href: "/operacao", description: "Lançamentos e controle operacional.", badge: productionPending, icon: "production" },
    { title: "Financeiro", href: "/financeiro", description: "Entradas, saídas, saldo e previsões.", badge: financePending, icon: "finance" },
    { title: "WhatsApp", href: "/whatsapp", description: "Mensagens e validações da equipe.", badge: whatsappPending, icon: "chat" },
    { title: "Funcionários", href: "/funcionarios", description: "Cadastro, status e movimentações.", badge: employeesPending, icon: "users" },
    { title: "Materiais", href: "/materiais", description: "Estoque, edição e consumo por operação.", badge: materialPending, icon: "materials" },
    { title: "VR", href: "/vr", description: "Vale refeição com acompanhamento diário.", badge: vrPending, icon: "vr" },
  ];
}

function buildDailySeries(records: ProductionRecord[]) {
  if (records.length === 0) return defaultDailyProduction;

  const today = new Date();
  return Array.from({ length: 6 }, (_, index) => {
    const date = new Date(today);
    date.setDate(today.getDate() - (5 - index));
    const isoDate = date.toISOString().slice(0, 10);
    return records.filter((record) => record.date === isoDate).reduce((sum, record) => sum + record.points, 0);
  });
}

function buildProductionByType(records: ProductionRecord[]) {
  const grouped = records.reduce<Record<string, number>>((acc, record) => {
    const type = getProductionType(record);
    acc[type] = (acc[type] ?? 0) + 1;
    return acc;
  }, {});

  return Object.entries(grouped).map(([label, value], index) => ({
    label,
    value,
    color: ["#2563eb", "#22c55e", "#f59e0b", "#ef4444"][index % 4],
  }));
}

function buildStatusData(records: ProductionRecord[]) {
  const launched = records.filter((record) => record.launchedConecta).length;
  const pending = records.filter((record) => !record.launchedConecta).length;
  const rework = records.filter((record) => record.status === "Refazer").length;

  return [
    { label: "Concluídos", value: launched, color: "#2563eb" },
    { label: "Pendentes", value: pending, color: "#f59e0b" },
    { label: "Retrabalho", value: rework, color: "#ef4444" },
  ].filter((item) => item.value > 0);
}

function getProductionType(record: ProductionRecord) {
  const text = `${record.conectaCode} ${record.rawMessage}`.toLowerCase();

  if (text.includes("ftta") || text.includes("instala")) return "FTTA";
  if (text.includes("fusion") || text.includes("fusão") || text.includes("fusao")) return "Fusão";
  if (text.includes("barramento")) return "Barramento";
  if (text.includes("manut")) return "Manutenção";
  return record.conectaCode || "Outros";
}

function teamEntries(groups: Record<string, { count: number; points: number; revenue: number }>) {
  return Object.entries(groups).sort((left, right) => right[1].count - left[1].count);
}

function sumPoints(records: ProductionRecord[]) {
  return records.reduce((sum, record) => sum + record.points, 0).toLocaleString("pt-BR");
}

function average(values: number[]) {
  if (!values.length) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function formatPoints(value: number) {
  return value.toFixed(2).replace(".", ",").replace(/,00$/, "");
}

function chartY(value: number, maxValue: number, height: number, top: number, bottom: number) {
  return top + (1 - value / maxValue) * (height - top - bottom);
}

function highlightForMetric(activeMetric: ComparisonMetric, target: Exclude<ComparisonMetric, "pendencias"> | "pendencias") {
  return activeMetric === target ? "text-yellow-300" : "text-slate-300";
}

function alertToneClass(tone: AlertItem["tone"]) {
  if (tone === "red") return "border-red-500/20 bg-red-500/10 hover:border-red-500/40";
  if (tone === "yellow") return "border-yellow-500/20 bg-yellow-500/10 hover:border-yellow-500/40";
  return "border-blue-500/20 bg-blue-500/10 hover:border-blue-500/40";
}
