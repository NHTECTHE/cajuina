/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('fs');
const file = 'src/components/tomador/TomadorPage.tsx';
let content = fs.readFileSync(file, 'utf8');

// 1. taxasDraft state
content = content.replace(
    'const [taxasDraft, setTaxasDraft] = useState<Record<number, { taxa: string; premio_minimo: string; status: string }>>({})',
    'const [taxasDraft, setTaxasDraft] = useState<Record<number, { taxa: string; premio_minimo: string; status: string; dias_vencimento: string }>>({})'
);

// 2. Draft type inside useEffect
content = content.replace(
    'const draft: Record<number, { taxa: string; premio_minimo: string; status: string }> = {}',
    'const draft: Record<number, { taxa: string; premio_minimo: string; status: string; dias_vencimento: string }> = {}'
);

// 3. Draft mapping inside useEffect
content = content.replace(
    /taxa: v\.taxa \?\? "",\s*premio_minimo: v\.premio_minimo \?\? "",\s*status: v\.status \|\| "sem_cadastro",/,
    'taxa: v.taxa ?? "",\n            premio_minimo: v.premio_minimo ?? "",\n            dias_vencimento: v.dias_vencimento !== null ? String(v.dias_vencimento) : "",\n            status: v.status || "sem_cadastro",'
);

// 4. Default draft in handleSaveTaxas
content = content.replace(
    'const draft = taxasDraft[s.id] ?? { taxa: "", premio_minimo: "", status: "sem_cadastro" }',
    'const draft = taxasDraft[s.id] ?? { taxa: "", premio_minimo: "", status: "sem_cadastro", dias_vencimento: "" }'
);

// 5. Mapped item inside handleSaveTaxas
content = content.replace(
    /taxa: taxaInputToDecimal\(draft\.taxa\) \?\? "0\.00",\s*premio_minimo: taxaInputToDecimal\(draft\.premio_minimo\),/,
    'taxa: taxaInputToDecimal(draft.taxa) ?? "0.00",\n        premio_minimo: taxaInputToDecimal(draft.premio_minimo),\n        dias_vencimento: draft.dias_vencimento ? parseInt(draft.dias_vencimento.replace(/\\D/g, ""), 10) : null,'
);

// 6. Draft set inside handleSaveTaxas success
content = content.replace(
    'const draft: Record<number, { taxa: string; premio_minimo: string; status: string }> = {}',
    'const draft: Record<number, { taxa: string; premio_minimo: string; status: string; dias_vencimento: string }> = {}'
);
content = content.replace(
    /draft\[v\.seguradora\] = { taxa: v\.taxa \?\? "", premio_minimo: v\.premio_minimo \?\? "", status: v\.status \|\| "sem_cadastro" }/,
    'draft[v.seguradora] = { taxa: v.taxa ?? "", premio_minimo: v.premio_minimo ?? "", status: v.status || "sem_cadastro", dias_vencimento: v.dias_vencimento !== null ? String(v.dias_vencimento) : "" }'
);

// 7. UI rendering default
content = content.replace(
    'const draft = taxasDraft[s.id] ?? { taxa: "", premio_minimo: "", status: "sem_cadastro" }',
    'const draft = taxasDraft[s.id] ?? { taxa: "", premio_minimo: "", status: "sem_cadastro", dias_vencimento: "" }'
);

// 8. UI rendering HTML
const uiHtml = `
                          <label className="w-full flex items-center justify-between text-xs gap-2">
                            <span className="opacity-60 shrink-0">Vencimento</span>
                            <span className="relative flex-1 max-w-[92px]">
                              <input
                                type="text"
                                inputMode="numeric"
                                value={draft.dias_vencimento}
                                placeholder={s.dias_vencimento !== null && s.dias_vencimento !== undefined ? String(s.dias_vencimento) : "N/A"}
                                onChange={(e) => setTaxasDraft((prev) => ({
                                  ...prev,
                                  [s.id]: { ...draft, dias_vencimento: e.target.value.replace(/\\D/g, "") },
                                }))}
                                className="w-full h-7 rounded-md border border-zinc-200 dark:border-zinc-700 bg-transparent pl-2 pr-8 text-right text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-brand-red/40"
                              />
                              <span className="absolute right-1.5 top-1/2 -translate-y-1/2 text-[10px] opacity-50">dias</span>
                            </span>
                          </label>
`;

content = content.replace(
    /<\/span>\s*<\/label>\s*<\/div>\s*\)\s*\}\)\}/,
    '</span>\n                          </label>\n' + uiHtml + '\n                        </div>\n                      )\n                    })}'
);

fs.writeFileSync(file, content, 'utf8');
console.log('Update finished.');
