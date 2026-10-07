import { expect, test } from "@playwright/test";
import { signUp, uniqueEmail, creditBalance } from "./helpers";

async function newBrand(page: import("@playwright/test").Page) {
  await page
    .getByRole("button", { name: "New brand kit", exact: true })
    .click();
  await page.getByLabel("Brand name", { exact: true }).fill("Test Skincare");
  await page.getByLabel("Industry", { exact: true }).fill("Skincare");
  await page
    .getByLabel("Audience", { exact: true })
    .fill("Mindful shoppers looking for simple daily skincare");
  await page
    .getByLabel("Brand voice", { exact: true })
    .fill("Warm, thoughtful, and clear");
  await page
    .getByRole("button", { name: "Save brand kit", exact: true })
    .click();
  await expect(page.getByRole("dialog")).toHaveCount(0);
}
test("complete offline demo: create brand and project, generate copy and sample image, save and export", async ({
  page,
}) => {
  await page.goto("/demo?view=brands");
  await newBrand(page);
  await page.goto("/demo?view=new");
  await page.getByRole("button", { name: "New project", exact: true }).click();
  await page.getByLabel("Project name", { exact: true }).fill("Demo launch");
  await page
    .getByRole("button", { name: "Create project", exact: true })
    .click();
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await page
    .getByLabel("Campaign name", { exact: true })
    .fill("My demo glow campaign");
  await page
    .getByLabel("Project", { exact: true })
    .selectOption({ label: "Demo launch" });
  await page
    .getByLabel("Brand kit", { exact: true })
    .selectOption({ label: "Test Skincare" });
  await page
    .getByLabel("Tell us about your product")
    .fill("A daily glow serum made for a simple morning ritual");
  await page.getByLabel("Campaign goal").selectOption("Drive sales");
  await page.getByRole("button", { name: "Create campaign draft" }).click();
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "My demo glow campaign",
  );
  await page.getByRole("button", { name: "Generate demo package" }).click();
  await expect(
    page.getByRole("heading", { name: "Campaign strategy", exact: true }),
  ).toBeVisible();
  await expect(creditBalance(page)).toHaveText("7");
  await page.getByRole("tab", { name: "Ad copy", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Hooks", exact: true }),
  ).toBeVisible();
  await page.getByRole("tab", { name: "Visual prompts", exact: true }).click();
  await page.getByRole("button", { name: "Add sample visual" }).first().click();
  await expect(page.locator(".asset-card")).toHaveCount(1);
  await expect(creditBalance(page)).toHaveText("6");
  await page
    .getByRole("button", { name: "Save campaign", exact: true })
    .click();
  const download = page.waitForEvent("download");
  await page
    .getByRole("button", { name: "Export package", exact: true })
    .click();
  expect((await download).suggestedFilename()).toBe(
    "my-demo-glow-campaign.json",
  );
  await page.reload();
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "My demo glow campaign",
  );
  await expect(creditBalance(page)).toHaveText("6");
});

test("authenticated workflow persists campaigns, spend and refunds in PostgreSQL", async ({
  page,
}) => {
  await signUp(page, uniqueEmail("studio"));
  await page.goto("/brands");
  await newBrand(page);
  await page.goto("/campaigns/new");
  await page.getByRole("button", { name: "New project", exact: true }).click();
  await page.getByLabel("Project name", { exact: true }).fill("Live launch");
  await page
    .getByRole("button", { name: "Create project", exact: true })
    .click();
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await page
    .getByLabel("Campaign name", { exact: true })
    .fill("A persistent skincare campaign");
  await page
    .getByLabel("Project", { exact: true })
    .selectOption({ label: "Live launch" });
  await page
    .getByLabel("Brand kit", { exact: true })
    .selectOption({ label: "Test Skincare" });
  await page
    .getByLabel("Tell us about your product")
    .fill("A daily glow serum made for a simple morning ritual");
  await page.getByRole("button", { name: "Create campaign draft" }).click();
  await page.waitForURL("**/campaigns/*");
  await page.getByRole("button", { name: "Generate with Claude" }).click();
  await expect(
    page.getByRole("heading", { name: "Campaign strategy", exact: true }),
  ).toBeVisible();
  await expect(creditBalance(page)).toHaveText("7");
  await page.getByRole("tab", { name: "Visual prompts", exact: true }).click();
  await page.getByRole("button", { name: "Generate image" }).first().click();
  await expect(page.locator(".asset-card")).toHaveCount(1);
  await expect(creditBalance(page)).toHaveText("6");
  await page
    .getByRole("button", { name: "Save campaign", exact: true })
    .click();
  await page.reload();
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "A persistent skincare campaign",
  );
  await page.getByRole("tab", { name: "Images", exact: false }).click();
  await page
    .getByLabel("Your image prompt")
    .fill("FAIL image provider refund test");
  await page.getByRole("button", { name: "Render image" }).click();
  await expect(page.getByRole("main").getByRole("alert")).toContainText(
    "refunded",
  );
  await expect(creditBalance(page)).toHaveText("6");
  await page.goto("/history");
  await expect(page.locator(".audit-table")).toContainText("Credits refunded");
  await page.goto("/billing");
  await expect(page.getByText("refund", { exact: true })).toBeVisible();
});
