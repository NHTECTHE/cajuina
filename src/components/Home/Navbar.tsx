"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "Início", href: "/" },
    { name: "Seguros", href: "#seguros" },
    { name: "Sobre nós", href: "#quem-somos" },
    { name: "Contato", href: "#contato" },
  ];

  return (
    <header
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        scrolled ? "bg-white/95 backdrop-blur-md shadow-sm h-14" : "bg-white/80 backdrop-blur-sm h-16 lg:h-20"
      }`}
    >
      <div className={`container mx-auto h-full px-6 lg:px-12 flex items-center justify-between transition-transform duration-300 ${scrolled ? "translate-y-0" : "translate-y-1 lg:translate-y-2"}`}>
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 relative z-50">
          <Image
            src="/2 - 1.png"
            alt="Cajuína"
            width={320}
            height={100}
            className={`w-auto object-contain transition-all duration-300 ${scrolled ? "h-16 lg:h-20" : "h-28 lg:h-32"}`}
            priority
          />
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className="text-[15px] font-semibold text-zinc-700 hover:text-brand-red transition-colors"
            >
              {link.name}
            </Link>
          ))}
        </nav>

        {/* Auth Buttons */}
        <div className="hidden lg:flex items-center gap-4">
          <Button
            variant="ghost"
            className="font-semibold text-zinc-700 hover:bg-zinc-100"
            onClick={() => router.push("/login")}
          >
            Entrar
          </Button>
          <Button
            className="bg-brand-red hover:bg-brand-red-hover text-white font-bold rounded-full px-6 shadow-md transition-transform hover:scale-105"
            onClick={() => router.push("/login")}
          >
            Cadastrar
          </Button>
        </div>

        {/* Mobile Menu Toggle */}
        <button
          className="lg:hidden relative z-50 p-2 text-zinc-800"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>

        {/* Mobile Nav */}
        <div
          className={`fixed inset-0 bg-white z-40 flex flex-col justify-center items-center gap-8 transition-transform duration-300 lg:hidden ${
            mobileMenuOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className="text-2xl font-bold text-zinc-800 hover:text-brand-red"
              onClick={() => setMobileMenuOpen(false)}
            >
              {link.name}
            </Link>
          ))}
          <div className="flex flex-col gap-4 mt-8 w-[80%] max-w-sm">
            <Button
              variant="outline"
              className="w-full text-lg h-14 border-2 font-bold"
              onClick={() => {
                setMobileMenuOpen(false);
                router.push("/login");
              }}
            >
              Entrar
            </Button>
            <Button
              className="w-full text-lg h-14 bg-brand-red hover:bg-brand-red-hover text-white font-bold"
              onClick={() => {
                setMobileMenuOpen(false);
                router.push("/login");
              }}
            >
              Cadastrar
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
