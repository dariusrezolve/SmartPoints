import { expect, test } from "@playwright/test";
import { createFirstChild, openMenuItem, registerAndSignIn, testEmail } from "./helpers";

test("invited parent sees shared child and own child, while owner sees only theirs", async ({ browser }) => {
  const ownerContext = await browser.newContext();
  const invitedContext = await browser.newContext();
  try {
    const owner = await ownerContext.newPage();
    const invited = await invitedContext.newPage();
    const invitedEmail = testEmail("invited");
    await registerAndSignIn(owner);
    await createFirstChild(owner, "Shared E2E Kid");

    await openMenuItem(owner, "Share access");
    const shareDialog = owner.getByRole("dialog", { name: "Share access" });
    await shareDialog.getByRole("textbox", { name: "Email address" }).fill(invitedEmail);
    await shareDialog.getByRole("button", { name: "Create share link" }).click();
    const invitationUrl = await shareDialog.locator("p").filter({ hasText: /\/invite\// }).textContent();
    expect(invitationUrl).toMatch(/^http:\/\/127\.0\.0\.1:3100\/invite\//);

    await registerAndSignIn(invited, invitedEmail);
    await createFirstChild(invited, "Private E2E Kid", false);
    await invited.goto(invitationUrl!);
    await invited.getByRole("button", { name: "Accept invitation" }).click();
    await expect(invited.getByRole("heading", { name: "Shared E2E Kid's points" })).toBeVisible();
    await invited.waitForLoadState("networkidle");
    await invited.locator("details summary").click();
    await expect(invited.getByRole("menuitem", { name: "Shared E2E Kid" })).toBeVisible();
    await expect(invited.getByRole("menuitem", { name: "Private E2E Kid" })).toBeVisible();

    await shareDialog.getByRole("button", { name: "Close Share access" }).click();
    await owner.locator("details summary").click();
    await expect(owner.getByRole("menuitem", { name: "Shared E2E Kid" })).toBeVisible();
    await expect(owner.getByRole("menuitem", { name: "Private E2E Kid" })).toHaveCount(0);
  } finally {
    await ownerContext.close();
    await invitedContext.close();
  }
});
