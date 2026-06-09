"use client";

import { useMemo, useState } from "react";
import { ErpShell } from "@/components/erp-shell";
import { MetricCard } from "@/components/metric-card";
import { createId, useErpData } from "@/hooks/use-erp-data";
import { calcularVR, calculateFinanceTotals, formatCurrency } from "@/lib/calculator";
import type { FinanceEntry, VrRecord } from "@/lib/types";

export default function FinanceiroPage() {
  const { data, addFinanceEntry, updateFinanceEntry, addVrRecord } = useErpData();
  const [entryForm, setEntryForm] = useState({
    description: "",
    type: "Entrada" as FinanceEntry["type"],
    category: "",
    amount: "",
    paid: true,
  });
  const [vrForm, setVrForm] = useState({ equipe: "", diasTrabalhados: "0", sabados: "0" });
  const totals = useMemo(() => calculateFinanceTotals(data.finance), [data.finance]);

  const handleAddEntry = () => {
    const amount = Number(entryForm.amount);

    if (!entryForm.description || !entryForm.category || !Number.isFinite(amount)) {
      return;
    }

    addFinanceEntry({
      id: createId("fin"),
      date: new Date().toISOString().slice(0, 10),
      description: entryForm.description,
      type: entryForm.type,
      category: entryForm.category,
      amount,
      paid: entryForm.type === "Entrada" ? true : entryForm.paid,
    });
    setEntryForm({ description: "", type: "Entrada", category: "", amount: "", paid: true });
  };

  const handleAddVr = () => {
    if (!vrForm.equipe) {
      return;
    }

    const record: VrRecord = {
      id: createId("vr"),
      equipe: vrForm.equipe,
      diasTrabalhados: Number(vrForm.diasTrabalhados) || 0,
      sabados: Number(vrForm.sabados) || 0,
      amount: calcularVR(Number(vrForm.diasTrabalhados) || 0, Number(vrForm.sabados) || 0),
    };

    addVrRecord(record);
    setVrForm({ equipe: "", diasTrabalhados: "0", sabados: "0" });
  };

  return (
    <ErpShell active="financeiro">
      <section className="grid gap-6">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight md:text-3xl">Financeiro</h1>
          <p className="mt-2 text-slate-400">
            Controle de entradas, saídas, contas a pagar, saldo e VR.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard label="Entradas" value={formatCurrency(totals.totalEntradas)} helper="receitas cadastradas" tone="positive" />
          <MetricCard label="Despesas" value={formatCurrency(totals.totalSaidas)} helper="saídas totais" tone="danger" />
          <MetricCard label="Saldo Atual" value={formatCurrency(totals.saldoAtual)} helper="pagas consideradas" tone="warning" />
          <MetricCard label="Falta Pagar" value={formatCurrency(totals.totalAPagar)} helper="contas pendentes" tone="danger" />
        </div>

        <section className="rounded-xl border border-yellow-950/70 bg-zinc-950 p-6">
          <h2 className="text-lg font-bold">Cadastrar Entrada ou Saída</h2>
          <div className="mt-4 grid gap-3 md:grid-cols-[1fr_140px_180px_140px_120px_auto]">
            <input
              className="rounded-lg border border-white/10 bg-black px-3 py-3 text-sm"
              onChange={(event) => setEntryForm((current) => ({ ...current, description: event.target.value }))}
              placeholder="Descrição"
              value={entryForm.description}
            />
            <select
              className="rounded-lg border border-white/10 bg-black px-3 py-3 text-sm"
              onChange={(event) => setEntryForm((current) => ({ ...current, type: event.target.value as FinanceEntry["type"] }))}
              value={entryForm.type}
            >
              <option>Entrada</option>
              <option>Saída</option>
            </select>
            <input
              className="rounded-lg border border-white/10 bg-black px-3 py-3 text-sm"
              onChange={(event) => setEntryForm((current) => ({ ...current, category: event.target.value }))}
              placeholder="Categoria"
              value={entryForm.category}
            />
            <input
              className="rounded-lg border border-white/10 bg-black px-3 py-3 text-sm"
              onChange={(event) => setEntryForm((current) => ({ ...current, amount: event.target.value }))}
              placeholder="Valor"
              type="number"
              value={entryForm.amount}
            />
            <label className="flex items-center gap-2 rounded-lg border border-white/10 bg-black px-3 py-3 text-sm">
              <input
                checked={entryForm.paid}
                disabled={entryForm.type === "Entrada"}
                onChange={(event) => setEntryForm((current) => ({ ...current, paid: event.target.checked }))}
                type="checkbox"
              />
              Pago
            </label>
            <button className="rounded-lg bg-yellow-500 px-4 py-3 text-sm font-extrabold text-black" onClick={handleAddEntry}>
              Adicionar
            </button>
          </div>
        </section>

        <div className="grid gap-4 xl:grid-cols-2">
          <LedgerTable
            entries={data.finance.filter((entry) => entry.type === "Entrada")}
            onTogglePaid={updateFinanceEntry}
            title="Entradas"
          />
          <LedgerTable
            entries={data.finance.filter((entry) => entry.type === "Saída")}
            onTogglePaid={updateFinanceEntry}
            title="Saídas e Contas a Pagar"
          />
        </div>

        <section className="rounded-xl border border-yellow-950/70 bg-zinc-950 p-6">
          <h2 className="text-lg font-bold">Controle de VR</h2>
          <div className="mt-4 grid gap-3 md:grid-cols-[1fr_160px_160px_auto]">
            <input
              className="rounded-lg border border-white/10 bg-black px-3 py-3 text-sm"
              onChange={(event) => setVrForm((current) => ({ ...current, equipe: event.target.value }))}
              placeholder="Equipe"
              value={vrForm.equipe}
            />
            <input
              className="rounded-lg border border-white/10 bg-black px-3 py-3 text-sm"
              onChange={(event) => setVrForm((current) => ({ ...current, diasTrabalhados: event.target.value }))}
              placeholder="Dias trabalhados"
              type="number"
              value={vrForm.diasTrabalhados}
            />
            <input
              className="rounded-lg border border-white/10 bg-black px-3 py-3 text-sm"
              onChange={(event) => setVrForm((current) => ({ ...current, sabados: event.target.value }))}
              placeholder="Sábados"
              type="number"
              value={vrForm.sabados}
            />
            <button className="rounded-lg bg-yellow-500 px-4 py-3 text-sm font-extrabold text-black" onClick={handleAddVr}>
              Calcular VR
            </button>
          </div>

          <div className="mt-5 overflow-hidden rounded-xl border border-white/10">
            <table className="w-full min-w-[620px] text-left text-sm">
              <thead className="bg-white/5 text-slate-400">
                <tr>
                  <th className="px-4 py-3">Equipe</th>
                  <th className="px-4 py-3">Dias</th>
                  <th className="px-4 py-3">Sábados</th>
                  <th className="px-4 py-3 text-right">VR</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {data.vr.map((record) => (
                  <tr key={record.id}>
                    <td className="px-4 py-3 font-semibold text-slate-100">{record.equipe}</td>
                    <td className="px-4 py-3 text-slate-400">{record.diasTrabalhados}</td>
                    <td className="px-4 py-3 text-slate-400">{record.sabados}</td>
                    <td className="px-4 py-3 text-right font-bold text-yellow-300">{formatCurrency(record.amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </section>
    </ErpShell>
  );
}

function LedgerTable({
  title,
  entries,
  onTogglePaid,
}: {
  title: string;
  entries: FinanceEntry[];
  onTogglePaid: (entry: FinanceEntry) => void;
}) {
  return (
    <section className="rounded-xl border border-yellow-950/70 bg-zinc-950 p-6">
      <h2 className="text-lg font-bold">{title}</h2>
      <div className="mt-5 overflow-hidden rounded-xl border border-white/10">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="bg-white/5 text-slate-400">
            <tr>
              <th className="px-4 py-3">Descrição</th>
              <th className="px-4 py-3">Categoria</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Valor</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {entries.map((entry) => (
              <tr key={entry.id}>
                <td className="px-4 py-3 font-semibold text-slate-100">{entry.description}</td>
                <td className="px-4 py-3 text-slate-400">{entry.category}</td>
                <td className="px-4 py-3 text-slate-400">
                  {entry.type === "Entrada" ? (
                    "Recebido"
                  ) : (
                    <label className="inline-flex items-center gap-2">
                      <input checked={entry.paid} onChange={(event) => onTogglePaid({ ...entry, paid: event.target.checked })} type="checkbox" />
                      {entry.paid ? "Pago" : "A pagar"}
                    </label>
                  )}
                </td>
                <td className="px-4 py-3 text-right font-bold text-yellow-300">{formatCurrency(entry.amount)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
