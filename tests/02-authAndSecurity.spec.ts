import { test, expect } from '@playwright/test';
import { restoreAuthState, getAuthFileTamperedByProjectName, setUserTamperedToSameAsUser, removeCookiesFromFile} from "../playwright/helper/functions.ts"


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

  test("session with missing CSRF token should be rejected", async({page}, testInfo)=>{
    // logic for the test
    await setUserTamperedToSameAsUser(page, testInfo.project.name);
  })
  
  test("session with invalid CSRF token should be rejected", async({page}, testInfo)=>{
    // logic for the test
    await setUserTamperedToSameAsUser(page, testInfo.project.name);
  })

});

// NEED TO CREATE TEST FOR RATE-LIMITING AND BRUTE-FORCE ATTACKS, BUT IT'S NOT POSSIBLE TO TEST IT WITH PLAYWRIGHT. NEED TO TEST IT MANUALLY OR WITH A DIFFERENT TOOL.