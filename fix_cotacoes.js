const fs = require('fs');
const file = 'src/components/cotacoes/CotacoesPage.tsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Desktop Layout Headers (grid-cols-11)
content = content.replace(
  'className="hidden xl:grid grid-cols-10 gap-4 px-5 py-2 text-[9px] font-bold uppercase tracking-wider opacity-65 border-b border-zinc-200/30 dark:border-zinc-800/30 text-center"',
  'className="hidden xl:grid grid-cols-11 gap-4 px-5 py-2 text-[9px] font-bold uppercase tracking-wider opacity-65 border-b border-zinc-200/30 dark:border-zinc-800/30 text-center"'
);
// Insert Status header
content = content.replace(
  '<div className="col-span-1">Emitido Por</div>\n                <div className="col-span-1">Ação</div>',
  '<div className="col-span-1">Emitido Por</div>\n                <div className="col-span-1">Status</div>\n                <div className="col-span-1">Ação</div>'
);

// 2. Desktop Layout Row (grid-cols-11)
content = content.replace(
  'className="hidden xl:grid grid-cols-10 gap-4 items-center p-3.5 px-5 text-center"',
  'className="hidden xl:grid grid-cols-11 gap-4 items-center p-3.5 px-5 text-center"'
);
// Remove status badge from ID column
const idColOld = `<div className="col-span-1 flex flex-col gap-1 text-[11px] font-bold text-zinc-500 text-left pl-5">
                        <span>#{t.id}</span>
                        {t.status && t.status !== "Iniciado" && (
                          <span className={cn(
                            "px-1.5 py-0.5 text-[9px] font-bold rounded-full uppercase tracking-wider border max-w-min",
                            t.status === "Aprovado" 
                              ? "bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800"
                              : "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800"
                          )}>
                            {t.status}
                          </span>
                        )}
                      </div>`;
const idColNew = `<div className="col-span-1 text-[11px] font-bold text-zinc-500 text-left pl-5">#{t.id}</div>`;
content = content.replace(idColOld, idColNew);

// Insert Status column after Emitido Por
const emitidoPorStr = `<div className="col-span-1 flex items-center justify-center text-[11px] text-zinc-650 dark:text-zinc-400">
                        <span className="font-medium opacity-80 uppercase leading-tight text-center">{t.criado_por_nome ?? "—"}</span>
                      </div>`;
const statusCol = `

                      {/* Status */}
                      <div className="col-span-1 flex items-center justify-center">
                        <span className={cn(
                          "px-1.5 py-0.5 text-[9px] font-bold rounded-full uppercase tracking-wider border max-w-min text-center leading-tight",
                          t.status === "Aprovado" 
                            ? "bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800"
                            : "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800"
                        )}>
                          {t.status === "Iniciado" ? "AGUARDANDO APROVAÇÃO" : t.status}
                        </span>
                      </div>`;
content = content.replace(emitidoPorStr, emitidoPorStr + statusCol);

// 3. Mobile Layout badge
const mobileBadgeOld = `{t.status && t.status !== "Iniciado" && (
                            <span className={cn(
                              "px-2 py-0.5 text-[10px] font-bold rounded-full uppercase tracking-wider border",
                              t.status === "Aprovado" 
                                ? "bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800"
                                : "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800"
                            )}>
                              {t.status}
                            </span>
                          )}`;
const mobileBadgeNew = `<span className={cn(
                              "px-2 py-0.5 text-[10px] font-bold rounded-full uppercase tracking-wider border",
                              t.status === "Aprovado" 
                                ? "bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800"
                                : "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800"
                            )}>
                              {t.status === "Iniciado" ? "AGUARDANDO APROVAÇÃO" : t.status}
                            </span>`;
content = content.replace(mobileBadgeOld, mobileBadgeNew);

fs.writeFileSync(file, content);
console.log("CotacoesPage updated!");
