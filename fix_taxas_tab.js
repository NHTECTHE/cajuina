const fs = require('fs');
const file = 'src/components/tomador/TomadorPage.tsx';
let lines = fs.readFileSync(file, 'utf8').split('\n');

const enderecoStart = lines.findIndex(l => l.includes('{/* ──── TAB: ENDEREÇO ──── */}'));

// Find the Taxas block inside the Endereco tab
let taxasStart = -1;
for (let i = enderecoStart; i < lines.length; i++) {
    if (lines[i].includes('<span>Taxas por Seguradora</span>')) {
        let j = i;
        while (!lines[j].includes('<div className="bg-black/5')) j--;
        taxasStart = j;
        break;
    }
}

// Find the end of the Taxas block (the </> )} right before the </div> that closes Endereco)
// Basically right before {/* ──── TAB: CONTATOS ──── */}
const contatosStart = lines.findIndex(l => l.includes('{/* ──── TAB: CONTATOS ──── */}'));

// The </div> that closes ENDEREÇO is at contatosStart - 2.
// The Taxas block is from taxasStart to contatosStart - 3.
let taxasEnd = contatosStart - 3;

// Double check
if (taxasStart !== -1) {
    const taxasBlock = lines.slice(taxasStart, taxasEnd + 1);
    
    // Remove it from current location
    lines.splice(taxasStart, taxasEnd - taxasStart + 1);
    
    // Now find the end of DADOS tab.
    // It is exactly the line right before {/* ──── TAB: ENDEREÇO ──── */}
    const newEnderecoStart = lines.findIndex(l => l.includes('{/* ──── TAB: ENDEREÇO ──── */}'));
    
    // We insert it right before the </div> that closes the DADOS tab, which is newEnderecoStart - 2
    lines.splice(newEnderecoStart - 2, 0, ...taxasBlock);
    
    fs.writeFileSync(file, lines.join('\n'), 'utf8');
    console.log('Fixed Taxas position!');
} else {
    console.error('Could not find Taxas block');
}
