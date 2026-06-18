'use server'

import { cookies } from 'next/headers'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'

export async function loginAction(formData: FormData) {
  const username = formData.get('username') as string
  const password = formData.get('password') as string

  try {
    const res = await fetch(`${API_URL}/auth/login/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    })

    const data = await res.json()
    console.log("LOGIN RESPONSE", res.status, data)

    if (!res.ok) {
      let errorMessage = 'Credenciais inválidas.'
      if (data.detail && typeof data.detail === 'string') {
        if (data.detail.toLowerCase().includes('no active account')) {
          errorMessage = 'Usuário ou senha incorretos.'
        } else {
          errorMessage = data.detail
        }
      }
      return { error: errorMessage }
    }

    // Set cookie using next/headers
    const cookieStore = await cookies()
    cookieStore.set('access_token', data.access, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24, // 1 day
    })
    
    if (data.refresh) {
      cookieStore.set('refresh_token', data.refresh, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 7, // 7 days
      })
    }

    return { success: true }
  } catch {
    return { error: 'Ocorreu um erro ao conectar com o servidor.' }
  }
}

export async function logoutAction() {
  const cookieStore = await cookies()
  
  cookieStore.delete('access_token')
  cookieStore.delete('refresh_token')
  
  return { success: true }
}
