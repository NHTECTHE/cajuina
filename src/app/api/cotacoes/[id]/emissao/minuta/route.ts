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

/** Passo 2: gera a minuta na seguradora.
 *
 *  Pode encadear até três chamadas do lado do backend (buscar ou cadastrar o
 *  segurado, gerar a minuta, listar pendências), e a geração em si foi medida
 *  em 81s contra o sandbox — daí o backend esperar 150s. Este limite não pode
 *  ser menor que o de lá, senão o proxy corta uma minuta que está saindo. */
export const maxDuration = 180;

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  const res = await fetch(`${BACKEND}/cotacoes/${id}/emissao/minuta/`, {
    method: "POST",
    headers: await backendHeaders(),
    body: JSON.stringify(body),
  });
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
