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

export interface Segurado {
  id?: number
  cnpj: string
  natureza_juridica: string
  nome: string
  endereco: string
  cidade: string
  estado: string
  bairro: string
  numero: string
  cep: string
  complemento: string
  observacoes: string
  criado_em?: string
  atualizado_em?: string
}

export async function listSeguradosAction(search = '') {
  const token = await getToken()
  if (!token) return { error: 'Não autenticado' }
  try {
    const params = new URLSearchParams()
    if (search) params.set('search', search)
    const res = await fetch(`${API_URL}/segurados/?${params}`, {
      headers: authHeaders(token),
      cache: 'no-store',
    })
    if (!res.ok) return { error: 'Erro ao buscar segurados' }
    const json = await res.json()
    return { data: json.data as Segurado[] }
  } catch (e: any) { console.error("ACTION ERROR:", e);
    return { error: 'Falha na comunicação com o servidor' }
  }
}

export async function createSeguradoAction(payload: Omit<Segurado, 'id' | 'criado_em' | 'atualizado_em'>) {
  const token = await getToken()
  if (!token) return { error: 'Não autenticado' }
  try {
    const res = await fetch(`${API_URL}/segurados/`, {
      method: 'POST',
      headers: authHeaders(token),
      body: JSON.stringify(payload),
    })
    const json = await res.json()
    if (!res.ok) return { error: json.detail || JSON.stringify(json) }
    return { data: json.data as Segurado }
  } catch (e: any) { console.error("ACTION ERROR:", e);
    return { error: 'Falha na comunicação com o servidor' }
  }
}

export async function updateSeguradoAction(id: number, payload: Partial<Segurado>) {
  const token = await getToken()
  if (!token) return { error: 'Não autenticado' }
  try {
    const res = await fetch(`${API_URL}/segurados/${id}/`, {
      method: 'PATCH',
      headers: authHeaders(token),
      body: JSON.stringify(payload),
    })
    const json = await res.json()
    if (!res.ok) return { error: json.detail || JSON.stringify(json) }
    return { data: json.data as Segurado }
  } catch (e: any) { console.error("ACTION ERROR:", e);
    return { error: 'Falha na comunicação com o servidor' }
  }
}

export async function deleteSeguradoAction(id: number) {
  const token = await getToken()
  if (!token) return { error: 'Não autenticado' }
  try {
    const res = await fetch(`${API_URL}/segurados/${id}/`, {
      method: 'DELETE',
      headers: authHeaders(token),
    })
    if (!res.ok) return { error: 'Erro ao excluir segurado' }
    return { success: true }
  } catch (e: any) { console.error("ACTION ERROR:", e);
    return { error: 'Falha na comunicação com o servidor' }
  }
}
