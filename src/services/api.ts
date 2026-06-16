const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";
const BASE_URL = API_URL.split("/api/")[0];

export async function lookupCnpj(cnpj: string) {
  const cleanCnpj = cnpj.replace(/\D/g, "");
  const response = await fetch(`${BASE_URL}/integracoes/cnpj/${cleanCnpj}/`);
  
  if (!response.ok) {
    throw new Error("Erro ao buscar CNPJ");
  }
  
  const result = await response.json();
  return result.data;
}

