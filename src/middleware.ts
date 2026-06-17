import { NextRequest, NextResponse } from "next/server";
import { isBasicAuthValid } from "@/lib/basic-auth";

const REALM = "Checklist Ayronex";

function unauthorizedResponse() {
  return new NextResponse("Authentication required.", {
    status: 401,
    headers: {
      "WWW-Authenticate": `Basic realm="${REALM}", charset="UTF-8"`
    }
  });
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isProtectedRoute = pathname.startsWith("/checklist");

  if (!isProtectedRoute) {
    return NextResponse.next();
  }

  if (!process.env.FISCAL_USER_EMAIL || !process.env.FISCAL_USER_PASSWORD) {
    return unauthorizedResponse();
  }

  if (!isBasicAuthValid(request.headers.get("authorization"))) {
    return unauthorizedResponse();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/checklist/:path*"]
};
