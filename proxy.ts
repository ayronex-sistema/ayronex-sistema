import { NextResponse, type NextRequest } from "next/server";

const protectedRoutes = ["/dashboard", "/operacao", "/funcionarios", "/financeiro"];

export function proxy(req: NextRequest) {
  const isProtected = protectedRoutes.some((route) => req.nextUrl.pathname.startsWith(route));
  const isLoggedIn = req.cookies.get("ayronex_session")?.value === "active";

  if (isProtected && !isLoggedIn) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  if (req.nextUrl.pathname === "/login" && isLoggedIn) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/operacao/:path*", "/funcionarios/:path*", "/financeiro/:path*", "/login"],
};
