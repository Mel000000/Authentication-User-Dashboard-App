import { test, expect } from '@playwright/test';
import path from "path";

const authFile = path.join(__dirname, '../playwright/.auth/user.json');

test.use({ storageState: authFile }); // ← load state for all tests in this file

const serverId = "xyde35zm"
const emailAddress = `test-user-@${serverId}.mailosaur.net`

test('navigating home', async ({ page }) => {
  await page.goto('https://authentication-user-dashboard-app.onrender.com/home');
  await expect(page.getByText('Welcome Home, testusername!', { exact: true})).toBeVisible();
});

test("editing profile", async({page})=>{
  await page.goto('https://authentication-user-dashboard-app.onrender.com/home');
  await page.getByRole('button', { name: 'Edit Profile' }).click();
  await page.getByRole('textbox').click();
  await page.getByRole('textbox').fill('newUsername');
  await page.getByRole('button', { name: 'Albania' }).click();
  await page.getByRole('button', { name: 'Austria flag Austria' }).click();
  await page.getByRole('button', { name: 'Austria' }).click(); // gets removed for real testing when users are disposable in the testing circle
  await page.getByRole('button', { name: 'Albania flag Albania' }).click();
  await page.locator('input[type="file"]').setInputFiles('jellyfishWallpaper.jpg');
  await page.getByRole('button', { name: 'Submit Changes' }).click();
  await expect(page.getByText("Profile updated successfully!", { exact: true})).toBeVisible();
})

test("logging out and in", async({page})=>{
  await page.goto('https://authentication-user-dashboard-app.onrender.com/home');
  await page.getByRole('button', { name: 'Logout' }).click();
  await expect(page.getByText("Logged out successfully! Redirecting to login page...", { exact: true})).toBeVisible();
  await page.context().storageState({ path: authFile });
  await page.goto("https://authentication-user-dashboard-app.onrender.com/home")
  await expect(page.getByText('Welcome Home, newUsername!', { exact: true})).not.toBeVisible();
  await page.getByPlaceholder("Enter email").click();
  await page.getByPlaceholder("Enter email").fill(emailAddress);
  await page.getByPlaceholder("Password").click();
  await page.getByPlaceholder("Password").fill('securepassword123');
  await page.getByRole("checkbox").click()
  await page.getByRole('button', { name: 'Sign In' }).click();
  await expect(page.getByText("Logged in successfully! Redirecting to login page...", { exact: true})).toBeVisible();
})
