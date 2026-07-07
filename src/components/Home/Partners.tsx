"use client";

import React from 'react';
import ScrollReveal from '@/components/ui/ScrollReveal';

// Replace these paths with the actual logo paths in your public folder
const partners = [
  { id: 1, name: 'Parceiro 1', src: '/parc1.png' },
  { id: 2, name: 'Parceiro 2', src: '/parc2.png' },
  { id: 3, name: 'Parceiro 3', src: '/parc3.png' },
  { id: 4, name: 'Parceiro 4', src: '/parc4.png' },
  { id: 5, name: 'Parceiro 5', src: '/parc5.png' },
  { id: 6, name: 'Parceiro 6', src: '/parc6.png' },
];

export default function Partners() {
  // Duplicate the array multiple times to ensure it covers even ultrawide screens seamlessly
  const duplicatedPartners = [...partners, ...partners, ...partners, ...partners];

  return (
    <section className="pt-10 pb-20 bg-white overflow-hidden border-b border-zinc-100">
      <ScrollReveal direction="up" duration={800}>

      <div className="relative w-full flex overflow-hidden">
        {/* Left gradient mask */}
        <div className="absolute left-0 top-0 bottom-0 w-32 z-10 bg-gradient-to-r from-white to-transparent pointer-events-none"></div>
        
        <div className="flex w-max animate-marquee items-center">
          {duplicatedPartners.map((partner, index) => (
            <div 
              key={`${partner.id}-${index}`} 
              className="flex justify-center items-center min-w-[200px] px-4 transition-all duration-300 opacity-70 hover:opacity-100"
            >
              <img 
                src={partner.src} 
                alt={partner.name} 
                className="max-h-40 w-auto object-contain brightness-0"
                onError={(e) => {
                  // Fallback to text if image fails to load
                  e.currentTarget.style.display = 'none';
                  if (e.currentTarget.nextElementSibling) {
                    (e.currentTarget.nextElementSibling as HTMLElement).style.display = 'block';
                  }
                }}
              />
              <div className="hidden text-xl font-bold text-zinc-400 whitespace-nowrap">
                {partner.name}
              </div>
            </div>
          ))}
        </div>

        {/* Right gradient mask */}
        <div className="absolute right-0 top-0 bottom-0 w-32 z-10 bg-gradient-to-l from-white to-transparent pointer-events-none"></div>
      </div>
      </ScrollReveal>
    </section>
  );
}
