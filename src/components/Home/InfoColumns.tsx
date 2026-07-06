import React from 'react';
import { ShieldCheck, Users, Handshake } from 'lucide-react';

const columns = [
  {
    title: "Quem utiliza?",
    text: "Empresas de todos os portes que precisam apresentar garantias para participar de licitações, firmar contratos, executar obras, prestar serviços ou fornecer produtos. Também pode ser utilizado para garantir obrigações em processos judiciais, trazendo mais segurança para todas as partes envolvidas.",
    icon: <Users className="w-12 h-12 md:w-14 md:h-14" strokeWidth={1.5} />,
    bg: "bg-white",
    textCol: "text-brand-red",
    titleCol: "text-brand-red",
  },
  {
    title: "O que é seguro garantia?",
    text: "É uma solução que garante o cumprimento das obrigações previstas em contratos e licitações. Com ele, empresas e órgãos contratantes têm mais segurança, transparência e proteção financeira, assegurando que os compromissos assumidos serão cumpridos conforme acordado.",
    icon: <ShieldCheck className="w-12 h-12 md:w-14 md:h-14" strokeWidth={1.5} />,
    bg: "bg-brand-red",
    textCol: "text-white/90",
    titleCol: "text-white",
  },
  {
    title: "Quando e onde pode ser utilizado?",
    text: "Quando a instituição pública ou privada solicita uma garantia para empresas que pretendem construir, prestar serviços, fabricar, fornecer bens e materiais. Também pode ser utilizado para garantir ações judiciais trabalhistas frente ao poder judiciário.",
    icon: <Handshake className="w-12 h-12 md:w-14 md:h-14" strokeWidth={1.5} />,
    bg: "bg-[#ffb800]",
    textCol: "text-zinc-900/90",
    titleCol: "text-zinc-900",
  }
];

export default function InfoColumns() {
  return (
    <section className="w-full bg-[#f8f9fa] pt-4 pb-20">
      <div className="w-full max-w-[95%] xl:max-w-[1500px] 2xl:max-w-[1700px] mx-auto px-4 lg:px-8">
        <div className="flex flex-col lg:flex-row overflow-hidden rounded-[2rem] lg:rounded-[3rem] border border-zinc-100 shadow-xl shadow-zinc-200/50">
          {columns.map((col, idx) => (
            <div 
              key={idx}
              className={`flex-1 flex flex-col items-center justify-center p-8 lg:p-12 text-center
                ${col.bg} 
                ${idx > 0 ? "lg:-ml-8 lg:rounded-l-[3rem] lg:shadow-[-20px_0_30px_rgba(0,0,0,0.1)] relative" : "relative"}
              `}
              style={{ zIndex: 10 + idx }}
            >
              <div className={`mb-6 ${col.titleCol} flex items-center justify-center`}>
                {col.icon}
              </div>
              <h2 className={`text-2xl lg:text-3xl font-extrabold mb-4 ${col.titleCol}`}>
                {col.title}
              </h2>
              <p className={`text-sm md:text-base font-medium leading-relaxed max-w-sm ${col.textCol}`}>
                {col.text}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
