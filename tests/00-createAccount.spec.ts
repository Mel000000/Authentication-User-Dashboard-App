// @ts-check
import { test, expect } from '@playwright/test';
import path from "path";
import MailosaurClient from 'mailosaur'
import dotenv from 'dotenv';
dotenv.config();

const authFile = path.join(__dirname, '../playwright/.auth/user.json');

const mailosaur = new MailosaurClient(process.env.MAILOSAUR_API_KEY)
const serverId = "xyde35zm"
const emailAddress = `test-user@${serverId}.mailosaur.net`

// creates new user and saves session/ cookies in user.json file for further testing
test('create account and verify email', async ({ page }) => {
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

  await page.waitForURL("https://audaf-testing.onrender.com/verify-email", { timeout: 30000 });

  await page.getByText('Send Code').click();

  // Let Mailosaur poll until the email arrives rather than using a flat wait
  const email = await mailosaur.messages.get(serverId, {
    sentTo: emailAddress
  }, { timeout: 60000 });

  const codeMatch = email.html.body.match(/\b\d{6}\b/)[0];
  await page.getByRole('textbox', { name: 'Verification Code' }).click();
  await page.getByRole('textbox', { name: 'Verification Code' }).fill(codeMatch);
  await page.getByRole('button', { name: 'Complete Registration' }).click();

  await expect(page.getByText('Email verified!')).toBeVisible({ timeout: 15000 });
  await page.goto('https://audaf-testing.onrender.com/home');
  await expect(page.getByText('Welcome Home, testusername!')).toBeVisible({ timeout: 15000 });

  await page.context().storageState({ path: authFile });
});