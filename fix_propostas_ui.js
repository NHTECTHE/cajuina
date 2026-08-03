const fs = require('fs');
const file = 'src/components/propostas/PropostasPage.tsx';
let content = fs.readFileSync(file, 'utf8');

// The action buttons footer in PropostasPage
// Look for something like:
// flex items-center justify-center gap-2 (mobile view buttons)
// We need to allow them to wrap or shrink

// Let's first read the file to see the structure of the footer
console.log(content.match(/<div[^>]*>[\s\S]*?Emitir[\s\S]*?<\/div>/g));
