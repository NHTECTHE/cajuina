const fs = require('fs');
const path = require('path');

const pages = [
  'src/app/dashboard/corretores/page.tsx',
  'src/app/dashboard/usuarios/page.tsx',
  'src/app/dashboard/segurados/page.tsx',
  'src/app/dashboard/produtores/page.tsx',
  'src/app/dashboard/modalidades/page.tsx',
  'src/app/dashboard/seguradoras/page.tsx',
  'src/app/dashboard/alterar-senha/page.tsx'
];

pages.forEach(pagePath => {
  const fullPath = path.join(__dirname, pagePath);
  if (!fs.existsSync(fullPath)) {
    console.log(`Skipping ${fullPath} - not found`);
    return;
  }
  
  let content = fs.readFileSync(fullPath, 'utf8');

  // 1. Add ArrowLeft import if missing
  if (!content.includes('ArrowLeft')) {
    content = content.replace(/import \{([\s\S]*?)\} from "lucide-react"/, (match, p1) => {
      return `import { ArrowLeft, ${p1.trim()} } from "lucide-react"`;
    });
  }

  // 2. Add useRouter import if missing
  if (!content.includes('useRouter')) {
    content = content.replace(/import \* as React from "react"/, `import * as React from "react"\nimport { useRouter } from "next/navigation"`);
  }

  // 3. Add const router = useRouter() inside export default function
  if (!content.includes('const router = useRouter()')) {
    content = content.replace(/export default function \w+\(\) \{/, match => `${match}\n  const router = useRouter()`);
  }

  // 4. Wrap header and add back button
  // We look for:
  // <div>
  //   <h1 className="text-2xl font-black
  const headerRegex = /(<div>\s*<h1 className="text-2xl font-black)/;
  if (content.match(headerRegex) && !content.includes('<ArrowLeft')) {
    content = content.replace(headerRegex, (match) => {
      return `<div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="w-8 h-8 flex items-center justify-center rounded-lg bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-400 transition-colors cursor-pointer shrink-0">
            <ArrowLeft className="size-4" />
          </button>
          ${match}`;
    });
    
    // Now we need to close the extra div we opened for flex layout.
    // The structure is usually:
    // <div>
    //   <h1>...</h1>
    //   <p>...</p>
    // </div>
    // We need to change the closing </div> to </div></div>
    // To do this safely, we find the <p> block and its closing </div>
    const closingDivRegex = /(<\/p>\s*<\/div>)/;
    if (content.match(closingDivRegex)) {
       content = content.replace(closingDivRegex, `$1\n        </div>`);
    } else {
       // alternative structure without p
       const altClosing = /(<\/h1>\s*<\/div>)/;
       content = content.replace(altClosing, `$1\n        </div>`);
    }
  }

  fs.writeFileSync(fullPath, content, 'utf8');
  console.log(`Updated ${pagePath}`);
});
