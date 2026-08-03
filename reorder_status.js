const fs = require('fs');
const file = 'src/components/tomador/TomadorPage.tsx';
let content = fs.readFileSync(file, 'utf8');

// The blocks inside the map are label elements.
// Status block starts with <label className="w-full flex items-center justify-between text-xs gap-2">\n                            <span className="opacity-60 shrink-0">Status</span>
// Taxa block starts similarly with "Taxa"
// P. M. block
// Vencimento block
// I will extract the Status block and append it after Vencimento.

const statusRegex = /(<label className="w-full flex items-center justify-between text-xs gap-2">\s*<span className="opacity-60 shrink-0">Status<\/span>[\s\S]*?<\/NativeSelect>\s*<\/span>\s*<\/label>\s*)/;
const match = content.match(statusRegex);

if (match) {
    const statusBlock = match[0];
    content = content.replace(statusRegex, ''); // remove from current pos

    // find the Vencimento block
    const vencimentoRegex = /(<label className="w-full flex items-center justify-between text-xs gap-2">\s*<span className="opacity-60 shrink-0">Vencimento<\/span>[\s\S]*?<\/label>\s*)/;
    
    content = content.replace(vencimentoRegex, (m) => {
        return m + '\n' + '                          ' + statusBlock.trim() + '\n';
    });

    fs.writeFileSync(file, content, 'utf8');
    console.log("Status moved to the bottom successfully.");
} else {
    console.log("Could not find status block.");
}

