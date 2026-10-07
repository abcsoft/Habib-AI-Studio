import { expect, test } from "@playwright/test";
test("branded landing renders complete product sections and public creative assets", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "creative direction.",
  );
  await expect(
    page.getByRole("link", { name: "Start creating for free" }),
  ).toHaveAttribute("href", "/signup");
  for (const id of ["features", "pricing", "gallery", "how-it-works"])
    await expect(page.locator(`#${id}`)).toBeVisible();
  await expect(page.locator("#pricing")).toContainText(
    "200 credits every month",
  );
  await expect(page.locator("#gallery img")).toHaveCount(4);
  for (const image of await page.locator("#gallery img").all())
    await expect
      .poll(() => image.evaluate((el) => (el as HTMLImageElement).naturalWidth))
      .toBeGreaterThan(0);
  await page.getByText("Does Claude generate the images?").click();
  await expect(
    page.getByText(/A separate image model renders your visuals/),
  ).toBeVisible();
});
test("studio walkthrough opens, advances, and leads to the demo", async ({
  page,
}) => {
  await page.goto("/");
  await page
    .getByRole("button", { name: "Watch the studio walkthrough" })
    .first()
    .click();
  await expect(page.getByRole("dialog")).toContainText("Make it your brand");
  for (let i = 0; i < 5; i++)
    await page.getByRole("button", { name: "Next step" }).click();
  await expect(
    page.getByRole("link", { name: "Try it yourself" }),
  ).toHaveAttribute("href", "/demo?view=new");
});
test("mobile marketing and demo fit the viewport and have functional navigation", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.goto("/demo");
  await page.getByRole("button", { name: "Open navigation" }).click();
  await page
    .getByRole("navigation", { name: "Studio navigation" })
    .getByRole("link", { name: "Brand kits" })
    .click();
  await expect(
    page.getByRole("heading", { name: "Your brand kits" }),
  ).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});
