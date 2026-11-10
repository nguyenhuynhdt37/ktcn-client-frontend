import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import {test} from 'node:test';
import {fileURLToPath} from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const manifest = JSON.parse(await fs.readFile(path.join(root, 'licenses/fonts/manifest.json'), 'utf8'));

test('vendored WOFF2 fonts retain their verified Google Fonts bytes and licenses', async () => {
  for (const font of manifest) {
    const bytes = await fs.readFile(path.join(root, 'public', font.file));
    assert.equal(bytes.subarray(0, 4).toString(), 'wOF2', font.file);
    assert.equal(bytes.length, font.bytes, font.file);
    assert.equal(createHash('sha256').update(bytes).digest('hex'), font.sha256, font.file);
    assert(font.file.includes(font.sha256.slice(0, 16)), 'Immutable font URLs must contain their content hash');
    assert.match(await fs.readFile(path.join(root, font.license), 'utf8'), /SIL OPEN FONT LICENSE/);
  }
});

test('all subset declarations and preloads resolve to vendored files', async () => {
  const css = await fs.readFile(path.join(root, 'src/styles/fonts.css'), 'utf8');
  const preloads = await fs.readFile(path.join(root, 'src/shared/components/layout/font-preloads.tsx'), 'utf8');
  const paths = new Set(manifest.map(font => font.file));
  assert(!css.includes('https://'), 'Font styles must not request external assets');
  for (const match of css.matchAll(/url\(([^)]+)\)/g)) assert(paths.has(match[1]), match[1]);
  for (const font of manifest) {
    const faces = [...css.matchAll(/@font-face\s*\{[^}]+\}/g)].map(match => match[0]).filter(face => face.includes(font.file));
    assert(faces.length > 0, `Missing face: ${font.file}`);
    assert(faces.every(face => face.match(/unicode-range:\s*([^;}]+)/)?.[1].replace(/\s/g, '') === font.unicodeRange.replace(/\s/g, '')), font.file);
    assert.equal(preloads.includes(font.file), font.preload, font.file);
  }
});
