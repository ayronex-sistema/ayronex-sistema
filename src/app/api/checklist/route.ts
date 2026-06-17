import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { isBasicAuthValid } from "@/lib/basic-auth";
import { checklistFormSchema } from "@/lib/checklist-schema";
import { appendChecklistSubmission } from "@/lib/google-sheets";
import { getCompanyById, getEmployeeById, getEpiById } from "@/lib/constants";
import type { ChecklistSubmission } from "@/types/checklist";

export const runtime = "nodejs";

function unauthorizedResponse() {
  return NextResponse.json(
    { error: "Não autorizado." },
    {
      status: 401,
      headers: {
        "WWW-Authenticate": 'Basic realm="Checklist Ayronex", charset="UTF-8"'
      }
    }
  );
}

export async function POST(request: Request) {
  try {
    if (!isBasicAuthValid(request.headers.get("authorization"))) {
      return unauthorizedResponse();
    }

    const body = (await request.json().catch(() => null)) as unknown;
    const parsed = checklistFormSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Dados inválidos.", issues: parsed.error.flatten() }, { status: 400 });
    }

    const submission = parsed.data;
    const selectedItems = submission.epis.filter((item) => item.selected).map(({ id, quantity }) => ({
      epiId: id,
      quantity
    }));

    if (selectedItems.length === 0) {
      return NextResponse.json({ error: "Selecione pelo menos um EPI." }, { status: 400 });
    }

    const company = getCompanyById(submission.company);
    const employee = getEmployeeById(submission.employeeId);

    if (!company) {
      return NextResponse.json({ error: "Empresa não encontrada." }, { status: 404 });
    }

    if (!employee || employee.companyId !== company.id) {
      return NextResponse.json({ error: "Funcionário não pertence à empresa selecionada." }, { status: 400 });
    }

    const invalidEpi = selectedItems.find((item) => !getEpiById(item.epiId));
    if (invalidEpi) {
      return NextResponse.json({ error: "Um dos EPIs selecionados não existe." }, { status: 400 });
    }

    const payload: ChecklistSubmission = {
      deliveryId: randomUUID(),
      companyId: submission.company,
      employeeId: submission.employeeId,
      inspectorName: submission.inspectorName || process.env.FISCAL_USER_NAME || process.env.FISCAL_USER_EMAIL || "Fiscal",
      observations: submission.observations,
      signature: submission.signature,
      selectedItems,
      submittedAt: new Date().toISOString(),
      declarationAccept: submission.declarationAccept
    };

    const recorded = await appendChecklistSubmission(payload);

    return NextResponse.json({
      ok: true,
      recordedToSheets: recorded.recorded,
      summaryRows: recorded.summaryRows,
      itemRows: recorded.itemRows,
      serverTimestamp: payload.submittedAt
    });
  } catch (error) {
    const message =
      process.env.NODE_ENV === "development" && error instanceof Error
        ? error.message
        : "Falha ao salvar o checklist na planilha.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
