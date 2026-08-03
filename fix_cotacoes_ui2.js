const fs = require('fs');
const file = 'src/components/cotacoes/CotacoesPage.tsx';
let content = fs.readFileSync(file, 'utf8');

// Replace the status check block with just Editar + Enviar para Emissão
const btnBlockRegex = /\{selectedCotacao\?\.status !== "Aprovado" \? \([\s\S]*?<\/button>\s*\)\}/;
const newBtnBlock = `<Button
                  type="button"
                  variant="outline"
                  onClick={() => selectedCotacao && openEdit(selectedCotacao)}
                  className="w-full sm:w-auto border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-900 font-semibold h-10.5 px-6 rounded-xl flex items-center justify-center gap-2"
                >
                  <Pencil className="size-4 text-zinc-500 dark:text-zinc-400" />
                  Editar
                </Button>
                <button
                  onClick={() => {
                    if (!seguradoraEscolhidaId) {
                      toast.error("Escolha uma seguradora.")
                      return
                    }
                    if (selectedCotacao && typeof window !== "undefined") {
                      localStorage.setItem(\`seguradora_cotacao_\${selectedCotacao.id}\`, String(seguradoraEscolhidaId))
                      localStorage.setItem(\`enviado_proposta_\${selectedCotacao.id}\`, "true")
                    }
                    router.push(\`/dashboard/propostas?id=\${selectedCotacao?.id}&abrirModal=true\`)
                  }}
                  className="inline-flex items-center justify-center gap-2 h-10 px-6 rounded-lg text-[12px] font-bold uppercase tracking-wide text-white bg-green-600 hover:bg-green-700 shadow-sm shadow-green-600/20 transition-colors cursor-pointer"
                >
                  <CheckCircle2 className="size-4" />
                  Enviar para Emissão
                </button>`;

content = content.replace(btnBlockRegex, newBtnBlock);

// Remove AlertDialog block
const dialogRegex = /\{\/\* ──── CONFIRMAÇÃO DE APROVAÇÃO ──── \*\/\}\s*<AlertDialog open=\{showApproveConfirm\} onOpenChange=\{setShowApproveConfirm\}>[\s\S]*?<\/AlertDialog>/;
content = content.replace(dialogRegex, '');

fs.writeFileSync(file, content, 'utf8');
console.log('UI cleanup 2 applied.');
