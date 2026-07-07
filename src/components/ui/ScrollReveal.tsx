"use client";

import React, { useEffect, useRef, useState, ReactNode } from 'react';

interface ScrollRevealProps {
  children: ReactNode;
  direction?: 'left' | 'right' | 'up' | 'down' | 'none';
  delay?: number;
  duration?: number;
  className?: string;
  threshold?: number;
  once?: boolean;
}

export default function ScrollReveal({
  children,
  direction = 'up',
  delay = 0,
  duration = 800,
  className = '',
  threshold = 0.15,
  once = false
}: ScrollRevealProps) {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const currentRef = ref.current;
    
    const observer = new IntersectionObserver(
      ([entry]) => {
        // Dispara quando o elemento entra na tela
        if (entry.isIntersecting) {
          setIsVisible(true);
          // Desconectar se a animação deve acontecer apenas uma vez
          if (once && currentRef) {
            observer.unobserve(currentRef);
          }
        } else {
          // Se sair da tela e não for "once", reseta a animação
          if (!once) {
            setIsVisible(false);
          }
        }
      },
      {
        root: null,
        rootMargin: '0px 0px -50px 0px', // Aciona um pouco antes de entrar completamente
        threshold: threshold
      }
    );

    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [threshold, once]);

  const getTransform = () => {
    if (isVisible) return 'translate(0, 0)';
    switch (direction) {
      case 'left': return 'translate(-80px, 0)';
      case 'right': return 'translate(80px, 0)';
      case 'up': return 'translate(0, 80px)';
      case 'down': return 'translate(0, -80px)';
      default: return 'translate(0, 0)';
    }
  };

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: isVisible ? 1 : 0,
        transform: getTransform(),
        transition: `opacity ${duration}ms cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms, transform ${duration}ms cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms`,
        willChange: 'opacity, transform'
      }}
    >
      {children}
    </div>
  );
}
