"use server"

import { cookies } from "next/headers"

// NEXT_PUBLIC_API_URL já inclui o /api/v1 (mesmo padrão das rotas em app/api).
const BACKEND = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1"

export async function getNotificacoesAction() {
  const cookieStore = await cookies()
  const token = cookieStore.get("access_token")?.value

  if (!token) return { data: [], error: "No token" }

  try {
    const res = await fetch(`${BACKEND}/notificacoes/`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    })

    if (!res.ok) {
      return { data: [], error: "Failed to fetch notifications" }
    }

    const data = await res.json()
    return { data, error: null }
  } catch (error: unknown) {
    return { data: [], error: error instanceof Error ? error.message : "Failed to fetch notifications" }
  }
}

export async function markNotificacoesAsReadAction() {
  const cookieStore = await cookies()
  const token = cookieStore.get("access_token")?.value

  if (!token) return { success: false }

  try {
    const res = await fetch(`${BACKEND}/notificacoes/lidas/`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    if (!res.ok) {
      return { success: false }
    }

    return { success: true }
  } catch {
    return { success: false }
  }
}
