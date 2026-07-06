import Navbar from "@/components/Home/Navbar";
import HeroBanner from "@/components/Home/HeroBanner";
import About from "@/components/Home/About";
import Partners from "@/components/Home/Partners";
import Products from "@/components/Home/Products";
import Signup from "@/components/Home/Signup";
import Contact from "@/components/Home/Contact";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cajuína Corretora de Seguros",
  description: "A Cajuína é o 1º aplicativo do Brasil a emitir Seguro Garantia. Seguros para licitação e contratos em minutos.",
};

export default function Home() {
  return (
    <main className="min-h-screen bg-white font-sans selection:bg-brand-red/20 selection:text-brand-red overflow-x-hidden">
      <Navbar />
      <HeroBanner />
      <About />
      <Products />
      <Partners />
      <Signup />
      <Contact />
    </main>
  );
}
