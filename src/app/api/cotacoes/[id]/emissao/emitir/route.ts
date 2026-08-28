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

/** Passo 4: pede a emissão da apólice.
 *
 *  Encadeia duas chamadas do lado do backend — o pedido e a consulta que traz
 *  os PDFs — e foi medido em 20s no caminho feliz e 37s quando a proposta foi
 *  para análise. O backend reserva 90s + 45s e o gunicorn espera 180s; este
 *  limite acompanha, senão o proxy corta uma emissão que está saindo. */
export const maxDuration = 180;

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  const res = await fetch(`${BACKEND}/cotacoes/${id}/emissao/emitir/`, {
    method: "POST",
    headers: await backendHeaders(),
    body: JSON.stringify(body),
  });
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
