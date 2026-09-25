// assets/manifest.json 생성: node tools/gen-manifest.mjs
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const out = [];
for (const dir of ['images', 'data', 'videos']) {
  const d = path.join(root, 'assets', dir);
  if (!fs.existsSync(d)) continue;
  for (const f of fs.readdirSync(d).sort()) if (!f.startsWith('.')) out.push(`${dir}/${f}`);
}
fs.writeFileSync(path.join(root, 'assets', 'manifest.json'), JSON.stringify(out, null, 1) + '\n');
console.log(`manifest: ${out.length} files`);
