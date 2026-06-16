"use client";

import { useMemo, useState } from "react";
import { ErpShell } from "@/components/erp-shell";
import { ModuleSpreadsheetActions, type SpreadsheetRow } from "@/components/module-spreadsheet-actions";
import { createId, useErpData } from "@/hooks/use-erp-data";
import { findBestConectaCode } from "@/utils/conecta-matcher";
import { parseOperationMessage, type ParsedOperationMessage } from "@/utils/parser";
import type { ProductionRecord, ProductionStatus, WhatsAppMessageRecord } from "@/lib/types";

const exampleMessage = `SP: 45872
Cabo: CTO-12 / FO-08
Local: Rua das Palmeiras, 120 - Centro
Status: OK
Equipe: Equipe Norte
Materiais: 80m fibra, 2 conectores, 1 CTO`;

const statusOptions: ProductionStatus[] = ["OK", "Pendente", "Refazer"];

export default function WhatsAppPage() {
  const { data, dataByCompany, empresaAtiva, addProduction, addWhatsAppMessage } = useErpData();
  const [message, setMessage] = useState(exampleMessage);
  const [parsed, setParsed] = useState<ParsedOperationMessage>(() => parseOperationMessage(exampleMessage));
  const [selectedCodeId, setSelectedCodeId] = useState(data.conectaCodes[0]?.id ?? "");
  const [status, setStatus] = useState<ProductionStatus>("OK");
  const [launchedConecta, setLaunchedConecta] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const selectedCode = data.conectaCodes.find((code) => code.id === selectedCodeId) ?? data.conectaCodes[0];
  const suggestedCode = useMemo(() => findBestConectaCode(parsed, data.conectaCodes), [data.conectaCodes, parsed]);

  const preview = useMemo(() => JSON.stringify(parsed, null, 2), [parsed]);

  function handleParse() {
    const nextParsed = parseOperationMessage(message);
    const matchedCode = findBestConectaCode(nextParsed, data.conectaCodes);

    setParsed(nextParsed);
    if (matchedCode) {
      setSelectedCodeId(matchedCode.id);
    }
    setFeedback(null);
  }

  function handleSaveMessage() {
    const nextParsed = parseOperationMessage(message);
    const code = selectedCode ?? findBestConectaCode(nextParsed, data.conectaCodes);

    if (!code) {
      setFeedback("Cadastre ou selecione um código Conecta antes de salvar a mensagem.");
      return;
    }

    const whatsappMessage: WhatsAppMessageRecord = {
      id: createId("wa"),
      empresa: empresaAtiva,
      recebidoEm: new Date().toISOString(),
      remetente: "Equipe operacional",
      mensagem: nextParsed.raw,
      sp: nextParsed.sp ?? "",
      cabo: nextParsed.cabo ?? "",
      local: nextParsed.local ?? "",
      status,
      equipe: nextParsed.equipe ?? "Sem equipe",
      materiais: nextParsed.materiais,
      confidence: nextParsed.confidence,
      launchedConecta,
    };

    const production: ProductionRecord = {
      id: createId("prod-wa"),
      empresa: empresaAtiva,
      date: new Date().toISOString().slice(0, 10),
      sp: whatsappMessage.sp,
      cabo: whatsappMessage.cabo,
      local: whatsappMessage.local,
      status: whatsappMessage.status,
      equipe: whatsappMessage.equipe,
      materiais: whatsappMessage.materiais,
      conectaCodeId: code.id,
      conectaCode: code.code,
      points: code.points,
      value: code.value,
      launchedConecta,
      rawMessage: whatsappMessage.mensagem,
    };

    addWhatsAppMessage(whatsappMessage);
    addProduction(production);
    setParsed(nextParsed);
    setFeedback("Mensagem processada e enviada para o fluxo de produção da empresa ativa.");
  }

  function handleImportMessages(rows: SpreadsheetRow[]) {
    rows.forEach((row, index) => {
      const raw = String(row.mensagem ?? row.mensagemOriginal ?? row.raw ?? JSON.stringify(row));
      const parsedRow = parseOperationMessage(raw);
      const code = findBestConectaCode(parsedRow, data.conectaCodes) ?? data.conectaCodes[0];

      if (!code) {
        return;
      }

      addWhatsAppMessage({
        id: createId("wa-import"),
        empresa: empresaAtiva,
        recebidoEm: String(row.recebidoEm ?? new Date().toISOString()),
        remetente: String(row.remetente ?? row.origem ?? `Importado ${index + 1}`),
        mensagem: raw,
        sp: parsedRow.sp ?? "",
        cabo: parsedRow.cabo ?? "",
        local: parsedRow.local ?? "",
        status: normalizeProductionStatus(parsedRow.status ?? "OK"),
        equipe: parsedRow.equipe ?? "Sem equipe",
        materiais: parsedRow.materiais,
        confidence: parsedRow.confidence,
        launchedConecta: String(row.launchedConecta ?? row.conecta ?? "").toLowerCase().includes("true"),
      });

      addProduction({
        id: createId("prod-wa-import"),
        empresa: empresaAtiva,
        date: String(row.date ?? row.data ?? new Date().toISOString().slice(0, 10)),
        sp: parsedRow.sp ?? `WA-${index + 1}`,
        cabo: parsedRow.cabo ?? "",
        local: parsedRow.local ?? "",
        status: normalizeProductionStatus(parsedRow.status ?? "OK"),
        equipe: parsedRow.equipe ?? "Sem equipe",
        materiais: parsedRow.materiais,
        conectaCodeId: code.id,
        conectaCode: code.code,
        points: code.points,
        value: code.value,
        launchedConecta: String(row.launchedConecta ?? row.conecta ?? "").toLowerCase().includes("true"),
        rawMessage: raw,
      });
    });

    setFeedback(`${rows.length} mensagens importadas para ${empresaAtiva}.`);
  }

  return (
    <ErpShell active="whatsapp">
      <section className="grid gap-6">
        <header>
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-yellow-500">WhatsApp</p>
          <h1 className="mt-2 text-3xl font-black tracking-tight text-white">Leitura de mensagens da equipe</h1>
          <p className="mt-3 max-w-3xl text-sm text-slate-400">
            Aqui fica só o fluxo de mensagens: leitura, parse automático, sugestão do Conecta e envio para a produção.
          </p>
        </header>

        <ModuleSpreadsheetActions
          description="Exporta e importa somente mensagens de WhatsApp da empresa ativa."
          empresa={empresaAtiva}
          moduleKey="whatsapp"
          moduleLabel="WhatsApp"
          onImportRows={handleImportMessages}
          rows={dataByCompany.whatsappMessages}
        />

        <div className="grid gap-4 xl:grid-cols-[1fr_0.95fr]">
          <section className="rounded-2xl border border-white/10 bg-zinc-950 p-6">
            <label className="text-sm font-semibold text-slate-300" htmlFor="message-input">
              Mensagem recebida
            </label>
            <textarea
              className="mt-3 min-h-72 w-full rounded-2xl border border-white/10 bg-black p-4 text-sm leading-6 text-slate-100 outline-none transition focus:border-emerald-500/60"
              id="message-input"
              onChange={(event) => setMessage(event.target.value)}
              value={message}
            />

            <div className="mt-4 grid gap-3 md:grid-cols-3">
              <select
                className="rounded-xl border border-white/10 bg-black px-3 py-3 text-sm"
                onChange={(event) => setSelectedCodeId(event.target.value)}
                value={selectedCode?.id ?? ""}
              >
                {data.conectaCodes.map((code) => (
                  <option key={code.id} value={code.id}>
                    {code.code} - {code.description}
                  </option>
                ))}
              </select>
              <select
                className="rounded-xl border border-white/10 bg-black px-3 py-3 text-sm"
                onChange={(event) => setStatus(event.target.value as ProductionStatus)}
                value={status}
              >
                {statusOptions.map((option) => (
                  <option key={option}>{option}</option>
                ))}
              </select>
              <label className="flex items-center gap-2 rounded-xl border border-white/10 bg-black px-3 py-3 text-sm">
                <input
                  checked={launchedConecta}
                  onChange={(event) => setLaunchedConecta(event.target.checked)}
                  type="checkbox"
                />
                Lançado no Conecta
              </label>
            </div>

            {suggestedCode ? (
              <p className="mt-3 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3 text-sm text-emerald-200">
                Sugestão automática Conecta: <strong>{suggestedCode.code}</strong> — {suggestedCode.description}
              </p>
            ) : (
              <p className="mt-3 rounded-xl border border-yellow-500/20 bg-yellow-500/10 p-3 text-sm text-yellow-200">
                Nenhum código Conecta sugerido ainda. Cadastre palavras-chave na descrição do código.
              </p>
            )}

            <div className="mt-4 flex flex-col gap-3 sm:flex-row">
              <button className="rounded-xl bg-white/10 px-4 py-3 text-sm font-bold" onClick={handleParse} type="button">
                Gerar JSON
              </button>
              <button
                className="rounded-xl bg-gradient-to-r from-emerald-300 to-emerald-600 px-4 py-3 text-sm font-extrabold text-black"
                onClick={handleSaveMessage}
                type="button"
              >
                Salvar mensagem
              </button>
            </div>

            {feedback ? <p className="mt-4 rounded-xl bg-white/5 p-3 text-sm text-slate-200">{feedback}</p> : null}
          </section>

          <section className="rounded-2xl border border-white/10 bg-zinc-950 p-6">
            <h2 className="text-lg font-bold">Preview estruturado</h2>
            <pre className="mt-4 max-h-[420px] overflow-auto rounded-2xl border border-white/10 bg-black p-4 text-sm leading-6 text-emerald-300">
              {preview}
            </pre>
          </section>
        </div>

        <section className="rounded-2xl border border-white/10 bg-black p-6">
          <h2 className="text-lg font-bold">Mensagens recentes</h2>
          <div className="mt-4 overflow-hidden rounded-2xl border border-white/10">
            <table className="w-full min-w-[900px] text-left text-sm">
              <thead className="bg-white/5 text-slate-400">
                <tr>
                  <th className="px-4 py-3">Recebido em</th>
                  <th className="px-4 py-3">Remetente</th>
                  <th className="px-4 py-3">Equipe</th>
                  <th className="px-4 py-3">SP</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Confiança</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {dataByCompany.whatsappMessages.map((item) => (
                  <tr key={item.id}>
                    <td className="px-4 py-3 text-slate-300">{formatDateTime(item.recebidoEm)}</td>
                    <td className="px-4 py-3 text-slate-300">{item.remetente}</td>
                    <td className="px-4 py-3 text-slate-300">{item.equipe}</td>
                    <td className="px-4 py-3 font-bold text-yellow-300">{item.sp}</td>
                    <td className="px-4 py-3 text-slate-300">{item.status}</td>
                    <td className="px-4 py-3 text-slate-300">{Math.round(item.confidence * 100)}%</td>
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

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short" }).format(new Date(value));
}

function normalizeProductionStatus(value: string) {
  const normalized = value.toLowerCase();
  if (normalized.includes("ref")) return "Refazer";
  if (normalized.includes("pend")) return "Pendente";
  return "OK";
}
