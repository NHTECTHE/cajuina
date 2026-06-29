"use server"

import { cookies } from "next/headers"

async function getAuthHeaders() {
  const cookieStore = await cookies()
  const token = cookieStore.get("access_token")?.value
  return {
    "Content-Type": "application/json",
    Authorization: token ? `Bearer ${token}` : "",
  }
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1"

export interface ChangePasswordPayload {
  old_password?: string
  new_password?: string
  new_password_confirm?: string
}

export async function changePasswordAction(data: ChangePasswordPayload) {
  try {
    const headers = await getAuthHeaders()
    const res = await fetch(`${API_URL}/alterar-senha/`, {
      method: "POST",
      headers,
      body: JSON.stringify(data),
    })
    
    const json = await res.json()
    if (!res.ok) {
      // Retorna o objeto de erro para poder mapear para os campos, se necessário
      return { error: json }
    }
    return { success: true, message: json.detail || "Senha alterada com sucesso!" }
  } catch (error) {
    console.error("changePasswordAction error:", error)
    return { error: "Erro inesperado ao conectar com o servidor." }
  }
}
