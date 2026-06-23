'use server'

import { cookies } from 'next/headers'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'

async function getToken(): Promise<string | null> {
  const cookieStore = await cookies()
  return cookieStore.get('access_token')?.value ?? null
}

function authHeaders(token: string) {
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  }
}

export interface Produtor {
  id?: number
  nome: string
  corretora_id: number | null
  corretora_nome?: string | null
  email: string
  telefone: string
  recebimento: string
  percentual: string | null
  meta: string | null
  ativo?: boolean
  criado_em?: string
  atualizado_em?: string
}

export async function listProdutoresAction(search = '') {
  const token = await getToken()
  if (!token) return { error: 'Não autenticado' }

  try {
    const params = new URLSearchParams()
    if (search) params.set('search', search)
    const res = await fetch(`${API_URL}/produtores/?${params}`, {
      headers: authHeaders(token),
      cache: 'no-store',
    })
    if (!res.ok) return { error: 'Erro ao buscar produtores' }
    const json = await res.json()
    return { data: json.data as Produtor[] }
  } catch {
    return { error: 'Falha na comunicação com o servidor' }
  }
}

export async function getProdutorAction(id: number) {
  const token = await getToken()
  if (!token) return { error: 'Não autenticado' }

  try {
    const res = await fetch(`${API_URL}/produtores/${id}/`, {
      headers: authHeaders(token),
      cache: 'no-store',
    })
    if (!res.ok) return { error: 'Produtor não encontrado' }
    const json = await res.json()
    return { data: json.data as Produtor }
  } catch {
    return { error: 'Falha na comunicação com o servidor' }
  }
}

export async function createProdutorAction(payload: Omit<Produtor, 'id' | 'criado_em' | 'atualizado_em'>) {
  const token = await getToken()
  if (!token) return { error: 'Não autenticado' }

  try {
    const res = await fetch(`${API_URL}/produtores/`, {
      method: 'POST',
      headers: authHeaders(token),
      body: JSON.stringify(payload),
    })
    const json = await res.json()
    if (!res.ok) return { error: json.detail || JSON.stringify(json) }
    return { data: json.data as Produtor }
  } catch {
    return { error: 'Falha na comunicação com o servidor' }
  }
}

export async function updateProdutorAction(id: number, payload: Partial<Produtor>) {
  const token = await getToken()
  if (!token) return { error: 'Não autenticado' }

  try {
    const res = await fetch(`${API_URL}/produtores/${id}/`, {
      method: 'PATCH',
      headers: authHeaders(token),
      body: JSON.stringify(payload),
    })
    const json = await res.json()
    if (!res.ok) return { error: json.detail || JSON.stringify(json) }
    return { data: json.data as Produtor }
  } catch {
    return { error: 'Falha na comunicação com o servidor' }
  }
}

export async function deleteProdutorAction(id: number) {
  const token = await getToken()
  if (!token) return { error: 'Não autenticado' }

  try {
    const res = await fetch(`${API_URL}/produtores/${id}/`, {
      method: 'DELETE',
      headers: authHeaders(token),
    })
    if (!res.ok) return { error: 'Erro ao excluir produtor' }
    return { success: true }
  } catch {
    return { error: 'Falha na comunicação com o servidor' }
  }
}
