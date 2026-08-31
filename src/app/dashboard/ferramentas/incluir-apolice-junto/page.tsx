import { Metadata } from "next"

import { ImportarApoliceJunto } from "@/components/ferramentas/ImportarApoliceJunto"

export const metadata: Metadata = {
  title: "Importar Apólice | Cajuína",
  description: "Traz para o sistema uma apólice já emitida na seguradora",
}

export default function Page() {
  return <ImportarApoliceJunto />
}
