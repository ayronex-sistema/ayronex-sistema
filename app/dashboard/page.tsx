"use client";

import { ErpShell } from "@/components/erp-shell";
import { MetricCard } from "@/components/metric-card";
import { calcularResumoERP, formatCurrency } from "@/lib/calculator";
import { useErpData } from "@/hooks/use-erp-data";

export default function DashboardPage() {
  const { dataByCompany, empresaAtiva } = useErpData();
  const resumo = calcularResumoERP(dataByCompany);
  const teams = Object.entries(resumo.productionByTeam);

  return (
    <ErpShell active="dashboard">
      <section className="grid gap-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight md:text-3xl">Dashboard Gerencial</h1>
            <p className="mt-2 text-slate-400">
              Controle operacional e financeiro em tempo real para {empresaAtiva}.
            </p>
          </div>
          <p className="text-sm text-slate-400">
            Resultado previsto:{" "}
            <strong className={resumo.resultadoPrevisto === "positivo" ? "text-emerald-300" : "text-red-300"}>
              {resumo.resultadoPrevisto}
            </strong>
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
          <MetricCard label="Produção Dia" value={String(resumo.productionDay.length)} helper="lançamentos de hoje" tone="positive" />
          <MetricCard label="Produção Mês" value={String(resumo.productionMonth.length)} helper="acumulado mensal" tone="positive" />
          <MetricCard label="Faturamento" value={formatCurrency(resumo.faturamentoEstimado)} helper="estimado do mês" tone="positive" />
          <MetricCard label="Saldo" value={formatCurrency(resumo.saldo)} helper="saldo atual" tone="warning" />
          <MetricCard label="A Pagar" value={formatCurrency(resumo.aPagar)} helper="despesas pendentes" tone="danger" />
          <MetricCard label="Pendente" value={String(resumo.pendingLaunches.length)} helper="não lançado no Conecta" tone="warning" />
        </div>

        <div className="grid gap-4 xl:grid-cols-[1.4fr_0.8fr]">
          <section className="rounded-xl border border-yellow-950/70 bg-zinc-950 p-6">
            <h2 className="text-lg font-bold">Produção por Equipe</h2>
            <div className="mt-5 overflow-hidden rounded-xl border border-white/10">
              <table className="w-full min-w-[620px] text-left text-sm">
                <thead className="bg-white/5 text-slate-400">
                  <tr>
                    <th className="px-4 py-3">Equipe</th>
                    <th className="px-4 py-3">Produção</th>
                    <th className="px-4 py-3">Pontos</th>
                    <th className="px-4 py-3">Faturamento</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {teams.length === 0 && (
                    <tr>
                      <td className="px-4 py-5 text-slate-500" colSpan={4}>
                        Nenhuma produção lançada ainda.
                      </td>
                    </tr>
                  )}
                  {teams.map(([team, values]) => (
                    <tr key={team}>
                      <td className="px-4 py-3 font-semibold text-yellow-300">{team}</td>
                      <td className="px-4 py-3 text-slate-300">{values.count}</td>
                      <td className="px-4 py-3 text-slate-300">{values.points}</td>
                      <td className="px-4 py-3 text-slate-300">{formatCurrency(values.revenue)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="rounded-xl border border-yellow-950/70 bg-zinc-950 p-6">
            <h2 className="text-lg font-bold">Prévia Financeira</h2>
            <dl className="mt-5 grid gap-4 text-sm">
              <PreviewRow label="Faturamento estimado" value={formatCurrency(resumo.faturamentoEstimado)} />
              <PreviewRow label="Despesas" value={formatCurrency(resumo.despesas)} />
              <PreviewRow label="Saldo final previsto" value={formatCurrency(resumo.saldoFinalPrevisto)} />
            </dl>
          </section>
        </div>
      </section>
    </ErpShell>
  );
}

function PreviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-lg bg-white/5 px-4 py-3">
      <dt className="text-slate-400">{label}</dt>
      <dd className="font-bold text-white">{value}</dd>
    </div>
  );
}
