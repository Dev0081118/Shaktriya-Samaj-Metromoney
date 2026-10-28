import { test, expect } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const axePath = path.resolve(__dirname, '../node_modules/axe-core/axe.min.js');

const WCAG_AA_OPTIONS = {
  runOnly: {
    type: 'tag',
    values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']
  },
  rules: {
    // Enforce strict WCAG 2.1 AA color contrast (min 4.5:1 ratio for normal text)
    'color-contrast': { enabled: true }
  }
};

async function injectAndRunAxe(page, options = WCAG_AA_OPTIONS) {
  await page.addScriptTag({ path: axePath });
  const results = await page.evaluate(async (opts) => {
    return window.axe.run(document, opts);
  }, options);
  return results;
}

test.describe('Automated Browser Accessibility Scans (axe-core)', () => {
  test('homepage has no critical accessibility violations', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    const results = await injectAndRunAxe(page);
    const criticalViolations = results.violations.filter(
      (v) => v.impact === 'critical' || v.impact === 'serious'
    );
    if (criticalViolations.length > 0) {
      console.log('Homepage violations:', JSON.stringify(criticalViolations.map(v => ({
        id: v.id,
        help: v.help,
        nodes: v.nodes.map(n => ({ html: n.html, target: n.target, failureSummary: n.failureSummary }))
      })), null, 2));
    }
    expect(criticalViolations).toEqual([]);
  });

  test('login page has no critical accessibility violations', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/login');
    await page.waitForLoadState('networkidle');
    const results = await injectAndRunAxe(page);
    const criticalViolations = results.violations.filter(
      (v) => v.impact === 'critical' || v.impact === 'serious'
    );
    if (criticalViolations.length > 0) {
      console.log('Login page violations:', JSON.stringify(criticalViolations.map(v => ({
        id: v.id,
        help: v.help,
        nodes: v.nodes.map(n => ({ html: n.html, target: n.target, failureSummary: n.failureSummary }))
      })), null, 2));
    }
    expect(criticalViolations).toEqual([]);
  });

  test('registration page has no critical accessibility violations', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/register');
    await page.waitForLoadState('networkidle');
    const results = await injectAndRunAxe(page);
    const criticalViolations = results.violations.filter(
      (v) => v.impact === 'critical' || v.impact === 'serious'
    );
    if (criticalViolations.length > 0) {
      console.log('Registration page violations:', JSON.stringify(criticalViolations.map(v => ({
        id: v.id,
        help: v.help,
        nodes: v.nodes.map(n => ({ html: n.html, target: n.target, failureSummary: n.failureSummary }))
      })), null, 2));
    }
    expect(criticalViolations).toEqual([]);
  });
});
