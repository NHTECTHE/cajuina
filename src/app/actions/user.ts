'use server'

import { cookies } from 'next/headers'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'

export async function getUserAction() {
  const cookieStore = await cookies()
  const token = cookieStore.get('access_token')?.value

  if (!token) {
    return { error: 'Não autenticado' }
  }

  try {
    const res = await fetch(`${API_URL}/users/me/`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      // Avoid caching so it's always fresh
      cache: 'no-store'
    })

    if (!res.ok) {
      if (res.status === 401) {
        return { error: 'Sessão expirada' }
      }
      return { error: 'Erro ao buscar dados do usuário' }
    }

    const data = await res.json()
    return { data }
  } catch (e: any) { console.error("ACTION ERROR:", e);
    return { error: 'Falha na comunicação com o servidor' }
  }
}
