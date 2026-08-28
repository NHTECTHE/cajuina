import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getMediaUrl(url: string | null | undefined): string {
  if (!url) return "";
  if (url.startsWith("blob:") || url.startsWith("data:")) return url;

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";
  const baseUrl = apiUrl.replace(/\/api\/v1\/?$/, "");
  
  if (url.startsWith("http://") || url.startsWith("https://")) {
    // Se o backend retornar localhost em produção (erro comum de proxy), substituímos pelo baseUrl
    if (url.includes("localhost") || url.includes("127.0.0.1")) {
      try {
        const path = new URL(url).pathname;
        return `${baseUrl}${path}`;
      } catch {
        return url;
      }
    }
    return url;
  }
  
  // Se for URL relativa (/media/...)
  return `${baseUrl}${url.startsWith("/") ? "" : "/"}${url}`;
}

// Formata um valor decimal (número ou string, ex.: "180.00") como moeda pt-BR
// "R$ 180,00". Retorna "—" quando o valor não é informado.
//
// Mora aqui, e não na página, porque a emissão mostra dinheiro em duas telas:
// os cards de seguradora e o modal de emissão. Duas cópias divergiriam.
export function formatBRL(value: string | number | null | undefined): string {
  if (value === null || value === undefined || value === "") return "—"
  const num = typeof value === "number" ? value : Number(value)
  if (!Number.isFinite(num)) return "—"
  return num.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  })
}
