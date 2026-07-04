import { test, expect } from '@playwright/test';
import path from "path";
import { MailpitClient } from 'mailpit-api';

const authFile = path.join(__dirname, '../playwright/.auth/user.json');

test.use({ storageState: authFile }); // ← load state for all tests in this file

const MAILPIT_URL = process.env.MAILPIT_URL || 'https://mailpit-testing.onrender.com';
const emailAddress = `test-user@gamil.com`

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

test("logging out", async({page})=>{
  await page.goto('https://audaf-testing.onrender.com/home');
  await page.getByRole('button', { name: 'Logout' }).click();
  await expect(page.getByText("Logged out successfully! Redirecting to login page...", { exact: true})).toBeVisible();
  await page.context().storageState({ path: authFile });
  await page.goto("https://audaf-testing.onrender.com/home")
  await expect(page.getByText('Welcome Home, newUsername!', { exact: true})).not.toBeVisible();
})

test("logging in with wrong credentials", async({page})=>{
  await page.goto("https://audaf-testing.onrender.com")
  await page.getByPlaceholder("Enter email").click();
  await page.getByPlaceholder("Enter email").fill(emailAddress);
  await page.getByPlaceholder("Password").click();
  await page.getByPlaceholder("Password").fill('wrongPassword');

  // Handle reCAPTCHA 
  await page.waitForFunction(() => {return document.querySelector('iframe[src*="recaptcha"]');});
  const frames = page.frames();
  const recaptchaFrame = frames.find(f => f.url().includes('recaptcha'));
  if (recaptchaFrame) {await recaptchaFrame.getByRole('checkbox', { name: "I'm not a robot" }).click();}

  await page.getByRole('button', { name: 'Sign In' }).click();

  await expect(page.getByText('Invalid credentials')).toBeVisible({ timeout: 10000 });
});

test("resetting password", async({page})=>{
  // Setting up Mailpit client
  const mailpit = new MailpitClient(MAILPIT_URL);
  await mailpit.deleteMessages();
  
  await page.goto("https://audaf-testing.onrender.com")
  await page.getByRole('link', { name: 'Forgot Password?' }).click();
  await page.getByRole('textbox', { name: 'Email Address' }).click();
  await page.getByRole('textbox', { name: 'Email Address' }).fill(emailAddress);
  await page.getByRole('button', { name: 'Send Code' }).click();
  
  let message;
  try {
    message = await mailpit.waitForMessage({
      query: `to:${emailAddress}`,
      timeout: 60000,
    });
  } catch (err) {
    throw new Error('Verification email not received within 60 seconds.');
  }

  const html = message.HTML || message.Text || '';
  const match = html.match(/\b\d{6}\b/);
  if (!match) {
    throw new Error('Could not find a 6-digit verification code in the email.');
  }
  const codeMatch = match[0];

  await page.getByRole('textbox', { name: 'Verification Code' }).click();
  await page.getByRole('textbox', { name: 'Verification Code' }).fill(codeMatch);
  await page.locator('div').filter({ hasText: /^Verify$/ }).click();
  await page.waitForURL("https://audaf-testing.onrender.com/reset-password", { timeout: 30000 });
  await page.getByRole('textbox', { name: 'New Password' }).click();
  await page.getByRole('textbox', { name: 'New Password' }).fill('newSecurePassword123');
  await page.getByRole('textbox', { name: 'Confirm Password' }).click();
  await page.getByRole('textbox', { name: 'Confirm Password' }).fill('newSecurePassword123');
  await page.getByRole('button', { name: 'Reset Password' }).click();
  await expect(page.getByText('Password reset successful! Redirecting to login page...')).toBeVisible({ timeout: 10000 });
  await page.waitForURL("https://audaf-testing.onrender.com", { timeout: 30000 });
});

test("logging in with correct credentials and verified email", async({page})=>{
  await page.goto("https://audaf-testing.onrender.com")
  await page.getByPlaceholder("Enter email").click();
  await page.getByPlaceholder("Enter email").fill(emailAddress);
  await page.getByPlaceholder("Password").click();
  await page.getByPlaceholder("Password").fill('newSecurePassword123');

  // Handle reCAPTCHA 
  await page.waitForFunction(() => {return document.querySelector('iframe[src*="recaptcha"]');});
  const frames = page.frames();
  const recaptchaFrame = frames.find(f => f.url().includes('recaptcha'));
  if (recaptchaFrame) {await recaptchaFrame.getByRole('checkbox', { name: "I'm not a robot" }).click();}

  await page.getByRole('button', { name: 'Sign In' }).click();

  await expect(page.getByText('Login successful! Redirecting to your dashboard...')).toBeVisible({ timeout: 10000 });
  await page.waitForURL("https://audaf-testing.onrender.com/home")
  await page.context().storageState({ path: authFile });
});

test("deleting test account", async({page})=>{
  await page.goto('https://audaf-testing.onrender.com/home');
  await page.getByRole('button', { name: 'Delete Account' }).click();
  await page.getByRole('textbox', { name: 'Enter your email' }).click();
  await page.getByRole('textbox', { name: 'Enter your email' }).fill(emailAddress);
  await page.getByRole('button', { name: 'Yes, Delete My Account' }).click();
  await expect(page.getByText("Account deleted successfully! Redirecting to login page...")).toBeVisible({timeout: 10000});
  await page.waitForURL("https://audaf-testing.onrender.com");
  await page.context().storageState({ path: authFile });
  await page.goto("https://audaf-testing.onrender.com/home");
  await expect(page.getByText('Welcome Home, newUsername!', { exact: true})).not.toBeVisible();
});
