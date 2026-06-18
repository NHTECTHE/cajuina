"use client"

import * as React from "react"
import { useState } from "react"
import { loginAction } from "./actions/auth"
import Image from "next/image"
import {
  Eye,
  EyeOff,
  Loader2,
  User,
  Lock,
  ArrowRight,
} from "lucide-react"
import { toast, Toaster } from "sonner"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"

import { useRouter } from "next/navigation"

export default function LoginPage() {
  const router = useRouter()
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const [usernameFocused, setUsernameFocused] = useState(false)
  const [passwordFocused, setPasswordFocused] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!username.trim()) {
      toast.error("Por favor, preencha o campo de usuário.")
      return
    }

    if (!password.trim()) {
      toast.error("Por favor, informe a sua senha.")
      return
    }

    setIsLoading(true)

    const formData = new FormData()
    formData.append("username", username)
    formData.append("password", password)

    let isSuccess = false;

    try {
      const result = await loginAction(formData)

      setIsLoading(false)

      if (result?.error) {
        toast.error(result.error)
      } else if (result?.success) {
        isSuccess = true;
      }
    } catch (err) {
      console.error("ERRO NO FRONTEND:", err)
      setIsLoading(false)
      toast.error("Ocorreu um erro inesperado ao conectar.")
    }

    if (isSuccess) {
      router.push("/dashboard")
    }
  }

  return (
    <div className="min-h-[100dvh] flex flex-col lg:flex-row bg-white font-sans selection:bg-brand-red/20 selection:text-brand-red">
      <Toaster position="top-right" richColors />

      {/* ───── LEFT: Hero Image Panel ───── */}
      <div className="hidden lg:flex lg:w-[38%] relative overflow-hidden rounded-r-3xl">

        {/* Background hero image */}
        <Image
          src="/hero-login.png"
          alt="Profissional usando a plataforma Cajuína"
          fill
          priority
          className="object-cover object-center"
        />

        {/* Dark overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/15 to-black/20" />

        {/* Logo at bottom — large and centered */}
        <div className="absolute bottom-[-60px] left-0 right-0 z-10 flex justify-center px-4">
          <Image
            src="/5 - 5.png"
            alt="Cajuína Corretora de Seguros"
            width={1200}
            height={400}
            priority
            className="w-auto h-[400px] max-w-full object-contain select-none drop-shadow-lg"
          />
        </div>
      </div>

      {/* ───── RIGHT: Login Form ───── */}
      <div className="flex-1 flex flex-col px-6 py-6 sm:px-12 lg:px-20 relative min-h-[100dvh] lg:min-h-0 bg-gradient-to-br from-white via-white to-red-50/40">

        {/* Subtle decorative element */}
        <div className="absolute top-0 right-0 w-[300px] h-[300px] md:w-[400px] md:h-[400px] bg-gradient-to-bl from-brand-red/[0.04] to-transparent rounded-full -translate-y-1/2 translate-x-1/3 pointer-events-none" />

        {/* Main Form Area Centered */}
        <div className="flex-1 flex flex-col justify-center items-center w-full max-w-[420px] mx-auto animate-fade-in-up relative z-10">
          
          {/* Mobile logo */}
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
            {/* Heading */}
            <div className="mb-8 text-center lg:text-left">
              <h1 className="text-2xl sm:text-3xl lg:text-[2rem] font-extrabold text-zinc-900 tracking-tight leading-tight">
                Bem-vindo de volta
              </h1>
              <p className="text-[14px] sm:text-[15px] text-zinc-500 mt-2.5 leading-relaxed">
                Acesse sua conta para gerenciar seus seguros com tranquilidade.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">

              {/* ── Username ── */}
              <div className="relative group">
                <div className={`flex items-center gap-3 bg-zinc-50/80 rounded-2xl border transition-all duration-200 px-4 h-[56px] ${usernameFocused
                    ? "border-brand-red/30 bg-white shadow-sm shadow-brand-red/5 ring-4 ring-brand-red/[0.06]"
                    : "border-zinc-200/80 hover:border-zinc-300"
                  }`}>
                  <User className={`size-[18px] shrink-0 transition-colors duration-200 ${usernameFocused ? "text-brand-red" : "text-zinc-400"
                    }`} />
                  <div className="flex-1 relative">
                    <input
                      id="username"
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      onFocus={() => setUsernameFocused(true)}
                      onBlur={() => setUsernameFocused(false)}
                      disabled={isLoading}
                      placeholder=" "
                      className="peer w-full bg-transparent pt-4 pb-0 text-sm text-zinc-800 outline-none placeholder-transparent disabled:opacity-50"
                    />
                    <label
                      htmlFor="username"
                      className="absolute left-0 top-1/2 -translate-y-1/2 text-[13px] text-zinc-500 pointer-events-none transition-all duration-200 peer-focus:top-1.5 peer-focus:translate-y-0 peer-focus:text-[10px] peer-focus:font-semibold peer-focus:text-brand-red peer-[:not(:placeholder-shown)]:top-1.5 peer-[:not(:placeholder-shown)]:translate-y-0 peer-[:not(:placeholder-shown)]:text-[10px] peer-[:not(:placeholder-shown)]:font-semibold peer-[:not(:placeholder-shown)]:text-zinc-500"
                    >
                      Usuário
                    </label>
                  </div>
                </div>
              </div>

              {/* ── Password ── */}
              <div className="relative group">
                <div className={`flex items-center gap-3 bg-zinc-50/80 rounded-2xl border transition-all duration-200 px-4 h-[56px] ${passwordFocused
                    ? "border-brand-red/30 bg-white shadow-sm shadow-brand-red/5 ring-4 ring-brand-red/[0.06]"
                    : "border-zinc-200/80 hover:border-zinc-300"
                  }`}>
                  <Lock className={`size-[18px] shrink-0 transition-colors duration-200 ${passwordFocused ? "text-brand-red" : "text-zinc-400"
                    }`} />
                  <div className="flex-1 relative">
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      onFocus={() => setPasswordFocused(true)}
                      onBlur={() => setPasswordFocused(false)}
                      disabled={isLoading}
                      placeholder=" "
                      className="peer w-full bg-transparent pt-4 pb-0 text-sm text-zinc-800 outline-none placeholder-transparent disabled:opacity-50"
                    />
                    <label
                      htmlFor="password"
                      className="absolute left-0 top-1/2 -translate-y-1/2 text-[13px] text-zinc-500 pointer-events-none transition-all duration-200 peer-focus:top-1.5 peer-focus:translate-y-0 peer-focus:text-[10px] peer-focus:font-semibold peer-focus:text-brand-red peer-[:not(:placeholder-shown)]:top-1.5 peer-[:not(:placeholder-shown)]:translate-y-0 peer-[:not(:placeholder-shown)]:text-[10px] peer-[:not(:placeholder-shown)]:font-semibold peer-[:not(:placeholder-shown)]:text-zinc-500"
                    >
                      Senha
                    </label>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isLoading}
                    className={`shrink-0 p-1.5 rounded-lg transition-all duration-150 focus:outline-none hover:bg-zinc-100 ${showPassword ? "text-brand-red" : "text-zinc-400 hover:text-zinc-600"
                      }`}
                    aria-label={showPassword ? "Ocultar senha" : "Exibir senha"}
                  >
                    {showPassword ? <EyeOff className="size-[16px]" /> : <Eye className="size-[16px]" />}
                  </button>
                </div>
              </div>

              {/* ── Forgot + Remember row ── */}
              <div className="flex items-center justify-between pt-1">
                <div className="flex items-center gap-2.5">
                  <Checkbox
                    id="remember"
                    checked={rememberMe}
                    onCheckedChange={(c) => setRememberMe(c === true)}
                    disabled={isLoading}
                    className="data-[state=checked]:bg-brand-red data-[state=checked]:border-brand-red rounded-md"
                  />
                  <Label
                    htmlFor="remember"
                    className="text-[13px] text-zinc-600 cursor-pointer select-none"
                  >
                    Lembrar-me
                  </Label>
                </div>
                <a
                  href="#forgot-password"
                  onClick={(e) => {
                    e.preventDefault()
                    toast.info("Para recuperar sua senha, contate o administrador do sistema.")
                  }}
                  className="text-[13px] font-semibold text-brand-red hover:text-brand-red-hover transition-colors"
                >
                  Esqueceu a senha?
                </a>
              </div>

              {/* ── Submit button ── */}
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-[52px] bg-brand-red hover:bg-brand-red-hover text-white text-[15px] font-bold rounded-2xl transition-all duration-200 shadow-lg shadow-brand-red/20 hover:shadow-xl hover:shadow-brand-red/30 active:scale-[0.98] cursor-pointer mt-4 group"
              >
                {isLoading ? (
                  <Loader2 className="size-5 animate-spin" />
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    Entrar
                    <ArrowRight className="size-4 transition-transform duration-200 group-hover:translate-x-0.5" />
                  </span>
                )}
              </Button>
            </form>

            {/* ── Divider ── */}
            <div className="flex items-center gap-4 my-7">
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-zinc-200 to-transparent" />
              <span className="text-[11px] text-zinc-400 font-semibold uppercase tracking-[0.15em]">ou</span>
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-zinc-200 to-transparent" />
            </div>

            {/* ── Register CTA ── */}
            <p className="text-[14px] text-zinc-500 text-center">
              Não possui uma conta?{" "}
              <a
                href="#register"
                onClick={(e) => {
                  e.preventDefault()
                  toast.info("A criação de novas contas está sob controle da administração.")
                }}
                className="font-bold text-brand-red hover:text-brand-red-hover hover:underline underline-offset-2 transition-all"
              >
                Cadastre-se
              </a>
            </p>
          </div>
        </div>

        {/* ── Footer ── */}
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
