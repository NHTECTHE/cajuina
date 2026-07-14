import { Metadata } from "next"
import PropostasPage from "@/components/propostas/PropostasPage"

export const metadata: Metadata = {
  title: "Propostas - Cajuína",
  description: "Gerencie as propostas no sistema Cajuína.",
}

export default function Page() {
  return <PropostasPage />
}
