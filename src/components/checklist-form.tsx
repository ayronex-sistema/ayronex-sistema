"use client";

import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ClipboardList, Loader2, Send, ShieldCheck, UserRound, CheckSquare2 } from "lucide-react";
import { Button, Card, Checkbox, Input, Select, Textarea, Badge } from "@/components/ui";
import { SignatureCanvas } from "@/components/signature-canvas";
import { COMPANIES, EPI_OPTIONS, employeesByCompany } from "@/lib/checklist-data";
import { checklistFormSchema, type ChecklistFormValues } from "@/lib/checklist-schema";
import { useChecklistStore } from "@/store/checklist-form-store";

export function ChecklistForm() {
  const updateDraft = useChecklistStore((state) => state.updateDraft);
  const resetDraft = useChecklistStore((state) => state.resetDraft);
  const initialDraft = useMemo(() => useChecklistStore.getState().draft, []);
  const [submitState, setSubmitState] = useState<{
    status: "idle" | "loading" | "success" | "error";
    message: string;
  }>({ status: "idle", message: "" });

  const form = useForm<ChecklistFormValues>({
    resolver: zodResolver(checklistFormSchema),
    defaultValues: initialDraft,
    mode: "onChange"
  });

  const { register, handleSubmit, setValue, watch, formState } = form;
  const companyField = register("company");
  const company = watch("company");
  const employeeId = watch("employeeId");
  const epis = watch("epis");
  const declarationAccept = watch("declarationAccept");
  const employeeOptions = useMemo(() => employeesByCompany(company), [company]);
  const selectedCount = useMemo(() => epis.filter((item) => item.selected).length, [epis]);
  const selectedQuantity = useMemo(
    () => epis.filter((item) => item.selected).reduce((sum, item) => sum + item.quantity, 0),
    [epis]
  );

  useEffect(() => {
    const subscription = watch((value) => {
      updateDraft(value as ChecklistFormValues);
    });

    return () => subscription.unsubscribe();
  }, [updateDraft, watch]);

  useEffect(() => {
    if (employeeId && !employeeOptions.some((employee) => employee.id === employeeId)) {
      setValue("employeeId", "");
    }
  }, [employeeId, employeeOptions, setValue]);

  function handleEpiSelection(epiId: string) {
    const current = form.getValues("epis");
    const next = current.map((item) =>
      item.id === epiId ? { ...item, selected: !item.selected } : item
    );
    setValue("epis", next, { shouldValidate: true, shouldDirty: true });
  }

  function handleQuantity(epiId: string, quantity: number) {
    const current = form.getValues("epis");
    const next = current.map((item) =>
      item.id === epiId ? { ...item, quantity: Math.max(1, quantity) } : item
    );
    setValue("epis", next, { shouldValidate: true, shouldDirty: true });
  }

  const onSubmit = async (values: ChecklistFormValues) => {
    setSubmitState({ status: "loading", message: "Enviando checklist para a planilha..." });

    try {
      const response = await fetch("/api/checklist", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          ...values,
          submittedAt: new Date().toISOString()
        })
      });

      const payload = (await response.json().catch(() => null)) as
        | { ok?: boolean; error?: string; recordedToSheets?: boolean; serverTimestamp?: string }
        | null;

      if (!response.ok) {
        throw new Error(payload?.error ?? "Não foi possível enviar o checklist.");
      }

      setSubmitState({
        status: "success",
        message: payload?.recordedToSheets
          ? "Checklist enviado com sucesso e salvo na planilha."
          : "Checklist enviado com sucesso. A planilha será conectada assim que as credenciais estiverem ativas."
      });

      resetDraft();
      form.reset(initialDraft);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Falha inesperada ao enviar o checklist.";
      setSubmitState({ status: "error", message });
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[1.35fr_0.65fr]">
      <Card className="p-6 shadow-2xl shadow-black/20">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-amber-400">Portal do fiscal</p>
            <h1 className="mt-2 text-3xl font-semibold text-white">Checklist de entrega de EPIs</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-400">
              Estrutura inicial do portal independente, com formulário validado e visual padrão Ayronex.
            </p>
          </div>
          <div className="rounded-2xl border border-amber-400/30 bg-amber-400/10 p-3 text-amber-300">
            <ShieldCheck className="h-7 w-7" />
          </div>
        </div>

        <form className="mt-8 space-y-8" onSubmit={handleSubmit(onSubmit)}>
          <section className="space-y-4 rounded-3xl border border-zinc-800 bg-zinc-950 p-5">
            <div className="flex items-center gap-3">
              <ClipboardList className="h-5 w-5 text-amber-400" />
              <h2 className="text-lg font-semibold text-white">Dados iniciais</h2>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-zinc-300">Empresa</label>
                <Select
                  {...companyField}
                  onChange={(event) => {
                    setValue("company", event.target.value as ChecklistFormValues["company"], {
                      shouldValidate: true,
                      shouldDirty: true
                    });
                    setValue("employeeId", "", { shouldValidate: true, shouldDirty: true });
                  }}
                >
                  {COMPANIES.map((companyOption) => (
                    <option key={companyOption.id} value={companyOption.id}>
                      {companyOption.label}
                    </option>
                  ))}
                </Select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-zinc-300">Funcionário</label>
                <Select {...register("employeeId")}>
                  <option value="">Selecione um funcionário</option>
                  {employeeOptions.map((employee) => (
                    <option key={employee.id} value={employee.id}>
                      {employee.label} — {employee.role}
                    </option>
                  ))}
                </Select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-zinc-300">Fiscal responsável</label>
                <Input {...register("inspectorName")} placeholder="Nome do fiscal" />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-zinc-300">Observações</label>
                <Textarea {...register("observations")} placeholder="Pendências, troca, observação de campo..." rows={4} />
              </div>
            </div>
          </section>

          <section className="space-y-4 rounded-3xl border border-zinc-800 bg-zinc-950 p-5">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <CheckSquare2 className="h-5 w-5 text-amber-400" />
                <h2 className="text-lg font-semibold text-white">Lista de EPIs</h2>
              </div>
              <Badge className="bg-amber-400/10 text-amber-300">{selectedCount} selecionados</Badge>
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {EPI_OPTIONS.map((epi, index) => {
                const current = epis[index];
                return (
                  <label
                    key={epi.id}
                    className={[
                      "cursor-pointer rounded-2xl border p-4 transition",
                      current?.selected ? "border-amber-400 bg-amber-400/10" : "border-zinc-800 bg-zinc-900/40 hover:border-zinc-700"
                    ].join(" ")}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold text-white">{epi.label}</p>
                        <p className="text-sm text-zinc-400">CA {epi.ca}</p>
                      </div>
                      <Checkbox checked={Boolean(current?.selected)} onChange={() => handleEpiSelection(epi.id)} />
                    </div>

                    {current?.selected ? (
                      <div className="mt-4 space-y-2">
                        <label className="block text-xs uppercase tracking-[0.25em] text-zinc-500">Quantidade</label>
                        <Input
                          type="number"
                          min={1}
                          value={current.quantity}
                          onChange={(event) => handleQuantity(epi.id, Number(event.target.value))}
                        />
                      </div>
                    ) : null}
                  </label>
                );
              })}
            </div>
          </section>

          <section className="space-y-4 rounded-3xl border border-zinc-800 bg-zinc-950 p-5">
            <div className="flex items-center gap-3">
              <UserRound className="h-5 w-5 text-amber-400" />
              <h2 className="text-lg font-semibold text-white">Assinatura digital</h2>
            </div>
            <SignatureCanvas value={watch("signature")} onChange={(dataUrl) => setValue("signature", dataUrl, { shouldValidate: true })} />
          </section>

          <section className="rounded-3xl border border-zinc-800 bg-zinc-950 p-5">
            <label className="flex cursor-pointer items-start gap-3 text-sm text-zinc-300">
              <Checkbox
                checked={declarationAccept}
                onChange={(event) => setValue("declarationAccept", event.target.checked, { shouldValidate: true, shouldDirty: true })}
                className="mt-1"
              />
              <span>
                Confirmo que os EPIs listados acima foram entregues corretamente e que o funcionário está ciente do recebimento.
              </span>
            </label>
          </section>

          <div className="flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-zinc-800 bg-zinc-950 p-5">
            <div className="space-y-1 text-sm text-zinc-400">
              <p>Funcionário selecionado: {employeeOptions.find((item) => item.id === watch("employeeId"))?.label ?? "—"}</p>
              <p>Total de itens: {selectedQuantity}</p>
            </div>
            <Button
              type="submit"
              disabled={formState.isSubmitting || submitState.status === "loading"}
              className="min-w-[180px] gap-2"
            >
              {submitState.status === "loading" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              Salvar checklist
            </Button>
          </div>

          {submitState.status !== "idle" ? (
            <div
              className={[
                "rounded-2xl border px-4 py-3 text-sm",
                submitState.status === "success"
                  ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                  : submitState.status === "error"
                    ? "border-red-500/30 bg-red-500/10 text-red-300"
                    : "border-amber-500/30 bg-amber-500/10 text-amber-300"
              ].join(" ")}
            >
              {submitState.message}
            </div>
          ) : null}
        </form>
      </Card>

      <aside className="space-y-6">
        <Card className="p-6">
          <p className="text-xs uppercase tracking-[0.35em] text-zinc-500">Estrutura</p>
          <h3 className="mt-2 text-xl font-semibold text-white">Base pronta para crescer</h3>
          <p className="mt-3 text-sm leading-6 text-zinc-400">
            Esta primeira versão já separa os componentes de interface, o schema de validação e o estado temporário do formulário.
          </p>
        </Card>

        <Card className="p-6">
          <p className="text-sm font-medium text-zinc-300">Resumo do rascunho</p>
          <div className="mt-4 space-y-3 text-sm text-zinc-400">
            <p><span className="text-zinc-500">Empresa:</span> {watch("company")}</p>
            <p><span className="text-zinc-500">Funcionário:</span> {watch("employeeId") || "—"}</p>
            <p><span className="text-zinc-500">EPIs ativos:</span> {selectedCount}</p>
            <p><span className="text-zinc-500">Declaração:</span> {declarationAccept ? "aceita" : "pendente"}</p>
            <p><span className="text-zinc-500">Assinatura:</span> {watch("signature") ? "capturada" : "pendente"}</p>
          </div>
        </Card>
      </aside>
    </div>
  );
}
