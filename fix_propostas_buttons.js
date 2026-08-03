const fs = require('fs');
const file = 'src/components/propostas/PropostasPage.tsx';
let content = fs.readFileSync(file, 'utf8');

// The wrapper
content = content.replace(
    /<div className="flex items-center gap-3 mx-auto">/,
    '<div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 mx-auto w-full px-2">'
);

// Buttons px-6 to px-4 sm:px-6
content = content.replace(
    /className="inline-flex items-center justify-center gap-2 h-10\.5 px-6 rounded-xl border border-red-200/g,
    'className="inline-flex items-center justify-center gap-2 h-10.5 px-4 sm:px-6 rounded-xl border border-red-200'
);

content = content.replace(
    /className="inline-flex items-center justify-center gap-2 h-10\.5 px-6 rounded-xl border border-zinc-200/g,
    'className="inline-flex items-center justify-center gap-2 h-10.5 px-4 sm:px-6 rounded-xl border border-zinc-200'
);

content = content.replace(
    /className="inline-flex items-center justify-center gap-2 h-10\.5 px-6 rounded-xl bg-brand-red/g,
    'className="inline-flex items-center justify-center gap-2 h-10.5 px-4 sm:px-6 rounded-xl bg-brand-red'
);

fs.writeFileSync(file, content, 'utf8');
console.log('Mobile buttons fixed.');
