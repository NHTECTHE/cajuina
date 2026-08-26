"use client"

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import "./not-found.css"; // kept empty to clear out old styles

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center relative overflow-hidden font-sans text-zinc-200">
      
      {/* Red Spotlight Background */}
      <div className="absolute top-[-30%] left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-[#e53e3e] rounded-full blur-[150px] opacity-25 pointer-events-none" />

      {/* 404 Content */}
      <div className="relative z-10 text-center flex flex-col items-center">
        {/* 3D 404 Text */}
        <h1 
          className="text-[160px] md:text-[220px] font-black text-[#e53e3e] leading-none tracking-tighter mb-4"
          style={{
            textShadow: '0 5px 0 #991b1b, 0 10px 0 #7f1d1d, 0 15px 0 #450a0a, 0 25px 25px rgba(0,0,0,0.9)'
          }}
        >
          404
        </h1>

        {/* Heading */}
        <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">
          Página Não Encontrada
        </h2>
        
        {/* Subtext */}
        <div className="max-w-xl text-center flex flex-col items-center gap-2 mb-10">
            <p className="text-lg font-medium text-zinc-300">
              Ops! Você saiu do mapa
            </p>
            <p className="text-sm md:text-base text-zinc-500 max-w-[90%] md:max-w-md leading-relaxed">
              A página que você está procurando tirou férias permanentes ou nunca existiu. 
              Não se preocupe, até os melhores exploradores se perdem de vez em quando.
            </p>
        </div>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Link 
            href="/dashboard"
            className="flex items-center justify-center px-8 py-3.5 rounded-lg bg-[#220a0a] hover:bg-[#e53e3e] text-[#e53e3e] hover:text-white font-semibold transition-all border border-[#e53e3e]/30 shadow-[0_0_20px_rgba(229,62,62,0.15)] hover:shadow-[0_0_30px_rgba(229,62,62,0.4)]"
          >
            Voltar ao Início
          </Link>
          
          <a 
            href="mailto:suporte@cajuina.com.br"
            className="flex items-center justify-center gap-2 px-8 py-3.5 rounded-lg bg-[#111] hover:bg-[#1a1a1a] text-zinc-300 font-semibold transition-colors border border-zinc-800 hover:border-zinc-700"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
            <span>Email Suporte</span>
          </a>
        </div>
      </div>
    </div>
  );
}
