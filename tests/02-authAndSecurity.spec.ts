import { test, expect } from '@playwright/test';
import path from 'path';
import { existsSync, readFileSync } from 'fs';
import { restoreAuthState, getAuthFileTamperedByProjectName, setUserTamperedToSameAsUser} from "../playwright/helper/functions.ts"

async function removeCookiesFromFile(page: any, filePath: string) {
  if (!existsSync(filePath)) return;
  const state = JSON.parse(readFileSync(filePath, 'utf8'));
  state.cookies = []; // Remove cookies
  await page.context().clearCookies(); // Clear cookies in the current context to make sure they are removed
  await page.context().addCookies(state.cookies); // add the empty cookies array to the context to make sure no cookies are present
  await page.context().storageState({ path: filePath }); // Save the modified state back to the file
  
}

test.describe('Authentication and Security Tests', () => {
  test.beforeEach(async ({ page }, testInfo) => {
    const tamperedFile = getAuthFileTamperedByProjectName(testInfo.project.name);
    await restoreAuthState(page, tamperedFile);
  });

  test('session with no cookies should be rejected', async ({ page }, testInfo) => {
    await page.goto('https://audaf-testing.onrender.com/home');
    await expect(page.getByText('Welcome Home, testusername!', { exact: true})).toBeVisible();
    await removeCookiesFromFile(page, getAuthFileTamperedByProjectName(testInfo.project.name));
    await page.goto('https://audaf-testing.onrender.com/home');
    await expect(page).toHaveURL('https://audaf-testing.onrender.com/');
    await expect(page.getByText('Welcome Back!', { exact: true})).toBeVisible();
    await setUserTamperedToSameAsUser(page, testInfo.project.name); // Reset the tampered state to match the regular user state for further tests
  });

  test("session with tampered JWT should be rejected", async({page}, testInfo)=>{
    // logic for the test
    await setUserTamperedToSameAsUser(page, testInfo.project.name);
  })

  test("session with expired JWT should be rejected", async({page}, testInfo)=>{
    // logic for the test
    await setUserTamperedToSameAsUser(page, testInfo.project.name);
  })

});