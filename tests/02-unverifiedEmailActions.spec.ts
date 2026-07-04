import { test, expect } from '@playwright/test';
import path from "path";
import { MailpitClient } from 'mailpit-api';

const authFileUnverified = path.join(__dirname, '../playwright/.auth/userUnverified.json');
const MAILPIT_URL = process.env.MAILPIT_URL || 'https://mailpit-testing.onrender.com';

test.use({ storageState: authFileUnverified }); // ← load state for all tests in this file

test("logging in with correct credentials but unverified email", async({page})=>{
  await page.goto("https://audaf-testing.onrender.com")
  await page.getByPlaceholder("Enter email").click();
  await page.getByPlaceholder("Enter email").fill('testuserunverified@example.com');
  await page.getByPlaceholder("Password").click();
  await page.getByPlaceholder("Password").fill('newSecurePassword123');

  // Handle reCAPTCHA 
  await page.waitForFunction(() => {return document.querySelector('iframe[src*="recaptcha"]');});
  const frames = page.frames();
  const recaptchaFrame = frames.find(f => f.url().includes('recaptcha'));
  if (recaptchaFrame) {await recaptchaFrame.getByRole('checkbox', { name: "I'm not a robot" }).click();}

  await page.getByRole('button', { name: 'Sign In' }).click();

  await expect(page.getByText('Please verify your email before logging in')).toBeVisible({ timeout: 10000 });
  await page.context().storageState({ path: authFileUnverified });
});

test("trying to reset password for unverified email", async({page})=>{
    // Setting up Mailpit client
    const mailpit = new MailpitClient(MAILPIT_URL);
    await mailpit.deleteMessages();
    
    await page.goto("https://audaf-testing.onrender.com")
    await page.getByRole('link', { name: 'Forgot Password?' }).click();
    await page.getByRole('textbox', { name: 'Email Address' }).click();
    await page.getByRole('textbox', { name: 'Email Address' }).fill("testuserunverified@example.com");
    await page.getByRole('button', { name: 'Send Code' }).click();
    
    let message;
    try {
    message = await mailpit.waitForMessage({
        query: `to:${"testuserunverified@example.com"}`,
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
    await expect(page.getByText("Please verify your email before password reset")).toBeVisible({ timeout: 10000 });
});