import { ShieldAlert } from "lucide-react"

export default function SemAcessoPage() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-6 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-50 dark:bg-red-950/40">
        <ShieldAlert className="h-8 w-8 text-red-500" />
      </div>
      <h1 className="text-2xl font-bold text-zinc-800 dark:text-zinc-100">
        Você não tem acesso a esta área
      </h1>
      <p className="max-w-md text-sm text-zinc-500 dark:text-zinc-400">
        Se você precisa usar esta tela, peça a um administrador para liberar a
        permissão correspondente no seu usuário.
      </p>
    </div>
  )
}
