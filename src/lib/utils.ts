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
