"use server"

import { cookies } from "next/headers"

export interface Modalidade {
  id?: number
  nome: string
  ativo: boolean
  criado_em?: string
  atualizado_em?: string
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

export async function listModalidadesAction(search = "") {
  try {
    const headers = await getAuthHeaders()
    const url = new URL(`${API_URL}/modalidades/`)
    if (search) url.searchParams.append("search", search)
    
    const res = await fetch(url.toString(), { headers, cache: 'no-store' })
    if (!res.ok) throw new Error("Falha ao buscar modalidades")
    
    const json = await res.json()
    return { data: json.data as Modalidade[] }
  } catch (error) {
    console.error("listModalidadesAction error:", error)
    return { error: error instanceof Error ? error.message : "Erro desconhecido" }
  }
}

export async function createModalidadeAction(data: Omit<Modalidade, "id" | "criado_em" | "atualizado_em">) {
  try {
    const headers = await getAuthHeaders()
    const res = await fetch(`${API_URL}/modalidades/`, {
      method: "POST",
      headers,
      body: JSON.stringify(data),
    })
    
    const json = await res.json()
    if (!res.ok) {
      const msg = typeof json === 'object' ? Object.values(json).flat().join(", ") : "Erro ao cadastrar modalidade"
      return { error: msg }
    }
    return { data: json.data as Modalidade }
  } catch (error) {
    console.error("createModalidadeAction error:", error)
    return { error: error instanceof Error ? error.message : "Erro desconhecido" }
  }
}

export async function updateModalidadeAction(id: number, data: Partial<Modalidade>) {
  try {
    const headers = await getAuthHeaders()
    const res = await fetch(`${API_URL}/modalidades/${id}/`, {
      method: "PATCH",
      headers,
      body: JSON.stringify(data),
    })
    
    const json = await res.json()
    if (!res.ok) {
      const msg = typeof json === 'object' ? Object.values(json).flat().join(", ") : "Erro ao atualizar modalidade"
      return { error: msg }
    }
    return { data: json.data as Modalidade }
  } catch (error) {
    console.error("updateModalidadeAction error:", error)
    return { error: error instanceof Error ? error.message : "Erro desconhecido" }
  }
}

export async function deleteModalidadeAction(id: number) {
  try {
    const headers = await getAuthHeaders()
    const res = await fetch(`${API_URL}/modalidades/${id}/`, {
      method: "DELETE",
      headers,
    })
    
    if (!res.ok) throw new Error("Erro ao excluir modalidade")
    return { success: true }
  } catch (error) {
    console.error("deleteModalidadeAction error:", error)
    return { error: error instanceof Error ? error.message : "Erro desconhecido" }
  }
}
