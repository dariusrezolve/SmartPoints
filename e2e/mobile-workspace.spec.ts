import { expect, test } from "@playwright/test";
import { createFirstChild, registerAndSignIn } from "./helpers";

test.use({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });

test("phone viewport can complete a task and redeem a reward without horizontal overflow", async ({ page }) => {
  await registerAndSignIn(page);
  await createFirstChild(page, "Mobile E2E Kid");
  await page.getByRole("button", { name: "Go to the bathroom: 1 points" }).click();
  await expect(page.getByRole("listitem").filter({ hasText: "Go to the bathroom" }).getByText("+1")).toBeVisible();
  const rewards = page.getByRole("heading", { name: "Rewards" }).locator("xpath=ancestor::div[contains(@class,'p-5')][1]");
  const screenTime = rewards.locator("div.rounded-2xl").filter({ hasText: "Screen time" });
  await screenTime.getByRole("button", { name: "Redeem" }).click();
  await expect(page.getByRole("listitem").filter({ hasText: "Screen time" })).toContainText("-1");
  await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)).toBeLessThanOrEqual(1);
});
