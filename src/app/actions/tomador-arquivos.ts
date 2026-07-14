'use server'

import { cookies } from 'next/headers'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'

async function getToken(): Promise<string | null> {
  const cookieStore = await cookies()
  return cookieStore.get('access_token')?.value ?? null
}

function authHeaders(token: string) {
  return {
    Authorization: `Bearer ${token}`,
  }
}

export interface TomadorArquivo {
  id: number
  arquivo: string
  nome_original: string
  tamanho: number
  criado_em: string
}

export async function listTomadorArquivosAction(tomadorId: number) {
  const token = await getToken()
  if (!token) return { error: 'Não autenticado' }

  try {
    const res = await fetch(`${API_URL}/tomadores/${tomadorId}/arquivos/`, {
      headers: authHeaders(token),
      cache: 'no-store',
    })
    if (!res.ok) return { error: 'Erro ao buscar arquivos' }
    const json = await res.json()
    return { data: json.data as TomadorArquivo[] }
  } catch (e: unknown) { console.error("ACTION ERROR:", e);
    return { error: 'Falha na comunicação com o servidor' }
  }
}

export async function uploadTomadorArquivoAction(tomadorId: number, file: File) {
  const token = await getToken()
  if (!token) return { error: 'Não autenticado' }

  try {
    const formData = new FormData()
    formData.append('arquivo', file)
    const res = await fetch(`${API_URL}/tomadores/${tomadorId}/arquivos/`, {
      method: 'POST',
      headers: authHeaders(token),
      body: formData,
    })
    const json = await res.json()
    if (!res.ok) return { error: json.arquivo?.[0] || json.detail || 'Erro ao enviar arquivo' }
    return { data: json.data as TomadorArquivo }
  } catch (e: unknown) { console.error("ACTION ERROR:", e);
    return { error: 'Falha na comunicação com o servidor' }
  }
}

export async function deleteTomadorArquivoAction(tomadorId: number, arquivoId: number) {
  const token = await getToken()
  if (!token) return { error: 'Não autenticado' }

  try {
    const res = await fetch(`${API_URL}/tomadores/${tomadorId}/arquivos/${arquivoId}/`, {
      method: 'DELETE',
      headers: authHeaders(token),
    })
    if (!res.ok) return { error: 'Erro ao excluir arquivo' }
    return { success: true }
  } catch (e: unknown) { console.error("ACTION ERROR:", e);
    return { error: 'Falha na comunicação com o servidor' }
  }
}
