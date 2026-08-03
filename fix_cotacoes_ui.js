const fs = require('fs');
const file = 'src/components/cotacoes/CotacoesPage.tsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Remove status badge from desktop list
content = content.replace(
    /\{\/\* Status \*\/\}\s*<div className="col-span-1 flex items-center justify-center">\s*<span className=\{cn\([\s\S]*?\)\}>\s*\{t\.status === "Iniciado" \? "AGUARDANDO APROVAÇÃO" : t\.status\}\s*<\/span>\s*<\/div>/,
    '{/* Status removido */}\n                      <div className="col-span-1 flex items-center justify-center"></div>'
);

// 2. Remove status badge from mobile list
content = content.replace(
    /<span className=\{cn\([\s\S]*?t\.status === "Iniciado" \? "AGUARDANDO APROVAÇÃO" : t\.status\}\s*<\/span>/,
    ''
);

// 3. Remove isAprovado checks from Seguradora map
content = content.replace(
    /const isAprovado = selectedCotacao\?\.status === "Aprovado"/g,
    '// isAprovado check removed, cotacoes are always approved'
);

content = content.replace(
    /const selecionavel = isAprovado && apto/g,
    'const selecionavel = apto'
);

content = content.replace(
    /title=\{isAprovado && !apto \? "Tomador sem taxa cadastrada para esta seguradora\." : undefined\}/g,
    'title={!apto ? "Tomador sem taxa cadastrada para esta seguradora." : undefined}'
);

content = content.replace(
    /isAprovado && !apto \? "cursor-not-allowed" : ""/g,
    '!apto ? "cursor-not-allowed" : ""'
);

content = content.replace(
    /\{selectedCotacao\?\.status === "Aprovado" && \(/,
    '{selectedCotacao && ('
);

// 4. Remove Aprovar button
content = content.replace(
    /\{selectedCotacao\?\.status !== "Aprovado" \? \([\s\S]*?<\/Button>\s*<\/div>\s*<\/div>\s*<\/div>/,
    `<Button
                      type="button"
                      variant="outline"
                      onClick={() => selectedCotacao && openEdit(selectedCotacao)}
                      className="w-full sm:w-auto border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-900 font-semibold h-10.5 px-6 rounded-xl flex items-center justify-center gap-2"
                    >
                      <Pencil className="size-4 text-zinc-500 dark:text-zinc-400" />
                      Editar
                    </Button>
              </div>
            </div>
          </div>`
);

// 5. Remove setShowApproveConfirm state usage
content = content.replace(
    /const \[showApproveConfirm, setShowApproveConfirm\] = useState\(false\)/,
    ''
);

// 6. Remove handleAprovar method entirely
content = content.replace(
    /const handleAprovar = async \(\) => \{[\s\S]*?\}\s*\}[\r\n]{1,3}/,
    ''
);

// 7. Remove modal rendering for Aprovar
content = content.replace(
    /\{\/\* Modal Aprovar \*\/\}\s*<Dialog open=\{showApproveConfirm\} onOpenChange=\{setShowApproveConfirm\}>[\s\S]*?<\/Dialog>/,
    ''
);

fs.writeFileSync(file, content, 'utf8');
console.log('UI cleanup applied.');
