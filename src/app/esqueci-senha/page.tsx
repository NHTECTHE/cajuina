"use client"

import * as React from "react"
import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Loader2, Mail, ArrowLeft, ArrowRight } from "lucide-react"
import { toast, Toaster } from "sonner"
import { Button } from "@/components/ui/button"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [emailFocused, setEmailFocused] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email.trim() || !email.includes("@")) {
      toast.error("Por favor, informe um e-mail válido.")
      return
    }

    setIsLoading(true)

    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'
      const res = await fetch(`${API_URL}/users/password-reset/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      })

      if (res.ok) {
        setIsSuccess(true)
        toast.success("Instruções enviadas com sucesso.")
      } else {
        toast.error("Ocorreu um erro ao processar a solicitação.")
      }
    } catch (err) {
      console.error("ERRO NO FRONTEND:", err)
      toast.error("Ocorreu um erro inesperado ao conectar.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-[100dvh] flex flex-col lg:flex-row bg-white font-sans selection:bg-brand-red/20 selection:text-brand-red">
      <Toaster position="top-right" richColors duration={5000} />

      {/* ───── LEFT: Red Overlay Panel ───── */}
      <div className="hidden lg:flex lg:w-[50vw] relative flex-col justify-center items-center px-10 pb-12 text-center text-white overflow-hidden rounded-r-[2.5rem]" style={{ background: "linear-gradient(135deg, #e53e3e 0%, #aa3232 100%)" }}>
        <Image
          src="/6.png"
          alt="Cajuína Corretora de Seguros"
          width={1000}
          height={400}
          quality={100}
          unoptimized={true}
          priority
          className="w-auto h-[380px] max-w-full object-contain select-none drop-shadow-md -mb-32 -mt-20 transition-all"
        />
        <p className="text-[12px] font-semibold uppercase tracking-[0.2em] mb-6 text-white/80 z-10 leading-relaxed px-4">
          seguro garantia para licitação <br /> e contratos em minutos!
        </p>
        <h2 className="text-3xl font-extrabold text-white mb-4 z-10">Lembrou da senha?</h2>
        <p className="text-[14px] font-medium text-white/90 mb-8 z-10 leading-relaxed px-4">
          Acesse sua conta para continuar gerenciando <br /> suas garantias e contratos.
        </p>
        <Link href="/">
          <Button
            type="button"
            variant="outline"
            className="relative z-20 bg-transparent text-white border-2 border-white hover:bg-white hover:text-[#e53e3e] font-bold rounded-full px-12 py-6 text-[15px] tracking-wide transition-all shadow-none hover:scale-105 cursor-pointer"
          >
            VOLTAR AO LOGIN
          </Button>
        </Link>
      </div>

      {/* ───── RIGHT: Forgot Password Form ───── */}
      <div className="flex-1 flex flex-col px-6 py-6 sm:px-12 lg:px-20 relative min-h-[100dvh] lg:min-h-0 bg-gradient-to-br from-white via-white to-red-50/40">
        <div className="absolute top-0 right-0 w-[300px] h-[300px] md:w-[400px] md:h-[400px] bg-gradient-to-bl from-brand-red/[0.04] to-transparent rounded-full -translate-y-1/2 translate-x-1/3 pointer-events-none" />

        <div className="flex-1 flex flex-col justify-center items-center w-full max-w-[420px] mx-auto animate-fade-in-up relative z-10">
          <div className="lg:hidden mb-10 w-full flex justify-center px-4">
            <Image
              src="/2 - 1.png"
              alt="Cajuína Corretora de Seguros"
              width={400}
              height={140}
              priority
              className="w-full max-w-[260px] sm:max-w-[320px] h-auto object-contain select-none"
            />
          </div>

          <div className="w-full">
            <div className="mb-8 text-center lg:text-left">
              <h1 className="text-2xl sm:text-3xl lg:text-[2rem] font-extrabold text-zinc-900 tracking-tight leading-tight">
                Recuperar Senha
              </h1>
              <p className="text-[14px] sm:text-[15px] text-zinc-500 mt-2.5 leading-relaxed">
                Informe o seu e-mail cadastrado. Enviaremos um link para você redefinir sua senha.
              </p>
            </div>

            {isSuccess ? (
              <div className="bg-green-50 text-green-800 p-6 rounded-2xl border border-green-200 text-center animate-in fade-in zoom-in duration-300">
                <Mail className="size-12 text-green-500 mx-auto mb-4" />
                <h3 className="text-lg font-bold mb-2">Verifique seu e-mail</h3>
                <p className="text-sm">
                  Se o e-mail informado estiver cadastrado em nossa base de dados, as instruções para redefinição de senha foram enviadas.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div className="relative group">
                  <div className={`flex items-center gap-3 bg-zinc-50/80 rounded-2xl border transition-all duration-200 px-4 h-[56px] ${emailFocused
                      ? "border-brand-red/30 bg-white shadow-sm shadow-brand-red/5 ring-4 ring-brand-red/[0.06]"
                      : "border-zinc-200/80 hover:border-zinc-300"
                    }`}>
                    <Mail className={`size-[18px] shrink-0 transition-colors duration-200 ${emailFocused ? "text-brand-red" : "text-zinc-400"
                      }`} />
                    <div className="flex-1 relative">
                      <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        onFocus={() => setEmailFocused(true)}
                        onBlur={() => setEmailFocused(false)}
                        disabled={isLoading}
                        placeholder=" "
                        className="peer w-full bg-transparent pt-4 pb-0 text-sm text-zinc-800 outline-none placeholder-transparent disabled:opacity-50"
                      />
                      <label
                        htmlFor="email"
                        className="absolute left-0 top-1/2 -translate-y-1/2 text-[13px] text-zinc-500 pointer-events-none transition-all duration-200 peer-focus:top-1.5 peer-focus:translate-y-0 peer-focus:text-[10px] peer-focus:font-semibold peer-focus:text-brand-red peer-[:not(:placeholder-shown)]:top-1.5 peer-[:not(:placeholder-shown)]:translate-y-0 peer-[:not(:placeholder-shown)]:text-[10px] peer-[:not(:placeholder-shown)]:font-semibold peer-[:not(:placeholder-shown)]:text-zinc-500"
                      >
                        E-mail
                      </label>
                    </div>
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-[52px] bg-brand-red hover:bg-brand-red-hover text-white text-[15px] font-bold rounded-2xl transition-all duration-200 shadow-lg shadow-brand-red/20 hover:shadow-xl hover:shadow-brand-red/30 active:scale-[0.98] cursor-pointer mt-4 group"
                >
                  {isLoading ? (
                    <Loader2 className="size-5 animate-spin" />
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      Enviar link de recuperação
                      <ArrowRight className="size-4 transition-transform duration-200 group-hover:translate-x-0.5" />
                    </span>
                  )}
                </Button>
              </form>
            )}
          </div>
        </div>

        <div className="w-full mt-auto pt-6 pb-2 flex justify-center">
          <p className="text-[11px] text-zinc-400 select-none text-center tracking-wide">
            Desenvolvido por{" "}
            <span className="text-purple-600 font-semibold">Nhtec</span>{" "}
            © 2021 – 2026
          </p>
        </div>
      </div>
    </div>
  )
}
