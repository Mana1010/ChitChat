import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
export async function middleware(req: NextRequest) {
  const token = await getToken({ req });
  const reqUrl = req.nextUrl;
  if (reqUrl.pathname === "/chats" || reqUrl.pathname === "/") {
    return NextResponse.redirect(new URL("/chats/public", req.url));
  }
  if (!token) {
    return NextResponse.redirect(new URL("/login", req.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/chats/:path*", "/mailbox/:path*"],
};
