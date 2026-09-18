import puppeteer from "@cloudflare/puppeteer";
import type { ScrapeSummary } from "../types";

interface ScrapeResult {
  html: string;
  screenshot: Uint8Array;
  heroScreenshot: Uint8Array;
  summary: ScrapeSummary;
}

/** Loads the lead's site in a real browser, extracts conversion-relevant content, and screenshots it. */
export async function scrapeSite(browserBinding: Fetcher, url: string): Promise<ScrapeResult> {
  const browser = await puppeteer.launch(browserBinding);
  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 });
    const start = Date.now();
    try {
      await page.goto(url, { waitUntil: "networkidle2", timeout: 20_000 });
    } catch {
      // Fallback if networkidle2 times out due to persistent streams / ads
      try {
        await page.goto(url, { waitUntil: "domcontentloaded", timeout: 15_000 });
        // Give page a short moment to render initial content
        await new Promise((resolve) => setTimeout(resolve, 1500));
      } catch (fallbackErr) {
        throw new Error(`Failed to load URL ${url}: ${fallbackErr instanceof Error ? fallbackErr.message : String(fallbackErr)}`);
      }
    }
    const loadTimeMs = Date.now() - start;

    const html = await page.content();

    const extracted = await page.evaluate(() => {
      const headings = Array.from(document.querySelectorAll("h1, h2, h3"))
        .map((h) => h.textContent?.trim() ?? "")
        .filter(Boolean);
      const imageAltTexts = Array.from(document.querySelectorAll("img")).map(
        (img) => img.getAttribute("alt") ?? "",
      );
      const bodyText = (document.body?.innerText ?? "").slice(0, 6_000);
      const ctaTexts = Array.from(document.querySelectorAll("a, button"))
        .map((el) => el.textContent?.trim() ?? "")
        .filter((t) => t.length > 0 && t.length < 60);
      const title = document.title || null;
      const metaDescription =
        document.querySelector('meta[name="description"]')?.getAttribute("content") ?? null;
      const bodyHtml = document.body?.innerHTML ?? "";
      const phoneMatches = bodyHtml.match(/(\+?\d[\d\-.() ]{7,}\d)/g) ?? [];
      const hasEmailCaptureForm = !!document.querySelector('input[type="email"]');
      return { headings, imageAltTexts, bodyText, ctaTexts, title, metaDescription, phoneMatches, hasEmailCaptureForm };
    });

    // Viewport-only screenshot for the brand-token vision call — Anthropic caps image dimensions at
    // 8000px, which a fullPage screenshot of a long page can exceed.
    const heroScreenshot = (await page.screenshot({ fullPage: false })) as Uint8Array;
    const screenshot = (await page.screenshot({ fullPage: true })) as Uint8Array;

    const summary: ScrapeSummary = {
      title: extracted.title,
      metaDescription: extracted.metaDescription,
      headings: extracted.headings,
      bodyText: extracted.bodyText,
      imageAltTexts: extracted.imageAltTexts,
      ctaTexts: extracted.ctaTexts,
      phoneNumbersFound: extracted.phoneMatches,
      hasEmailCaptureForm: extracted.hasEmailCaptureForm,
      loadTimeMs,
    };

    return { html, screenshot, heroScreenshot, summary };
  } finally {
    await browser.close();
  }
}
