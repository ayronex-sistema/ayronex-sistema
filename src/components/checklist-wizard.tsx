"use client";

import { useMemo, useState } from "react";
import { CheckCircle2, ChevronLeft, ChevronRight, ClipboardList, Loader2, Send, UserRound } from "lucide-react";
import { COMPANIES, EPI_CATALOG, getEmployeesByCompany, getEmployeeById, getCompanyById, getEpiById } from "@/lib/constants";
import { Stepper } from "@/components/stepper";
import { SignatureField } from "@/components/signature-pad";

type ChecklistWizardProps = {
  inspectorName: string;
};

type SelectedItem = {
  epiId: string;
  quantity: number;
};

const STEPS = ["Empresa e funcionário", "EPIs entregues", "Assinatura e envio"];

export function ChecklistWizard({ inspectorName }: ChecklistWizardProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [companyId, setCompanyId] = useState(COMPANIES[0]?.id ?? "");
  const [employeeId, setEmployeeId] = useState("");
  const [selectedItems, setSelectedItems] = useState<SelectedItem[]>([]);
  const [signature, setSignature] = useState("");
  const [signatureKey, setSignatureKey] = useState(0);
  const [observations, setObservations] = useState("");
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [loading, setLoading] = useState(false);

  const company = useMemo(() => getCompanyById(companyId), [companyId]);
  const employees = useMemo(() => getEmployeesByCompany(companyId), [companyId]);
  const employee = useMemo(() => getEmployeeById(employeeId), [employeeId]);
  const totalItems = useMemo(() => selectedItems.reduce((sum, item) => sum + item.quantity, 0), [selectedItems]);

  const canContinueStep1 = Boolean(companyId && employeeId);
  const canContinueStep2 = selectedItems.length > 0;
  const canSubmit = Boolean(canContinueStep1 && canContinueStep2 && signature);

  function toggleEpi(epiId: string) {
    setSelectedItems((current) => {
      const exists = current.find((item) => item.epiId === epiId);
      if (exists) {
        return current.filter((item) => item.epiId !== epiId);
      }
      const epi = getEpiById(epiId);
      return [...current, { epiId, quantity: epi?.defaultQuantity ?? 1 }];
    });
  }

  function updateQuantity(epiId: string, quantity: number) {
    setSelectedItems((current) =>
      current.map((item) => (item.epiId === epiId ? { ...item, quantity: Math.max(1, quantity) } : item))
    );
  }

  function resetForm() {
    setCurrentStep(0);
    setCompanyId(COMPANIES[0]?.id ?? "");
    setEmployeeId("");
    setSelectedItems([]);
    setSignature("");
    setSignatureKey((current) => current + 1);
    setObservations("");
  }

  async function handleSubmit() {
    if (!canSubmit) return;
    setLoading(true);
    setMessage(null);

    try {
      const response = await fetch("/api/checklist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyId,
          employeeId,
          inspectorName,
          selectedItems,
          signature,
          observations,
          submittedAt: new Date().toISOString()
        })
      });

      const body = (await response.json().catch(() => null)) as { error?: string; recordedToSheets?: boolean } | null;

      if (!response.ok) {
        setMessage({ type: "error", text: body?.error ?? "Não foi possível salvar o checklist." });
        return;
      }

      setMessage({
        type: "success",
        text: body?.recordedToSheets
          ? "Checklist enviado com sucesso para a planilha da central."
          : "Checklist salvo localmente. Conecte as credenciais do Google Sheets para registrar na planilha."
      });
      resetForm();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <Stepper steps={STEPS} currentStep={currentStep} />

      <div className="grid gap-6 lg:grid-cols-[1.4fr_0.8fr]">
        <section className="rounded-3xl border border-zinc-800 bg-zinc-900/70 p-6 shadow-2xl shadow-black/20">
          {currentStep === 0 ? (
            <div className="space-y-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.35em] text-amber-400">Etapa 1</p>
                  <h2 className="mt-2 text-2xl font-semibold text-white">Selecione a empresa e o funcionário</h2>
                  <p className="mt-2 text-sm text-zinc-400">O fiscal só enxerga o fluxo de checklist. Nada de áreas administrativas.</p>
                </div>
                <ClipboardList className="h-10 w-10 text-amber-400" />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-zinc-300">Empresa</label>
                  <select
                    value={companyId}
                    onChange={(event) => {
                      setCompanyId(event.target.value);
                      setEmployeeId("");
                    }}
                    className="w-full rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-zinc-100 outline-none transition focus:border-amber-400"
                  >
                    {COMPANIES.map((option) => (
                      <option key={option.id} value={option.id}>
                        {option.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-zinc-300">Funcionário</label>
                  <select
                    value={employeeId}
                    onChange={(event) => setEmployeeId(event.target.value)}
                    className="w-full rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-zinc-100 outline-none transition focus:border-amber-400"
                  >
                    <option value="">Selecione um funcionário</option>
                    {employees.map((option) => (
                      <option key={option.id} value={option.id}>
                        {option.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {company && employee ? (
                <div className="grid gap-4 rounded-2xl border border-zinc-800 bg-zinc-950 p-4 md:grid-cols-2">
                  <div>
                    <p className="text-xs uppercase tracking-[0.3em] text-zinc-500">Empresa ativa</p>
                    <p className="mt-1 text-lg font-semibold text-white">{company.name}</p>
                    <p className="text-sm text-zinc-400">{company.cnpj}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.3em] text-zinc-500">Funcionário</p>
                    <p className="mt-1 text-lg font-semibold text-white">{employee.name}</p>
                    <p className="text-sm text-zinc-400">
                      {employee.registration} • {employee.role}
                    </p>
                  </div>
                </div>
              ) : null}
            </div>
          ) : null}

          {currentStep === 1 ? (
            <div className="space-y-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.35em] text-amber-400">Etapa 2</p>
                  <h2 className="mt-2 text-2xl font-semibold text-white">Marque os EPIs entregues</h2>
                  <p className="mt-2 text-sm text-zinc-400">Cada item vira uma linha no checklist e segue com CA, quantidade e assinatura.</p>
                </div>
                <UserRound className="h-10 w-10 text-amber-400" />
              </div>

              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {EPI_CATALOG.map((epi) => {
                  const selected = selectedItems.find((item) => item.epiId === epi.id);
                  return (
                    <label
                      key={epi.id}
                      className={[
                        "cursor-pointer rounded-3xl border p-4 transition",
                        selected ? "border-amber-400 bg-amber-400/10" : "border-zinc-800 bg-zinc-950 hover:border-zinc-700"
                      ].join(" ")}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-semibold text-white">{epi.name}</p>
                          <p className="text-sm text-zinc-400">CA {epi.ca}</p>
                          <p className="text-xs text-zinc-500">{epi.unit}</p>
                        </div>
                        <input
                          type="checkbox"
                          checked={Boolean(selected)}
                          onChange={() => toggleEpi(epi.id)}
                          className="mt-1 h-4 w-4 accent-amber-400"
                        />
                      </div>

                      {selected ? (
                        <div className="mt-4">
                          <label className="mb-2 block text-xs uppercase tracking-[0.3em] text-zinc-500">Quantidade</label>
                          <input
                            type="number"
                            min={1}
                            value={selected.quantity}
                            onChange={(event) => updateQuantity(epi.id, Number(event.target.value))}
                            className="w-full rounded-2xl border border-zinc-800 bg-zinc-900 px-3 py-2 text-zinc-100 outline-none focus:border-amber-400"
                          />
                        </div>
                      ) : null}
                    </label>
                  );
                })}
              </div>
            </div>
          ) : null}

          {currentStep === 2 ? (
            <div className="space-y-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.35em] text-amber-400">Etapa 3</p>
                  <h2 className="mt-2 text-2xl font-semibold text-white">Assinatura e envio</h2>
                  <p className="mt-2 text-sm text-zinc-400">Revise o checklist e finalize com assinatura digital.</p>
                </div>
                <CheckCircle2 className="h-10 w-10 text-amber-400" />
              </div>

              <SignatureField key={signatureKey} value={signature} onChange={setSignature} />

              <div>
                <label className="mb-2 block text-sm font-medium text-zinc-300">Observações</label>
                <textarea
                  rows={4}
                  value={observations}
                  onChange={(event) => setObservations(event.target.value)}
                  className="w-full rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-zinc-100 outline-none transition placeholder:text-zinc-600 focus:border-amber-400"
                  placeholder="Ex.: substituição em andamento, itens danificados, pendências..."
                />
              </div>

              <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4 text-sm text-zinc-400">
                <p className="font-medium text-zinc-200">Resumo</p>
                <div className="mt-3 grid gap-2 md:grid-cols-2">
                  <p><span className="text-zinc-500">Empresa:</span> {company?.name}</p>
                  <p><span className="text-zinc-500">Funcionário:</span> {employee?.name}</p>
                  <p><span className="text-zinc-500">Itens:</span> {totalItems}</p>
                  <p><span className="text-zinc-500">Fiscal:</span> {inspectorName}</p>
                </div>
              </div>
            </div>
          ) : null}
        </section>

        <aside className="space-y-6">
          <div className="rounded-3xl border border-zinc-800 bg-zinc-900/70 p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-zinc-500">Portal do fiscal</p>
            <h3 className="mt-2 text-xl font-semibold text-white">Somente checklist</h3>
            <p className="mt-2 text-sm text-zinc-400">
              Este portal foi desenhado para receber dados e assinatura. A integração com o ERP principal acontecerá via aba de Checklist.
            </p>
          </div>

          <div className="rounded-3xl border border-zinc-800 bg-zinc-900/70 p-6">
            <p className="text-sm font-medium text-zinc-300">Progresso</p>
            <div className="mt-3 flex items-center gap-3 text-sm text-zinc-400">
              <span className="rounded-full bg-amber-400 px-2 py-1 text-xs font-semibold text-black">
                {selectedItems.length} EPIs
              </span>
              <span className="rounded-full border border-zinc-700 px-2 py-1 text-xs">
                {totalItems} itens
              </span>
            </div>
            <div className="mt-4 h-2 rounded-full bg-zinc-800">
              <div
                className="h-2 rounded-full bg-amber-400 transition-all"
                style={{ width: `${Math.min(100, (currentStep / (STEPS.length - 1)) * 100)}%` }}
              />
            </div>
          </div>

          <div className="rounded-3xl border border-zinc-800 bg-zinc-900/70 p-6">
            <p className="text-sm font-medium text-zinc-300">Seleção atual</p>
            <div className="mt-3 space-y-2 text-sm text-zinc-400">
              <p>Empresa: {company?.name ?? "-"}</p>
              <p>Funcionário: {employee?.name ?? "-"}</p>
              <p>Assinatura: {signature ? "capturada" : "pendente"}</p>
            </div>
          </div>
        </aside>
      </div>

      {message ? (
        <div
          className={[
            "rounded-2xl border px-4 py-3 text-sm",
            message.type === "success"
              ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-300"
              : "border-red-500/40 bg-red-500/10 text-red-300"
          ].join(" ")}
        >
          {message.text}
        </div>
      ) : null}

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-zinc-800 bg-zinc-900/70 p-4">
        <button
          type="button"
          onClick={() => setCurrentStep((step) => Math.max(0, step - 1))}
          disabled={currentStep === 0}
          className="inline-flex items-center gap-2 rounded-2xl border border-zinc-700 px-4 py-3 text-sm text-zinc-200 transition hover:border-amber-400 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ChevronLeft className="h-4 w-4" />
          Voltar
        </button>

        {currentStep < 2 ? (
          <button
            type="button"
            onClick={() => {
              if ((currentStep === 0 && canContinueStep1) || (currentStep === 1 && canContinueStep2)) {
                setCurrentStep((step) => step + 1);
              }
            }}
            className="inline-flex items-center gap-2 rounded-2xl bg-amber-400 px-4 py-3 font-semibold text-black transition hover:bg-amber-300"
          >
            Avançar
            <ChevronRight className="h-4 w-4" />
          </button>
        ) : (
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!canSubmit || loading}
            className="inline-flex items-center gap-2 rounded-2xl bg-amber-400 px-5 py-3 font-semibold text-black transition hover:bg-amber-300 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            Enviar checklist
          </button>
        )}
      </div>
    </div>
  );
}
