// @ts-check
import { test, expect } from '@playwright/test';

test('create new account', async ({ page }) => {
  await page.goto('https://authentication-user-dashboard-app.onrender.com/signup');
  await page.getByRole('textbox', { name: 'Password', exact: true }).click();
  await page.getByRole('textbox', { name: 'Password', exact: true }).fill('securepassword123');
  await page.getByRole('textbox', { name: 'Confirm Password' }).click();
  await page.getByRole('textbox', { name: 'Confirm Password' }).fill('securepassword123');
  await page.getByRole('textbox', { name: 'Username' }).click();
  await page.getByRole('textbox', { name: 'Username' }).fill('testusername');
  await page.getByRole('textbox', { name: 'Email Address' }).click();
  await page.getByRole('textbox', { name: 'Email Address' }).fill('test@gmail.com');
  await page.locator('input[type="file"]').setInputFiles('jellyfishWallpaper.jpg');
  await page.getByRole('button', { name: '-- Select country --' }).click();
  await page.getByRole('button', { name: 'Albania flag Albania' }).click();
  await page.getByRole('button', { name: 'Create Account' }).click();
  await page.waitForTimeout(1000);
  if  (await page.getByText('User created successfully!').isVisible()) {
    console.log('Account creation successful!');
  } else if (await page.getByText('Email already in use').isVisible()) {
    console.error('Account creation failed since the email is already in use!');
  }
});


