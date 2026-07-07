"use client";

import React from 'react';
import { Phone, MapPin, Mail, ArrowUpRight } from 'lucide-react';
import ScrollReveal from '@/components/ui/ScrollReveal';

export default function Contact() {
  const contacts = [
    {
      icon: <Phone className="w-6 h-6 text-brand-red" />,
      title: "WhatsApp / Telefone",
      content: "(86) 3081-0282",
      link: "https://wa.me/558630810282",
      delay: 0,
    },
    {
      icon: <MapPin className="w-6 h-6 text-brand-red" />,
      title: "Endereço",
      content: (
        <>
          R. Mato Grosso - 720 - Porenquanto<br />
          Torre 2 - Sala 612 - Empresarial Shopping Rio Poty<br />
          Teresina - PI
        </>
      ),
      link: "https://www.google.com/maps/search/?api=1&query=Cajuína+Corretora+de+Seguros+Teresina",
      delay: 200,
    },
    {
      icon: <Mail className="w-6 h-6 text-brand-red" />,
      title: "E-mail",
      content: "garantia@cajuinaseguros.com.br",
      link: "mailto:garantia@cajuinaseguros.com.br",
      delay: 400,
    },
  ];

  return (
    <section id="contato" className="w-full bg-brand-red relative overflow-hidden flex flex-col">
      
      {/* Decorative Background Elements */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[150vw] md:w-[800px] h-[400px] bg-white/10 blur-[120px] rounded-full pointer-events-none"></div>

      {/* Content Wrapper */}
      <div className="w-full max-w-7xl mx-auto px-6 lg:px-8 relative z-10 py-32 lg:py-40">
        
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16 lg:mb-24">
          <ScrollReveal direction="down">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6 tracking-tight">
              Contato
            </h2>
            <p className="text-white/80 text-lg">
              Estamos prontos para ajudar. Fale com nossos especialistas pelos canais abaixo ou venha tomar um café com a gente.
            </p>
          </ScrollReveal>
        </div>

        {/* Contact Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 max-w-5xl mx-auto w-full">
          {contacts.map((contact, index) => (
            <ScrollReveal key={index} direction="up" delay={contact.delay} className="h-full">
              <a 
                href={contact.link}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative bg-white border border-slate-100 rounded-3xl pt-5 px-5 pb-6 lg:pt-6 lg:px-6 lg:pb-8 flex flex-col items-center text-center h-full transition-all duration-300 hover:shadow-[0_15px_40px_rgba(0,0,0,0.12)] hover:-translate-y-3 hover:scale-105 overflow-hidden"
              >
                {/* Hover Glow */}
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-brand-red/[0.02] opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                
                {/* Icon Circle */}
                <div className="w-12 h-12 bg-brand-red/10 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-brand-red/20 transition-all duration-300">
                  {contact.icon}
                </div>
                
                {/* Title */}
                <h3 className="text-[16px] font-bold text-slate-900 mb-2">{contact.title}</h3>
                
                {/* Content */}
                <p className="text-slate-500 text-[14px] leading-relaxed mb-3">
                  {contact.content}
                </p>

                {/* Action arrow */}
                <div className="mt-auto w-8 h-8 rounded-full border border-slate-100 flex items-center justify-center text-slate-300 group-hover:text-brand-red group-hover:border-brand-red group-hover:bg-brand-red/5 transition-colors duration-300">
                  <ArrowUpRight className="w-4 h-4" />
                </div>
              </a>
            </ScrollReveal>
          ))}
        </div>

      </div>

      {/* Footer / Copyright */}
      <div className="w-full border-t border-slate-200/60 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
            <p className="text-slate-500 text-sm font-medium">
              &copy; {new Date().getFullYear()}, Cajuína Corretora de Seguros é devidamente registrada na SUSEP sob nº 202010585
            </p>
            
            <div className="flex gap-6 text-sm font-medium text-slate-400">
              <a href="#" className="hover:text-brand-red transition-colors">Termos de Uso</a>
              <a href="#" className="hover:text-brand-red transition-colors">Política de Privacidade</a>
            </div>
          </div>
        </div>
      </div>

    </section>
  );
}
