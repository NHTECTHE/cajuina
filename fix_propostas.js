const fs = require('fs');
const file = 'src/components/propostas/PropostasPage.tsx';
let content = fs.readFileSync(file, 'utf8');

const detailsViewOldStart = '{/* ──── DETAILS VIEW (mesma estrutura da tela de Cotações) ──── */}';
const detailsViewOldEnd = '{/* ──── AVISO: SEGURADORA NÃO ESCOLHIDA ──── */}';

const startIndex = content.indexOf(detailsViewOldStart);
const endIndex = content.indexOf(detailsViewOldEnd);

if (startIndex !== -1 && endIndex !== -1) {
  const newDetailsView = `{/* ──── DETAILS VIEW (NOVO LAYOUT DE CONFIRMAÇÃO) ──── */}
      {view === "details" && selected && (
        <div className="flex flex-col gap-6 p-2 max-w-6xl mx-auto w-full">
          <div className="flex items-center gap-4 mb-2">
            <button
              onClick={() => setView("list")}
              className="w-8 h-8 flex items-center justify-center rounded-full bg-black/5 hover:bg-black/10 dark:bg-white/5 dark:hover:bg-white/10 transition-colors"
            >
              <ArrowLeft className="size-4 opacity-70" />
            </button>
          </div>

          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-zinc-800 dark:text-zinc-100">Deseja Prosseguir com a Emissão?</h1>
            <p className="text-[13px] text-zinc-500 mt-1">Confirme os dados abaixo antes de emitir a cotação.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* ENVOLVIDOS */}
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800 rounded-xl p-6 shadow-sm">
              <h3 className="text-[#e85c5c] font-bold text-xs uppercase tracking-wider mb-5">ENVOLVIDOS</h3>
              <div className="flex flex-col gap-4">
                <div>
                  <span className="text-[10px] text-zinc-500 uppercase tracking-wide">TOMADOR</span>
                  <p className="text-[13px] text-zinc-800 dark:text-zinc-200 font-bold mt-0.5 uppercase">{selected.tomador_cnpj} - {selected.tomador_nome}</p>
                </div>
                <div>
                  <span className="text-[10px] text-zinc-500 uppercase tracking-wide">SEGURADO</span>
                  <p className="text-[13px] text-zinc-800 dark:text-zinc-200 font-bold mt-0.5 uppercase">{selected.segurado_cnpj || "—"} - {selected.segurado_nome || "—"}</p>
                </div>
                <div>
                  <span className="text-[10px] text-zinc-500 uppercase tracking-wide">SEGURADORA</span>
                  <p className="text-[13px] text-zinc-800 dark:text-zinc-200 font-bold mt-0.5 uppercase">JUNTO SEGUROS</p>
                </div>
              </div>
            </div>

            {/* DETALHES DA APÓLICE */}
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800 rounded-xl p-6 shadow-sm">
              <h3 className="text-[#e85c5c] font-bold text-xs uppercase tracking-wider mb-5">DETALHES DA APÓLICE</h3>
              <div className="flex flex-col gap-4">
                <div>
                  <span className="text-[10px] text-zinc-500 uppercase tracking-wide">MODALIDADE</span>
                  <p className="text-[13px] text-zinc-800 dark:text-zinc-200 font-bold mt-0.5 uppercase">{selected.modalidade_nome}</p>
                </div>
                <div>
                  <span className="text-[10px] text-zinc-500 uppercase tracking-wide">EDITAL / CONTRATO</span>
                  <p className="text-[13px] text-zinc-800 dark:text-zinc-200 font-bold mt-0.5 uppercase">{selected.edital || "—"}</p>
                </div>
              </div>
            </div>

            {/* VALORES E VENCIMENTO */}
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800 rounded-xl p-6 shadow-sm">
              <h3 className="text-[#e85c5c] font-bold text-xs uppercase tracking-wider mb-5">VALORES E VENCIMENTO</h3>
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] text-zinc-500 uppercase tracking-wide">VALOR DA COBERTURA</span>
                  <p className="text-lg text-[#e85c5c] font-bold mt-1">{formatBRL(selected.importancia_segurada)}</p>
                </div>
                <div>
                  <div className="mb-4">
                    <span className="text-[10px] text-zinc-500 uppercase tracking-wide">VALOR (PRÊMIO)</span>
                    <p className="text-[13px] text-zinc-800 dark:text-zinc-200 font-bold mt-0.5">R$ 150,00</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-zinc-500 uppercase tracking-wide">VENCIMENTO</span>
                    <p className="text-[13px] text-zinc-800 dark:text-zinc-200 font-bold mt-0.5">20/07/2026</p>
                  </div>
                </div>
              </div>
            </div>

            {/* VIGÊNCIA */}
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800 rounded-xl p-6 shadow-sm">
              <h3 className="text-[#e85c5c] font-bold text-xs uppercase tracking-wider mb-5">VIGÊNCIA</h3>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <span className="text-[10px] text-zinc-500 uppercase tracking-wide">INÍCIO</span>
                  <p className="text-[13px] text-zinc-800 dark:text-zinc-200 font-bold mt-0.5">{isoToBR(selected.data_inicio)}</p>
                </div>
                <div>
                  <span className="text-[10px] text-zinc-500 uppercase tracking-wide">TOTAL DE DIAS</span>
                  <p className="text-[13px] text-zinc-800 dark:text-zinc-200 font-bold mt-0.5">{selected.prazo_dias != null ? \`\${selected.prazo_dias} Dias\` : "—"}</p>
                </div>
                <div>
                  <span className="text-[10px] text-zinc-500 uppercase tracking-wide">FIM</span>
                  <p className="text-[13px] text-zinc-800 dark:text-zinc-200 font-bold mt-0.5">{isoToBR(selected.data_final)}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 flex flex-col items-center">
            <p className="text-[11px] text-zinc-500 mb-8 text-center max-w-3xl">
              Declaro, expressamente, ter lido, compreendido e concordado com as condições aqui estabelecidas, incluindo as condições gerais do presente seguro.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-between w-full relative mb-10">
              <span className="text-[11px] text-zinc-500 font-medium absolute left-0 hidden sm:block">
                Sujeito a Análise e a Aprovação pela Seguradora
              </span>
              <div className="flex items-center gap-3 mx-auto">
                <button 
                  onClick={() => handleDelete(selected)}
                  className="bg-[#f97316] hover:bg-[#ea580c] text-white text-[11px] font-bold px-8 py-2.5 rounded-lg uppercase tracking-wide transition-colors"
                >
                  Excluir
                </button>
                <button 
                  className="bg-zinc-500 hover:bg-zinc-600 text-white text-[11px] font-bold px-8 py-2.5 rounded-lg uppercase tracking-wide transition-colors"
                >
                  Editar
                </button>
                <button 
                  onClick={() => setShowEmitirModal(true)}
                  className="bg-[#e85c5c] hover:bg-[#d44848] text-white text-[11px] font-bold px-8 py-2.5 rounded-lg uppercase tracking-wide transition-colors"
                >
                  Emitir
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      `;
  
  content = content.substring(0, startIndex) + newDetailsView + content.substring(endIndex);
  fs.writeFileSync(file, content);
  console.log("PropostasPage updated!");
} else {
  console.error("Could not find start or end index for replacement");
}
