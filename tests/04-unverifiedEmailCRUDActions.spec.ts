// @ts-check
import { test, expect } from '@playwright/test';
import path from "path";
import { exec } from 'child_process';
import { promisify } from 'util';
import {loginUser} from "../playwright/helpers/recycle.ts"
import {getAuthFileUnverified, restoreAuthState} from "../playwright/utils/functions.ts"

const cleanUpScript = path.join(__dirname, '../.github/scripts/cleanUp.js');

const execAsync = promisify(exec);

test.describe.serial('Unverified Email CRUD Actions', () => {
  test.beforeEach(async ({ page }, testInfo) => {
    const authFileUnverified = getAuthFileUnverified(testInfo.project.name);
    await restoreAuthState(page, authFileUnverified);
  });

  test.afterAll(async () => {
    const { stdout, stderr } = await execAsync(`node ${cleanUpScript}`);
    console.log('Cleanup stdout:', stdout);
    console.error('Cleanup stderr:', stderr);

    expect(stdout).toContain('Finished checking for users to delete.');
    expect(stderr).toBe('');
  });

  test('navigating home', async ({ page }) => {
    await page.goto('/home');
    await expect(page.getByText('Welcome Home, testuserunverified!', { exact: true})).not.toBeVisible();
  });

  test("logging in with correct credentials but unverified email", async({page}, testInfo)=>{

    await loginUser(page, testInfo, "newSecurePassword123")

    await page.waitForTimeout(3000);
    await expect(page.locator('form')).toBeVisible({ timeout: 10000 });
    await page.context().storageState({ path: getAuthFileUnverified(testInfo.project.name) });
  });
});

