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

export interface Seguradora {
  id?: number
  nome: string
  valor_licitacao: string | null
  valor_execucao: string | null
  taxa_comissao: string | null
  dia_vencimento: number | null
  ativo?: boolean
  criado_em?: string
  atualizado_em?: string
}

export async function listSeguradorasAction(search = '') {
  const token = await getToken()
  if (!token) return { error: 'Não autenticado' }

  try {
    const params = new URLSearchParams()
    if (search) params.set('search', search)
    const res = await fetch(`${API_URL}/seguradoras/?${params}`, {
      headers: authHeaders(token),
      cache: 'no-store',
    })
    if (!res.ok) return { error: 'Erro ao buscar seguradoras' }
    const json = await res.json()
    return { data: json.data as Seguradora[] }
  } catch {
    return { error: 'Falha na comunicação com o servidor' }
  }
}

export async function createSeguradoraAction(payload: Omit<Seguradora, 'id' | 'criado_em' | 'atualizado_em'>) {
  const token = await getToken()
  if (!token) return { error: 'Não autenticado' }

  try {
    const res = await fetch(`${API_URL}/seguradoras/`, {
      method: 'POST',
      headers: authHeaders(token),
      body: JSON.stringify(payload),
    })
    const json = await res.json()
    if (!res.ok) return { error: json.detail || JSON.stringify(json) }
    return { data: json.data as Seguradora }
  } catch {
    return { error: 'Falha na comunicação com o servidor' }
  }
}

export async function updateSeguradoraAction(id: number, payload: Partial<Seguradora>) {
  const token = await getToken()
  if (!token) return { error: 'Não autenticado' }

  try {
    const res = await fetch(`${API_URL}/seguradoras/${id}/`, {
      method: 'PATCH',
      headers: authHeaders(token),
      body: JSON.stringify(payload),
    })
    const json = await res.json()
    if (!res.ok) return { error: json.detail || JSON.stringify(json) }
    return { data: json.data as Seguradora }
  } catch {
    return { error: 'Falha na comunicação com o servidor' }
  }
}

export async function deleteSeguradoraAction(id: number) {
  const token = await getToken()
  if (!token) return { error: 'Não autenticado' }

  try {
    const res = await fetch(`${API_URL}/seguradoras/${id}/`, {
      method: 'DELETE',
      headers: authHeaders(token),
    })
    if (!res.ok) return { error: 'Erro ao excluir seguradora' }
    return { success: true }
  } catch {
    return { error: 'Falha na comunicação com o servidor' }
  }
}
