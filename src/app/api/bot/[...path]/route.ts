import { NextRequest, NextResponse } from "next/server";
import { checkIsAdmin } from "@/actions/admin";

export async function GET(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const p = await params;
  return proxyRequest(req, p.path, "GET");
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const p = await params;
  return proxyRequest(req, p.path, "POST");
}

async function proxyRequest(req: NextRequest, pathArray: string[], method: string) {
  try {
    // SECURITY: Проверяем, авторизован ли пользователь как админ
    const isAdmin = await checkIsAdmin();
    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized access to Bot Proxy" }, { status: 401 });
    }

    const BOT_API = process.env.NEXT_PUBLIC_BOT_API || "http://212.43.151.126:8080";
    const API_KEY = process.env.BOT_API_KEY || "";
    const path = pathArray.join("/");
    const searchParams = req.nextUrl.search;
    const url = `${BOT_API}/api/${path}${searchParams}`;

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      "X-API-Key": API_KEY
    };

    let body = undefined;
    if (method === "POST") {
      body = await req.text();
    }

    const response = await fetch(url, {
      method,
      headers,
      body,
    });

    const data = await response.json().catch(() => ({}));

    return NextResponse.json(data, { status: response.status });
  } catch (error: any) {
    console.error("Proxy error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
