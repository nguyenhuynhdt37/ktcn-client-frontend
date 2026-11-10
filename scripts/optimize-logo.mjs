import assert from "node:assert/strict";
import { readFile, mkdir, writeFile } from "node:fs/promises";
import sharp from "sharp";

// The supplied SVG contains a bitmap, so a vector minifier cannot reduce it.
const svgPath = new URL("../public/images/logo.svg", import.meta.url);
const svg = await readFile(svgPath, "utf8");
const embedded = svg.match(/data:image\/(?:png|webp);base64,([^"']+)/);
assert(embedded, "Expected the existing embedded logo bitmap");
const source = Buffer.from(embedded[1], "base64");
const fullSize = await sharp(source).webp({ lossless: true, effort: 6 }).toBuffer();

// WebP may clear RGB in fully transparent pixels; visible RGBA must be exact.
const before = await sharp(source).ensureAlpha().raw().toBuffer();
const after = await sharp(fullSize).ensureAlpha().raw().toBuffer();
assert.equal(before.length, after.length);
for (let offset = 0; offset < before.length; offset += 4) {
  assert.equal(before[offset + 3], after[offset + 3]);
  if (before[offset + 3] > 0) {
    assert(before.subarray(offset, offset + 3).equals(after.subarray(offset, offset + 3)));
  }
}

const assets = new URL("../src/shared/assets/", import.meta.url);
await mkdir(assets, { recursive: true });
for (const width of [320, 480, 640, 960, 1280, 2048]) {
  const image = width === 2048 ? fullSize : await sharp(fullSize).resize(width).webp({ lossless: true, effort: 6 }).toBuffer();
  await writeFile(new URL(`logo-${width}.webp`, assets), image);
  console.log(`logo-${width}.webp: ${image.length} bytes`);
}

await writeFile(svgPath, svg.replace(embedded[0], `data:image/webp;base64,${fullSize.toString("base64")}`));
console.log(`SVG: ${Buffer.byteLength(svg)} → ${Buffer.byteLength(await readFile(svgPath, "utf8"))} bytes; visible pixels unchanged`);
