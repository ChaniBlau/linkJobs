import { Page } from 'puppeteer';
import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import logger from '../utils/logger';

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
 * Logs into a LinkedIn account, navigates to a specific group URL,
 * scrolls through the page to load additional posts,
 * and extracts the text content from all visible posts.
 *
 * @param {string} groupUrl - The URL of the LinkedIn group to scrape.
 * @param {string} email - The email address used to log in to LinkedIn.
 * @param {string} password - The password used to log in to LinkedIn.
 * @returns {Promise<string[]>} An array of post texts extracted from the group page.
 *
 * @throws {Error} If login fails or the page structure is unexpected.
 */

export async function scrapeLinkedInGroupPosts(
  groupUrl: string,
  email: string,
  password: string
): Promise<string[]> {
  logger.info("🚀 Launching browser...")
  const browser = await puppeteer.launch({
    headless: process.env.HEADLESS !== 'false',
    defaultViewport: { width: 1280, height: 800 },
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();

  try {
    logger.info("🔐 Logging in to LinkedIn...")
    await page.goto('https://www.linkedin.com/login', { waitUntil: 'networkidle2' });

    await page.type('#username', email, { delay: 50 });
    await page.type('#password', password, { delay: 50 });

    await Promise.all([
      page.click('button[type="submit"]'),
      page.waitForNavigation({ waitUntil: 'networkidle2' }),
    ]);

    if (page.url().includes('/checkpoint')) {
      logger.error("❌ Login checkpoint – authentication failed");
      throw new Error("❌ Login checkpoint – authentication failed");
    }

    logger.info("📥 Navigating to group page...");
    await page.goto(groupUrl, { waitUntil: 'networkidle2' });

    logger.info("📜 Scrolling to load posts...");
    await autoScroll(page);

    logger.info("🔍 Extracting post texts...");
    const posts = await page.evaluate(() => {
      const elements = Array.from(
        document.querySelectorAll('[data-test-post-container], .feed-shared-update-v2')
      );

      return elements
        .map(el => (el as HTMLElement).innerText.trim())
        .filter(Boolean);
    });

    logger.info(`✅ Found ${posts.length} posts`);
    return posts;
  } catch (err) {
    logger.error('[❌ scrapeLinkedInGroupPosts] Error:', err);
    throw err; 
  } finally {
    await browser.close();
    logger.info("🧹 Browser closed");
  }
}
