import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

const BACKEND = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

async function backendHeaders() {
  const cookieStore = await cookies();
  const token = cookieStore.get("access_token")?.value;
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

/** Grava a apólice importada — cotação-espelho, apólice e emissão. */
export const maxDuration = 90;

export async function POST(req: NextRequest) {
  const res = await fetch(`${BACKEND}/apolices/importar/`, {
    method: "POST",
    headers: await backendHeaders(),
    body: await req.text(),
  });

  const texto = await res.text();
  try {
    return NextResponse.json(JSON.parse(texto), { status: res.status });
  } catch {
    return NextResponse.json(
      { detail: "A seguradora não respondeu. Tente novamente." },
      { status: res.status || 502 },
    );
  }
}
