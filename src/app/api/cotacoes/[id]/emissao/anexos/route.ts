import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

const BACKEND = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

/** Passo 3: documentos que a análise da seguradora pede.
 *
 *  Multipart, não JSON — e por isso este handler é o único que **não** define
 *  `Content-Type`: quem monta o boundary é o `fetch` a partir do `FormData`,
 *  e um header nosso o sobrescreveria com um valor sem boundary, deixando o
 *  Django com um corpo que ele não sabe abrir.
 *
 *  O limite da Junto é 30 MB por requisição, e o backend recusa acima disso. */
export const maxDuration = 180;

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const cookieStore = await cookies();
  const token = cookieStore.get("access_token")?.value;

  const res = await fetch(`${BACKEND}/cotacoes/${id}/emissao/anexos/`, {
    method: "POST",
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: await req.formData(),
  });
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
