// @ts-check
import { test, expect } from '@playwright/test';
import path from "path";
import MailosaurClient from 'mailosaur'
import dotenv from 'dotenv';
dotenv.config();

const authFile = path.join(__dirname, '../playwright/.auth/user.json');

const mailosaur = new MailosaurClient(process.env.MAILOSAUR_API_KEY)
const serverId = "xyde35zm"


const emailAddress = `test-user@${Date.now()}${serverId}.mailosaur.net`

// creates new user and saves session/ cookies in user.json file for further testing
test('fill out form and verify email', async ({ page }) => {
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
  await page.waitForTimeout(1000);
  if  (await page.getByText('User created successfully!').isVisible()) {
    console.log('Account creation successful!');
  } else if (await page.getByText('Email already in use').isVisible()) {
    console.error('Account creation failed since the email is already in use!')
  }
  await page.waitForURL("https://audaf-testing.onrender.com/verify-email")
  await page.waitForTimeout(1000);
  await page.getByText('Send Code').click();
  const email = await mailosaur.messages.get(serverId, {
    sentTo: emailAddress
  }, {timeout: 10000});
  const codeMatch = email.html.body.match(/\b\d{6}\b/)[0];
  await page.getByRole('textbox', { name: 'Verification Code' }).click();
  await page.getByRole('textbox', { name: 'Verification Code' }).fill(codeMatch);
  await page.getByRole('button', { name: 'Complete Registration' }).click();
  await page.waitForTimeout(2000);
  await page.context().storageState({ path: authFile });
});