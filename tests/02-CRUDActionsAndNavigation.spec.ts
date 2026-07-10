import { test, expect } from '@playwright/test';
import path from "path";
import { existsSync, readFileSync } from 'fs';
import { MailpitClient } from 'mailpit-api';

function getAuthFileByProjectName(projectName: string) {
  return path.join(__dirname, '../playwright/.auth', `user-${projectName.toLowerCase()}.json`);
}

const emailAddressFile = path.join(__dirname, '../playwright/.auth/emails.json');

const MAILPIT_URL = process.env.MAILPIT_URL || 'https://mailpit-testing.onrender.com';

function getEmailAddressForProject(testInfo: { project: { name: string } }) {
  if (!existsSync(emailAddressFile)) {
    return `test-user-${testInfo.project.name.toLowerCase()}@gamil.com`;
  }

  try {
    const emailData = JSON.parse(readFileSync(emailAddressFile, 'utf8'));
    return emailData[testInfo.project.name.toLowerCase()] || emailData.emailAddress || `test-user-${testInfo.project.name.toLowerCase()}@gamil.com`;
  } catch {
    return `test-user-${testInfo.project.name.toLowerCase()}@gamil.com`;
  }
}

async function restoreAuthState(page: any, filePath: string) {
  if (!existsSync(filePath)) {
    return;
  }

  const state = JSON.parse(readFileSync(filePath, 'utf8'));
  const context = page.context();

  if (state.cookies?.length) {
    await context.addCookies(state.cookies);
  }

  for (const originState of state.origins || []) {
    await page.goto(originState.origin, { waitUntil: 'domcontentloaded' }).catch(() => {});
    await page.evaluate((storage: any) => {
      for (const item of storage.localStorage || []) {
        window.localStorage.setItem(item.name, item.value);
      }
    }, originState);
  }
}

