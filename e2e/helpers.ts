import { expect, type Page } from "@playwright/test";
import { randomUUID } from "node:crypto";

export function testEmail(label: string) {
  return `${label}-${randomUUID()}@example.test`;
}

export async function registerAndSignIn(page: Page, email = testEmail("parent")) {
  const password = `E2e-${randomUUID()}!`;
  await page.goto("/sign-up");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: "Create account" }).click();
  await expect(page).toHaveURL(/\/sign-in/);
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: "Sign in" }).click();
  await page.waitForLoadState("networkidle");
  return { email, password };
}

export async function createFirstChild(page: Page, name: string, starter = true) {
  await expect(page.getByRole("heading", { name: "Create your family" })).toBeVisible();
  await page.getByLabel("Child's display name").fill(name);
  if (starter) await page.getByRole("checkbox", { name: /Start with the daily task list/ }).check();
  await page.getByRole("button", { name: "Create child profile" }).click();
  await expect(page.getByRole("heading", { name: `${name}'s points` })).toBeVisible();
  await page.waitForLoadState("networkidle");
}

export async function openMenuItem(page: Page, name: string) {
  await page.locator("details summary").click();
  await expect(page.getByRole("menuitem", { name, exact: true })).toBeVisible();
  await page.getByRole("menuitem", { name, exact: true }).click();
  await expect(page.getByRole("dialog", { name })).toBeVisible();
}
