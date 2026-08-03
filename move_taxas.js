const fs = require('fs');
const file = 'src/components/tomador/TomadorPage.tsx';
let content = fs.readFileSync(file, 'utf8');
const lines = content.split('\n');

// Find the Taxas Tab block
const taxasStartIdx = lines.findIndex(l => l.includes('{/* ──── TAB: TAXAS ──── */}'));
let taxasEndIdx = taxasStartIdx;
while (!lines[taxasEndIdx].includes('            {/* ──── TAB: ARQUIVOS ──── */}')) {
    taxasEndIdx++;
}

// Extract Taxas block, excluding the top <div> and the bottom </div>
const taxasBlock = lines.slice(taxasStartIdx + 2, taxasEndIdx - 2);

// Delete the original Taxas block
lines.splice(taxasStartIdx, taxasEndIdx - taxasStartIdx);

// Find the end of TAB: DADOS
const contatosStartIdx = lines.findIndex(l => l.includes('{/* ──── TAB: CONTATOS ──── */}'));

// Insert the Taxas block right before the closing </div> of the DADOS tab
// (which is 2 lines before the CONTATOS tab starts)
lines.splice(contatosStartIdx - 1, 0, ...taxasBlock);

// Do the simple replacements
content = lines.join('\n');
content = content.replace(
    'const loadingSeguradoras = currentTab === "taxas" && !seguradorasLoaded',
    'const loadingSeguradoras = currentTab === "dados" && !seguradorasLoaded'
);
content = content.replace(
    'if (currentTab !== "taxas" || seguradorasLoaded) return',
    'if (currentTab !== "dados" || seguradorasLoaded) return'
);
content = content.replace(
    'if (currentTab !== "taxas" || editingId === null || taxasLoadedFor === editingId) return',
    'if (currentTab !== "dados" || editingId === null || taxasLoadedFor === editingId) return'
);

// Remove the Taxas Tab button
const buttonStartIdx = lines.findIndex(l => l.includes('onClick={() => setCurrentTab("taxas")}'));
if (buttonStartIdx !== -1) {
    // Look backwards for the <button
    let btnStart = buttonStartIdx;
    while (!lines[btnStart].includes('<button')) btnStart--;
    // Look forwards for the </button>
    let btnEnd = buttonStartIdx;
    while (!lines[btnEnd].includes('</button>')) btnEnd++;
    
    // Now apply to content (re-splitting because of earlier modifications)
    let newLines = content.split('\n');
    const bStart = newLines.findIndex(l => l.includes('onClick={() => setCurrentTab("taxas")}'));
    let bS = bStart, bE = bStart;
    while (!newLines[bS].includes('<button')) bS--;
    while (!newLines[bE].includes('</button>')) bE++;
    newLines.splice(bS, bE - bS + 1);
    content = newLines.join('\n');
}

fs.writeFileSync(file, content, 'utf8');
console.log('Done!');
