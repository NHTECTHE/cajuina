"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ArrowRight, ShieldCheck, Clock, FileCheck, Users, Handshake } from "lucide-react";
import { useRouter } from "next/navigation";

// CSS Mockup for iPhone
const PhoneMockup = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => (
  <div className={`relative mx-auto w-[240px] h-[500px] lg:w-[260px] lg:h-[540px] bg-[#333333] rounded-[2.5rem] p-[4px] shadow-2xl overflow-hidden ${className}`}>
    <div className="w-full h-full bg-black rounded-[2.3rem] overflow-hidden relative border-[2px] border-black">
      {/* Notch */}
      <div className="absolute top-0 inset-x-0 h-5 w-32 mx-auto bg-black rounded-b-2xl z-50"></div>
      {/* Inner Screen */}
      <div className="relative w-full h-full bg-[#9ca3af] overflow-hidden flex flex-col">
        {children}
      </div>
    </div>
  </div>
);

// Generic Image Screen for Phone
const ImageScreen = ({ src }: { src: string }) => (
  <div className="relative w-full h-full bg-white">
    <Image src={src} alt="App Screen" fill sizes="(max-width: 768px) 100vw, 33vw" className="object-cover object-top" />
  </div>
);

const slides = [
  {
    id: 1,
    title: "Seguro Garantia para",
    subtitle: "Licitação",
    highlight: "em minutos!",
    description: "As melhores cotações com o melhor custo-benefício para participar de licitações e garantir contratos com agilidade e segurança.",
    image: "/hero-login.webp",
    type: "image",
    accentColor: "bg-brand-red",
    textColor: "text-brand-red",
    baseText: "text-zinc-900",
    descText: "text-zinc-500",
    taglineBg: "bg-zinc-50",
    taglineBorder: "border-zinc-100",
    taglineText: "text-zinc-600",
    featureText: "text-zinc-700",
    featureIconBg: "bg-brand-red/10",
    featureIconText: "text-brand-red",
    btn1Bg: "bg-brand-red text-white hover:brightness-90",
    btn2Bg: "bg-transparent border-2 border-zinc-200 text-zinc-700 hover:bg-zinc-50 hover:border-zinc-300",
    features: [
      { icon: <Clock size={20} />, text: "Emissão Instantânea" },
      { icon: <ShieldCheck size={20} />, text: "100% Seguro" }
    ]
  },
  {
    id: 2,
    title: "Conheça o nosso",
    highlight: "Aplicativo!",
    description: "O 1º aplicativo do Brasil a emitir Seguro Garantia.\nBaixe agora e tenha todas as suas\napólices na palma da mão.",
    type: "phone",
    accentColor: "bg-white",
    textColor: "text-[#ffb800]",
    baseText: "text-zinc-900",
    descText: "text-zinc-500",
    taglineBg: "bg-zinc-50",
    taglineBorder: "border-zinc-100",
    taglineText: "text-zinc-600",
    featureText: "text-zinc-700",
    featureIconBg: "bg-brand-red/10",
    featureIconText: "text-brand-red",
    btn1Bg: "bg-brand-red text-white hover:brightness-90",
    btn2Bg: "bg-transparent border-2 border-zinc-200 text-zinc-700 hover:bg-zinc-50 hover:border-zinc-300",
    features: [
      { icon: <FileCheck size={20} />, text: "Gestão Simplificada" },
      { icon: <ShieldCheck size={20} />, text: "Acesso Rápido" }
    ]
  },
  {
    id: 3,
    title: "", // Not used in this type
    highlight: "",
    description: "",
    type: "columns",
    accentColor: "",
    textColor: "",
    features: [],
    columns: [
      {
        title: "Quem utiliza?",
        text: "Empresas de todos os portes que precisam apresentar garantias para participar de licitações, firmar contratos, executar obras, prestar serviços ou fornecer produtos. Também pode ser utilizado para garantir obrigações em processos judiciais, trazendo mais segurança para todas as partes envolvidas.",
        icon: <Users className="w-14 h-14 md:w-16 md:h-16" strokeWidth={1.5} />,
        bg: "bg-white",
        textCol: "text-brand-red",
        titleCol: "text-brand-red",
      },
      {
        title: "O que é seguro garantia?",
        text: "É uma solução que garante o cumprimento das obrigações previstas em contratos e licitações. Com ele, empresas e órgãos contratantes têm mais segurança, transparência e proteção financeira, assegurando que os compromissos assumidos serão cumpridos conforme acordado.",
        icon: <ShieldCheck className="w-14 h-14 md:w-16 md:h-16" strokeWidth={1.5} />,
        bg: "bg-brand-red",
        textCol: "text-white/90",
        titleCol: "text-white",
      },
      {
        title: "Quando e onde pode ser utilizado?",
        text: "Quando a instituição pública ou privada solicita uma garantia para empresas que pretendem construir, prestar serviços, fabricar, fornecer bens e materiais. Também pode ser utilizado para garantir ações judiciais trabalhistas frente ao poder judiciário.",
        icon: <Handshake className="w-14 h-14 md:w-16 md:h-16" strokeWidth={1.5} />,
        bg: "bg-[#ffb800]",
        textCol: "text-zinc-900/90",
        titleCol: "text-zinc-900",
      }
    ]
  }
];

