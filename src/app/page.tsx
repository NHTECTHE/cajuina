"use client"

import * as React from "react"
import { useState } from "react"
import { loginAction } from "./actions/auth"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  Eye,
  EyeOff,
  Loader2,
  User,
  Lock,
  Mail,
  Phone,
  Building2,
  ArrowRight,
  CheckCircle2
} from "lucide-react"
import { toast, Toaster } from "sonner"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'

const maskCNPJ = (value: string) => {
  return value
    .replace(/\D/g, "")
    .replace(/^(\d{2})(\d)/, "$1.$2")
    .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/\.(\d{3})(\d)/, ".$1/$2")
    .replace(/(\d{4})(\d)/, "$1-$2")
    .slice(0, 18);
};

const maskPhone = (value: string) => {
  return value
    .replace(/\D/g, "")
    .replace(/^(\d{2})(\d)/g, "($1) $2")
    .replace(/(\d)(\d{4})$/, "$1-$2")
    .slice(0, 15);
};

export default function AuthPage() {
  const router = useRouter()

  // State for Animation
  const [isRightPanelActive, setIsRightPanelActive] = useState(false)

  // -----------------------------------------
  // LOGIN STATE & LOGIC
  // -----------------------------------------
  const [loginUsername, setLoginUsername] = useState("")
  const [loginPassword, setLoginPassword] = useState("")
  const [showLoginPassword, setShowLoginPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(true)
  const [isLoadingLogin, setIsLoadingLogin] = useState(false)

  const [loginUsernameFocused, setLoginUsernameFocused] = useState(false)
  const [loginPasswordFocused, setLoginPasswordFocused] = useState(false)

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!loginUsername.trim() || !loginPassword.trim()) {
      toast.error("Por favor, preencha usuário e senha.")
      return
    }

    setIsLoadingLogin(true)

    const formData = new FormData()
    formData.append("username", loginUsername)
    formData.append("password", loginPassword)

    let isSuccess = false;

    try {
      const result = await loginAction(formData)

      setIsLoadingLogin(false)

      if (result?.error) {
        toast.error(result.error)
      } else if (result?.success) {
        isSuccess = true;
      }
    } catch (err) {
      console.error("ERRO NO FRONTEND:", err)
      setIsLoadingLogin(false)
      toast.error("Ocorreu um erro inesperado ao conectar.")
    }

    if (isSuccess) {
      router.push("/dashboard")
    }
  }

  // -----------------------------------------
  // REGISTER STATE & LOGIC
  // -----------------------------------------
  const [regData, setRegData] = useState({
    cnpj: "",
    nome: "",
    email: "",
    telefone: "",
    senha: "",
  })
  const [showRegPassword, setShowRegPassword] = useState(false)
  const [isLoadingReg, setIsLoadingReg] = useState(false)
  const [isSuccessReg, setIsSuccessReg] = useState(false)

  const handleRegChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    let newValue = value;

    if (id === "cnpj") newValue = maskCNPJ(value);
    if (id === "telefone") newValue = maskPhone(value);

    setRegData(prev => ({ ...prev, [id]: newValue }));
  }

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!regData.cnpj || !regData.nome || !regData.email || !regData.telefone || !regData.senha) {
      toast.error("Por favor, preencha todos os campos obrigatórios.")
      return
    }

    setIsLoadingReg(true)

    try {
      const res = await fetch(`${API_URL}/users/register/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          cnpj: regData.cnpj.replace(/\D/g, ""),
          first_name: regData.nome,
          email: regData.email,
          telefone: regData.telefone.replace(/\D/g, ""),
          password: regData.senha,
        }),
      });

      const data = await res.json();
      setIsLoadingReg(false)

      if (!res.ok) {
        let erroMsg = "Erro ao realizar cadastro."
        if (data.email) erroMsg = data.email[0];
        else if (data.cnpj) erroMsg = data.cnpj[0];
        else if (data.password) erroMsg = data.password[0];
        else if (data.detail) erroMsg = data.detail;
        else if (data.non_field_errors) erroMsg = data.non_field_errors[0];

        toast.error(erroMsg)
      } else {
        setIsSuccessReg(true)
      }
    } catch (err) {
      console.error("ERRO:", err)
      setIsLoadingReg(false)
      toast.error("Ocorreu um erro inesperado ao conectar.")
    }
  }

  if (isSuccessReg) {
    return (
      <div className="min-h-[100dvh] flex flex-col justify-center items-center bg-zinc-50 font-sans p-6">
        <div className="bg-white p-8 md:p-12 rounded-3xl shadow-xl max-w-md w-full text-center flex flex-col items-center">
          <CheckCircle2 className="size-20 text-green-500 mb-6" />
          <h1 className="text-2xl font-bold text-zinc-900 mb-4">Cadastro Realizado!</h1>
          <p className="text-zinc-500 mb-8 leading-relaxed">
            Sua conta foi criada com sucesso, mas encontra-se inativa.
            <br /><br />
            Enviamos um e-mail para <strong>{regData.email}</strong> com as instruções para ativação da sua conta.
          </p>
          <Button
            onClick={() => {
              setIsSuccessReg(false)
              setIsRightPanelActive(false)
            }}
            className="w-full h-12 bg-brand-red hover:bg-brand-red-hover text-white text-[15px] font-bold rounded-2xl"
          >
            Voltar para o Login
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-[100dvh] lg:h-screen w-full m-0 p-0 font-sans selection:bg-brand-red/20 selection:text-brand-red overflow-x-hidden overflow-y-auto lg:overflow-hidden bg-white flex flex-col lg:fixed lg:inset-0">
      <Toaster position="top-right" richColors duration={5000} />

      <div className={`auth-wrapper-fs flex-1 relative w-full lg:h-full bg-gradient-to-br from-white via-white to-red-50/40 lg:bg-none lg:bg-white rounded-none shadow-none m-0 p-0 ${isRightPanelActive ? "right-panel-active" : ""}`}>

        {/* ==================================================== */}
        {/* SIGN UP CONTAINER (LEFT INIT, SLIDES RIGHT IN CSS)   */}
        {/* ==================================================== */}
        <div className={`form-container sign-up-container ${isRightPanelActive ? "flex" : "hidden lg:flex"} min-h-[100dvh] lg:min-h-0 flex-col justify-center items-center px-6 py-12 lg:py-0 lg:px-12 bg-white transition-all duration-[600ms] ease-in-out lg:absolute lg:top-0 lg:h-full w-full lg:w-[50vw] ${isRightPanelActive ? "lg:left-[50vw] lg:opacity-100 lg:z-[5]" : "lg:left-0 lg:opacity-0 lg:z-[1] lg:pointer-events-none"}`}>
          <form onSubmit={handleRegisterSubmit} className="flex flex-col gap-3 w-full max-w-[360px] animate-fade-in-up">

            <div className="mb-4 text-center">
              <h1 className="text-2xl lg:text-3xl font-extrabold text-zinc-900 tracking-tight leading-tight mb-2">
                Criar sua conta
              </h1>
              <p className="text-[13px] text-zinc-500">
                Preencha os dados abaixo para se cadastrar.
              </p>
            </div>

            <div className="relative group">
              <div className="flex items-center gap-3 bg-zinc-50/80 rounded-2xl border border-zinc-200/80 hover:border-zinc-300 px-4 h-[50px] focus-within:border-brand-red/30 focus-within:bg-white focus-within:ring-4 focus-within:ring-brand-red/[0.06] transition-all duration-200">
                <Building2 className="size-[16px] shrink-0 text-zinc-400 group-focus-within:text-brand-red transition-colors" />
                <div className="flex-1 relative">
                  <input
                    id="cnpj"
                    type="text"
                    value={regData.cnpj}
                    onChange={handleRegChange}
                    disabled={isLoadingReg}
                    placeholder=" "
                    required
                    className="peer w-full bg-transparent pt-3 pb-0 text-[13px] text-zinc-800 outline-none placeholder-transparent disabled:opacity-50"
                  />
                  <label className="absolute left-0 top-1/2 -translate-y-1/2 text-[12px] text-zinc-500 pointer-events-none transition-all duration-200 peer-focus:top-1 peer-focus:translate-y-0 peer-focus:text-[9px] peer-focus:font-semibold peer-focus:text-brand-red peer-[:not(:placeholder-shown)]:top-1 peer-[:not(:placeholder-shown)]:translate-y-0 peer-[:not(:placeholder-shown)]:text-[9px] peer-[:not(:placeholder-shown)]:font-semibold peer-[:not(:placeholder-shown)]:text-zinc-500">
                    CNPJ
                  </label>
                </div>
              </div>
            </div>

            <div className="relative group">
              <div className="flex items-center gap-3 bg-zinc-50/80 rounded-2xl border border-zinc-200/80 hover:border-zinc-300 px-4 h-[50px] focus-within:border-brand-red/30 focus-within:bg-white focus-within:ring-4 focus-within:ring-brand-red/[0.06] transition-all duration-200">
                <User className="size-[16px] shrink-0 text-zinc-400 group-focus-within:text-brand-red transition-colors" />
                <div className="flex-1 relative">
                  <input
                    id="nome"
                    type="text"
                    value={regData.nome}
                    onChange={handleRegChange}
                    disabled={isLoadingReg}
                    placeholder=" "
                    required
                    className="peer w-full bg-transparent pt-3 pb-0 text-[13px] text-zinc-800 outline-none placeholder-transparent disabled:opacity-50"
                  />
                  <label className="absolute left-0 top-1/2 -translate-y-1/2 text-[12px] text-zinc-500 pointer-events-none transition-all duration-200 peer-focus:top-1 peer-focus:translate-y-0 peer-focus:text-[9px] peer-focus:font-semibold peer-focus:text-brand-red peer-[:not(:placeholder-shown)]:top-1 peer-[:not(:placeholder-shown)]:translate-y-0 peer-[:not(:placeholder-shown)]:text-[9px] peer-[:not(:placeholder-shown)]:font-semibold peer-[:not(:placeholder-shown)]:text-zinc-500">
                    Nome da Empresa / Usuário
                  </label>
                </div>
              </div>
            </div>

            <div className="relative group">
              <div className="flex items-center gap-3 bg-zinc-50/80 rounded-2xl border border-zinc-200/80 hover:border-zinc-300 px-4 h-[50px] focus-within:border-brand-red/30 focus-within:bg-white focus-within:ring-4 focus-within:ring-brand-red/[0.06] transition-all duration-200">
                <Mail className="size-[16px] shrink-0 text-zinc-400 group-focus-within:text-brand-red transition-colors" />
                <div className="flex-1 relative">
                  <input
                    id="email"
                    type="email"
                    value={regData.email}
                    onChange={handleRegChange}
                    disabled={isLoadingReg}
                    placeholder=" "
                    required
                    className="peer w-full bg-transparent pt-3 pb-0 text-[13px] text-zinc-800 outline-none placeholder-transparent disabled:opacity-50"
                  />
                  <label className="absolute left-0 top-1/2 -translate-y-1/2 text-[12px] text-zinc-500 pointer-events-none transition-all duration-200 peer-focus:top-1 peer-focus:translate-y-0 peer-focus:text-[9px] peer-focus:font-semibold peer-focus:text-brand-red peer-[:not(:placeholder-shown)]:top-1 peer-[:not(:placeholder-shown)]:translate-y-0 peer-[:not(:placeholder-shown)]:text-[9px] peer-[:not(:placeholder-shown)]:font-semibold peer-[:not(:placeholder-shown)]:text-zinc-500">
                    E-mail
                  </label>
                </div>
              </div>
            </div>

            <div className="relative group">
              <div className="flex items-center gap-3 bg-zinc-50/80 rounded-2xl border border-zinc-200/80 hover:border-zinc-300 px-4 h-[50px] focus-within:border-brand-red/30 focus-within:bg-white focus-within:ring-4 focus-within:ring-brand-red/[0.06] transition-all duration-200">
                <Phone className="size-[16px] shrink-0 text-zinc-400 group-focus-within:text-brand-red transition-colors" />
                <div className="flex-1 relative">
                  <input
                    id="telefone"
                    type="text"
                    value={regData.telefone}
                    onChange={handleRegChange}
                    disabled={isLoadingReg}
                    placeholder=" "
                    required
                    className="peer w-full bg-transparent pt-3 pb-0 text-[13px] text-zinc-800 outline-none placeholder-transparent disabled:opacity-50"
                  />
                  <label className="absolute left-0 top-1/2 -translate-y-1/2 text-[12px] text-zinc-500 pointer-events-none transition-all duration-200 peer-focus:top-1 peer-focus:translate-y-0 peer-focus:text-[9px] peer-focus:font-semibold peer-focus:text-brand-red peer-[:not(:placeholder-shown)]:top-1 peer-[:not(:placeholder-shown)]:translate-y-0 peer-[:not(:placeholder-shown)]:text-[9px] peer-[:not(:placeholder-shown)]:font-semibold peer-[:not(:placeholder-shown)]:text-zinc-500">
                    Telefone
                  </label>
                </div>
              </div>
            </div>

            <div className="relative group">
              <div className="flex items-center gap-3 bg-zinc-50/80 rounded-2xl border border-zinc-200/80 hover:border-zinc-300 px-4 h-[50px] focus-within:border-brand-red/30 focus-within:bg-white focus-within:ring-4 focus-within:ring-brand-red/[0.06] transition-all duration-200">
                <Lock className="size-[16px] shrink-0 text-zinc-400 group-focus-within:text-brand-red transition-colors" />
                <div className="flex-1 relative">
                  <input
                    id="senha"
                    type={showRegPassword ? "text" : "password"}
                    value={regData.senha}
                    onChange={handleRegChange}
                    disabled={isLoadingReg}
                    placeholder=" "
                    required
                    className="peer w-full bg-transparent pt-3 pb-0 text-[13px] text-zinc-800 outline-none placeholder-transparent disabled:opacity-50"
                  />
                  <label className="absolute left-0 top-1/2 -translate-y-1/2 text-[12px] text-zinc-500 pointer-events-none transition-all duration-200 peer-focus:top-1 peer-focus:translate-y-0 peer-focus:text-[9px] peer-focus:font-semibold peer-focus:text-brand-red peer-[:not(:placeholder-shown)]:top-1 peer-[:not(:placeholder-shown)]:translate-y-0 peer-[:not(:placeholder-shown)]:text-[9px] peer-[:not(:placeholder-shown)]:font-semibold peer-[:not(:placeholder-shown)]:text-zinc-500">
                    Senha
                  </label>
                </div>
                <button
                  type="button"
                  onClick={() => setShowRegPassword(!showRegPassword)}
                  disabled={isLoadingReg}
                  className="shrink-0 p-1 rounded-lg transition-all focus:outline-none hover:bg-zinc-100 text-zinc-400 hover:text-zinc-600"
                >
                  {showRegPassword ? <EyeOff className="size-[14px]" /> : <Eye className="size-[14px]" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={isLoadingReg}
              className="w-full h-[50px] bg-[#e53e3e] hover:bg-[#c53030] text-white text-[14px] font-bold rounded-2xl shadow-lg mt-2 transition-all hover:shadow-[#e53e3e]/30"
            >
              {isLoadingReg ? <Loader2 className="size-5 animate-spin" /> : "Finalizar Cadastro"}
            </Button>

          </form>

          {/* Mobile-only toggle */}
          <div className="lg:hidden mt-6 text-center w-full max-w-[360px] animate-fade-in-up">
            <span className="text-[13px] text-zinc-500">
              Já tem uma conta?{" "}
            </span>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                setIsRightPanelActive(false);
              }}
              className="text-[13px] font-bold text-[#e53e3e] hover:underline"
            >
              Entrar
            </button>
          </div>
        </div>

        {/* ==================================================== */}
        {/* SIGN IN CONTAINER (LEFT INIT, OPACITY SHOWS)         */}
        {/* ==================================================== */}
        <div className={`form-container sign-in-container ${isRightPanelActive ? "hidden lg:flex" : "flex"} min-h-[100dvh] lg:min-h-0 flex-col justify-center items-center px-6 py-12 lg:py-0 lg:px-12 bg-white transition-all duration-[600ms] ease-in-out lg:absolute lg:top-0 lg:h-full w-full lg:w-[50vw] ${isRightPanelActive ? "lg:left-[50vw] lg:opacity-0 lg:z-[1] lg:pointer-events-none" : "lg:left-0 lg:opacity-100 lg:z-[2]"}`}>
          <form onSubmit={handleLoginSubmit} className="flex flex-col gap-4 w-full max-w-[360px] animate-fade-in-up">

            {/* Mobile logo (only shown if needed, but overlay is hidden on mobile so we might want a logo here) */}
            <div className="lg:hidden mb-6 w-full flex justify-center px-4">
              <Image
                src="/2 - 1.png"
                alt="Cajuína"
                width={200}
                height={70}
                priority
                className="w-auto h-auto object-contain select-none"
              />
            </div>

            <div className="mb-6 text-center">
              <h1 className="text-2xl lg:text-3xl font-extrabold text-zinc-900 tracking-tight leading-tight mb-2">
                Bem-vindo de volta
              </h1>
              <p className="text-[13px] text-zinc-500">
                Acesse sua conta para gerenciar seus seguros.
              </p>
            </div>

            <div className="relative group">
              <div className={`flex items-center gap-3 bg-zinc-50/80 rounded-2xl border transition-all duration-200 px-4 h-[56px] ${loginUsernameFocused
                ? "border-brand-red/30 bg-white shadow-sm ring-4 ring-brand-red/[0.06]"
                : "border-zinc-200/80 hover:border-zinc-300"
                }`}>
                <User className={`size-[18px] shrink-0 transition-colors duration-200 ${loginUsernameFocused ? "text-brand-red" : "text-zinc-400"}`} />
                <div className="flex-1 relative">
                  <input
                    id="loginUsername"
                    type="text"
                    value={loginUsername}
                    onChange={(e) => setLoginUsername(e.target.value)}
                    onFocus={() => setLoginUsernameFocused(true)}
                    onBlur={() => setLoginUsernameFocused(false)}
                    disabled={isLoadingLogin}
                    placeholder=" "
                    className="peer w-full bg-transparent pt-4 pb-0 text-[14px] text-zinc-800 outline-none placeholder-transparent disabled:opacity-50"
                  />
                  <label className="absolute left-0 top-1/2 -translate-y-1/2 text-[13px] text-zinc-500 pointer-events-none transition-all duration-200 peer-focus:top-1.5 peer-focus:translate-y-0 peer-focus:text-[10px] peer-focus:font-semibold peer-focus:text-brand-red peer-[:not(:placeholder-shown)]:top-1.5 peer-[:not(:placeholder-shown)]:translate-y-0 peer-[:not(:placeholder-shown)]:text-[10px] peer-[:not(:placeholder-shown)]:font-semibold peer-[:not(:placeholder-shown)]:text-zinc-500">
                    Usuário
                  </label>
                </div>
              </div>
            </div>

            <div className="relative group">
              <div className={`flex items-center gap-3 bg-zinc-50/80 rounded-2xl border transition-all duration-200 px-4 h-[56px] ${loginPasswordFocused
                ? "border-brand-red/30 bg-white shadow-sm ring-4 ring-brand-red/[0.06]"
                : "border-zinc-200/80 hover:border-zinc-300"
                }`}>
                <Lock className={`size-[18px] shrink-0 transition-colors duration-200 ${loginPasswordFocused ? "text-brand-red" : "text-zinc-400"}`} />
                <div className="flex-1 relative">
                  <input
                    id="loginPassword"
                    type={showLoginPassword ? "text" : "password"}
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    onFocus={() => setLoginPasswordFocused(true)}
                    onBlur={() => setLoginPasswordFocused(false)}
                    disabled={isLoadingLogin}
                    placeholder=" "
                    className="peer w-full bg-transparent pt-4 pb-0 text-[14px] text-zinc-800 outline-none placeholder-transparent disabled:opacity-50"
                  />
                  <label className="absolute left-0 top-1/2 -translate-y-1/2 text-[13px] text-zinc-500 pointer-events-none transition-all duration-200 peer-focus:top-1.5 peer-focus:translate-y-0 peer-focus:text-[10px] peer-focus:font-semibold peer-focus:text-brand-red peer-[:not(:placeholder-shown)]:top-1.5 peer-[:not(:placeholder-shown)]:translate-y-0 peer-[:not(:placeholder-shown)]:text-[10px] peer-[:not(:placeholder-shown)]:font-semibold peer-[:not(:placeholder-shown)]:text-zinc-500">
                    Senha
                  </label>
                </div>
                <button
                  type="button"
                  onClick={() => setShowLoginPassword(!showLoginPassword)}
                  disabled={isLoadingLogin}
                  className="shrink-0 p-1.5 rounded-lg transition-all focus:outline-none hover:bg-zinc-100 text-zinc-400 hover:text-zinc-600"
                >
                  {showLoginPassword ? <EyeOff className="size-[16px]" /> : <Eye className="size-[16px]" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center gap-2.5">
                <Checkbox
                  id="remember"
                  checked={rememberMe}
                  onCheckedChange={(c) => setRememberMe(c === true)}
                  disabled={isLoadingLogin}
                  className="data-[state=checked]:bg-[#e53e3e] data-[state=checked]:border-[#e53e3e] rounded-md"
                />
                <Label htmlFor="remember" className="text-[13px] text-zinc-600 cursor-pointer select-none">
                  Lembrar-me
                </Label>
              </div>
              <Link
                href="/esqueci-senha"
                className="text-[13px] font-semibold text-[#e53e3e] hover:underline decoration-2 underline-offset-4"
              >
                Esqueceu a senha?
              </Link>
            </div>

            <Button
              type="submit"
              disabled={isLoadingLogin}
              className="w-full h-[52px] bg-[#e53e3e] hover:bg-[#c53030] text-white text-[15px] font-bold rounded-2xl shadow-lg mt-3 group transition-all hover:shadow-[#e53e3e]/30"
            >
              {isLoadingLogin ? (
                <Loader2 className="size-5 animate-spin" />
              ) : (
                <span className="flex items-center justify-center gap-2">
                  Entrar
                  <ArrowRight className="size-4 transition-transform duration-200 group-hover:translate-x-0.5" />
                </span>
              )}
            </Button>

          </form>

          {/* Mobile-only toggle */}
          <div className="lg:hidden mt-6 text-center w-full max-w-[360px] animate-fade-in-up">
            <span className="text-[13px] text-zinc-500">
              Não possui conta?{" "}
            </span>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                setIsRightPanelActive(true);
              }}
              className="text-[13px] font-bold text-[#e53e3e] hover:underline"
            >
              Cadastre-se
            </button>
          </div>
        </div>

        {/* ==================================================== */}
        {/* OVERLAY CONTAINER                                    */}
        {/* ==================================================== */}
        <div className={`overlay-container hidden lg:block absolute top-0 h-full w-[50vw] transition-all duration-[600ms] ease-in-out overflow-hidden z-[100] ${isRightPanelActive ? "left-0 rounded-r-[2.5rem] rounded-l-none" : "left-[50vw] rounded-l-[2.5rem] rounded-r-none"}`}>
          <div className={`overlay absolute top-0 h-full w-[100vw] transition-all duration-[600ms] ease-in-out bg-cover bg-no-repeat text-white ${isRightPanelActive ? "left-0" : "left-[-50vw]"}`} style={{ background: "linear-gradient(135deg, #e53e3e 0%, #aa3232 100%)" }}>

            {/* OVERLAY LEFT (Appears when Sign Up is active, clicking "Entrar" switches to Sign In) */}
            <div className={`overlay-panel overlay-left absolute top-0 h-full w-[50vw] flex flex-col justify-center items-center px-10 pb-12 text-center transition-all duration-[600ms] ease-in-out ${isRightPanelActive ? "left-0" : "left-[-20%]"}`}>
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
              <h2 className="text-3xl font-extrabold text-white mb-4 z-10">Já é cliente?</h2>
              <p className="text-[14px] font-medium text-white/90 mb-8 z-10 leading-relaxed px-4">
                Acesse sua conta para continuar gerenciando <br /> suas garantias e contratos.
              </p>
              <Button
                variant="outline"
                className="relative z-20 bg-transparent text-white border-2 border-white hover:bg-white hover:text-[#e53e3e] font-bold rounded-full px-12 py-6 text-[15px] tracking-wide transition-all shadow-none hover:scale-105"
                onClick={() => setIsRightPanelActive(false)}
              >
                ENTRAR
              </Button>
            </div>

            {/* OVERLAY RIGHT (Appears when Sign In is active, clicking "Cadastrar" switches to Sign Up) */}
            <div className={`overlay-panel overlay-right absolute top-0 h-full w-[50vw] flex flex-col justify-center items-center px-10 pb-12 text-center transition-all duration-[600ms] ease-in-out ${isRightPanelActive ? "right-[-20%]" : "right-0"}`}>
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
              <h2 className="text-3xl font-extrabold text-white mb-4 z-10">Novo por aqui?</h2>
              <p className="text-[14px] font-medium text-white/90 mb-8 z-10 leading-relaxed px-4">
                Cadastre-se ou entre em contato conosco <br /> para se tornar um cliente.
              </p>
              <Button
                variant="outline"
                className="relative z-20 bg-transparent text-white border-2 border-white hover:bg-white hover:text-[#e53e3e] font-bold rounded-full px-12 py-6 text-[15px] tracking-wide transition-all shadow-none hover:scale-105"
                onClick={() => setIsRightPanelActive(true)}
              >
                CADASTRAR
              </Button>
            </div>

          </div>
        </div>

      </div>

      <div className="absolute bottom-4 w-full flex justify-center z-0 lg:z-auto">
        <p className="text-[11px] text-zinc-400 select-none text-center tracking-wide">
          Desenvolvido por{" "}
          <span className="text-purple-600 font-semibold">Nhtec</span>{" "}
          © 2021 – 2026
        </p>
      </div>
    </div>
  )
}
