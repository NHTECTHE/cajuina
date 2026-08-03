const fs = require('fs');
const file = 'src/components/tomador/TomadorPage.tsx';
let content = fs.readFileSync(file, 'utf8');
const lines = content.split('\n');

const enderecoTabIdx = lines.findIndex(l => l.includes('{/* ──── TAB: ENDEREÇO ──── */}'));
const contatosTabIdx = lines.findIndex(l => l.includes('{/* ──── TAB: CONTATOS ──── */}'));

// Find where Taxas starts. It's the div with space-y-4 inside the endereco tab.
// It should be right after the </div> that closes ENDEREÇO's grid container.
let taxasStart = -1;
for (let i = contatosTabIdx - 1; i > enderecoTabIdx; i--) {
    if (lines[i].includes('Taxas por Seguradora')) {
        // Backtrack to find the <div>
        let j = i;
        while (!lines[j].includes('<div className="bg-black/5')) j--;
        taxasStart = j;
        break;
    }
}

if (taxasStart !== -1) {
    // The taxas block ends exactly at contatosTabIdx - 2 (since -1 is empty line)
    // Wait, let's just grab everything from taxasStart to contatosTabIdx - 1, except the last </div>
    // Wait, the Taxas block was: 
    // taxasStart: <div className="bg-black/5 ...">
    // ...
    // contatosTabIdx - 2: </div> (closes the endereco tab, wait, earlier we added a </div> at the end of Taxas!)
    // Actually, let's look at the structure right before TAB: CONTATOS.
    
    let taxasEnd = contatosTabIdx - 1;
    while (!lines[taxasEnd].includes('</div>')) taxasEnd--;
    
    // We need to move [taxasStart, taxasEnd] to right before TAB: ENDEREÇO
    // Wait! The `</div>` at `taxasEnd` is actually closing the TAB: ENDEREÇO div!
    // If I move the Taxas block AND the `</div>` closing `ENDEREÇO`, I will leave `ENDEREÇO` unclosed!
    // No, wait. I explicitly added a `</div>` to the end of Taxas in `multi_replace_file_content`.
    // Let's just find the exact block from taxasStart to the </div> right after `</>`!
}

