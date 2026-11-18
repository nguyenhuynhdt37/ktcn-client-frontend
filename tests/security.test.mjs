import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  buildCspReportOnlyHeader,
  safePortalHref,
  sanitizeRichHtml,
  serializeJsonLd,
} from '../src/shared/lib/security.ts';

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

test('safePortalHref permits safe portal routes/protocols and blocks dangerous URLs', () => {
  assert.equal(safePortalHref('/tin-tuc?page=1#top'), '/tin-tuc?page=1#top');
  assert.equal(safePortalHref('#tuyen-sinh'), '#tuyen-sinh');
  assert.equal(safePortalHref('https://ktcn.vinhuni.edu.vn/path'), 'https://ktcn.vinhuni.edu.vn/path');
  assert.equal(safePortalHref('mailto:ktcn@vinhuni.edu.vn'), 'mailto:ktcn@vinhuni.edu.vn');
  assert.equal(safePortalHref('tel:+842383855452'), 'tel:+842383855452');

  assert.equal(safePortalHref('javascript:alert(1)'), '#');
  assert.equal(safePortalHref('data:text/html,<script>alert(1)</script>'), '#');
  assert.equal(safePortalHref('vbscript:msgbox(1)'), '#');
  assert.equal(safePortalHref('//evil.example/phish'), '#');
  assert.equal(safePortalHref('/\\evil.example/phish'), '#');
  assert.equal(safePortalHref('java\tscript:alert(1)'), '#');
  assert.equal(safePortalHref('', '/vi'), '/vi');
  assert.equal(safePortalHref(null, '/vi'), '/vi');
});

test('buildCspReportOnlyHeader includes nonce when provided and restricts dangerous directives', () => {
  const withNonce = buildCspReportOnlyHeader({
    nonce: 'testNonce123==',
    isDev: false,
    apiOrigin: 'https://api.itup.io.vn/v1',
  });
  assert.match(withNonce, /script-src 'self' 'nonce-testNonce123==' https:\/\/www\.googletagmanager\.com/);
  assert.doesNotMatch(withNonce, /'unsafe-eval'/);
  assert.match(withNonce, /connect-src [^;]*https:\/\/api\.itup\.io\.vn/);
  assert.match(withNonce, /object-src 'none'/);
  assert.match(withNonce, /frame-ancestors 'none'/);

  const fallback = buildCspReportOnlyHeader({ isDev: true });
  assert.match(fallback, /script-src 'self' 'unsafe-inline'/);
  assert.match(fallback, /'unsafe-eval'/);
});
