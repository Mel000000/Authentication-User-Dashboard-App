// @ts-check
import { test, expect } from '@playwright/test';

test('has title', async ({ page }) => {
  await page.goto('https://authentication-user-dashboard-app.onrender.com/');

  // Expect a title "to contain" a substring.
  await expect(page.getByText("Welcome Back!")).toBeVisible();
});

test("testing workflow with intentional error", async ({ page }) => {
  await page.getByText("Not a real element").click();

});

