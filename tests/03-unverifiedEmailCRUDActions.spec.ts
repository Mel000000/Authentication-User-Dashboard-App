import { test, expect } from '@playwright/test';
import path from "path";
import { existsSync, readFileSync } from 'fs';

const emailAddressFile = path.join(__dirname, '../playwright/.auth/emails.json');

function getAuthFileUnverifiedByProjectName(projectName: string) {
  return path.join(__dirname, '../playwright/.auth', `userUnverified-${projectName.toLowerCase()}.json`);
}

function getUnverifiedEmailAddressForProject(testInfo: { project: { name: string } }) {
  if (!existsSync(emailAddressFile)) {
    return `test-user-unverified-${testInfo.project.name.toLowerCase()}@gamil.com`;
  }

  try {
    const emailData = JSON.parse(readFileSync(emailAddressFile, 'utf8'));
    return emailData[`${testInfo.project.name.toLowerCase()}-unverified`] || `test-user-unverified-${testInfo.project.name.toLowerCase()}@gamil.com`;
  } catch {
    return `test-user-unverified-${testInfo.project.name.toLowerCase()}@gamil.com`;
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

test.describe.serial('Unverified Email CRUD Actions', () => {
  test.beforeEach(async ({ page }, testInfo) => {
    const authFileUnverified = getAuthFileUnverifiedByProjectName(testInfo.project.name);
    await restoreAuthState(page, authFileUnverified);
  });

  test('navigating home', async ({ page }) => {
    await page.goto('https://audaf-testing.onrender.com/home');
    await expect(page.getByText('Welcome Home, testuserunverified!', { exact: true})).not.toBeVisible();
  });

  test("logging in with correct credentials but unverified email", async({page}, testInfo)=>{
    const emailAddress = getUnverifiedEmailAddressForProject(testInfo);
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
    await page.context().storageState({ path: getAuthFileUnverifiedByProjectName(testInfo.project.name) });
  });
});

