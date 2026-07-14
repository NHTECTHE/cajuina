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
  logo: string | null
  meta: string | null
  premio_minimo: string
  taxa_comissao: string | null
  dia_vencimento: number | null
  ativo?: boolean
  api_usuario?: string
  api_senha?: string
  api_ou_name?: string
  api_source_app?: string
  criado_em?: string
  atualizado_em?: string
}

function toFormData(payload: Record<string, unknown>, logoFile?: File | null): FormData {
  const formData = new FormData()
  for (const [key, value] of Object.entries(payload)) {
    if (value === null || value === undefined) continue
    formData.append(key, String(value))
  }
  if (logoFile) formData.append('logo', logoFile)
  return formData
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
  } catch (e: unknown) { console.error("ACTION ERROR:", e);
    return { error: 'Falha na comunicação com o servidor' }
  }
}

export async function getSeguradoraAction(id: number) {
  const token = await getToken()
  if (!token) return { error: 'Não autenticado' }

  try {
    const res = await fetch(`${API_URL}/seguradoras/${id}/`, {
      headers: authHeaders(token),
      cache: 'no-store',
    })
    if (!res.ok) return { error: 'Erro ao buscar seguradora' }
    const json = await res.json()
    return { data: json.data as Seguradora }
  } catch (e: unknown) { console.error("ACTION ERROR:", e);
    return { error: 'Falha na comunicação com o servidor' }
  }
}

export async function createSeguradoraAction(
  payload: Omit<Seguradora, 'id' | 'logo' | 'criado_em' | 'atualizado_em'>,
  logoFile?: File | null,
) {
  const token = await getToken()
  if (!token) return { error: 'Não autenticado' }

  try {
    const res = await fetch(`${API_URL}/seguradoras/`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: toFormData(payload, logoFile),
    })
    const text = await res.text()
    let json
    try {
      json = JSON.parse(text)
    } catch {
      console.error("BACKEND HTML ERROR (status " + res.status + "):", text.substring(0, 2000))
      return { error: 'Erro inesperado no servidor backend.' }
    }
    if (!res.ok) return { error: json.detail || JSON.stringify(json) }
    return { data: json.data as Seguradora }
  } catch (e: unknown) {
    console.error("ACTION ERROR:", e);
    return { error: 'Falha na comunicação com o servidor' }
  }
}

export async function updateSeguradoraAction(
  id: number,
  payload: Partial<Omit<Seguradora, 'logo'>>,
  logoFile?: File | null,
) {
  const token = await getToken()
  if (!token) return { error: 'Não autenticado' }

  try {
    const res = await fetch(`${API_URL}/seguradoras/${id}/`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token}` },
      body: toFormData(payload, logoFile),
    })
    const json = await res.json()
    if (!res.ok) return { error: json.detail || JSON.stringify(json) }
    return { data: json.data as Seguradora }
  } catch (e: unknown) { console.error("ACTION ERROR:", e);
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
  } catch (e: unknown) { console.error("ACTION ERROR:", e);
    return { error: 'Falha na comunicação com o servidor' }
  }
}
