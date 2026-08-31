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

/** Prévia da importação: consulta a apólice na seguradora, sem gravar nada.
 *
 *  A chamada sai daqui para a Junto, e o backend espera `TIMEOUT_CONSULTA`
 *  (45s). `maxDuration` cobre o limite da plataforma serverless com folga. */
export const maxDuration = 90;

export async function GET(req: NextRequest) {
  const numero = req.nextUrl.searchParams.get("numero") ?? "";
  const seguradora = req.nextUrl.searchParams.get("seguradora") ?? "";
  const qs = new URLSearchParams({ numero, seguradora }).toString();

  const res = await fetch(`${BACKEND}/apolices/importar/previa/?${qs}`, {
    headers: await backendHeaders(),
  });

  // A seguradora fora do ar chega como 502 sem corpo JSON; `res.json()` cru
  // aqui derrubaria o route handler inteiro.
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