test.describe.serial('CRUD Actions and Navigation', () => {
  test.beforeEach(async ({ page }, testInfo) => {
    const authFile = getAuthFileByProjectName(testInfo.project.name);
    await restoreAuthState(page, authFile);
  });

  test('navigating home', async ({ page }, testInfo) => {
    const emailAddress = getEmailAddressForProject(testInfo);
    await page.goto('https://audaf-testing.onrender.com/home');
    await expect(page.getByText('Welcome Home, testusername!', { exact: true})).toBeVisible();
  });

  test("editing profile", async({page}, testInfo)=>{
    const emailAddress = getEmailAddressForProject(testInfo);
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

  test("logging out", async({page}, testInfo)=>{
    const emailAddress = getEmailAddressForProject(testInfo);
    await page.goto('https://audaf-testing.onrender.com/home');
    await page.getByRole('button', { name: 'Logout' }).click();
    await expect(page.getByText("Logged out successfully! Redirecting to login page...", { exact: true})).toBeVisible();
    await page.context().storageState({ path: getAuthFileByProjectName(testInfo.project.name) });
    await page.goto("https://audaf-testing.onrender.com/home")
    await expect(page.getByText('Welcome Home, newUsername!', { exact: true})).not.toBeVisible();
  })

  test("logging in with wrong credentials", async({page}, testInfo)=>{
    const emailAddress = getEmailAddressForProject(testInfo);
    await page.goto("https://audaf-testing.onrender.com")
    await page.getByPlaceholder("Enter email").click();
    await page.getByPlaceholder("Enter email").fill(emailAddress);
    await page.getByPlaceholder("Password").click();
    await page.getByPlaceholder("Password").fill('wrongPassword');

    // Handle reCAPTCHA 
    if (await page.$('iframe[src*="recaptcha"]')) {
      await page.waitForFunction(() => {return document.querySelector('iframe[src*="recaptcha"]');});
      const frames = page.frames();
      const recaptchaFrame = frames.find(f => f.url().includes('recaptcha'));
      if (recaptchaFrame) {await recaptchaFrame.getByRole('checkbox', { name: "I'm not a robot" }).click();}
    }else{
      // Handle reCAPTCHA – works in both Firefox and Chromium
      // Wait for the reCAPTCHA iframe to appear in the DOM
      await page.waitForSelector('iframe[src*="recaptcha"]', { timeout: 10000 });
      // Create a frame locator for that iframe
      const recaptchaFrame = page.frameLocator('iframe[src*="recaptcha"]');
      // Click the "I'm not a robot" checkbox inside the iframe
      await recaptchaFrame.getByRole('checkbox', { name: "I'm not a robot" }).click();
    }

    await page.getByRole('button', { name: 'Sign In' }).click();
    
    await page.waitForTimeout(3000);
    await expect(page.locator('form')).toBeVisible({ timeout: 10000 });
  });

  test("resetting password withh correct and incorrect verification code", async({page}, testInfo)=>{
    const emailAddress = getEmailAddressForProject(testInfo);
    // Setting up Mailpit client
    const mailpit = new MailpitClient(MAILPIT_URL);
    await mailpit.deleteMessages();
    
    await page.goto("https://audaf-testing.onrender.com")
    await page.getByRole('link', { name: 'Forgot Password?' }).click();
    await page.getByRole('textbox', { name: 'Email Address' }).click();
    // testing with wrong email first to see if the system handles it correctly
    await page.getByRole('textbox', { name: 'Email Address' }).fill("wrong@example.com");
    await page.getByRole('button', { name: 'Send Code' }).click();
    await expect(page.getByText("User not found")).toBeVisible({ timeout: 10000 });
    await page.getByRole('textbox', { name: 'Email Address' }).fill(emailAddress);
    await page.getByRole('button', { name: 'Send Code' }).click();
    
    let message;
    try {
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Timeout waiting for verification email')), 60000)
      );
      message = await Promise.race([
        mailpit.waitForMessage({
          query: `to:${emailAddress}`,
        }),
        timeoutPromise,
      ]);
    } catch (err) {
      throw new Error('Verification email not received within 60 seconds.');
    }

    const html = (message as any)?.HTML || (message as any)?.Text || '';
    const match = html.match(/\b\d{6}\b/);
    if (!match) {
      throw new Error('Could not find a 6-digit verification code in the email.');
    }
    const codeMatch = match[0];

    await page.getByRole('textbox', { name: 'Verification Code' }).click();
    // testing with wrong verification code first to see if the system handles it correctly
    await page.getByRole('textbox', { name: 'Verification Code' }).fill("000000"); // incorrect code
    await page.locator('div').filter({ hasText: /^Verify$/ }).click();
    await expect(page.getByText("Invalid code")).toBeVisible({ timeout: 10000 });
    await page.getByRole('textbox', { name: 'Verification Code' }).fill(codeMatch);
    await page.locator('div').filter({ hasText: /^Verify$/ }).click();
    await page.waitForURL("https://audaf-testing.onrender.com/reset-password", { timeout: 30000 });
    await page.getByRole('textbox', { name: 'New Password' }).click();
    // testing with password without numberfirst to see if the system handles it correctly
    await page.getByRole('textbox', { name: 'New Password' }).fill('bad');
    await page.getByRole('textbox', { name: 'Confirm Password' }).click();
    await page.getByRole('textbox', { name: 'Confirm Password' }).fill('bad');
    await expect(page.getByText("Password must be at least 6 characters long and contain at least one number")).toBeVisible({ timeout: 10000 });
    
    await page.getByRole('textbox', { name: 'New Password' }).fill('newSecurePassword123');
    await page.getByRole('textbox', { name: 'Confirm Password' }).click();
    await page.getByRole('textbox', { name: 'Confirm Password' }).fill('newSecurePassword123');
    await page.getByRole('button', { name: 'Reset Password' }).click();
    await expect(page.getByText('Password reset successful! Redirecting to login page...')).toBeVisible({ timeout: 10000 });
    await page.waitForURL("https://audaf-testing.onrender.com", { timeout: 30000 });
  });

  test("logging in with correct credentials and verified email", async({page}, testInfo)=>{
    const emailAddress = getEmailAddressForProject(testInfo);
    await page.goto("https://audaf-testing.onrender.com")
    await page.getByPlaceholder("Enter email").click();
    await page.getByPlaceholder("Enter email").fill(emailAddress);
    await page.getByPlaceholder("Password").click();
    await page.getByPlaceholder("Password").fill('newSecurePassword123');

    // Handle reCAPTCHA 
    if (await page.$('iframe[src*="recaptcha"]')) {
      await page.waitForFunction(() => {return document.querySelector('iframe[src*="recaptcha"]');});
      const frames = page.frames();
      const recaptchaFrame = frames.find(f => f.url().includes('recaptcha'));
      if (recaptchaFrame) {await recaptchaFrame.getByRole('checkbox', { name: "I'm not a robot" }).click();}
    }else{
      // Handle reCAPTCHA – works in both Firefox and Chromium
      // Wait for the reCAPTCHA iframe to appear in the DOM
      await page.waitForSelector('iframe[src*="recaptcha"]', { timeout: 10000 });
      // Create a frame locator for that iframe
      const recaptchaFrame = page.frameLocator('iframe[src*="recaptcha"]');
      // Click the "I'm not a robot" checkbox inside the iframe
      await recaptchaFrame.getByRole('checkbox', { name: "I'm not a robot" }).click();
    }

    await page.getByRole('button', { name: 'Sign In' }).click();

    await page.waitForTimeout(3000);
    await expect(page.locator('form')).toBeVisible({ timeout: 10000 });
    await page.waitForURL(/home|login/, { timeout: 10000 }).catch(() => {});
    await page.context().storageState({ path: getAuthFileByProjectName(testInfo.project.name) });
  });

  test("deleting test account", async({page}, testInfo)=>{
    const emailAddress = getEmailAddressForProject(testInfo);
    await page.goto('https://audaf-testing.onrender.com/home');
    await page.getByRole('button', { name: 'Delete Account' }).click();
    await page.getByRole('textbox', { name: 'Enter your email' }).click();
    await page.getByRole('textbox', { name: 'Enter your email' }).fill(emailAddress);
    await page.getByRole('button', { name: 'Yes, Delete My Account' }).click();
    await expect(page.getByText("Account deleted successfully! Redirecting to login page...")).toBeVisible({timeout: 10000});
    await page.waitForURL("https://audaf-testing.onrender.com");
    await page.context().storageState({ path: getAuthFileByProjectName(testInfo.project.name) });
    await page.goto("https://audaf-testing.onrender.com/home");
    await expect(page.getByText('Welcome Home, newUsername!', { exact: true})).not.toBeVisible();
  });

});