"use client"

import { useEffect, useState, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { CheckCircle2, XCircle, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'

function ActivationContent() {
  const searchParams = useSearchParams()
  const token = searchParams.get("token")
  
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading")
  const [message, setMessage] = useState("Validando seu token de ativação...")

  useEffect(() => {
    if (!token) {
      setStatus("error")
      setMessage("Token de ativação não encontrado na URL.")
      return
    }

    const activateAccount = async () => {
      try {
        const res = await fetch(`${API_URL}/users/activate/`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ token }),
        })

        const data = await res.json()

        if (res.ok) {
          setStatus("success")
          setMessage("Sua conta foi ativada com sucesso!")
        } else {
          setStatus("error")
          // O backend retorna os erros em uma lista ou mensagem específica
          if (data.token) setMessage(data.token[0])
          else if (data.non_field_errors) setMessage(data.non_field_errors[0])
          else if (data.detail) setMessage(data.detail)
          else setMessage("Erro ao ativar conta.")
        }
      } catch (err) {
        setStatus("error")
        setMessage("Ocorreu um erro de conexão com o servidor.")
      }
    }

    activateAccount()
  }, [token])

  return (
    <div className="bg-white p-8 md:p-12 rounded-3xl shadow-xl max-w-md w-full text-center flex flex-col items-center">
      {status === "loading" && (
        <>
          <Loader2 className="size-20 text-brand-red animate-spin mb-6" />
          <h1 className="text-2xl font-bold text-zinc-900 mb-4">Ativando conta...</h1>
        </>
      )}
      
      {status === "success" && (
        <>
          <CheckCircle2 className="size-20 text-green-500 mb-6" />
          <h1 className="text-2xl font-bold text-zinc-900 mb-4">Conta Ativada!</h1>
        </>
      )}

      {status === "error" && (
        <>
          <XCircle className="size-20 text-red-500 mb-6" />
          <h1 className="text-2xl font-bold text-zinc-900 mb-4">Falha na Ativação</h1>
        </>
      )}

      <p className="text-zinc-500 mb-8 leading-relaxed">
        {message}
      </p>

      {status !== "loading" && (
        <Link href="/" className="w-full">
          <Button className="w-full h-12 bg-brand-red hover:bg-brand-red-hover text-white text-[15px] font-bold rounded-2xl">
            Ir para o Login
          </Button>
        </Link>
      )}
    </div>
  )
}

export default function ActivatePage() {
  return (
    <div className="min-h-[100dvh] flex flex-col justify-center items-center bg-zinc-50 font-sans p-6 selection:bg-brand-red/20 selection:text-brand-red">
      <Suspense fallback={
        <div className="bg-white p-8 md:p-12 rounded-3xl shadow-xl max-w-md w-full text-center flex flex-col items-center">
          <Loader2 className="size-20 text-brand-red animate-spin mb-6" />
          <h1 className="text-2xl font-bold text-zinc-900 mb-4">Carregando...</h1>
        </div>
      }>
        <ActivationContent />
      </Suspense>
    </div>
  )
}
