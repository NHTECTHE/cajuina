"use client"

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import "./not-found.css"; // kept empty to clear out old styles

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#faf8f5] dark:bg-[#0b0e17] flex items-center justify-center p-4 overflow-hidden relative font-sans selection:bg-[#e53e3e]/20">
      
      <div className="relative w-full max-w-4xl flex flex-col items-center justify-center mt-[-5vh]">
        
        {/* The huge 404 Text in the background */}
        <div className="relative z-0 flex items-center justify-center text-[180px] sm:text-[250px] md:text-[320px] font-black leading-none tracking-tighter select-none">
          {/* Sombra preta densa projetada para baixo, igual a imagem */}
          <span className="text-[#e53e3e] drop-shadow-[0_35px_35px_rgba(0,0,0,0.45)] relative z-10 translate-x-3 sm:translate-x-6">4</span>
          <span className="text-[#0f1424] dark:text-zinc-200 drop-shadow-[0_35px_35px_rgba(0,0,0,0.6)] relative z-20">0</span>
          <span className="text-[#e53e3e] drop-shadow-[0_35px_35px_rgba(0,0,0,0.45)] relative z-10 -translate-x-3 sm:-translate-x-6">4</span>
        </div>

        {/* The Glassmorphism Card */}
        {/* Adjusted negative margin to lower the card slightly as requested */}
        <div className="relative z-30 -mt-12 sm:-mt-18 md:-mt-20 w-[95%] sm:w-[85%] md:w-[650px] rounded-[32px] bg-white/30 dark:bg-[#0f1424]/30 backdrop-blur-xl border border-white/30 dark:border-zinc-800/30 shadow-[0_8px_32px_rgba(0,0,0,0.1)] flex flex-col items-center text-center p-8 sm:p-12 md:p-14">
          
          <h1 className="text-3xl md:text-4xl font-bold text-[#0f1424] dark:text-zinc-100 mb-4 drop-shadow-sm">
            Ops! Página não encontrada
          </h1>
          
          <p className="text-base md:text-lg text-[#0f1424]/70 dark:text-zinc-400 font-medium mb-10 max-w-md leading-relaxed">
            Parece que essa página sumiu ou foi movida. Não se preocupe, vamos te levar de volta com segurança.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
            {/* Primary Button */}
            <Link 
              href="/dashboard"
              className="flex items-center justify-center gap-2 bg-[#0f1424] hover:bg-[#1a233a] dark:bg-zinc-100 dark:hover:bg-zinc-200 dark:text-[#0b0e17] text-white px-8 py-4 rounded-full font-bold transition-all hover:-translate-y-1 hover:shadow-lg active:scale-95 active:translate-y-0"
            >
              <span>Voltar para o início</span>
              <ArrowRight size={18} />
            </Link>

            {/* Secondary Button */}
            <Link 
              href="/dashboard/cotacoes"
              className="flex items-center justify-center gap-2 bg-[#fef0f0] hover:bg-[#fce1e1] dark:bg-[#e53e3e]/10 dark:hover:bg-[#e53e3e]/20 text-[#e53e3e] px-8 py-4 rounded-full font-bold transition-all hover:-translate-y-1 hover:shadow-md active:scale-95 active:translate-y-0"
            >
              <span>Ver Cotações</span>
            </Link>
          </div>
        </div>

      </div>
      
      {/* Cajuína Subtle Logo at bottom */}
      <div className="absolute bottom-6 font-bold text-sm tracking-widest text-[#0f1424]/20 dark:text-zinc-500/30 uppercase">
        Cajuína Seguros
      </div>
    </div>
  );
}
