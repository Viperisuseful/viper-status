import { expect, test } from "@playwright/test";

test("renders the public service register without horizontal overflow", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page.getByText("Viper Status").first()).toBeVisible();
  await expect(page.getByText("ViperCapture API")).toBeVisible();
  await expect(page.getByText("QuickRunLab API")).toBeVisible();
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
  );
  expect(overflow).toBe(false);
});

