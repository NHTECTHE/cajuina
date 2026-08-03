const fs = require('fs');
const file = 'src/components/propostas/PropostasPage.tsx';
let content = fs.readFileSync(file, 'utf8');

// Replace the wrapper
content = content.replace(
    /<div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 mx-auto w-full px-2">/,
    '<div className="flex flex-wrap sm:flex-nowrap items-center justify-between gap-3 w-full relative mb-10">'
);

// Replace Excluir button classes
content = content.replace(
    /className="inline-flex items-center justify-center gap-2 h-10\.5 px-4 sm:px-6 rounded-xl border border-red-200 dark:border-red-900\/50 bg-white dark:bg-zinc-900 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950\/50 font-semibold text-xs transition-all active:scale-\[0\.98\] shadow-sm cursor-pointer"/,
    'className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 h-10.5 sm:px-6 rounded-xl border border-red-200 dark:border-red-900/50 bg-white dark:bg-zinc-900 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/50 font-semibold text-xs transition-all active:scale-[0.98] shadow-sm cursor-pointer"'
);

// Replace Editar button classes
content = content.replace(
    /className="inline-flex items-center justify-center gap-2 h-10\.5 px-4 sm:px-6 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 font-semibold text-xs transition-all active:scale-\[0\.98\] shadow-sm cursor-pointer"/,
    'className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 h-10.5 sm:px-6 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 font-semibold text-xs transition-all active:scale-[0.98] shadow-sm cursor-pointer"'
);

// Replace Emitir button classes
content = content.replace(
    /className="inline-flex items-center justify-center gap-2 h-10\.5 px-4 sm:px-6 rounded-xl bg-brand-red text-white hover:bg-brand-red\/90 font-bold text-xs shadow-md shadow-brand-red\/10 transition-all active:scale-\[0\.98\] cursor-pointer"/,
    'className="w-full sm:w-auto inline-flex items-center justify-center gap-2 h-10.5 sm:px-8 rounded-xl bg-brand-red text-white hover:bg-brand-red/90 font-bold text-xs shadow-md shadow-brand-red/10 transition-all active:scale-[0.98] cursor-pointer"'
);

// We must also remove the outer relative mb-10 div from the old code if there are multiple.
// Wait, the wrapper was inside `<div className="flex flex-col sm:flex-row items-center justify-between w-full relative mb-10">`
// Let's just do a string replace on the whole block to be 100% precise.
