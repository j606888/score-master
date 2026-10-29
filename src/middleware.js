import { NextResponse } from "next/server";

// 管理用的房間總覽：用 Basic Auth 保護，密碼在 ADMIN_PASSWORD
export const config = {
  matcher: ["/rooms", "/api/rooms"],
};

function safeEqual(a, b) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}

function isAuthorized(req) {
  const password = process.env.ADMIN_PASSWORD;
  const header = req.headers.get("authorization") || "";
  if (!password || !header.startsWith("Basic ")) return false;

  try {
    const decoded = atob(header.slice(6));
    const given = decoded.slice(decoded.indexOf(":") + 1);
    return safeEqual(given, password);
  } catch {
    return false;
  }
}

export function middleware(req) {
  if (isAuthorized(req)) return NextResponse.next();

  return new NextResponse("Authentication required", {
    status: 401,
    headers: { "WWW-Authenticate": 'Basic realm="score-master admin"' },
  });
}
