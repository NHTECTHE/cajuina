import { Metadata } from "next"
import ApolicesPage from "@/components/apolices/ApolicesPage"

export const metadata: Metadata = {
  title: "Apólices | Cajuína Seguros",
  description: "Gerenciamento de apólices e informações financeiras associadas.",
}

export default function ApolicesRoutePage() {
  return (
    <div className="w-full">
      <ApolicesPage />
    </div>
  )
}
