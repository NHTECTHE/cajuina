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

/** Passo 1: cria (ou recalcula) a cotação na seguradora integrada.
 *
 *  A chamada sai daqui para a seguradora e pode levar alguns segundos — o
 *  backend usa timeout de 30s, então este handler não pode ser mais curto que
 *  isso. `maxDuration` cobre o limite da plataforma serverless. */
export const maxDuration = 60;

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  // A seguradora escolhida vem no body: engolir o corpo aqui faria o Django
  // recusar toda cotação com 400.
  const body = await req.json().catch(() => ({}));
  const res = await fetch(`${BACKEND}/cotacoes/${id}/emissao/cotar/`, {
    method: "POST",
    headers: await backendHeaders(),
    body: JSON.stringify(body),
  });
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
