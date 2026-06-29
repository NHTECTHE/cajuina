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

export interface Usuario {
  id?: number
  first_name: string
  email: string
  username: string
  cargo: string
  password?: string
}

export async function listUsuariosAction(search = '') {
  const token = await getToken()
  if (!token) return { error: 'Não autenticado' }

  try {
    const params = new URLSearchParams()
    if (search) params.set('search', search)
    const res = await fetch(`${API_URL}/users/?${params}`, {
      headers: authHeaders(token),
      cache: 'no-store',
    })
    if (!res.ok) return { error: 'Erro ao buscar usuários' }
    const json = await res.json()
    return { data: json.data as Usuario[] }
  } catch {
    return { error: 'Falha na comunicação com o servidor' }
  }
}

export async function createUsuarioAction(payload: Omit<Usuario, 'id'>) {
  const token = await getToken()
  if (!token) return { error: 'Não autenticado' }

  try {
    const res = await fetch(`${API_URL}/users/`, {
      method: 'POST',
      headers: authHeaders(token),
      body: JSON.stringify(payload),
    })
    const json = await res.json()
    if (!res.ok) return { error: json.detail || JSON.stringify(json) }
    return { data: json.data as Usuario }
  } catch {
    return { error: 'Falha na comunicação com o servidor' }
  }
}

export async function updateUsuarioAction(id: number, payload: Partial<Usuario>) {
  const token = await getToken()
  if (!token) return { error: 'Não autenticado' }

  try {
    const res = await fetch(`${API_URL}/users/${id}/`, {
      method: 'PATCH',
      headers: authHeaders(token),
      body: JSON.stringify(payload),
    })
    const json = await res.json()
    if (!res.ok) return { error: json.detail || JSON.stringify(json) }
    return { data: json.data as Usuario }
  } catch {
    return { error: 'Falha na comunicação com o servidor' }
  }
}

export async function deleteUsuarioAction(id: number) {
  const token = await getToken()
  if (!token) return { error: 'Não autenticado' }

  try {
    const res = await fetch(`${API_URL}/users/${id}/`, {
      method: 'DELETE',
      headers: authHeaders(token),
    })
    if (!res.ok) return { error: 'Erro ao excluir usuário' }
    return { success: true }
  } catch {
    return { error: 'Falha na comunicação com o servidor' }
  }
}
