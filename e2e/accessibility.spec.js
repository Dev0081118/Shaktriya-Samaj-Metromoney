import { test, expect } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const axePath = path.resolve(__dirname, '../node_modules/axe-core/axe.min.js');

async function injectAndRunAxe(page, options = {}) {
  await page.addScriptTag({ path: axePath });
  const results = await page.evaluate(async (opts) => {
    return window.axe.run(document, opts);
  }, options);
  return results;
}

test.describe('Automated Browser Accessibility Scans (axe-core)', () => {
  test('homepage has no critical structural accessibility violations', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    const results = await injectAndRunAxe(page, {
      rules: {
        'color-contrast': { enabled: false }
      }
    });
    const criticalViolations = results.violations.filter(
      (v) => v.impact === 'critical' || v.impact === 'serious'
    );
    expect(criticalViolations).toEqual([]);
  });

  test('login page has no critical structural accessibility violations', async ({ page }) => {
    await page.goto('/login');
    await page.waitForLoadState('networkidle');
    const results = await injectAndRunAxe(page, {
      rules: {
        'color-contrast': { enabled: false }
      }
    });
    const criticalViolations = results.violations.filter(
      (v) => v.impact === 'critical' || v.impact === 'serious'
    );
    expect(criticalViolations).toEqual([]);
  });

  test('registration page has no critical structural accessibility violations', async ({ page }) => {
    await page.goto('/register');
    await page.waitForLoadState('networkidle');
    const results = await injectAndRunAxe(page, {
      rules: {
        'color-contrast': { enabled: false }
      }
    });
    const criticalViolations = results.violations.filter(
      (v) => v.impact === 'critical' || v.impact === 'serious'
    );
    expect(criticalViolations).toEqual([]);
  });
});
