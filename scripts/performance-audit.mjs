import fs from 'node:fs/promises';
import path from 'node:path';
import { createRequire } from "node:module";
import { pathToFileURL } from "node:url";
const toolRequire = createRequire(path.resolve(process.env.PERF_TOOLS_DIR || ".", "package.json"));
const {default: lighthouse} = await import(pathToFileURL(toolRequire.resolve("lighthouse")).href);
const {default: desktopConfig} = await import(pathToFileURL(toolRequire.resolve("lighthouse/core/config/desktop-config.js")).href);
const {launch} = await import(pathToFileURL(createRequire(toolRequire.resolve("lighthouse")).resolve("chrome-launcher")).href);

const [url, label, count = '3', deviceFilter] = process.argv.slice(2);
if (!url || !label) throw new Error('Usage: node audit.mjs URL LABEL [RUNS]');
const directory = path.resolve(process.env.PERF_ARTIFACTS_DIR || '.performance-reports', label);
await fs.mkdir(directory, { recursive: true });
const summaries = [];
for (const device of ['mobile', 'desktop']) {
  if (deviceFilter && device !== deviceFilter) continue;
  for (let run = 1; run <= Number(count); run++) {
    const chrome = await launch({ chromePath: process.env.CHROME_PATH, chromeFlags: ['--headless=new', '--disable-extensions', '--no-first-run', '--no-default-browser-check'] });
    try {
      const result = await lighthouse(url, { port: chrome.port, output: ['json', 'html'], logLevel: 'error', onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'], ...(process.env.PERF_BLOCK ? {blockedUrlPatterns:process.env.PERF_BLOCK.split(',')} : {}) }, device === 'desktop' ? desktopConfig : undefined);
      const stem = path.join(directory, `${device}-${run}`);
      await fs.writeFile(`${stem}.json`, result.report[0]);
      await fs.writeFile(`${stem}.html`, result.report[1]);
      if (run === 1) {
        await fs.writeFile(`${stem}.trace.json`, JSON.stringify(result.artifacts.Trace));
        await fs.writeFile(`${stem}.devtools.json`, JSON.stringify(result.artifacts.DevtoolsLog));
      }
      const audits = result.lhr.audits;
      const summary = { label, device, actualFormFactor: result.lhr.configSettings.formFactor, screenEmulation: result.lhr.configSettings.screenEmulation, run, url: result.lhr.finalDisplayedUrl, lighthouse: result.lhr.lighthouseVersion, chrome: result.lhr.environment.hostUserAgent, scores: Object.fromEntries(Object.entries(result.lhr.categories).map(([key, value]) => [key, value.score * 100])), fcp: audits['first-contentful-paint'].numericValue, lcp: audits['largest-contentful-paint'].numericValue, tbt: audits['total-blocking-time'].numericValue, cls: audits['cumulative-layout-shift'].numericValue, speedIndex: audits['speed-index'].numericValue, mainThread: audits['mainthread-work-breakdown']?.numericValue, bytes: audits['total-byte-weight']?.numericValue, warnings: result.lhr.runWarnings, error: result.lhr.runtimeError };
      if (summary.actualFormFactor !== device) throw new Error('Unexpected Lighthouse form factor');
      summaries.push(summary);
      await fs.writeFile(path.join(directory, 'summary.json'), JSON.stringify(summaries, null, 2));
      console.log(JSON.stringify(summary));
    } finally { await chrome.kill(); }
  }
}
