import assert from 'node:assert/strict';
import { test } from 'node:test';
import { sanitizeRichHtml, serializeJsonLd } from '../src/shared/lib/security.ts';

test('CMS HTML removes executable markup and dangerous URL schemes', () => {
  const clean = sanitizeRichHtml('<p>Hello</p><script>bad()</script><img src="/logo.png" onerror="bad()"><a href="jav&#x61;script:bad()">link</a><svg onload="bad()"></svg><iframe srcdoc="<script>bad()</script>"></iframe>');
  assert.ok(clean.includes('<p>Hello</p>'));
  assert.ok(clean.includes('src="/logo.png"'));
  assert.doesNotMatch(clean, /<script|onerror|javascript:|<svg|srcdoc/);
});

test('CMS formatting, table structure and approved video embeds survive', () => {
  const clean = sanitizeRichHtml('<h2 id="section">Tiêu đề</h2><p style="text-align:center;color:#123456">Nội dung</p><table><tbody><tr><td colspan="2">Cell</td></tr></tbody></table><iframe src="https://www.youtube.com/embed/test"></iframe>');
  assert.match(clean, /id="section"/);
  assert.match(clean, /text-align:center/);
  assert.match(clean, /colspan="2"/);
  assert.match(clean, /https:\/\/www.youtube.com\/embed\/test/);
  assert.doesNotMatch(sanitizeRichHtml('<iframe src="https://evil.example/"></iframe>'), /src="https:\/\/evil/);
});

test('JSON-LD cannot terminate its script element and preserves JSON data', () => {
  const data = { title: '</script><script>bad()</script>', unicode: 'Tiếng Việt' };
  const serialized = serializeJsonLd(data);
  assert.doesNotMatch(serialized, /</);
  assert.deepEqual(JSON.parse(serialized), data);
});
