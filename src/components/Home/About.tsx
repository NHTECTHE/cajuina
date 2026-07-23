"use client";
import React from 'react';
import { ShieldCheck, Users, FileText, ArrowRight } from 'lucide-react';
import ScrollReveal from '@/components/ui/ScrollReveal';

const stats = [
  { id: 1, name: 'Anos de Mercado', value: '15+', icon: ShieldCheck },
  { id: 2, name: 'Clientes Ativos', value: '5.000+', icon: Users },
  { id: 3, name: 'Emissões Realizadas', value: '200.000+', icon: FileText },
];

export default function About() {
  return (
    <section id="quem-somos" className="relative pt-16 pb-16 sm:pt-24 sm:pb-32 bg-[#fcfbfa] overflow-hidden">
      {/* Decorative curved lines (subtle background details) */}
      <div className="absolute top-0 right-0 -z-10 opacity-30 pointer-events-none hidden lg:block">
        <svg width="500" height="500" viewBox="0 0 500 500" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M500 0C500 276.14 276.14 500 0 500" stroke="#8b0a0a" strokeWidth="1" />
        </svg>
      </div>
      <div className="absolute bottom-0 left-0 -z-10 opacity-30 pointer-events-none hidden lg:block">
        <svg width="400" height="400" viewBox="0 0 400 400" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M0 400C0 179.086 179.086 0 400 0" stroke="#8b0a0a" strokeWidth="1" />
        </svg>
      </div>

      <div className="mx-auto max-w-7xl px-6 lg:px-8 relative z-10">

        {/* STATS BLOCK */}
        <div className="mx-auto mb-20 max-w-2xl lg:max-w-none relative z-30">
          <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-12 lg:max-w-none lg:grid-cols-3">
            {stats.map((stat) => (
              <div
                key={stat.name}
                className="group relative flex flex-col bg-white p-6 rounded-2xl shadow-sm border border-zinc-100 hover:shadow-xl hover:border-red-900/10 transition-all duration-300 hover:-translate-y-1"
              >
                <dt className="text-sm font-medium leading-6 text-zinc-600 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-50 group-hover:bg-[#8b0000]/10 transition-colors duration-300">
                    <stat.icon className="h-5 w-5 text-zinc-900 group-hover:text-[#8b0000] transition-colors duration-300" aria-hidden="true" />
                  </div>
                  {stat.name}
                </dt>
                <dd className="mt-4 flex flex-auto flex-col text-base leading-7">
                  <p className="flex-auto text-4xl font-bold tracking-tight text-zinc-900 group-hover:text-[#8b0000] transition-colors duration-300">
                    {stat.value}
                  </p>
                </dd>
              </div>
            ))}
          </dl>
        </div>

        {/* NEW LAYOUT (Matched to design image) */}
        <div className="relative flex flex-col lg:flex-row items-center justify-between w-full max-w-7xl mx-auto gap-16 lg:gap-8 mt-12">

          {/* LEFT SIDE: IMAGES & SHAPES */}
          <ScrollReveal direction="right" duration={1000} once={true} className="relative w-full lg:w-[45%] flex flex-col items-center lg:items-start pt-12">
            <div className="relative w-full max-w-[500px] mx-auto lg:ml-0 lg:mr-auto">
              {/* Yellow Shape */}
              <div className="absolute -left-6 lg:-left-16 top-16 bottom-0 w-[60%] lg:w-[70%] bg-[#dcb10d] rounded-[2rem] lg:rounded-[3rem] lg:rounded-bl-none z-0"></div>

              {/* Dark Red Shape */}
              <div className="absolute left-4 lg:left-0 right-[-1rem] lg:right-[-2rem] bottom-0 h-[100%] bg-[#8b0000] rounded-[3rem] lg:rounded-[4rem] lg:rounded-r-[6rem] z-10"></div>

              {/* Image Clipper Wrapper (Only for fotoW bottom curve) */}
              <div className="absolute left-4 lg:left-0 right-[-1rem] lg:right-[-2rem] bottom-0 top-[-20%] z-20 rounded-b-[3rem] lg:rounded-bl-[4rem] lg:rounded-br-[6rem] overflow-hidden pointer-events-none">
                {/* Inner container to restore original parent coordinate system */}
                <div className="absolute bottom-0 -left-4 lg:left-0 right-4 lg:right-8 h-[450px] sm:h-[550px] lg:h-[650px] pointer-events-auto">
                  {/* Right Image (fotoW) - CLIPPED BOTTOM PART */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/fotoW.webp" alt="W" className="absolute bottom-[-1rem] lg:bottom-[-3rem] right-[-10%] lg:right-[-28%] w-[95%] lg:w-[110%] h-auto object-contain z-20 drop-shadow-xl" />
                </div>
              </div>

              {/* Container for unclipped images and layout height */}
              <div className="relative z-30 flex items-end justify-center h-[450px] sm:h-[550px] lg:h-[650px] w-full pointer-events-auto">
                {/* Right Image (fotoW) - UNCLIPPED TOP PART (Allows arms to pop out) */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/fotoW.webp" alt="W" className="absolute bottom-[-1rem] lg:bottom-[-3rem] right-[-10%] lg:right-[-28%] w-[95%] lg:w-[120%] h-auto object-contain z-20 drop-shadow-xl [clip-path:inset(0_0_15%_0)]" />

                {/* Left Image (foto4) - Front */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/foto4.webp" alt="N" className="absolute bottom-0 left-[-20%] lg:left-[-14%] w-[85%] lg:w-[93%] h-auto object-contain z-30 drop-shadow-2xl" />
              </div>
            </div>


          </ScrollReveal>

          {/* RIGHT SIDE: TEXT BLOCK */}
          <ScrollReveal direction="left" duration={1000} delay={200} once={true} className="w-full lg:w-[50%] flex flex-col justify-center">
            {/* Eyebrow */}
            <div className="mb-6 flex flex-col items-center lg:items-start">
              <h3 className="text-xs font-bold tracking-[0.2em] text-[#8b0000] uppercase mb-3">Quem Somos</h3>
              <div className="h-[1px] w-12 bg-[#8b0000]"></div>
            </div>

            {/* Main heading */}
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-zinc-900 leading-[1.1] mb-8 text-center lg:text-left">
              Segurança que<br className="hidden sm:block" />
              nasce da experiência<span className="text-[#8b0000]">.</span>
            </h2>

            {/* Paragraph */}
            <p className="text-lg sm:text-xl text-zinc-600 mb-10 max-w-xl leading-relaxed text-center lg:text-left mx-auto lg:mx-0">
              Há mais de 20 anos, a Cajuína Seguros une conhecimento, agilidade e proximidade para encontrar a proteção ideal para cada negócio.
            </p>

            {/* Highlighted text */}
            <div className="flex items-center gap-5 mb-12 justify-center lg:justify-start">
              <div className="w-1 h-12 bg-[#dcb10d]"></div>
              <p className="text-lg sm:text-xl text-zinc-700 font-medium">Especialistas em Seguro Garantia.</p>
            </div>

            {/* Button */}
            <div className="flex justify-center lg:justify-start">
              <a href="#cadastro" className="bg-[#e53e3e] hover:bg-[#8b0000] transition-all duration-300 text-white font-bold py-4 px-8 rounded-xl flex items-center gap-4 group shadow-lg shadow-[#8b0000]/20 hover:shadow-xl hover:-translate-y-1">
                FAÇA SEU CADASTRO
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" strokeWidth={1.5} />
              </a>
            </div>
          </ScrollReveal>

        </div>

      </div>
    </section>
  );
}
