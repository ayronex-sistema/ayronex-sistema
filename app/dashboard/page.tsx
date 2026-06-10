"use client";

import Link from "next/link";
import { ErpShell } from "@/components/erp-shell";
import { ModuleSpreadsheetActions } from "@/components/module-spreadsheet-actions";
import { useErpData } from "@/hooks/use-erp-data";
import { calcularResumoERP, formatCurrency } from "@/lib/calculator";
import { companies, filterErpDataByCompany } from "@/lib/companies";
import type { CompanyName, ErpData, ProductionRecord } from "@/lib/types";

const weekLabels = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
const defaultDailyProduction = [28, 46, 38, 57, 49, 72];

export default function DashboardPage() {
  const { data, dataByCompany, empresaAtiva, setEmpresaAtiva } = useErpData();
  const resumo = calcularResumoERP(dataByCompany);
  const teamEntries = Object.entries(resumo.productionByTeam);
  const dailyProduction = buildDailySeries(resumo.productionMonth);
  const productionByType = buildProductionByType(resumo.productionMonth);
  const statusData = buildStatusData(resumo.productionMonth);
  const companyOverview = buildCompanyOverview(data);

  return (
    <ErpShell active="dashboard">
      <section className="space-y-6">
        <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <span className="grid size-11 place-items-center rounded-xl bg-yellow-500 text-lg font-black text-black">
                06
              </span>
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.28em] text-yellow-500">Dashboard gerencial</p>
                <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-white">Visão completa da operação</h1>
              </div>
            </div>
            <p className="mt-4 max-w-3xl text-sm text-slate-400">
              Painel de {empresaAtiva}. Clique nos cards das empresas para trocar os cálculos do Dashboard.
            </p>
          </div>

          <div className="rounded-2xl border border-yellow-950/60 bg-zinc-950 px-4 py-3 text-sm">
            <p className="text-slate-400">Resultado previsto</p>
            <p className={resumo.resultadoPrevisto === "positivo" ? "font-bold text-emerald-300" : "font-bold text-red-300"}>
              {resumo.resultadoPrevisto.toUpperCase()}
            </p>
          </div>
        </header>

        <section className="rounded-[1.75rem] border border-yellow-950/70 bg-[#071112] p-4 shadow-2xl shadow-black/40 md:p-6">
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <DashboardMetric label="Faturamento estimado" value={formatCurrency(resumo.faturamentoEstimado)} />
            <DashboardMetric label="Custo total" value={formatCurrency(resumo.despesas)} />
            <DashboardMetric label="Lucro projetado" value={formatCurrency(resumo.saldoFinalPrevisto)} />
            <DashboardMetric label="Produção do mês" value={`${sumPoints(resumo.productionMonth)} pontos`} tone="green" />
          </div>

          <div className="mt-4 grid gap-3 lg:grid-cols-3">
            {companyOverview.map((company) => (
              <CompanySummaryCard key={company.name} onSelect={setEmpresaAtiva} {...company} />
            ))}
          </div>

          <div className="mt-4 grid gap-4 xl:grid-cols-[1fr_0.85fr]" id="indicadores">
            <Panel title="Produção por dia">
              <LineChart values={dailyProduction} />
            </Panel>

            <Panel title="Produção por tipo">
              <DonutChart
                items={productionByType}
                emptyLabel="Sem produção"
              />
            </Panel>

            <Panel title="Produção por equipe">
              <BarChart entries={teamEntries} />
            </Panel>

            <Panel title="Status de lançamentos">
              <DonutChart
                items={statusData}
                emptyLabel="Sem lançamentos"
              />
            </Panel>
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

        <section className="grid gap-4 md:grid-cols-4">
          <FeatureCard href="/operacao" icon="⌕" title="Dados em tempo real" />
          <FeatureCard href="/indicadores" icon="⌁" title="Indicadores de desempenho" />
          <FeatureCard href="/financeiro" icon="↗" title="Tomada de decisão rápida" />
          <FeatureCard href="/funcionarios" icon="▣" title="Gestão por resultados" />
        </section>
      </section>
    </ErpShell>
  );
}

function CompanySummaryCard({
  name,
  faturamento,
  despesas,
  saldo,
  producao,
  onSelect,
}: {
  name: CompanyName;
  faturamento: number;
  despesas: number;
  saldo: number;
  producao: number;
  onSelect: (company: CompanyName) => void;
}) {
  return (
    <button
      className="rounded-2xl border border-yellow-950/50 bg-black/30 p-4 text-left transition hover:-translate-y-0.5 hover:border-yellow-500/60 hover:bg-yellow-500/10 focus:outline-none focus:ring-2 focus:ring-yellow-500/40"
      onClick={() => onSelect(name)}
      type="button"
    >
      <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-yellow-500">{name}</p>
      <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
        <MiniValue label="Produção" value={String(producao)} />
        <MiniValue label="Faturamento" value={formatCurrency(faturamento)} />
        <MiniValue label="Despesas" value={formatCurrency(despesas)} />
        <MiniValue label="Saldo previsto" value={formatCurrency(saldo)} tone={saldo >= 0 ? "positive" : "negative"} />
      </div>
      <p className="mt-4 text-xs font-semibold text-yellow-300/80">Clique para selecionar esta empresa</p>
    </button>
  );
}

