import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { password } = (await req.json()) as { password?: string };
  const expectedPassword = process.env.ERP_PASSWORD || "ayronex123";

  if (password !== expectedPassword) {
    return NextResponse.json({ error: "Senha inválida." }, { status: 401 });
  }

  const response = NextResponse.json({ success: true });
  response.cookies.set("ayronex_session", "active", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 12,
  });

  return response;
}
