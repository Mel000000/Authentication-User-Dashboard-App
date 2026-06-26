import { test, expect } from '@playwright/test';
import path from "path";

const authFile = path.join(__dirname, '../playwright/.auth/user.json');
console.log('authFile path:', authFile);
test.use({ storageState: authFile }); // ← load state for all tests in this file

const serverId = "xyde35zm"
const emailAddress = `test-user@${serverId}.mailosaur.net`

test('navigating home', async ({ page }) => {
  await page.goto('https://audaf-testing.onrender.com/home');
  await expect(page.getByText('Welcome Home, testusername!', { exact: true})).toBeVisible();
});

test("editing profile", async({page})=>{
  await page.goto('https://audaf-testing.onrender.com/home');
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
  await page.goto('https://audaf-testing.onrender.com/home');
  await page.getByRole('button', { name: 'Logout' }).click();
  await expect(page.getByText("Logged out successfully! Redirecting to login page...", { exact: true})).toBeVisible();
  await page.context().storageState({ path: authFile });
  await page.goto("https://audaf-testing.onrender.com/home")
  await expect(page.getByText('Welcome Home, newUsername!', { exact: true})).not.toBeVisible();
  await page.goto("https://audaf-testing.onrender.com")
  await page.getByPlaceholder("Enter email").click();
  await page.getByPlaceholder("Enter email").fill(emailAddress);
  await page.getByPlaceholder("Password").click();
  await page.getByPlaceholder("Password").fill('securepassword123');

  // Handle reCAPTCHA 
  await page.waitForFunction(() => {
    return document.querySelector('iframe[src*="recaptcha"]');
  });

  const frames = page.frames();
  const recaptchaFrame = frames.find(f =>
    f.url().includes('recaptcha')
  );
  if (recaptchaFrame) {
    await recaptchaFrame.getByRole('checkbox', { name: "I'm not a robot" }).click();
  }

  await page.getByRole('button', { name: 'Sign In' }).click();

  await expect(
    page.getByText('Login successful! Redirecting to your dashboard...')
  ).toBeVisible({ timeout: 10000 });
  await page.waitForURL("https://audaf-testing.onrender.com/home")
  await page.context().storageState({ path: authFile });
})

test("deleting test account", async({page})=>{
  await page.goto('https://audaf-testing.onrender.com/home');
  await page.getByRole('button', { name: 'Delete Account' }).click();
  await page.getByRole('textbox', { name: 'Enter your email' }).click();
  await page.getByRole('textbox', { name: 'Enter your email' }).fill('test-user@xyde35zm.mailosaur.net');
  await page.getByRole('button', { name: 'Yes, Delete My Account' }).click();
})
