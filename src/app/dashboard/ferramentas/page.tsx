import { Metadata } from "next"
import { FerramentasPage } from "@/components/ferramentas/FerramentasPage"

export const metadata: Metadata = {
  title: "Ferramentas | Cajuína",
  description: "Ferramentas do sistema e opções diversas",
}

export default function Page() {
  return <FerramentasPage />
}
