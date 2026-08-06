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
  const jsonBody = await request.json();
  
  const headers = await backendAuthHeaders();
  headers["Content-Type"] = "application/json";

  const res = await fetch(`${BACKEND}/cotacoes/${id}/enviar-email/`, {
    method: "POST",
    headers,
    body: JSON.stringify(jsonBody),
  });
  
  let data;
  const contentType = res.headers.get("content-type");
  if (contentType && contentType.indexOf("application/json") !== -1) {
    data = await res.json();
  } else {
    data = await res.text();
  }
  
  return NextResponse.json(data, { status: res.status });
}
