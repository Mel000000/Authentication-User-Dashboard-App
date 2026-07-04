// @ts-check
import { test, expect } from '@playwright/test';
import path from "path";
import { MailpitClient } from 'mailpit-api';
import dotenv from 'dotenv';
dotenv.config();

const authFile = path.join(__dirname, '../playwright/.auth/user.json');
const authFileUnverified = path.join(__dirname, '../playwright/.auth/userUnverified.json');

const emailAddress = `test-user@gamil.com`

const MAILPIT_URL = process.env.MAILPIT_URL || 'https://mailpit-testing.onrender.com';

// creates new user and saves session/ cookies in user.json file for further testing
test('create account and verify email', async ({ page }) => {
  // Setting up Mailpit client
  const mailpit = new MailpitClient(MAILPIT_URL);
  await mailpit.deleteMessages();

  // Filling up Signup Forum
  await page.goto('https://audaf-testing.onrender.com/signup');
  await page.getByRole('textbox', { name: 'Password', exact: true }).click();
  await page.getByRole('textbox', { name: 'Password', exact: true }).fill('securepassword123');
  await page.getByRole('textbox', { name: 'Confirm Password' }).click();
  await page.getByRole('textbox', { name: 'Confirm Password' }).fill('securepassword123');
  await page.getByRole('textbox', { name: 'Username' }).click();
  await page.getByRole('textbox', { name: 'Username' }).fill('testusername');
  await page.getByRole('textbox', { name: 'Email Address' }).click();
  await page.getByRole('textbox', { name: 'Email Address' }).fill(emailAddress);
  await page.locator('input[type="file"]').setInputFiles('jellyfishWallpaper.jpg');
  await page.getByRole('button', { name: '-- Select country --' }).click();
  await page.getByRole('button', { name: 'Albania flag Albania' }).click();
  await page.getByRole('button', { name: 'Create Account' }).click();

  // Wait for navigation to verification page
  await page.waitForURL("https://audaf-testing.onrender.com/verify-email", { timeout: 30000 });
  // trigger the email sender 
  await page.getByText('Send Code').click();

  // Wait for the verification email to arrive (polls internally)
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
  
  // Enter the code and complete registration
  await page.getByRole('textbox', { name: 'Verification Code' }).click();
  await page.getByRole('textbox', { name: 'Verification Code' }).fill(codeMatch);
  await page.getByRole('button', { name: 'Complete Registration' }).click();

  await expect(page.getByText('Email verified!')).toBeVisible({ timeout: 15000 });
  await page.goto('https://audaf-testing.onrender.com/home');
  await expect(page.getByText('Welcome Home, testusername!')).toBeVisible({ timeout: 15000 });

  await page.context().storageState({ path: authFile });
});

test("trying to create account with already registered email", async({page})=>{
  // run the create account and veerify email test again to try to create account with already registered email
  await page.goto('https://audaf-testing.onrender.com/signup');
  await page.getByRole('textbox', { name: 'Password', exact: true }).click();
  await page.getByRole('textbox', { name: 'Password', exact: true }).fill('securepassword123');
  await page.getByRole('textbox', { name: 'Confirm Password' }).click();
  await page.getByRole('textbox', { name: 'Confirm Password' }).fill('securepassword123');
  await page.getByRole('textbox', { name: 'Username' }).click();
  await page.getByRole('textbox', { name: 'Username' }).fill('testusername2');
  await page.getByRole('textbox', { name: 'Email Address' }).click();
  await page.getByRole('textbox', { name: 'Email Address' }).fill(emailAddress);
  await page.locator('input[type="file"]').setInputFiles('jellyfishWallpaper.jpg');
  await page.getByRole('button', { name: '-- Select country --' }).click();
  await page.getByRole('button', { name: 'Albania flag Albania' }).click();
  await page.getByRole('button', { name: 'Create Account' }).click();
  await expect(page.getByText('Email already in use')).toBeVisible({ timeout: 15000 });
});

test("create account and don't verify email", async({page})=>{
  // Filling up Signup Forum
  await page.goto('https://audaf-testing.onrender.com/signup');
  await page.getByRole('textbox', { name: 'Password', exact: true }).click();
  await page.getByRole('textbox', { name: 'Password', exact: true }).fill('securepassword123');
  await page.getByRole('textbox', { name: 'Confirm Password' }).click();
  await page.getByRole('textbox', { name: 'Confirm Password' }).fill('securepassword123');
  await page.getByRole('textbox', { name: 'Username' }).click();
  await page.getByRole('textbox', { name: 'Username' }).fill('testuserunverified');
  await page.getByRole('textbox', { name: 'Email Address' }).click();
  await page.getByRole('textbox', { name: 'Email Address' }).fill('testuserunverified@example.com');
  await page.locator('input[type="file"]').setInputFiles('jellyfishWallpaper.jpg');
  await page.getByRole('button', { name: '-- Select country --' }).click();
  await page.getByRole('button', { name: 'Albania flag Albania' }).click();
  await page.getByRole('button', { name: 'Create Account' }).click();
  await page.waitForURL("https://audaf-testing.onrender.com/verify-email", { timeout: 30000 });

  await page.context().storageState({ path: authFileUnverified });
});