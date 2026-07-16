"use server"

import { cookies } from "next/headers"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000"

export async function getNotificacoesAction() {
  const cookieStore = await cookies()
  const token = cookieStore.get("access_token")?.value

  if (!token) return { data: [], error: "No token" }

  try {
    const res = await fetch(`${API_URL}/api/v1/notificacoes/`, {
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
  } catch (error: any) {
    return { data: [], error: error.message }
  }
}

export async function markNotificacoesAsReadAction() {
  const cookieStore = await cookies()
  const token = cookieStore.get("access_token")?.value

  if (!token) return { success: false }

  try {
    const res = await fetch(`${API_URL}/api/v1/notificacoes/lidas/`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    if (!res.ok) {
      return { success: false }
    }

    return { success: true }
  } catch (error) {
    return { success: false }
  }
}
