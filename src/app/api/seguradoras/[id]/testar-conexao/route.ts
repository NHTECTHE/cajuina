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

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const res = await fetch(`${BACKEND}/seguradoras/${id}/testar-conexao/`, {
    method: "POST",
    headers: await backendHeaders(),
    body: "{}",
  });
  // Mesma defesa das rotas da Junto: o backend pode responder erro sem corpo
  // JSON (502 de gateway, container reiniciando), e `res.json()` cru derruba o
  // route handler inteiro.
  const texto = await res.text();
  try {
    return NextResponse.json(JSON.parse(texto), { status: res.status });
  } catch {
    return NextResponse.json(
      { data: { ok: false, mensagem: "A seguradora não respondeu. Tente novamente." } },
      { status: res.status || 502 },
    );
  }
}
