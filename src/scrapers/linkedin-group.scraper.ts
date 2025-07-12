import { Page } from 'puppeteer';
import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';

puppeteer.use(StealthPlugin());

/**
 * מבצע גלילה מדורגת חכמה לדף כדי לטעון עוד פוסטים
 */
async function autoScroll(page: Page, maxAttempts: number = 10, delay: number = 1500): Promise<void> {
  let previousHeight = await page.evaluate(() => document.body.scrollHeight);
  for (let i = 0; i < maxAttempts; i++) {
    await page.evaluate(() => window.scrollBy(0, window.innerHeight));
    await new Promise(resolve => setTimeout(resolve, delay));
    const newHeight = await page.evaluate(() => document.body.scrollHeight);
    if (newHeight === previousHeight) break;
    previousHeight = newHeight;
  }
}

/**
 * שליפת טקסטים מקבוצת לינקדאין
 * @param groupUrl כתובת URL של קבוצת לינקדאין
 * @param email אימייל חשבון
 * @param password סיסמה לחשבון
 * @returns מערך פוסטים טקסטואליים
 */
export async function scrapeLinkedInGroupPosts(
  groupUrl: string,
  email: string,
  password: string
): Promise<string[]> {
  console.log("🚀 Launching browser...");
  const browser = await puppeteer.launch({
    headless: process.env.HEADLESS !== 'false',
    defaultViewport: { width: 1280, height: 800 },
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();

  try {
    console.log("🔐 Logging in to LinkedIn...");
    await page.goto('https://www.linkedin.com/login', { waitUntil: 'networkidle2' });

    await page.type('#username', email, { delay: 50 });
    await page.type('#password', password, { delay: 50 });

    await Promise.all([
      page.click('button[type="submit"]'),
      page.waitForNavigation({ waitUntil: 'networkidle2' }),
    ]);

    if (page.url().includes('/checkpoint')) {
      throw new Error("❌ Login checkpoint – authentication failed");
    }

    console.log("📥 Navigating to group page...");
    await page.goto(groupUrl, { waitUntil: 'networkidle2' });

    console.log("📜 Scrolling to load posts...");
    await autoScroll(page);

    console.log("🔍 Extracting post texts...");
    const posts = await page.evaluate(() => {
      const elements = Array.from(
        document.querySelectorAll('[data-test-post-container], .feed-shared-update-v2')
      );

      return elements
        .map(el => (el as HTMLElement).innerText.trim())
        .filter(Boolean);
    });

    console.log(`✅ Found ${posts.length} posts`);
    return posts;
  } catch (err) {
    console.error('[❌ scrapeLinkedInGroupPosts] Error:', err);
    throw err; // כדי שיתפוס למעלה
  } finally {
    await browser.close();
    console.log("🧹 Browser closed");
  }
}
