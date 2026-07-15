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

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const res = await fetch(`${BACKEND}/cotacoes/${id}/aprovar/`, {
    method: "POST",
    headers: await backendHeaders(),
  });
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
