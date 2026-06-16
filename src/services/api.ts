const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";
const BASE_URL = API_URL.split("/api/")[0];

export async function lookupCnpj(cnpj: string): Promise<Record<string, unknown>> {
  const cleanCnpj = cnpj.replace(/\D/g, "");
  const response = await fetch(`${BASE_URL}/integracoes/cnpj/${cleanCnpj}/`);

  if (!response.ok) {
    throw new Error("Erro ao buscar CNPJ");
  }

  const result: { data?: Record<string, unknown> } = await response.json();

  if (!result.data || typeof result.data !== "object") {
    throw new Error("Resposta inválida ao buscar CNPJ");
  }

  return result.data;
}

