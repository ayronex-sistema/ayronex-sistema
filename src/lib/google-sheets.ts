import { google } from "googleapis";
import type { ChecklistSubmission } from "@/types/checklist";
import { getEpiById } from "@/lib/constants";

type SheetsConfig = {
  auth: InstanceType<typeof google.auth.JWT>;
  spreadsheetId: string;
  summarySheet: string;
  itemsSheet: string;
};

export type ChecklistAppendResult = {
  recorded: boolean;
  summaryRows: number;
  itemRows: number;
  summarySheet: string;
  itemsSheet: string;
};

function buildSheetsConfig(): SheetsConfig {
  const spreadsheetId = process.env.CHECKLIST_SPREADSHEET_ID;
  const serviceAccountJson = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;

  if (!spreadsheetId) {
    throw new Error("CHECKLIST_SPREADSHEET_ID não configurado.");
  }

  let clientEmail: string | undefined;
  let privateKey: string | undefined;

  if (serviceAccountJson) {
    try {
      const parsed = JSON.parse(serviceAccountJson) as {
        client_email?: string;
        private_key?: string;
      };
      clientEmail = parsed.client_email;
      privateKey = parsed.private_key?.replace(/\\n/g, "\n");
    } catch {
      throw new Error("GOOGLE_SERVICE_ACCOUNT_JSON está em um formato inválido.");
    }
  } else {
    clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
    privateKey = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY?.replace(/\\n/g, "\n");
  }

  if (!clientEmail || !privateKey) {
    throw new Error(
      "Credenciais do Google Sheets ausentes. Defina GOOGLE_SERVICE_ACCOUNT_JSON ou as variáveis GOOGLE_SERVICE_ACCOUNT_EMAIL e GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY."
    );
  }

  return {
    auth: new google.auth.JWT(clientEmail, undefined, privateKey, ["https://www.googleapis.com/auth/spreadsheets"]),
    spreadsheetId,
    summarySheet: process.env.CHECKLIST_SUMMARY_SHEET ?? "Checklist",
    itemsSheet: process.env.CHECKLIST_ITEMS_SHEET ?? "Checklist_Itens"
  };
}

export async function appendChecklistSubmission(submission: ChecklistSubmission): Promise<ChecklistAppendResult> {
  const client = buildSheetsConfig();
  const sheets = google.sheets({ version: "v4", auth: client.auth });

  const summaryValues = [
    [
      submission.deliveryId,
      submission.companyId,
      submission.employeeId,
      submission.submittedAt,
      submission.signature,
      submission.declarationAccept ? "SIM" : "NÃO"
    ]
  ];

  await sheets.spreadsheets.values.append({
    spreadsheetId: client.spreadsheetId,
    range: `${client.summarySheet}!A:F`,
    valueInputOption: "RAW",
    insertDataOption: "INSERT_ROWS",
    requestBody: { values: summaryValues }
  });

  const itemValues = submission.selectedItems.map((item, index) => {
    const epi = getEpiById(item.epiId);
    return [
      `${submission.deliveryId}-${index + 1}`,
      submission.deliveryId,
      epi?.id ?? item.epiId,
      epi?.name ?? item.epiId,
      item.quantity
    ];
  });

  if (itemValues.length > 0) {
    await sheets.spreadsheets.values.append({
      spreadsheetId: client.spreadsheetId,
      range: `${client.itemsSheet}!A:E`,
      valueInputOption: "RAW",
      insertDataOption: "INSERT_ROWS",
      requestBody: { values: itemValues }
    });
  }

  return {
    recorded: true,
    summaryRows: summaryValues.length,
    itemRows: itemValues.length,
    summarySheet: client.summarySheet,
    itemsSheet: client.itemsSheet
  };
}
