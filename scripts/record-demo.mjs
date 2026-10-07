import { chromium, expect } from "@playwright/test";
import { mkdir, writeFile } from "node:fs/promises";
// Records the public sample workspace only. Start pnpm dev before running.
const baseURL = "http://localhost:3000";
await mkdir(".local-tools/video", { recursive: true });
const browser = await chromium.launch();
const context = await browser.newContext({
  viewport: { width: 1280, height: 800 },
  recordVideo: {
    dir: ".local-tools/video",
    size: { width: 1280, height: 800 },
  },
  reducedMotion: "reduce",
});
const page = await context.newPage(),
  recordingStarted = Date.now();
try {
  await page.goto(`${baseURL}/demo`);
  await page.evaluate(() => document.fonts.ready);
  await page.locator(".dashboard-hero img").waitFor();
  await page.waitForTimeout(600);
  const trimStart = (Date.now() - recordingStarted) / 1000,
    started = Date.now();
  const hold = async (seconds) =>
    page.waitForTimeout(Math.max(0, seconds * 1000 - (Date.now() - started)));
  await page.screenshot({ path: "public/studio-demo-poster.png" });
  await hold(7);
  await page
    .getByRole("navigation", { name: "Studio navigation" })
    .getByRole("link", { name: "Brand kits", exact: true })
    .click();
  await page
    .getByRole("button", { name: "New brand kit", exact: true })
    .click();
  await page.getByLabel("Brand name", { exact: true }).fill("Bloom Ritual");
  await page.getByLabel("Industry", { exact: true }).fill("Skincare");
  await page
    .getByLabel("Audience", { exact: true })
    .fill("Mindful shoppers seeking a simple morning ritual");
  await page
    .getByLabel("Brand voice", { exact: true })
    .fill("Warm, minimal, thoughtful. Honest product claims.");
  await hold(15);
  await page
    .getByRole("button", { name: "Save brand kit", exact: true })
    .click();
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await hold(18);
  await page.goto(`${baseURL}/demo?view=new`);
  await page.getByRole("button", { name: "New project", exact: true }).click();
  await page
    .getByLabel("Project name", { exact: true })
    .fill("Daily Glow launch");
  await page
    .getByLabel("Description", { exact: true })
    .fill("Introduce our daily skincare ritual.");
  await page
    .getByRole("button", { name: "Create project", exact: true })
    .click();
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await page
    .getByLabel("Campaign name", { exact: true })
    .fill("A little glow. A lot of you.");
  await page
    .getByLabel("Project", { exact: true })
    .selectOption({ label: "Daily Glow launch" });
  await page
    .getByLabel("Brand kit", { exact: true })
    .selectOption({ label: "Bloom Ritual" });
  await page
    .getByLabel("Tell us about your product")
    .fill(
      "Daily Glow serum: a considered skincare step for a simple morning ritual. 30 ml bottle. Avoid invented efficacy claims or discounts.",
    );
  await page.getByLabel("Campaign goal").selectOption("Product launch");
  await page
    .getByRole("button", { name: "Create campaign draft" })
    .scrollIntoViewIfNeeded();
  await hold(32);
  await page.getByRole("button", { name: "Create campaign draft" }).click();
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "A little glow. A lot of you.",
  );
  await page.getByRole("button", { name: "Generate demo package" }).click();
  await page
    .getByRole("heading", { name: "Campaign strategy", exact: true })
    .waitFor();
  await page.evaluate(() => scrollTo(0, 0));
  await hold(45);
  await page.getByRole("tab", { name: "Ad copy", exact: true }).click();
  await hold(54);
  await page.getByRole("tab", { name: "Visual prompts", exact: true }).click();
  await hold(60);
  await page.getByRole("button", { name: "Add sample visual" }).first().click();
  await page.locator(".asset-card").first().waitFor();
  await hold(65);
  await page
    .getByRole("button", { name: "Save campaign", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Export package", exact: true })
    .click();
  await hold(69);
  await page
    .getByRole("navigation", { name: "Studio navigation" })
    .getByRole("link", { name: "Campaigns AI", exact: true })
    .click();
  await hold(72);
  await page
    .getByRole("navigation", { name: "Studio navigation" })
    .getByRole("link", { name: "Overview", exact: true })
    .click();
  await hold(75);
  await context.close();
  await writeFile(
    ".local-tools/video/recording.json",
    JSON.stringify(
      { path: await page.video().path(), trimStart, duration: 75 },
      null,
      2,
    ),
  );
  console.info(
    "Recording complete. Encode the recorded WebM to public/studio-demo.mp4 using FFmpeg; details in .local-tools/video/recording.json.",
  );
} catch (error) {
  await page.screenshot({
    path: ".local-tools/video/failure.png",
    fullPage: true,
  });
  await writeFile(
    ".local-tools/video/failure.txt",
    await page.locator("main").innerText(),
  );
  throw error;
} finally {
  await browser.close();
}
