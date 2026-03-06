const { chromium } = require('@playwright/test');

const APP_URL = process.env.APP_URL || 'http://localhost:3000';

async function run() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  try {
    await page.goto(APP_URL, { waitUntil: 'networkidle' });

    const checks = await page.evaluate(() => {
      const hasHeader = Boolean(document.querySelector('header'));
      const hasMain = Boolean(document.querySelector('main'));
      const hasFooter = Boolean(document.querySelector('footer'));
      const hasH1 = Boolean(document.querySelector('h1'));
      const hasNav = Boolean(document.querySelector('nav'));

      const focusable = Array.from(
        document.querySelectorAll(
          'a[href], button, input, select, textarea, [tabindex]:not([tabindex="-1"])'
        )
      ).filter((element) => {
        const style = window.getComputedStyle(element);
        return (
          style.display !== 'none' &&
          style.visibility !== 'hidden' &&
          !element.hasAttribute('disabled')
        );
      });

      return {
        hasHeader,
        hasMain,
        hasFooter,
        hasH1,
        hasNav,
        focusableCount: focusable.length,
        pageTitle: document.title,
      };
    });

    let tabMoves = 0;
    for (let index = 0; index < 8; index++) {
      await page.keyboard.press('Tab');
      const focusedTag = await page.evaluate(() => document.activeElement?.tagName || '');
      if (focusedTag) {
        tabMoves++;
      }
    }

    const pass =
      checks.hasHeader &&
      checks.hasMain &&
      checks.hasFooter &&
      checks.hasH1 &&
      checks.hasNav &&
      checks.focusableCount > 0 &&
      tabMoves > 0;

    console.log('=== Accessibility Smoke Check ===');
    console.log(`URL: ${APP_URL}`);
    console.log(`Title: ${checks.pageTitle}`);
    console.log(`Header: ${checks.hasHeader}`);
    console.log(`Main: ${checks.hasMain}`);
    console.log(`Footer: ${checks.hasFooter}`);
    console.log(`Nav: ${checks.hasNav}`);
    console.log(`H1: ${checks.hasH1}`);
    console.log(`Focusable elements: ${checks.focusableCount}`);
    console.log(`Keyboard tab moves observed: ${tabMoves}`);

    if (!pass) {
      console.error('❌ Accessibility smoke check FAILED');
      process.exit(1);
    }

    console.log('✅ Accessibility smoke check PASSED');
  } finally {
    await browser.close();
  }
}

run().catch((error) => {
  console.error('❌ Accessibility smoke check error:', error);
  process.exit(1);
});
