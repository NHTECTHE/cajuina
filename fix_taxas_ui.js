const fs = require('fs');
const file = 'src/components/tomador/TomadorPage.tsx';
let content = fs.readFileSync(file, 'utf8');

// 1. taxasDraft state
content = content.replace(
    'const [taxasDraft, setTaxasDraft] = useState<Record<number, { taxa: string; premio_minimo: string }>>({})',
    'const [taxasDraft, setTaxasDraft] = useState<Record<number, { taxa: string; premio_minimo: string; status: string }>>({})'
);

// 2. Draft type inside useEffect
content = content.replace(
    'const draft: Record<number, { taxa: string; premio_minimo: string }> = {}',
    'const draft: Record<number, { taxa: string; premio_minimo: string; status: string }> = {}'
);

// 3. Draft mapping inside useEffect
content = content.replace(
    /taxa: v\.taxa \?\? "",\s*premio_minimo: v\.premio_minimo \?\? "",/,
    'taxa: v.taxa ?? "",\n            premio_minimo: v.premio_minimo ?? "",\n            status: v.status ?? "sem_cadastro",'
);

// 4. Default draft in handleSaveTaxas
content = content.replace(
    'const draft = taxasDraft[s.id] ?? { taxa: "", premio_minimo: "" }',
    'const draft = taxasDraft[s.id] ?? { taxa: "", premio_minimo: "", status: "sem_cadastro" }'
);

// 5. Default draft in UI mapping
content = content.replace(
    'const draft = taxasDraft[s.id] ?? { taxa: "", premio_minimo: "" }',
    'const draft = taxasDraft[s.id] ?? { taxa: "", premio_minimo: "", status: "sem_cadastro" }'
);

// 6. UI Element addition
const selectHtml = `
                          <label className="w-full flex items-center justify-between text-xs gap-2">
                            <span className="opacity-60 shrink-0">Status</span>
                            <span className="relative flex-1 max-w-[120px]">
                              <NativeSelect
                                value={draft.status}
                                onChange={(e) => setTaxasDraft((prev) => ({
                                  ...prev,
                                  [s.id]: { ...draft, status: e.target.value },
                                }))}
                                className="w-full h-7 rounded-md border border-zinc-200 dark:border-zinc-700 bg-transparent text-xs focus:outline-none focus:ring-2 focus:ring-brand-red/40"
                              >
                                <option value="cadastro_ok">Cadastro OK</option>
                                <option value="sem_cadastro">Sem cadastro</option>
                                <option value="outro_corretor">Outro corretor</option>
                                <option value="sem_aceitacao">Sem aceitação</option>
                              </NativeSelect>
                            </span>
                          </label>
`;

content = content.replace(
    /<label className="w-full flex items-center justify-between text-xs gap-2">\s*<span className="opacity-60 shrink-0">Taxa<\/span>/,
    selectHtml + '\n                          <label className="w-full flex items-center justify-between text-xs gap-2">\n                            <span className="opacity-60 shrink-0">Taxa</span>'
);

fs.writeFileSync(file, content, 'utf8');
console.log('Done modifying TomadorPage.tsx');
