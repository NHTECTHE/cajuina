"use client"

import * as React from "react"
import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import {
  Eye,
  EyeOff,
  Loader2,
  User,
  Lock,
  Mail,
  Phone,
  Building2,
  CheckCircle2
} from "lucide-react"
import { toast, Toaster } from "sonner"
import { lookupCnpj } from "@/services/api"
import { Button } from "@/components/ui/button"

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

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    cnpj: "",
    nome: "",
    email: "",
    telefone: "",
    senha: "",
  })
  
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [cnpjLoading, setCnpjLoading] = useState(false)

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    let newValue = value;

    if (id === "cnpj") {
      newValue = maskCNPJ(value);
      const digits = newValue.replace(/\D/g, "");
      if (digits.length === 14) {
        setCnpjLoading(true);
        try {
          const data = await lookupCnpj(digits);
          setFormData(prev => ({
            ...prev,
            cnpj: newValue,
            nome: data.razao_social || data.nome_fantasia || prev.nome,
            email: data.email || prev.email,
            telefone: maskPhone(data.telefone || "") || prev.telefone,
          }));
          setCnpjLoading(false);
          return;
        } catch {
          toast.error("CNPJ não encontrado");
        } finally {
          setCnpjLoading(false);
        }
      }
    }
    if (id === "telefone") newValue = maskPhone(value);

    setFormData(prev => ({ ...prev, [id]: newValue }));
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.cnpj || !formData.nome || !formData.email || !formData.telefone || !formData.senha) {
      toast.error("Por favor, preencha todos os campos obrigatórios.")
      return
    }

    setIsLoading(true)

    try {
      const res = await fetch(`${API_URL}/users/register/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          cnpj: formData.cnpj.replace(/\D/g, ""),
          first_name: formData.nome,
          email: formData.email,
          telefone: formData.telefone.replace(/\D/g, ""),
          password: formData.senha,
        }),
      });

      const data = await res.json();

      setIsLoading(false)

      if (!res.ok) {
        // Formatar erros
        let erroMsg = "Erro ao realizar cadastro."
        if (data.email) erroMsg = data.email[0];
        else if (data.cnpj) erroMsg = data.cnpj[0];
        else if (data.password) erroMsg = data.password[0];
        else if (data.detail) erroMsg = data.detail;
        else if (data.non_field_errors) erroMsg = data.non_field_errors[0];
        
        toast.error(erroMsg)
      } else {
        setIsSuccess(true)
      }
    } catch (err) {
      console.error("ERRO:", err)
      setIsLoading(false)
      toast.error("Ocorreu um erro inesperado ao conectar.")
    }
  }

  if (isSuccess) {
    return (
      <div className="min-h-[100dvh] flex flex-col justify-center items-center bg-zinc-50 font-sans p-6">
        <div className="bg-white p-8 md:p-12 rounded-3xl shadow-xl max-w-md w-full text-center flex flex-col items-center">
          <CheckCircle2 className="size-20 text-green-500 mb-6" />
          <h1 className="text-2xl font-bold text-zinc-900 mb-4">Cadastro Realizado!</h1>
          <p className="text-zinc-500 mb-8 leading-relaxed">
            Sua conta foi criada com sucesso, mas encontra-se inativa. 
            <br/><br/>
            Enviamos um e-mail para <strong>{formData.email}</strong> com as instruções para ativação da sua conta.
          </p>
          <Link href="/" className="w-full">
            <Button className="w-full h-12 bg-brand-red hover:bg-brand-red-hover text-white text-[15px] font-bold rounded-2xl">
              Voltar para o Login
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-[100dvh] flex flex-col lg:flex-row bg-white font-sans selection:bg-brand-red/20 selection:text-brand-red">
      <Toaster position="top-right" closeButton richColors />

      {/* ───── LEFT: Hero Image Panel ───── */}
      <div className="hidden lg:flex lg:w-[38%] relative overflow-hidden rounded-r-3xl">
        <Image
          src="/hero-login.png"
          alt="Cajuína"
          fill
          priority
          className="object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/15 to-black/20" />
        <div className="absolute bottom-[-60px] left-0 right-0 z-10 flex justify-center px-4">
          <Image
            src="/5 - 5.png"
            alt="Cajuína"
            width={1200}
            height={400}
            priority
            className="w-auto h-[400px] max-w-full object-contain select-none drop-shadow-lg"
          />
        </div>
      </div>

      {/* ───── RIGHT: Register Form ───── */}
      <div className="flex-1 flex flex-col px-6 py-6 sm:px-12 lg:px-20 relative min-h-[100dvh] lg:min-h-0 bg-gradient-to-br from-white via-white to-red-50/40">
        
        <div className="flex-1 flex flex-col justify-center items-center w-full max-w-[420px] mx-auto animate-fade-in-up relative z-10">
          
          <div className="w-full">
            <div className="mb-8 text-center lg:text-left">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 tracking-tight leading-tight">
                Criar sua conta
              </h1>
              <p className="text-[14px] text-zinc-500 mt-2.5">
                Preencha os dados abaixo para se cadastrar no sistema.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              
              <div className="relative group">
                <div className="flex items-center gap-3 bg-zinc-50/80 rounded-2xl border border-zinc-200/80 hover:border-zinc-300 px-4 h-[56px] focus-within:border-brand-red/30 focus-within:bg-white focus-within:ring-4 focus-within:ring-brand-red/[0.06] transition-all duration-200">
                  <Building2 className="size-[18px] shrink-0 text-zinc-400 group-focus-within:text-brand-red transition-colors" />
                  <div className="flex-1 relative">
                    <input
                      id="cnpj"
                      type="text"
                      value={formData.cnpj}
                      onChange={handleChange}
                      disabled={isLoading || cnpjLoading}
                      placeholder=" "
                      required
                      className="peer w-full bg-transparent pt-4 pb-0 pr-8 text-sm text-zinc-800 outline-none placeholder-transparent disabled:opacity-50"
                    />
                    <label className="absolute left-0 top-1/2 -translate-y-1/2 text-[13px] text-zinc-500 pointer-events-none transition-all duration-200 peer-focus:top-1.5 peer-focus:translate-y-0 peer-focus:text-[10px] peer-focus:font-semibold peer-focus:text-brand-red peer-[:not(:placeholder-shown)]:top-1.5 peer-[:not(:placeholder-shown)]:translate-y-0 peer-[:not(:placeholder-shown)]:text-[10px] peer-[:not(:placeholder-shown)]:font-semibold peer-[:not(:placeholder-shown)]:text-zinc-500">
                      CNPJ
                    </label>
                    {cnpjLoading && (
                      <Loader2 className="absolute right-0 top-1/2 -translate-y-1/2 size-4 animate-spin text-brand-red" />
                    )}
                  </div>
                </div>
              </div>

              <div className="relative group">
                <div className="flex items-center gap-3 bg-zinc-50/80 rounded-2xl border border-zinc-200/80 hover:border-zinc-300 px-4 h-[56px] focus-within:border-brand-red/30 focus-within:bg-white focus-within:ring-4 focus-within:ring-brand-red/[0.06] transition-all duration-200">
                  <User className="size-[18px] shrink-0 text-zinc-400 group-focus-within:text-brand-red transition-colors" />
                  <div className="flex-1 relative">
                    <input
                      id="nome"
                      type="text"
                      value={formData.nome}
                      onChange={handleChange}
                      disabled={isLoading}
                      placeholder=" "
                      required
                      className="peer w-full bg-transparent pt-4 pb-0 text-sm text-zinc-800 outline-none placeholder-transparent disabled:opacity-50"
                    />
                    <label className="absolute left-0 top-1/2 -translate-y-1/2 text-[13px] text-zinc-500 pointer-events-none transition-all duration-200 peer-focus:top-1.5 peer-focus:translate-y-0 peer-focus:text-[10px] peer-focus:font-semibold peer-focus:text-brand-red peer-[:not(:placeholder-shown)]:top-1.5 peer-[:not(:placeholder-shown)]:translate-y-0 peer-[:not(:placeholder-shown)]:text-[10px] peer-[:not(:placeholder-shown)]:font-semibold peer-[:not(:placeholder-shown)]:text-zinc-500">
                      Nome da Empresa / Usuário
                    </label>
                  </div>
                </div>
              </div>

              <div className="relative group">
                <div className="flex items-center gap-3 bg-zinc-50/80 rounded-2xl border border-zinc-200/80 hover:border-zinc-300 px-4 h-[56px] focus-within:border-brand-red/30 focus-within:bg-white focus-within:ring-4 focus-within:ring-brand-red/[0.06] transition-all duration-200">
                  <Mail className="size-[18px] shrink-0 text-zinc-400 group-focus-within:text-brand-red transition-colors" />
                  <div className="flex-1 relative">
                    <input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      disabled={isLoading}
                      placeholder=" "
                      required
                      className="peer w-full bg-transparent pt-4 pb-0 text-sm text-zinc-800 outline-none placeholder-transparent disabled:opacity-50"
                    />
                    <label className="absolute left-0 top-1/2 -translate-y-1/2 text-[13px] text-zinc-500 pointer-events-none transition-all duration-200 peer-focus:top-1.5 peer-focus:translate-y-0 peer-focus:text-[10px] peer-focus:font-semibold peer-focus:text-brand-red peer-[:not(:placeholder-shown)]:top-1.5 peer-[:not(:placeholder-shown)]:translate-y-0 peer-[:not(:placeholder-shown)]:text-[10px] peer-[:not(:placeholder-shown)]:font-semibold peer-[:not(:placeholder-shown)]:text-zinc-500">
                      E-mail
                    </label>
                  </div>
                </div>
              </div>

              <div className="relative group">
                <div className="flex items-center gap-3 bg-zinc-50/80 rounded-2xl border border-zinc-200/80 hover:border-zinc-300 px-4 h-[56px] focus-within:border-brand-red/30 focus-within:bg-white focus-within:ring-4 focus-within:ring-brand-red/[0.06] transition-all duration-200">
                  <Phone className="size-[18px] shrink-0 text-zinc-400 group-focus-within:text-brand-red transition-colors" />
                  <div className="flex-1 relative">
                    <input
                      id="telefone"
                      type="text"
                      value={formData.telefone}
                      onChange={handleChange}
                      disabled={isLoading}
                      placeholder=" "
                      required
                      className="peer w-full bg-transparent pt-4 pb-0 text-sm text-zinc-800 outline-none placeholder-transparent disabled:opacity-50"
                    />
                    <label className="absolute left-0 top-1/2 -translate-y-1/2 text-[13px] text-zinc-500 pointer-events-none transition-all duration-200 peer-focus:top-1.5 peer-focus:translate-y-0 peer-focus:text-[10px] peer-focus:font-semibold peer-focus:text-brand-red peer-[:not(:placeholder-shown)]:top-1.5 peer-[:not(:placeholder-shown)]:translate-y-0 peer-[:not(:placeholder-shown)]:text-[10px] peer-[:not(:placeholder-shown)]:font-semibold peer-[:not(:placeholder-shown)]:text-zinc-500">
                      Telefone
                    </label>
                  </div>
                </div>
              </div>

              <div className="relative group">
                <div className="flex items-center gap-3 bg-zinc-50/80 rounded-2xl border border-zinc-200/80 hover:border-zinc-300 px-4 h-[56px] focus-within:border-brand-red/30 focus-within:bg-white focus-within:ring-4 focus-within:ring-brand-red/[0.06] transition-all duration-200">
                  <Lock className="size-[18px] shrink-0 text-zinc-400 group-focus-within:text-brand-red transition-colors" />
                  <div className="flex-1 relative">
                    <input
                      id="senha"
                      type={showPassword ? "text" : "password"}
                      value={formData.senha}
                      onChange={handleChange}
                      disabled={isLoading}
                      placeholder=" "
                      required
                      className="peer w-full bg-transparent pt-4 pb-0 text-sm text-zinc-800 outline-none placeholder-transparent disabled:opacity-50"
                    />
                    <label className="absolute left-0 top-1/2 -translate-y-1/2 text-[13px] text-zinc-500 pointer-events-none transition-all duration-200 peer-focus:top-1.5 peer-focus:translate-y-0 peer-focus:text-[10px] peer-focus:font-semibold peer-focus:text-brand-red peer-[:not(:placeholder-shown)]:top-1.5 peer-[:not(:placeholder-shown)]:translate-y-0 peer-[:not(:placeholder-shown)]:text-[10px] peer-[:not(:placeholder-shown)]:font-semibold peer-[:not(:placeholder-shown)]:text-zinc-500">
                      Senha
                    </label>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isLoading}
                    className="shrink-0 p-1.5 rounded-lg transition-all focus:outline-none hover:bg-zinc-100 text-zinc-400 hover:text-zinc-600"
                  >
                    {showPassword ? <EyeOff className="size-[16px]" /> : <Eye className="size-[16px]" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-[52px] bg-brand-red hover:bg-brand-red-hover text-white text-[15px] font-bold rounded-2xl shadow-lg mt-4"
              >
                {isLoading ? <Loader2 className="size-5 animate-spin" /> : "Finalizar Cadastro"}
              </Button>
            </form>

            <div className="mt-8 text-center">
              <p className="text-[14px] text-zinc-500">
                Já possui uma conta?{" "}
                <Link href="/" className="font-bold text-brand-red hover:underline">
                  Faça login
                </Link>
              </p>
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}
