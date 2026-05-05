const fs = require('fs');
const path = require('path');

const tsconfigPath = path.join(__dirname, '..', 'node_modules', 'mongodb', 'tsconfig.json');

if (!fs.existsSync(tsconfigPath)) {
  console.log('[postinstall] mongodb tsconfig not found, skipping patch.');
  process.exit(0);
}

let content = fs.readFileSync(tsconfigPath, 'utf8');
let changed = false;

if (!content.includes('"ignoreDeprecations": "6.0"')) {
  const next = content.replace(
    /("moduleResolution"\s*:\s*"node"\s*,)/,
    '$1\n    "ignoreDeprecations": "6.0",'
  );
  if (next !== content) {
    content = next;
    changed = true;
  }
}

if (!content.includes('"rootDir": "./src"')) {
  const next = content.replace(
    /("outDir"\s*:\s*"lib"\s*,)/,
    '"rootDir": "./src",\n    $1'
  );
  if (next !== content) {
    content = next;
    changed = true;
  }
}

if (changed) {
  fs.writeFileSync(tsconfigPath, content, 'utf8');
  console.log('[postinstall] patched mongodb tsconfig for TypeScript 6 diagnostics compatibility.');
} else {
  console.log('[postinstall] mongodb tsconfig already compatible.');
}
