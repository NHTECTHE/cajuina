"use client";
import React, { useState, useEffect } from 'react';
import { ShieldCheck, Users, FileText } from 'lucide-react';
import ScrollReveal from '@/components/ui/ScrollReveal';

const stats = [
  { id: 1, name: 'Anos de Mercado', value: '15+', icon: ShieldCheck },
  { id: 2, name: 'Clientes Ativos', value: '5.000+', icon: Users },
  { id: 3, name: 'Emissões Realizadas', value: '200.000+', icon: FileText },
];

export default function About() {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % 4);
    }, 3000); // Change focus every 3 seconds
    return () => clearInterval(interval);
  }, []);

  const getPhotoClasses = (index: number, baseZIndex: string) => {
    const isActive = activeIndex === index;
    return `transition-all duration-700 ease-in-out ${baseZIndex} ${
      isActive 
        ? "opacity-100 brightness-110 lg:drop-shadow-[0_0_15px_rgba(255,255,255,0.4)]" 
        : "opacity-100 lg:opacity-40 brightness-100 lg:brightness-75 grayscale-0 lg:grayscale-[50%]"
    }`;
  };

  return (
    <section id="quem-somos" className="relative pt-16 pb-0 sm:pt-24 sm:pb-32 bg-white lg:bg-transparent lg:bg-gradient-to-b lg:from-[#f8f9fa] lg:to-white overflow-hidden">
      {/* Subtle background pattern/gradient */}
      <div className="absolute inset-0 -z-10 hidden lg:block bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-orange-50/50 via-transparent to-transparent opacity-70 overflow-hidden"></div>
      
      <div className="mx-auto max-w-7xl px-6 lg:px-8 relative z-10">
        
        {/* STATS BLOCK MOVED TO TOP */}
        <div className="mx-auto mb-16 max-w-2xl sm:mb-20 lg:mb-24 lg:max-w-none relative z-30">
          <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-12 lg:max-w-none lg:grid-cols-3">
            {stats.map((stat) => (
              <div 
                key={stat.name} 
                className="group relative flex flex-col bg-brand-red lg:bg-white p-6 rounded-2xl shadow-md lg:shadow-sm border border-brand-red lg:border-zinc-100 hover:shadow-xl hover:border-brand-red/20 transition-all duration-300 hover:-translate-y-1"
              >
                <dt className="text-sm font-medium leading-6 text-white/90 lg:text-zinc-600 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 lg:bg-zinc-50 lg:group-hover:bg-brand-red/10 transition-colors duration-300">
                    <stat.icon className="h-5 w-5 text-white lg:text-zinc-900 lg:group-hover:text-brand-red transition-colors duration-300" aria-hidden="true" />
                  </div>
                  {stat.name}
                </dt>
                <dd className="mt-4 flex flex-auto flex-col text-base leading-7">
                  <p className="flex-auto text-4xl font-bold tracking-tight text-white lg:text-zinc-900 lg:group-hover:text-brand-red transition-colors duration-300">
                    {stat.value}
                  </p>
                </dd>
                
                {/* Decorative glowing dot */}
                <div className="absolute top-6 right-6 w-2 h-2 rounded-full bg-white/40 lg:bg-brand-red/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 shadow-[0_0_8px_rgba(255,255,255,0.6)] lg:shadow-[0_0_8px_rgba(239,68,68,0.6)]"></div>
              </div>
            ))}
          </dl>
        </div>

        {/* NEW LAYOUT: Images on left, Text on right */}
        <div className="relative flex flex-col lg:flex-row items-stretch lg:items-center justify-end w-full max-w-7xl mx-auto mt-8 lg:mt-24 mb-12">
          
          {/* DESKTOP IMAGES (Original 4 photos) */}
          <ScrollReveal direction="up" duration={1000} once={true} className="hidden lg:flex relative w-[85%] sm:w-[70%] aspect-square mx-auto lg:mx-0 lg:w-[45%] lg:min-h-[600px] lg:aspect-auto items-end justify-center z-20 lg:absolute lg:left-0 lg:top-1/2 lg:-translate-y-[40%] mt-8 lg:mt-0">
            {/* Background Block */}
            <div className="absolute inset-0 lg:top-[-20%] lg:bottom-[0%] lg:left-[10%] lg:right-[10%] bg-[#f42626] z-0 rounded-3xl lg:rounded-sm shadow-2xl"></div>
            
            {/* The 4 Photos without background */}
            <div className="absolute inset-0 z-10 w-full h-full rounded-3xl lg:rounded-none overflow-visible">
              {/* Back Center (Top) - 4foto */}
              <img src="/foto4.png" alt="Equipe 4" className={`absolute top-[-25%] lg:top-[-42%] left-[25%] lg:left-[18.5%] w-[50%] lg:w-[63%] h-auto object-contain drop-shadow-xl [mask-image:linear-gradient(to_bottom,black_40%,transparent_90%)] lg:[mask-image:linear-gradient(to_bottom,black_40%,transparent_90%)] ${getPhotoClasses(0, 'z-10')}`} />
              {/* Middle Left - foto 3 */}
              <img src="/foto3.png" alt="Equipe 3" className={`absolute bottom-[0%] left-[-5%] lg:left-[-6%] w-[55%] lg:w-[68%] h-auto object-contain drop-shadow-xl scale-x-[-1] ${getPhotoClasses(1, 'z-20')}`} />
              {/* Middle Right - foto 1 */}
              <img src="/foto1.png" alt="Equipe 1" className={`absolute bottom-[0%] right-[-5%] lg:right-[-6%] w-[55%] lg:w-[68%] h-auto object-contain drop-shadow-xl ${getPhotoClasses(2, 'z-20')}`} />
              {/* Front Center (Bottom) - foto 2 */}
              <div className="absolute inset-0 overflow-hidden z-30 pointer-events-none rounded-3xl lg:rounded-none">
                <img src="/foto2.png" alt="Equipe 2" className={`absolute bottom-[0%] lg:bottom-[-12%] left-[25%] lg:left-[18%] w-[50%] lg:w-[66%] h-auto object-contain drop-shadow-2xl ${getPhotoClasses(3, 'z-30')}`} />
              </div>
            </div>
          </ScrollReveal>

          {/* TEXT BLOCK WITH MOBILE IMAGE INSIDE */}
          <div className="-mx-6 lg:mx-0 lg:w-[75%] lg:ml-auto bg-[#fdcf3c] pt-12 pb-12 sm:py-20 lg:py-40 px-6 sm:px-14 lg:pl-[25%] lg:pr-20 rounded-none lg:rounded-[2rem] lg:rounded-r-[3rem] lg:rounded-l-none flex flex-col justify-center shadow-none lg:shadow-xl z-0 mt-0 lg:mt-0 transition-all">
            <ScrollReveal direction="up" duration={1000} delay={200} once={true}>
              <h2 className="text-4xl sm:text-5xl lg:text-7xl font-extrabold text-[#f42626] mb-6 tracking-tight drop-shadow-sm text-center lg:text-left">
                Quem somos
              </h2>
              <p className="text-[#f42626] text-lg sm:text-xl lg:text-2xl leading-relaxed font-bold text-center lg:text-left">
                Somos uma Corretora de Seguros dedicada a viabilizar os seus negócios. Desempenhamos um trabalho de excelência e expertise no segmento, entregando as melhores soluções com segurança e agilidade.
              </p>
            </ScrollReveal>

            {/* MOBILE IMAGE (cajuina.png) - INSIDE YELLOW BLOCK */}
            <ScrollReveal direction="up" duration={1000} once={true} className="flex lg:hidden relative w-full aspect-[2/1] mt-8 z-20">
              <div className="absolute inset-0 z-10 w-full h-full">
                <img src="/cajuina.png" alt="Equipe Cajuína" className="w-full h-full object-cover object-[center_45%] rounded-[1.5rem] shadow-xl border-4 border-white/20" />
              </div>
            </ScrollReveal>
          </div>
          
        </div>
        
      </div>
    </section>
  );
}
