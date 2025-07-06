import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';

// הוספת תוסף להסתרת סימנים של דפדפן אוטומטי
puppeteer.use(StealthPlugin());

/**
 * שליפת פוסטים מקבוצת לינקדאין
 * @param groupUrl כתובת URL של קבוצת לינקדאין (מלאה, כולל https)
 * @param email אימייל חשבון לינקדאין
 * @param password סיסמה לחשבון
 * @returns מערך של טקסטים מתוך פוסטים בקבוצה
 */
export async function scrapeLinkedInGroupPosts(
  groupUrl: string,
  email: string,
  password: string
): Promise<string[]> {
  const browser = await puppeteer.launch({
    headless: false, // true לריצה ברקע
    defaultViewport: { width: 1280, height: 800 },
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();

  try {
    // שלב 1: התחברות ללינקדאין
    await page.goto('https://www.linkedin.com/login', {
      waitUntil: 'networkidle2',
    });

    await page.type('#username', email, { delay: 50 });
    await page.type('#password', password, { delay: 50 });

    await Promise.all([
      page.click('button[type="submit"]'),
      page.waitForNavigation({ waitUntil: 'networkidle2' }),
    ]);

    // שלב 2: מעבר לדף הקבוצה
    await page.goto(groupUrl, { waitUntil: 'networkidle2' });

    // שלב 3: גלילה מדורגת לטעינת פוסטים
    for (let i = 0; i < 5; i++) {
      await page.evaluate(() => window.scrollBy(0, window.innerHeight));
      await new Promise(resolve => setTimeout(resolve, 1500));
    }

    // שלב 4: שליפת טקסטים מהפוסטים
    const posts = await page.evaluate(() => {
      const elements = Array.from(
        document.querySelectorAll('[data-test-post-container], .feed-shared-update-v2')
      );

      return elements
        .map(el => (el as HTMLElement).innerText.trim())
        .filter(Boolean);
    });

    return posts;
  } catch (err) {
    console.error('[scrapeLinkedInGroupPosts] Error:', err);
    return [];
  } finally {
    await browser.close();
  }
}
