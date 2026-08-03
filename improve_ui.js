/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('fs');
const file = 'src/components/tomador/TomadorPage.tsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Add dynamic border to the card
// Current: className="bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200/50 dark:border-zinc-800/40 p-4 shadow-sm flex flex-col items-center text-center gap-2.5"
// Change to:
// className={cn("bg-white dark:bg-zinc-800 rounded-xl border p-4 shadow-sm flex flex-col items-center text-center gap-2.5 transition-colors", draft.status === 'cadastro_ok' ? 'border-emerald-500/50 dark:border-emerald-500/40 ring-1 ring-emerald-500/20' : draft.status === 'sem_aceitacao' ? 'border-red-500/40 dark:border-red-500/30 opacity-70' : draft.status === 'outro_corretor' ? 'border-amber-500/40 dark:border-amber-500/30 opacity-80' : 'border-zinc-200/50 dark:border-zinc-800/40 opacity-60')}

content = content.replace(
    /className="bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200\/50 dark:border-zinc-800\/40 p-4 shadow-sm flex flex-col items-center text-center gap-2\.5"/,
    `className={cn(
                            "bg-white dark:bg-zinc-800 rounded-xl border p-4 shadow-sm flex flex-col items-center text-center gap-2.5 transition-colors",
                            draft.status === "cadastro_ok"
                              ? "border-emerald-500/50 dark:border-emerald-500/40 ring-1 ring-emerald-500/20"
                              : draft.status === "sem_aceitacao"
                              ? "border-red-500/40 dark:border-red-500/30 opacity-70 grayscale"
                              : draft.status === "outro_corretor"
                              ? "border-amber-500/40 dark:border-amber-500/30 opacity-80"
                              : "border-zinc-200/50 dark:border-zinc-800/40 opacity-60 grayscale"
                          )}`
);

// 2. Add divider before Status
content = content.replace(
    /<label className="w-full flex items-center justify-between text-xs gap-2">\s*<span className="opacity-60 shrink-0">Status<\/span>/,
    '<hr className="w-full border-zinc-200 dark:border-zinc-800 my-0.5" />\n                          <label className="w-full flex items-center justify-between text-xs gap-2">\n                            <span className="opacity-60 shrink-0">Status</span>'
);

fs.writeFileSync(file, content, 'utf8');
console.log('UI improvements applied.');
