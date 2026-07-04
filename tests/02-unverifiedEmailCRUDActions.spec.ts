import { test, expect } from '@playwright/test';
import path from "path";
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

const authFileUnverified = path.join(__dirname, '../playwright/.auth/userUnverified.json');
const cleanUpScript = path.join(__dirname, '../.github/scripts/cleanUp.js');

test.use({ storageState: authFileUnverified }); // ← load state for all tests in this file

test('navigating home', async ({ page }) => {
  await page.goto('https://audaf-testing.onrender.com/home');
  await expect(page.getByText('Welcome Home, testuserunverified!', { exact: true})).not.toBeVisible();
});

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

test("running cleanup for unverified user", async({page})=>{
    const { stdout, stderr } = await execAsync(`node ${cleanUpScript}`);
    console.log('Cleanup stdout:', stdout);
    console.error('Cleanup stderr:', stderr);

    expect(stdout).toContain('Deleted user with unverified email: testuserunverified@example.com');
    expect(stderr).toBe('');
});

