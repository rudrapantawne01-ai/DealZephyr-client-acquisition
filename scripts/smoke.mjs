// Optional browser QA. Run with a local server and CHROMIUM_PATH if Chromium is not at /usr/bin/chromium.
import assert from 'node:assert/strict';
import { chromium } from 'playwright-core';
const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || '/usr/bin/chromium', headless: true, args: ['--no-sandbox'] });
const errors = [];
try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  page.on('pageerror', error => errors.push(error.message));
  await page.goto(process.env.DEMO_URL || 'http://localhost:3000', { waitUntil: 'networkidle' });
  assert.match(await page.locator('.fiction-banner').innerText(), /not a DealZephyr client/i);
  const baseRunway = await page.locator('.hero-number').innerText();
  await page.getByRole('button', { name: 'Scenario Lab', exact: true }).click();
  const live = () => page.locator('.live-runway').innerText();
  await page.getByLabel('Monthly revenue growth').fill('1');
  assert.notEqual(await live(), baseRunway);
  await page.locator('.side-scenarios').getByRole('button', { name: 'Base Plan' }).click();
  await page.getByLabel('Cloud / infrastructure').fill('50000');
  assert.notEqual((await live()).split('\n')[0], baseRunway);
  await page.locator('.side-scenarios').getByRole('button', { name: 'Base Plan' }).click();
  await page.getByLabel('Number of planned hires').fill('8');
  assert.equal(await page.locator('.hire-card').count(), 8);
  await page.getByLabel('Start month').first().fill('2026-10');
  await page.getByLabel('Fully loaded / month').first().fill('16000');
  assert.notEqual((await live()).split('\n')[0], baseRunway);
  await page.locator('.side-scenarios').getByRole('button', { name: 'Base Plan' }).click();
  await page.getByRole('checkbox').check();
  await page.getByLabel('Amount').fill('3000000');
  assert.notEqual((await live()).split('\n')[0], baseRunway);
  for (const name of ['Aggressive Hiring', 'Delayed Hiring', 'Revenue Downside', 'Hiring + Revenue Downside']) {
    await page.locator('.side-scenarios').getByRole('button', { name, exact: true }).click();
    assert.ok((await page.locator('.live-top').innerText()).includes(name));
  }
  await page.getByRole('button', { name: 'Decision', exact: true }).click();
  assert.equal(await page.locator('.option-card').count(), 3);
  await page.getByRole('button', { name: 'Decision Brief' }).click();
  assert.match(await page.locator('.brief-disclaimer').innerText(), /fictional company/i);
  await page.emulateMedia({ media: 'print' });
  assert.equal(await page.locator('.brief-toolbar').evaluate(el => getComputedStyle(el).display), 'none');
  assert.ok((await page.pdf({ format: 'A4', printBackground: true })).length > 10_000);
  await page.emulateMedia({ media: 'screen' });
  await page.getByRole('button', { name: 'Presentation mode' }).click();
  assert.equal(await page.locator('.sidebar').evaluate(el => getComputedStyle(el).display), 'none');
  await page.locator('.presenter-bar').getByRole('button', { name: 'Base', exact: true }).click();
  assert.equal(await page.locator('.hero-number').innerText(), baseRunway);
  const mobile = await browser.newPage({ viewport: { width: 390, height: 844 } });
  mobile.on('pageerror', error => errors.push(error.message));
  await mobile.goto(process.env.DEMO_URL || 'http://localhost:3000', { waitUntil: 'networkidle' });
  assert.equal(await mobile.evaluate(() => document.body.scrollWidth <= innerWidth), true);
  await mobile.getByRole('button', { name: 'Open menu' }).click();
  await mobile.getByRole('button', { name: 'Scenario Lab', exact: true }).click();
  assert.equal(await mobile.evaluate(() => document.body.scrollWidth <= innerWidth), true);
  assert.deepEqual(errors, []);
  console.log('Browser smoke QA passed: controls, presets, decision, print, presentation and mobile.');
} finally { await browser.close(); }
