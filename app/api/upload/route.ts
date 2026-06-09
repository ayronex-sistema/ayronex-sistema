import { NextRequest, NextResponse } from 'next/server';
import * as XLSX from 'xlsx';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) return NextResponse.json({ error: 'Nenhum arquivo enviado.' }, { status: 400 });

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    const firstSheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheetName];
    const rows = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];

    // Log para você ver no terminal se o link foi carregado
    const scriptUrl = process.env.GOOGLE_SCRIPT_URL;
    console.log("Link carregado:", scriptUrl); 

    if (!scriptUrl) {
      throw new Error("GOOGLE_SCRIPT_URL não está definida.");
    }
    
    const response = await fetch(scriptUrl, {
      method: 'POST',
      body: JSON.stringify(rows),
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    });

    if (!response.ok) throw new Error(`Erro no Google: ${response.statusText}`);

    const result = await response.json();
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Erro detalhado:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}