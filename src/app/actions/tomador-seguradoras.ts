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

export interface TomadorSeguradora {
  id: number
  seguradora: number
  seguradora_nome: string
  seguradora_ativo: boolean
  status: string
  taxa: string
  premio_minimo: string | null
  premio_minimo_efetivo: string
  dias_vencimento: number | null
  dias_vencimento_efetivo: number | null
  apto: boolean
  criado_em: string
  atualizado_em: string
}

export interface TomadorSeguradoraInput {
  seguradora: number
  status: string
  taxa: string
  premio_minimo: string | null
  dias_vencimento: number | null
}

export async function listTomadorSeguradorasAction(tomadorId: number) {
  const token = await getToken()
  if (!token) return { error: 'Não autenticado' }

  try {
    const res = await fetch(`${API_URL}/tomadores/${tomadorId}/seguradoras/`, {
      headers: authHeaders(token),
      cache: 'no-store',
    })
    if (!res.ok) return { error: 'Erro ao buscar taxas do tomador' }
    const json = await res.json()
    return { data: json.data as TomadorSeguradora[] }
  } catch (e: unknown) { console.error("ACTION ERROR:", e);
    return { error: 'Falha na comunicação com o servidor' }
  }
}

export async function saveTomadorSeguradorasAction(
  tomadorId: number,
  itens: TomadorSeguradoraInput[],
) {
  const token = await getToken()
  if (!token) return { error: 'Não autenticado' }

  try {
    const res = await fetch(`${API_URL}/tomadores/${tomadorId}/seguradoras/`, {
      method: 'PUT',
      headers: authHeaders(token),
      body: JSON.stringify({ itens }),
    })
    const json = await res.json()
    if (!res.ok) {
      return { error: json.detail || json.itens?.[0] || 'Erro ao salvar as taxas' }
    }
    return { data: json.data as TomadorSeguradora[] }
  } catch (e: unknown) { console.error("ACTION ERROR:", e);
    return { error: 'Falha na comunicação com o servidor' }
  }
}
