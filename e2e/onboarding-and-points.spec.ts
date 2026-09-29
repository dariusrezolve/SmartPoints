import { expect, test } from "@playwright/test";
import { createFirstChild, openMenuItem, registerAndSignIn } from "./helpers";

test("onboarding template, full task points, timed reward, and undo", async ({ page }) => {
  await registerAndSignIn(page);
  await createFirstChild(page, "E2E Kid");

  await expect(page.getByRole("button", { name: "Mers la baie x 3plus bonus: 4 points" })).toBeVisible();
  const rewards = page.getByRole("heading", { name: "Rewards" }).locator("xpath=ancestor::div[contains(@class,'p-5')][1]");
  await expect(rewards).toContainText("Screen time");

  await page.getByRole("link", { name: "Add a task" }).click();
  const taskDialog = page.getByRole("dialog", { name: "Edit tasks" });
  await taskDialog.getByRole("textbox", { name: "Name" }).fill("E2E ten point quest");
  await taskDialog.getByRole("spinbutton", { name: "Points" }).fill("10");
  await taskDialog.getByRole("button", { name: "Create task" }).click();
  await expect(page.getByRole("button", { name: "E2E ten point quest: 10 points" })).toBeVisible();
  await taskDialog.getByRole("button", { name: "Close Edit tasks" }).click();
  await expect(taskDialog).not.toBeVisible();

  await page.getByRole("button", { name: "E2E ten point quest: 10 points" }).click();
  await expect(page.getByLabel("10 stars")).toBeVisible();
  await expect(page.getByRole("listitem").filter({ hasText: "E2E ten point quest" }).getByText("+10")).toBeVisible();
  await page.getByRole("listitem").filter({ hasText: "E2E ten point quest" }).getByRole("button", { name: "Undo task" }).click();
  await expect(page.getByLabel("0 stars")).toBeVisible();

  await page.getByRole("link", { name: "Add a reward" }).click();
  const rewardDialog = page.getByRole("dialog", { name: "Edit rewards" });
  await rewardDialog.getByRole("textbox", { name: "Name" }).fill("E2E timed reward");
  await rewardDialog.getByRole("spinbutton", { name: "Cost" }).fill("2");
  await rewardDialog.getByRole("checkbox", { name: "Time based" }).check();
  await expect(rewardDialog.getByRole("spinbutton", { name: "Duration (minutes)" })).toHaveValue("30");
  await rewardDialog.getByRole("button", { name: "Create reward" }).click();
  await expect(rewardDialog).toContainText("E2E timed reward");
  await rewardDialog.getByRole("button", { name: "Close Edit rewards" }).click();
  await expect(rewardDialog).not.toBeVisible();
  const rewardCard = rewards.locator("div.rounded-2xl").filter({ hasText: "E2E timed reward" });
  await rewardCard.getByRole("button", { name: "Redeem" }).click();
  await expect(rewardCard.getByRole("timer")).toContainText(/29:|30:/);

  await openMenuItem(page, "Timer limits");
  const limitsDialog = page.getByRole("dialog", { name: "Timer limits" });
  await limitsDialog.getByRole("spinbutton", { name: "Consecutive timer events (minutes)" }).fill("30");
  await limitsDialog.getByRole("spinbutton", { name: "Total timer events per day (minutes)" }).fill("30");
  await limitsDialog.getByRole("button", { name: "Save timer limits" }).click();
  await rewardCard.getByRole("button", { name: "Redeem" }).click();
  await expect(page.getByRole("status")).toContainText(/limit|minutes|timer/i);
  await page.getByRole("listitem").filter({ hasText: "E2E timed reward" }).getByRole("button", { name: "Undo reward" }).click();
  await expect(page.getByRole("listitem").filter({ hasText: "E2E timed reward" }).getByRole("button", { name: "Undo reward" })).toHaveCount(0);
});
