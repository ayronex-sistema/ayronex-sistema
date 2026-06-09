import { NextResponse } from "next/server";
import { EMPLOYEE_SHEET_GID, EMPLOYEE_SHEET_ID, EMPLOYEE_SHEET_NAME, parseEmployeeSheetRows } from "@/lib/employees";

export const runtime = "nodejs";

const GOOGLE_SHEETS_CSV_URL =
  process.env.GOOGLE_FUNCIONARIOS_CSV_URL ??
  `https://docs.google.com/spreadsheets/d/${EMPLOYEE_SHEET_ID}/gviz/tq?tqx=out:csv&gid=${EMPLOYEE_SHEET_GID}`;

export async function GET() {
  try {
    const response = await fetch(GOOGLE_SHEETS_CSV_URL, {
      cache: "no-store",
      headers: {
        Accept: "text/csv,text/plain,*/*",
      },
    });

    if (!response.ok) {
      throw new Error(`Google Sheets respondeu ${response.status}.`);
    }

    const csv = await response.text();
    const rows = parseCsv(csv);
    const employees = parseEmployeeSheetRows(rows);

    if (employees.length === 0) {
      throw new Error("Nenhum funcionário encontrado na planilha.");
    }

    return NextResponse.json({
      employees,
      source: "google-sheets",
      sheet: EMPLOYEE_SHEET_NAME,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Falha ao carregar funcionários.";

    return NextResponse.json(
      {
        error: message,
        source: "fallback",
        sheet: EMPLOYEE_SHEET_NAME,
      },
      { status: 502 },
    );
  }
}

function parseCsv(csv: string) {
  const rows: string[][] = [];
  let currentCell = "";
  let currentRow: string[] = [];
  let insideQuotes = false;

  for (let index = 0; index < csv.length; index += 1) {
    const char = csv[index];
    const nextChar = csv[index + 1];

    if (char === '"' && insideQuotes && nextChar === '"') {
      currentCell += '"';
      index += 1;
      continue;
    }

    if (char === '"') {
      insideQuotes = !insideQuotes;
      continue;
    }

    if (char === "," && !insideQuotes) {
      currentRow.push(currentCell);
      currentCell = "";
      continue;
    }

    if ((char === "\n" || char === "\r") && !insideQuotes) {
      if (char === "\r" && nextChar === "\n") {
        index += 1;
      }

      currentRow.push(currentCell);
      rows.push(currentRow);
      currentCell = "";
      currentRow = [];
      continue;
    }

    currentCell += char;
  }

  if (currentCell || currentRow.length > 0) {
    currentRow.push(currentCell);
    rows.push(currentRow);
  }

  return rows;
}
