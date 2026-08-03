const fs = require('fs');
const file = 'src/components/cotacoes/CotacoesPage.tsx';
let content = fs.readFileSync(file, 'utf8');

// Change grid-cols-11 to grid-cols-10 in header
content = content.replace(
    /<div className="hidden xl:grid grid-cols-11 gap-4 px-5 py-2 text-\[9px\] font-bold uppercase tracking-wider opacity-65 border-b border-zinc-200\/30 dark:border-zinc-800\/30 text-center">/,
    '<div className="hidden xl:grid grid-cols-10 gap-4 px-5 py-2 text-[9px] font-bold uppercase tracking-wider opacity-65 border-b border-zinc-200/30 dark:border-zinc-800/30 text-center">'
);

// Remove Status header
content = content.replace(
    /<div className="col-span-1">Status<\/div>\s*/,
    ''
);

// Change grid-cols-11 to grid-cols-10 in row
content = content.replace(
    /<div className="hidden xl:grid grid-cols-11 gap-4 items-center p-3\.5 px-5 text-center">/,
    '<div className="hidden xl:grid grid-cols-10 gap-4 items-center p-3.5 px-5 text-center">'
);

// Remove the empty status div
content = content.replace(
    /\{\/\* Status removido \*\/\}\s*<div className="col-span-1 flex items-center justify-center"><\/div>\s*/,
    ''
);

fs.writeFileSync(file, content, 'utf8');
console.log('UI cleanup 3 applied.');
