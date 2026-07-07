"use client";

import React from 'react';
import Image from 'next/image';
import ScrollReveal from '@/components/ui/ScrollReveal';

const features = [
  {
    id: 'garantia',
    title: 'Seguro Garantia',
    description: 'Tem como principal finalidade assegurar o fiel cumprimento das obrigações assumidas pelo tomador perante o segurado, sejam elas decorrentes de contratos firmados entre as partes ou de exigências previstas em lei. Esse tipo de seguro oferece proteção financeira ao segurado, garantindo que, caso o tomador deixe de cumprir suas responsabilidades contratuais ou legais, haverá cobertura para os prejuízos previstos na apólice.',
    image: '/image3.png',
    bgColor: 'bg-brand-red'
  },
  {
    id: 'risco',
    title: 'Risco de Engenharia',
    description: 'Protege obras e projetos contra danos e imprevistos durante sua execução. Ele oferece cobertura para novas construções, reformas, ampliações, instalações e mudanças de layout, desde o início até a conclusão da obra. Essa modalidade garante mais segurança financeira, reduz prejuízos causados por acidentes e contribui para o cumprimento do cronograma, proporcionando tranquilidade para empresas, construtoras e proprietários.',
    image: '/image 2.png',
    bgColor: 'bg-brand-red'
  },
  {
    id: 'responsabilidade',
    title: 'Responsabilidade Civil',
    description: 'Protege empresas e profissionais contra prejuízos decorrentes de danos materiais, corporais ou morais causados involuntariamente a terceiros durante o exercício de suas atividades. Essa modalidade oferece maior segurança financeira, preserva o patrimônio do segurado e permite que indústrias, comércios e prestadores de serviços atuem com mais tranquilidade e confiança.',
    image: '/image1.png',
    bgColor: 'bg-brand-red'
  }
];

const AnimatedTitle = () => {
  const [isVisible, setIsVisible] = React.useState(false);
  const ref = React.useRef<HTMLHeadingElement>(null);

  React.useEffect(() => {
    const currentRef = ref.current;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        } else {
          setIsVisible(false);
        }
      },
      { threshold: 0.1 }
    );
    if (currentRef) observer.observe(currentRef);
    return () => {
      if (currentRef) observer.unobserve(currentRef);
    };
  }, []);

  const word = "PRODUTOS";

  return (
    <h3 ref={ref} className="text-4xl md:text-5xl lg:text-7xl uppercase text-brand-red lg:text-white drop-shadow-lg px-6 flex flex-wrap justify-center items-center gap-2 lg:gap-4">
      <span className="font-light tracking-widest">Nossos</span>
      <span className="font-black flex tracking-widest">
        {word.split('').map((letter, i) => (
          <span
            key={i}
            className="transition-opacity duration-500 ease-in-out"
            style={{
              opacity: isVisible ? 1 : 0,
              transitionDelay: isVisible ? `${i * 150}ms` : '0ms'
            }}
          >
            {letter}
          </span>
        ))}
      </span>
    </h3>
  );
};

export default function Products() {
  return (
    <section id="seguros" className="w-full text-white overflow-hidden bg-white lg:bg-brand-red">

      {/* HEADER SECTION */}
      <div className="w-full bg-white lg:bg-brand-red pt-16 pb-6 lg:pt-36 lg:pb-16 text-center flex justify-center">
        <AnimatedTitle />
      </div>

      {/* PRODUCTS BLOCKS (Zigue-Zague) */}
      <div className="w-full flex flex-col">
        {features.map((feature, index) => {
          // Alternar a direção com base no índice (par = imagem esquerda, ímpar = imagem direita)
          const isEven = index % 2 === 0;

          return (
            <div key={feature.id} className={`w-full py-4 lg:py-24 bg-white lg:${feature.bgColor}`}>
              <div className="mx-auto max-w-7xl px-6 lg:px-8">

                <div className={`flex flex-col lg:flex-row items-center gap-12 lg:gap-16 ${isEven ? '' : 'lg:flex-row-reverse'}`}>

                  {/* IMAGEM */}
                  <div className="hidden lg:block w-full lg:w-1/2">
                    <ScrollReveal direction={isEven ? 'left' : 'right'} delay={100} duration={1000}>
                      <div className="relative w-full aspect-square md:aspect-[3/4] lg:aspect-[3/4] max-w-md mx-auto rounded-[3rem] lg:rounded-[4rem] overflow-hidden shadow-2xl ring-4 ring-white/10 hover:scale-[1.02] transition-transform duration-500">
                        <Image
                          src={feature.image}
                          alt={feature.title}
                          fill
                          sizes="(max-width: 768px) 100vw, 50vw"
                          className="object-cover"
                          unoptimized
                        />
                      </div>
                    </ScrollReveal>
                  </div>

                  {/* TEXTO */}
                  <div className="w-full lg:w-1/2 flex flex-col justify-center text-center lg:text-left bg-brand-red lg:bg-transparent p-6 lg:p-0 rounded-2xl lg:rounded-none shadow-md lg:shadow-none">
                    <ScrollReveal direction={isEven ? 'right' : 'left'} delay={300} duration={1000}>
                      <h2 className="text-2xl md:text-5xl lg:text-6xl font-extrabold mb-3 lg:mb-8 text-white leading-tight drop-shadow-md">
                        {feature.title}
                      </h2>
                      <p className="text-sm sm:text-base lg:text-2xl text-white/95 mb-6 lg:mb-10 leading-relaxed drop-shadow-sm font-medium">
                        {feature.description}
                      </p>
                      <div>
                        <button 
                          onClick={() => document.getElementById('contato')?.scrollIntoView({ behavior: 'smooth' })}
                          className="bg-white text-brand-red font-bold py-2.5 px-6 lg:py-4 lg:px-10 rounded-full shadow-md hover:bg-zinc-100 hover:shadow-xl transition-all transform hover:-translate-y-1 text-sm lg:text-lg"
                        >
                          SABER MAIS
                        </button>
                      </div>
                    </ScrollReveal>
                  </div>

                </div>

              </div>
            </div>
          );
        })}
      </div>

    </section>
  );
}
