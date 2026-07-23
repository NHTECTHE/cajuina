"use client";

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Building2, User, Mail, Phone, Lock, CheckCircle2, Loader2 } from 'lucide-react';
import ScrollReveal from '@/components/ui/ScrollReveal';
import { toast, Toaster } from 'sonner';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

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

export default function Signup() {
  const [isVisible, setIsVisible] = useState(false);
  const timelineRef = useRef<HTMLDivElement>(null);

  const [formData, setFormData] = useState({
    cnpj: "",
    nome: "",
    email: "",
    telefone: "",
    senha: "",
    repetirSenha: "",
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    let newValue = value;

    if (id === "cnpj") newValue = maskCNPJ(value);
    if (id === "telefone") newValue = maskPhone(value);

    setFormData(prev => ({ ...prev, [id]: newValue }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.cnpj || !formData.nome || !formData.email || !formData.telefone || !formData.senha || !formData.repetirSenha) {
      toast.error("Por favor, preencha todos os campos obrigatórios.");
      return;
    }

    if (formData.senha !== formData.repetirSenha) {
      toast.error("As senhas não coincidem.");
      return;
    }

    setIsLoading(true);

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
      setIsLoading(false);

      if (!res.ok) {
        let erroMsg = "Erro ao realizar cadastro.";
        if (data.email) erroMsg = data.email[0];
        else if (data.cnpj) erroMsg = data.cnpj[0];
        else if (data.password) erroMsg = data.password[0];
        else if (data.detail) erroMsg = data.detail;
        else if (data.non_field_errors) erroMsg = data.non_field_errors[0];
        
        toast.error(erroMsg);
      } else {
        setIsSuccess(true);
      }
    } catch (err) {
      console.error("ERRO:", err);
      setIsLoading(false);
      toast.error("Ocorreu um erro inesperado ao conectar.");
    }
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      { threshold: 0, rootMargin: '-10% 0px' }
    );
    if (timelineRef.current) observer.observe(timelineRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section id="cadastro" className="w-full bg-white relative flex flex-col overflow-hidden">
      <Toaster position="top-right" closeButton richColors />
      
      {/* Top Section: Steps and Form */}
      <div className="w-full max-w-6xl mx-auto px-6 lg:px-8 pt-24 pb-32 lg:pt-40 lg:pb-64 flex flex-col-reverse lg:flex-row gap-12 lg:gap-16 xl:gap-24 relative z-10 items-center lg:items-start justify-center">
        
        {/* LEFT COLUMN: Registration Form */}
        <div className="w-full lg:w-1/2 flex justify-center lg:justify-start items-center">
          <ScrollReveal direction="right" delay={300} className="w-full max-w-md">
            <div className="bg-white rounded-[2rem] shadow-2xl ring-1 ring-slate-100 p-8 sm:p-12 w-full">
              {!isSuccess ? (
                <form className="space-y-6" onSubmit={handleSubmit}>
                  
                  {/* CNPJ */}
                  <div className="relative border-b border-slate-300 pb-2">
                    <div className="absolute inset-y-0 left-0 flex items-center pointer-events-none text-slate-400">
                      <Building2 size={20} />
                    </div>
                    <input 
                      type="text" 
                      id="cnpj"
                      value={formData.cnpj}
                      onChange={handleChange}
                      placeholder="CNPJ" 
                      required
                      className="w-full pl-8 outline-none text-slate-700 bg-transparent placeholder-slate-400"
                    />
                  </div>

                  {/* Nome */}
                  <div className="relative border-b border-slate-300 pb-2 pt-2">
                    <div className="absolute inset-y-0 left-0 flex items-center pointer-events-none text-slate-400">
                      <User size={20} />
                    </div>
                    <input 
                      type="text" 
                      id="nome"
                      value={formData.nome}
                      onChange={handleChange}
                      placeholder="Nome para Contato" 
                      required
                      className="w-full pl-8 outline-none text-slate-700 bg-transparent placeholder-slate-400"
                    />
                  </div>

                  {/* Email */}
                  <div className="relative border-b border-slate-300 pb-2 pt-2">
                    <div className="absolute inset-y-0 left-0 flex items-center pointer-events-none text-slate-400">
                      <Mail size={20} />
                    </div>
                    <input 
                      type="email" 
                      id="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="Email" 
                      required
                      className="w-full pl-8 outline-none text-slate-700 bg-transparent placeholder-slate-400"
                    />
                  </div>

                  {/* Telefone */}
                  <div className="relative border-b border-slate-300 pb-2 pt-2">
                    <div className="absolute inset-y-0 left-0 flex items-center pointer-events-none text-slate-400">
                      <Phone size={20} />
                    </div>
                    <input 
                      type="tel" 
                      id="telefone"
                      value={formData.telefone}
                      onChange={handleChange}
                      placeholder="Telefone" 
                      required
                      className="w-full pl-8 outline-none text-slate-700 bg-transparent placeholder-slate-400"
                    />
                  </div>

                  {/* Senha */}
                  <div className="relative border-b border-slate-300 pb-2 pt-2">
                    <div className="absolute inset-y-0 left-0 flex items-center pointer-events-none text-slate-400">
                      <Lock size={20} />
                    </div>
                    <input 
                      type="password" 
                      id="senha"
                      value={formData.senha}
                      onChange={handleChange}
                      placeholder="Senha" 
                      required
                      className="w-full pl-8 outline-none text-slate-700 bg-transparent placeholder-slate-400"
                    />
                  </div>

                  {/* Repetir Senha */}
                  <div className="relative border-b border-slate-300 pb-2 pt-2">
                    <div className="absolute inset-y-0 left-0 flex items-center pointer-events-none text-slate-400">
                      <Lock size={20} />
                    </div>
                    <input 
                      type="password" 
                      id="repetirSenha"
                      value={formData.repetirSenha}
                      onChange={handleChange}
                      placeholder="Repetir Senha" 
                      required
                      className="w-full pl-8 outline-none text-slate-700 bg-transparent placeholder-slate-400"
                    />
                  </div>

                  <div className="pt-6">
                    <button 
                      type="submit" 
                      disabled={isLoading}
                      className="w-full flex items-center justify-center bg-[#f04f42] hover:bg-[#d84639] text-white font-bold py-4 rounded-xl transition-colors shadow-md disabled:opacity-50"
                    >
                      {isLoading ? <Loader2 className="size-5 animate-spin" /> : "CADASTRAR"}
                    </button>
                  </div>
                  
                </form>
              ) : (
                <div className="flex flex-col items-center text-center py-8">
                  <CheckCircle2 className="size-16 text-green-500 mb-4" />
                  <h3 className="text-xl font-bold text-slate-900 mb-2">Cadastro Realizado!</h3>
                  <p className="text-slate-500 text-sm leading-relaxed mb-6">
                    Sua conta foi criada com sucesso, mas encontra-se inativa. 
                    <br/><br/>
                    Enviamos um e-mail para <strong>{formData.email}</strong> com as instruções.
                  </p>
                  <Link href="/login" className="w-full">
                    <button 
                      className="w-full bg-[#f04f42] hover:bg-[#d84639] text-white font-bold py-3 rounded-xl transition-colors shadow-md text-sm"
                    >
                      Voltar para o Login
                    </button>
                  </Link>
                </div>
              )}
            </div>
          </ScrollReveal>
        </div>

        {/* RIGHT COLUMN: Steps */}
        <div 
          ref={timelineRef}
          className="w-full lg:w-1/2 flex flex-col justify-center items-center lg:items-start z-20 lg:pl-16 lg:mt-12"
        >
          <div key={isVisible ? 'visible' : 'hidden'} className="relative pl-10 w-full max-w-sm">
            <ScrollReveal direction="down" className="mb-10">
              <h2 className="text-3xl lg:text-4xl font-bold text-[#1e293b]">
                Faça seu cadastro!
              </h2>
            </ScrollReveal>
            
            <style>
              {`
                @keyframes walkLine {
                  0% { height: 0px; }
                  100% { height: calc(100% - 88px); }
                }
                @keyframes popCard {
                  0% { transform: scale(0.80); }
                  100% { transform: scale(1); }
                }
                @keyframes activateDot {
                  100% { border-color: black; background-color: black; }
                }
                
                .animate-walk-line {
                  animation: walkLine 2.5s linear forwards;
                  animation-delay: 0.5s;
                }
                
                /* Passo 1: Atingido aos ~1.1s */
                .animate-dot-1 {
                  animation: activateDot 0.2s forwards;
                  animation-delay: 1.1s;
                }
                .animate-card-1 {
                  transform: scale(0.80);
                  transform-origin: left center;
                  animation: popCard 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
                  animation-delay: 1.1s;
                }

                /* Passo 2: Atingido aos ~2.0s */
                .animate-dot-2 {
                  animation: activateDot 0.2s forwards;
                  animation-delay: 2.0s;
                }
                .animate-card-2 {
                  transform: scale(0.80);
                  transform-origin: left center;
                  animation: popCard 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
                  animation-delay: 2.0s;
                }

                /* Passo 3: Atingido aos ~2.9s */
                .animate-dot-3 {
                  animation: activateDot 0.2s forwards;
                  animation-delay: 2.9s;
                }
                .animate-card-3 {
                  transform: scale(0.80);
                  transform-origin: left center;
                  animation: popCard 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
                  animation-delay: 2.9s;
                }
              `}
            </style>

            {/* Vertical lines */}
            <div className="absolute left-[11px] top-10 bottom-12 w-[2px] bg-slate-100"></div>
            <div className={`absolute left-[11px] top-10 w-[2px] bg-black ${isVisible ? 'animate-walk-line' : ''}`} style={{ height: '0px' }}></div>

            <div className="flex flex-col gap-5 w-full">
              
              {/* Step 1 */}
              <div className="relative w-full">
                {/* Hollow Gray Dot that turns black */}
                <div className={`absolute -left-[33px] top-6 w-3 h-3 bg-white border-2 border-slate-200 rounded-full ring-[6px] ring-white transition-colors ${isVisible ? 'animate-dot-1' : ''}`}></div>
                {/* Card */}
                <div className={`bg-white rounded-[20px] p-5 shadow-[0_2px_20px_rgba(0,0,0,0.04)] border border-slate-100 relative z-10 ${isVisible ? 'animate-card-1' : 'scale-[0.80] origin-left'}`}>
                  <div className="flex justify-between items-center mb-2 gap-2">
                    <h3 className="text-[16px] sm:text-[18px] font-bold text-slate-900">Vamos começar</h3>
                  </div>
                  <p className="text-slate-500 text-[14px] sm:text-[15px] leading-relaxed">
                    Informe alguns dados para calcularmos o melhor preço para sua garantia.
                  </p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="relative w-full">
                {/* Hollow Gray Dot that turns black */}
                <div className={`absolute -left-[33px] top-6 w-3 h-3 bg-white border-2 border-slate-200 rounded-full ring-[6px] ring-white transition-colors ${isVisible ? 'animate-dot-2' : ''}`}></div>
                <div className={`bg-white rounded-[20px] p-5 shadow-[0_2px_20px_rgba(0,0,0,0.04)] border border-slate-100 relative z-10 ${isVisible ? 'animate-card-2' : 'scale-[0.80] origin-left'}`}>
                  <div className="flex justify-between items-center mb-2 gap-2">
                    <h3 className="text-[16px] sm:text-[18px] font-bold text-slate-900">Simule em minutos</h3>
                  </div>
                  <p className="text-slate-500 text-[14px] sm:text-[15px] leading-relaxed">
                    Em poucos passos você recebe sua cotação, online e sem custo.
                  </p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="relative w-full">
                {/* Hollow Gray Dot that turns black */}
                <div className={`absolute -left-[33px] top-6 w-3 h-3 bg-white border-2 border-slate-200 rounded-full ring-[6px] ring-white transition-colors ${isVisible ? 'animate-dot-3' : ''}`}></div>
                <div className={`bg-white rounded-[20px] p-5 shadow-[0_2px_20px_rgba(0,0,0,0.04)] border border-slate-100 relative z-10 ${isVisible ? 'animate-card-3' : 'scale-[0.80] origin-left'}`}>
                  <div className="flex justify-between items-center mb-2 gap-2">
                    <h3 className="text-[16px] sm:text-[18px] font-bold text-slate-900">Pronto!</h3>
                  </div>
                  <p className="text-slate-500 text-[14px] sm:text-[15px] leading-relaxed">
                    Contrate online e receba imediatamente sua garantia.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>


    </section>
  );
}
