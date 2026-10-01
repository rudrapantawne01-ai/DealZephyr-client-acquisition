// Optional browser QA. Run with a local server and CHROMIUM_PATH if Chromium is not at /usr/bin/chromium.
import assert from 'node:assert/strict';
import { chromium } from 'playwright-core';
const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || '/usr/bin/chromium', headless: true, args: ['--no-sandbox'] });
const errors = [];
try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  page.on('pageerror', error => errors.push(error.message));
  await page.goto(process.env.DEMO_URL || 'http://localhost:3000', { waitUntil: 'networkidle' });
  const logoIsLoaded = async locator => {
    await locator.scrollIntoViewIfNeeded();
    return locator.evaluate(image => new Promise(resolve => {
      const loaded = () => image.complete && image.naturalWidth > 0 && image.naturalHeight > 0;
      if (loaded()) return resolve(true);
      const finish = () => resolve(loaded());
      image.addEventListener('load', finish, { once: true });
      image.addEventListener('error', finish, { once: true });
      setTimeout(finish, 5000);
    }));
  };
  assert.equal(await logoIsLoaded(page.locator('.sidebar .brand-image')), true);
  assert.equal(await logoIsLoaded(page.locator('.app-footer .brand-image')), true);
  assert.match(await page.locator('.fiction-banner').innerText(), /not a DealZephyr client/i);
  const baseRunway = await page.locator('.hero-number').innerText();
  assert.match(await page.locator('.overview-head h1').innerText(), /before you commit/i);
  const timing = page.getByRole('group', { name: 'Move all planned hires' });
  for (const label of ['Now', 'In 30 days', 'In 60 days', 'In 90 days']) {
    await timing.getByRole('button', { name: label, exact: true }).click();
    assert.equal(await timing.getByRole('button', { name: label, exact: true }).getAttribute('class'), 'active');
  }
  assert.notEqual(await page.locator('.hero-number').innerText(), baseRunway);
  await page.getByRole('button', { name: 'Run 60-second demo' }).click();
  assert.equal(await page.locator('.hero-number').innerText(), baseRunway);
  for (let step = 1; step < 5; step++) {
    await page.locator('.guided-card').getByRole('button', { name: 'Next' }).click();
    assert.match(await page.locator('.guided-progress').innerText(), new RegExp(`STEP ${step + 1} / 5`));
  }
  assert.match(await page.locator('.decision-takeaway').innerText(), /OPTION C/);
  assert.equal(await logoIsLoaded(page.locator('.topbar .brand-image')), true);
  await page.locator('.guided-card').getByRole('button', { name: 'Finish' }).click();
  await page.getByRole('button', { name: 'Exit presentation' }).click();
  await page.getByRole('button', { name: 'Scenario Lab', exact: true }).click();
  const live = () => page.locator('.live-runway').innerText();
  await page.getByLabel('Monthly revenue growth').fill('1');
  assert.notEqual(await live(), baseRunway);
  await page.locator('.side-scenarios').getByRole('button', { name: 'Base Plan' }).click();
  await page.getByLabel('Revenue downside').fill('8');
  assert.notEqual((await live()).split('\n')[0], baseRunway);
  await page.locator('.side-scenarios').getByRole('button', { name: 'Base Plan' }).click();
  await page.getByLabel('Core gross margin').fill('70');
  assert.notEqual((await live()).split('\n')[0], baseRunway);
  await page.locator('.side-scenarios').getByRole('button', { name: 'Base Plan' }).click();
  await page.getByLabel('Cloud / infrastructure').fill('50000');
  assert.notEqual((await live()).split('\n')[0], baseRunway);
  await page.locator('.side-scenarios').getByRole('button', { name: 'Base Plan' }).click();
  await page.getByLabel('Current cash').fill('1900000');
  assert.notEqual((await live()).split('\n')[0], baseRunway);
  await page.locator('.side-scenarios').getByRole('button', { name: 'Base Plan' }).click();
  await page.getByLabel('Other operating expenses').fill('200000');
  assert.notEqual((await live()).split('\n')[0], baseRunway);
  await page.locator('.side-scenarios').getByRole('button', { name: 'Base Plan' }).click();
  await page.getByLabel('Number of planned hires').fill('8');
  assert.equal(await page.locator('.hire-card').count(), 8);
  await page.getByLabel('Start month').first().fill('2026-10');
  await page.getByLabel('Fully loaded / month').first().fill('16000');
  await page.getByLabel('Role').first().fill('Enterprise Account Executive');
  await page.getByLabel('Department').first().selectOption('Sales');
  assert.notEqual((await live()).split('\n')[0], baseRunway);
  await page.locator('.side-scenarios').getByRole('button', { name: 'Base Plan' }).click();
  await page.getByRole('checkbox').check();
  await page.getByLabel('Fundraise month').fill('2027-05');
  await page.getByLabel('Amount').fill('3000000');
  assert.notEqual((await live()).split('\n')[0], baseRunway);
  await page.getByRole('checkbox').uncheck();
  assert.equal((await live()).split('\n')[0], baseRunway);
  await page.getByLabel('Cloud / infrastructure').fill('30000');
  await page.getByRole('button', { name: 'Save this scenario' }).click();
  await page.getByRole('dialog', { name: 'Save scenario' }).getByLabel('Scenario name').fill('Sales call example');
  await page.getByRole('dialog', { name: 'Save scenario' }).getByRole('button', { name: 'Save scenario' }).click();
  assert.ok((await page.locator('.side-scenarios').innerText()).includes('Sales call example'));
  for (const name of ['Aggressive Hiring', 'Delayed Hiring', 'Revenue Downside', 'Hiring + Revenue Downside']) {
    await page.locator('.side-scenarios').getByRole('button', { name, exact: true }).click();
    assert.ok((await page.locator('.live-top').innerText()).includes(name));
  }
  await page.getByRole('button', { name: 'Decision', exact: true }).click();
  assert.equal(await page.locator('.option-card').count(), 3);
  assert.match(await page.locator('.decision-takeaway').innerText(), /revenue downside/i);
  assert.match(await page.locator('.decision-takeaway').innerText(), /OPTION C/);
  await page.getByRole('button', { name: 'Decision Brief' }).click();
  assert.equal(await logoIsLoaded(page.locator('.brief-top .brand-image')), true);
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
  await mobile.getByRole('button', { name: 'Run 60-second demo' }).click();
  assert.equal(await mobile.evaluate(() => document.body.scrollWidth <= innerWidth), true);
  await mobile.locator('.guided-card').getByRole('button', { name: 'Skip' }).click();
  await mobile.getByRole('button', { name: 'Exit presentation' }).click();
  await mobile.getByRole('button', { name: 'Open menu' }).click();
  await mobile.getByRole('button', { name: 'Scenario Lab', exact: true }).click();
  assert.equal(await mobile.evaluate(() => document.body.scrollWidth <= innerWidth), true);
  assert.deepEqual(errors, []);
  console.log('Browser smoke QA passed: controls, presets, decision, print, presentation and mobile.');
} finally { await browser.close(); }
