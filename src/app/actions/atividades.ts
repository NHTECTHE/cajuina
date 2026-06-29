"use server"

import { cookies } from "next/headers"

export interface Atividade {
  id: number
  usuario_nome: string
  usuario_username: string
  acao: 'LOGIN' | 'CRIAÇÃO' | 'ATUALIZAÇÃO' | 'EXCLUSÃO'
  entidade: string
  item: string
  detalhes: string
  criado_em: string
}

async function getAuthHeaders() {
  const cookieStore = await cookies()
  const token = cookieStore.get("access_token")?.value
  return {
    "Content-Type": "application/json",
    Authorization: token ? `Bearer ${token}` : "",
  }
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1"

export async function listAtividadesAction() {
  try {
    const headers = await getAuthHeaders()
    const res = await fetch(`${API_URL}/atividades/`, { headers, cache: 'no-store' })
    if (!res.ok) throw new Error("Falha ao buscar atividades")
    
    const json = await res.json()
    return { data: json.data as Atividade[] }
  } catch (error) {
    console.error("listAtividadesAction error:", error)
    return { error: error instanceof Error ? error.message : "Erro desconhecido" }
  }
}