export default function HeroBanner() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [activePhone, setActivePhone] = useState(1); // 0: left, 1: center, 2: right
  const router = useRouter();

  // Trigger entrance animations on mount
  useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), 50);
    return () => clearTimeout(timer);
  }, []);

  // Auto-slide every 7 seconds
  useEffect(() => {
    if (!isLoaded) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
    }, 7000);
    return () => clearInterval(timer);
  }, [currentSlide, isLoaded]);

  // Phone auto-highlight every 2 seconds on Slide 2
  useEffect(() => {
    if (currentSlide !== 1) {
      const timer = setTimeout(() => setActivePhone(1), 50);
      return () => clearTimeout(timer);
    }
    
    const initialTimer = setTimeout(() => setActivePhone(1), 50);
    
    const phoneTimer = setInterval(() => {
      setActivePhone((prev) => {
        if (prev === 1) return 0; // Center -> Left
        if (prev === 0) return 2; // Left -> Right
        return 1; // Right -> Center
      });
    }, 2000);
    
    return () => {
      clearTimeout(initialTimer);
      clearInterval(phoneTimer);
    };
  }, [currentSlide]);

  const handleDotClick = (index: number) => {
    if (isAnimating || index === currentSlide) return;
    setIsAnimating(true);
    setCurrentSlide(index);
    setTimeout(() => setIsAnimating(false), 800);
  };

  return (
    <div className="w-full relative">
      
      {/* MOBILE HERO (visible only on small screens) */}
      <div className="flex flex-col w-full min-h-[100dvh] pt-[100px] pb-12 bg-white relative overflow-hidden lg:hidden">
        
        {/* Abstract Background Decoration */}
        <div className="absolute top-0 right-0 w-[80vw] h-[80vw] rounded-full bg-brand-red/10 blur-[80px] pointer-events-none"></div>

        {/* Content Top */}
        <div className="flex flex-col px-6 z-20 relative">
          <h1 className="text-[3rem] leading-[1.1] font-extrabold text-zinc-900 mb-4 tracking-tight">
            Seu Seguro<br />Garantia <br /><span className="text-brand-red">em Minutos</span>
          </h1>
          <p className="text-zinc-500 text-[17px] mb-8 leading-relaxed max-w-[95%] font-medium">
            Compare cotações, emita sua apólice e garanta seus contratos com agilidade e total segurança.
          </p>
          
          {/* Normal Button CTA */}
          <Button 
            onClick={() => router.push('/login')}
            className="h-14 w-max px-10 rounded-full text-white bg-brand-red hover:bg-brand-red-hover text-[16px] font-bold shadow-xl transition-transform hover:scale-105 active:scale-95 mb-12"
          >
            Simular Agora
          </Button>
        </div>

        {/* Image Card Area */}
        <div className="w-full px-6 relative z-10 flex flex-col items-center">
          
          <div className="relative w-full aspect-[4/5] max-h-[500px] bg-zinc-100 rounded-[2rem] overflow-hidden shadow-xl border border-white/50">
            <Image 
              src="/hero-login.webp"
              alt="Cliente Cajuína"
              fill 
              sizes="100vw"
              className="object-cover object-center" 
              priority
            />
          </div>

          {/* Partner Logos Area - Scrolling Marquee */}
          <div className="w-full relative mt-8 flex overflow-hidden">
            {/* Left fade */}
            <div className="absolute left-0 top-0 bottom-0 w-16 z-10 bg-gradient-to-r from-white to-transparent pointer-events-none"></div>
            
            <div className="flex w-max animate-marquee items-center opacity-90">
              {[1, 2, 3, 4, 5, 6, 1, 2, 3, 4, 5, 6].map((num, i) => (
                <div key={i} className="relative w-56 h-24 -mx-4 flex-shrink-0">
                  <Image src={`/parc${num}.webp`} alt={`Parceiro ${num}`} fill sizes="224px" className="object-contain brightness-0" />
                </div>
              ))}
            </div>

            {/* Right fade */}
            <div className="absolute right-0 top-0 bottom-0 w-16 z-10 bg-gradient-to-l from-white to-transparent pointer-events-none"></div>
          </div>
          
        </div>
        
      </div>

      {/* DESKTOP HERO (visible only on large screens) */}
      <div className="hidden lg:flex relative w-full min-h-[100dvh] pt-[88px] pb-12 items-center bg-[#f8f9fa] overflow-hidden">
        
        {/* Background Abstract Shapes for Dribbble-like feel */}
        <div className="absolute top-0 right-0 w-[60vw] h-[100vh] bg-gradient-to-bl from-white to-transparent opacity-60 z-0 pointer-events-none"></div>
        <div className="absolute top-[40%] left-[-5%] w-[40vw] h-[40vw] rounded-full bg-brand-red/5 blur-[100px] z-0 pointer-events-none"></div>

        <div className="w-full max-w-[95%] xl:max-w-[1500px] 2xl:max-w-[1700px] relative mx-auto px-4 lg:px-8 z-10 h-full flex flex-col justify-center">
        
        {/* Main Dribbble Style Container */}
        <div className="w-full bg-white rounded-[2rem] lg:rounded-[3rem] shadow-2xl shadow-zinc-200/50 p-6 lg:p-12 xl:p-16 flex flex-col lg:flex-row items-center justify-between gap-10 lg:gap-24 xl:gap-32 min-h-[750px] relative overflow-hidden border border-zinc-100">
          
          {/* Background Image - Only visible on Slide 1 */}
          <div 
            className={`absolute inset-0 z-0 transition-all duration-[1500ms] ease-[cubic-bezier(0.25,1,0.5,1)] ${
              currentSlide === 0 && isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-24"
            }`}
            style={{ 
              maskImage: 'linear-gradient(to right, transparent 0%, transparent 45%, black 80%, black 100%)',
              WebkitMaskImage: 'linear-gradient(to right, transparent 0%, transparent 45%, black 80%, black 100%)'
            }}
          >
            <Image
              src="/hero-page.webp"
              alt="Hero Background"
              fill
              sizes="100vw"
              className="object-cover object-right translate-x-[15%] md:translate-x-[20%] lg:translate-x-[25%] scale-[1.05]"
              priority
            />
          </div>
          
          {/* Red Wavy Background - Only visible on Slide 2 */}
          <div className={`absolute inset-0 z-0 transition-opacity duration-1000 ${currentSlide === 1 ? "opacity-100" : "opacity-0"} pointer-events-none`}>
            <svg 
              className="absolute inset-0 w-full h-full text-brand-red drop-shadow-2xl" 
              preserveAspectRatio="none" 
              viewBox="0 0 100 100" 
              fill="currentColor"
            >
              <path d="M 45 0 C 38 35, 38 65, 45 100 L 100 100 L 100 0 Z" />
            </svg>
          </div>

          {/* LEFT: Text Content */}
          <div className="flex-1 w-full relative z-20 flex flex-col justify-center">
            {slides.map((slide, index) => slide.type !== "columns" && (
              <div 
                key={slide.id}
                className={`absolute inset-0 flex flex-col justify-center ${
                  index === currentSlide && isLoaded 
                    ? "pointer-events-auto relative z-20" 
                    : "pointer-events-none absolute z-0"
                }`}
              >
                {/* Tagline */}
                <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${slide.taglineBg} border ${slide.taglineBorder} text-sm font-semibold ${slide.taglineText} mb-6 w-max transition-all duration-700 ease-out ${index === currentSlide && isLoaded ? "opacity-100 translate-y-0 delay-[500ms]" : "opacity-0 translate-y-8"}`}>
                  <span className={`w-2 h-2 rounded-full ${slide.accentColor} animate-pulse`}></span>
                  Cajuína Corretora
                </div>
                
                {/* Title Line by Line */}
                <h1 className={`text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-extrabold ${slide.baseText} leading-[1.1] mb-6 tracking-tight`}>
                  <div className="overflow-hidden pb-2">
                    <span className={`block transition-all duration-[800ms] ease-out ${index === currentSlide && isLoaded ? "opacity-100 translate-y-0 delay-[650ms]" : "opacity-0 translate-y-full"}`}>
                      {slide.title}
                    </span>
                  </div>
                  <div className="overflow-hidden">
                    <span className={`block transition-all duration-[800ms] ease-out ${index === currentSlide && isLoaded ? "opacity-100 translate-y-0 delay-[800ms]" : "opacity-0 translate-y-full"}`}>
                      {slide.subtitle && <span className={`${slide.baseText} mr-2`}>{slide.subtitle}</span>}
                      <span className={slide.textColor}>{slide.highlight}</span>
                    </span>
                  </div>
                </h1>
                
                {/* Description */}
                <p className={`text-lg md:text-xl ${slide.descText} font-medium mb-10 leading-relaxed max-w-xl whitespace-pre-line transition-all duration-700 ease-out ${index === currentSlide && isLoaded ? "opacity-100 translate-y-0 delay-[950ms]" : "opacity-0 translate-y-8"}`}>
                  {slide.description}
                </p>

                {/* Features */}
                <div className={`flex flex-wrap items-center gap-6 mb-12 transition-all duration-700 ease-out ${index === currentSlide && isLoaded ? "opacity-100 translate-y-0 delay-[1100ms]" : "opacity-0 translate-y-8"}`}>
                  {slide.features.map((feature, i) => (
                    <div key={i} className={`flex items-center gap-2 ${slide.featureText} font-semibold`}>
                      <div className={`p-2 rounded-lg ${slide.featureIconBg} ${slide.featureIconText}`}>
                        {feature.icon}
                      </div>
                      {feature.text}
                    </div>
                  ))}
                </div>

                {/* Buttons */}
                <div className={`flex flex-wrap gap-4 transition-all duration-700 ease-out ${index === currentSlide && isLoaded ? "opacity-100 translate-y-0 delay-[1250ms]" : "opacity-0 translate-y-8"}`}>
                  <Button 
                    onClick={() => router.push('/login')}
                    className={`h-14 px-8 rounded-xl text-[15px] font-bold shadow-xl transition-all hover:-translate-y-1 hover:shadow-2xl flex items-center gap-2 group ${slide.btn1Bg}`}
                  >
                    Simular Agora
                    <ArrowRight className="size-5 transition-transform group-hover:translate-x-1" />
                  </Button>
                  <Button 
                    variant="outline"
                    className={`h-14 px-8 rounded-xl text-[15px] font-bold transition-all ${slide.btn2Bg}`}
                    onClick={() => document.getElementById('contato')?.scrollIntoView({ behavior: 'smooth' })}
                  >
                    Falar com Especialista
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {/* RIGHT: Dynamic Visuals Area */}
          <div className="w-full lg:w-[500px] xl:w-[600px] h-[400px] lg:h-[600px] relative z-10 flex items-center justify-center flex-shrink-0">
            
            {slides.map((slide, index) => slide.type !== "columns" && (
              <div 
                key={slide.id}
                className={`absolute inset-0 transition-all duration-[1000ms] ease-[cubic-bezier(0.25,1,0.5,1)] flex items-center justify-center ${
                  index === currentSlide && isLoaded 
                    ? "opacity-100 scale-100 pointer-events-auto delay-[1000ms]" 
                    : "opacity-0 scale-95 pointer-events-none delay-0"
                }`}
              >
                {slide.type === "phone" ? (
                  // Three phones floating
                  <div className="relative flex items-center justify-center w-full h-full perspective-1000 -translate-x-6 lg:-translate-x-12 xl:-translate-x-20 mt-8 lg:mt-0">
                    
                    {/* Phone 1 (Left - Tela Inicio) */}
                    <div className={`absolute transform transition-all duration-700 drop-shadow-2xl ${
                      activePhone === 0 
                        ? "-translate-x-24 lg:-translate-x-40 -translate-y-4 rotate-0 scale-100 lg:scale-105 opacity-100 z-30" 
                        : "-translate-x-24 lg:-translate-x-40 -rotate-12 scale-95 lg:scale-100 opacity-80 z-10"
                    }`}>
                      <PhoneMockup>
                        <ImageScreen src="/tela-inicio.webp" />
                      </PhoneMockup>
                    </div>

                    {/* Phone 3 (Right - Tela Tomador) */}
                    <div className={`absolute transform transition-all duration-700 drop-shadow-2xl ${
                      activePhone === 2 
                        ? "translate-x-24 lg:translate-x-40 -translate-y-4 rotate-0 scale-100 lg:scale-105 opacity-100 z-30" 
                        : "translate-x-24 lg:translate-x-40 rotate-12 scale-95 lg:scale-100 opacity-80 z-10"
                    }`}>
                      <PhoneMockup>
                        <ImageScreen src="/tela-tomador.webp" />
                      </PhoneMockup>
                    </div>
                    
                    {/* Phone 2 (Center - Tela Login) */}
                    <div className={`relative transform transition-all duration-700 drop-shadow-3xl ${
                      activePhone === 1 
                        ? "rotate-0 scale-[1.15] lg:scale-[1.20] -translate-y-6 opacity-100 z-30" 
                        : "rotate-0 scale-[1.10] lg:scale-[1.15] opacity-90 z-20"
                    }`}>
                      <PhoneMockup>
                        <ImageScreen src="/tela-login.webp" />
                      </PhoneMockup>
                    </div>

                  </div>
                ) : null}
              </div>
            ))}
            
          </div>

          {/* Slide 3: Columns Layout */}
          <div className={`absolute inset-0 z-40 flex flex-col lg:flex-row pointer-events-none overflow-hidden rounded-[2rem] lg:rounded-[3rem]`}>
            {slides[2]?.columns?.map((col, idx) => (
              <div 
                key={idx}
                className={`flex-1 flex flex-col items-center justify-center p-8 lg:p-12 xl:p-16 text-center
                  ${col.bg} 
                  ${idx > 0 ? "-mt-8 rounded-t-[3rem] shadow-[0_-20px_30px_rgba(0,0,0,0.1)] lg:-mt-0 lg:-ml-12 lg:rounded-t-none lg:rounded-l-[3rem] lg:shadow-[-20px_0_30px_rgba(0,0,0,0.2)]" : ""} 
                  transition-all duration-[1200ms] ease-[cubic-bezier(0.25,1,0.5,1)] 
                  ${currentSlide === 2 && isLoaded ? "opacity-100 translate-y-0 lg:translate-x-0 pointer-events-auto" : "opacity-0 translate-y-12 lg:translate-y-0 lg:translate-x-24 pointer-events-none"}
                `}
                style={{ 
                  zIndex: 10 + idx, 
                  transitionDelay: currentSlide === 2 ? `${idx * 400}ms` : '0ms' 
                }}
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

        {/* Carousel Indicators */}
        <div className="mt-8 flex justify-center gap-3">
          {slides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => handleDotClick(idx)}
              className={`h-2 rounded-full transition-all duration-500 ${
                currentSlide === idx ? "w-10 bg-brand-red" : "w-2 bg-zinc-300 hover:bg-zinc-400"
              }`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>

      </div>
      </div>
    </div>
  );
}
