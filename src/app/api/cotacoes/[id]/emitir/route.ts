import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

const BACKEND = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

async function backendAuthHeaders(): Promise<Record<string, string>> {
  const cookieStore = await cookies();
  const token = cookieStore.get("access_token")?.value;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const formData = await request.formData();
  const res = await fetch(`${BACKEND}/cotacoes/${id}/emitir/`, {
    method: "POST",
    headers: await backendAuthHeaders(),
    body: formData,
  });
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
