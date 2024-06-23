import { NextResponse, type NextRequest } from "next/server";
import { getSession } from "./lib/session";

export async function middleware(req: NextRequest) {
  const session = await getSession();
  if (!session.userId) {
    return NextResponse.redirect(new URL(req.url).origin + "/auth", {
      status: 302,
    });
  }
}

export const config = {
  matcher: [
    // match paths NOT starting with /_next/static, /_next/image, /favicon.ico, /auth, or /api
    { source: "/((?!_next/static|_next/image|favicon.ico|api|auth).*)" },
  ],
};
