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

export interface Corretor {
  id?: number
  cpf_cnpj: string
  nome: string
  recebimento: string
  percentual: string | null
  banco: string
  agencia: string
  conta: string
  email: string
  telefone: string
  url_saida: string
  ativo?: boolean
  criado_em?: string
  atualizado_em?: string
}

export async function listCorretoresAction(search = '') {
  const token = await getToken()
  if (!token) return { error: 'Não autenticado' }

  try {
    const params = new URLSearchParams()
    if (search) params.set('search', search)
    const res = await fetch(`${API_URL}/corretores/?${params}`, {
      headers: authHeaders(token),
      cache: 'no-store',
    })
    if (!res.ok) return { error: 'Erro ao buscar corretores' }
    const json = await res.json()
    return { data: json.data as Corretor[] }
  } catch {
    return { error: 'Falha na comunicação com o servidor' }
  }
}

export async function getCorretorAction(id: number) {
  const token = await getToken()
  if (!token) return { error: 'Não autenticado' }

  try {
    const res = await fetch(`${API_URL}/corretores/${id}/`, {
      headers: authHeaders(token),
      cache: 'no-store',
    })
    if (!res.ok) return { error: 'Corretor não encontrado' }
    const json = await res.json()
    return { data: json.data as Corretor }
  } catch {
    return { error: 'Falha na comunicação com o servidor' }
  }
}

export async function createCorretorAction(payload: Omit<Corretor, 'id' | 'criado_em' | 'atualizado_em'>) {
  const token = await getToken()
  if (!token) return { error: 'Não autenticado' }

  try {
    const res = await fetch(`${API_URL}/corretores/`, {
      method: 'POST',
      headers: authHeaders(token),
      body: JSON.stringify(payload),
    })
    const json = await res.json()
    if (!res.ok) return { error: json.detail || JSON.stringify(json) }
    return { data: json.data as Corretor }
  } catch {
    return { error: 'Falha na comunicação com o servidor' }
  }
}

export async function updateCorretorAction(id: number, payload: Partial<Corretor>) {
  const token = await getToken()
  if (!token) return { error: 'Não autenticado' }

  try {
    const res = await fetch(`${API_URL}/corretores/${id}/`, {
      method: 'PATCH',
      headers: authHeaders(token),
      body: JSON.stringify(payload),
    })
    const json = await res.json()
    if (!res.ok) return { error: json.detail || JSON.stringify(json) }
    return { data: json.data as Corretor }
  } catch {
    return { error: 'Falha na comunicação com o servidor' }
  }
}

export async function deleteCorretorAction(id: number) {
  const token = await getToken()
  if (!token) return { error: 'Não autenticado' }

  try {
    const res = await fetch(`${API_URL}/corretores/${id}/`, {
      method: 'DELETE',
      headers: authHeaders(token),
    })
    if (!res.ok) return { error: 'Erro ao excluir corretor' }
    return { success: true }
  } catch {
    return { error: 'Falha na comunicação com o servidor' }
  }
}