function MiniValue({ label, value, tone = "default" }: { label: string; value: string; tone?: "default" | "positive" | "negative" }) {
  const toneClass = tone === "positive" ? "text-emerald-300" : tone === "negative" ? "text-red-300" : "text-white";

  return (
    <div>
      <p className="text-[11px] text-slate-500">{label}</p>
      <p className={`mt-1 font-bold ${toneClass}`}>{value}</p>
    </div>
  );
}

function DashboardMetric({ label, value, tone = "default" }: { label: string; value: string; tone?: "default" | "green" }) {
  return (
    <article className="rounded-2xl border border-white/5 bg-[#0b1a1d] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
      <p className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-slate-500">{label}</p>
      <strong className={`mt-4 block text-2xl tracking-tight ${tone === "green" ? "text-emerald-300" : "text-white"}`}>
        {value}
      </strong>
    </article>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="min-h-72 rounded-2xl border border-white/5 bg-[#0b171a] p-5">
      <h2 className="text-sm font-extrabold uppercase tracking-[0.12em] text-white">{title}</h2>
      <div className="mt-5">{children}</div>
    </section>
  );
}

function LineChart({ values }: { values: number[] }) {
  const maxValue = Math.max(...values, 1);
  const points = values
    .map((value, index) => {
      const x = (index / Math.max(values.length - 1, 1)) * 100;
      const y = 100 - (value / maxValue) * 82 - 8;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <div>
      <svg className="h-52 w-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 100 100">
        {[20, 40, 60, 80].map((line) => (
          <line className="stroke-white/10" key={line} x1="0" x2="100" y1={line} y2={line} />
        ))}
        <polyline fill="none" points={points} stroke="#22c55e" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.6" />
        <polyline fill="none" opacity="0.35" points={`0,100 ${points} 100,100`} stroke="#22c55e" strokeWidth="1" />
        {points.split(" ").map((point) => {
          const [cx, cy] = point.split(",");
          return <circle className="fill-emerald-300" cx={cx} cy={cy} key={point} r="1.8" />;
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
  const maxCount = Math.max(...data.map(([, value]) => value.count), 1);

  return (
    <div className="flex h-52 items-end gap-4">
      {data.slice(0, 6).map(([team, value]) => (
        <div className="flex flex-1 flex-col items-center gap-2" key={team}>
          <div className="flex h-40 w-full items-end rounded-t-xl bg-white/[0.03]">
            <div
              className="w-full rounded-t-xl bg-gradient-to-t from-blue-800 to-blue-400"
              style={{ height: `${Math.max((value.count / maxCount) * 100, 12)}%` }}
            />
          </div>
          <span className="max-w-20 truncate text-xs text-slate-500">{team}</span>
        </div>
      ))}
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
      </div>
    </div>
  );
}

function FeatureCard({ href, icon, title }: { href: string; icon: string; title: string }) {
  return (
    <Link
      className="group rounded-2xl border border-yellow-950/50 bg-zinc-950 p-5 text-center transition hover:-translate-y-1 hover:border-yellow-500/60 hover:bg-yellow-500/10 focus:outline-none focus:ring-2 focus:ring-yellow-500/50"
      href={href}
    >
      <div className="mx-auto grid size-12 place-items-center rounded-full border border-white/10 text-2xl text-yellow-400">{icon}</div>
      <p className="mt-4 text-sm font-bold text-slate-200 group-hover:text-yellow-200">{title}</p>
    </Link>
  );
}

type ChartItem = {
  label: string;
  value: number;
  color: string;
};

function buildDailySeries(records: ProductionRecord[]) {
  if (records.length === 0) {
    return defaultDailyProduction;
  }

  const today = new Date();
  return Array.from({ length: 6 }, (_, index) => {
    const date = new Date(today);
    date.setDate(today.getDate() - (5 - index));
    const isoDate = date.toISOString().slice(0, 10);
    return records.filter((record) => record.date === isoDate).reduce((sum, record) => sum + record.points, 0);
  });
}

function buildProductionByType(records: ProductionRecord[]): ChartItem[] {
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

function buildStatusData(records: ProductionRecord[]): ChartItem[] {
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

function sumPoints(records: ProductionRecord[]) {
  return records.reduce((sum, record) => sum + record.points, 0).toLocaleString("pt-BR");
}

function buildCompanyOverview(data: ErpData) {
  return companies.map((company) => {
    const companyData = filterErpDataByCompany(data, company);
    const resumo = calcularResumoERP(companyData);

    return {
      name: company,
      faturamento: resumo.faturamentoEstimado,
      despesas: resumo.despesas,
      saldo: resumo.saldoFinalPrevisto,
      producao: resumo.productionMonth.length,
    };
  });
}
