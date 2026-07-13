// @ts-check
import { test, expect } from '@playwright/test';
import { restoreAuthState,
          getAuthFileTamperedByProjectName,
          setUserTamperedToSameAsUser,
          removeCookiesFromFile,
          tamperWithJWTToken,
          tamperWithCSRFToken,
          letCookiesExpire,
          restoreExpiredCookies,
          getAuthFileByProjectName} from "../playwright/utils/functions.ts"


test.describe('Authentication and Security Tests', () => {
  test.beforeEach(async ({ page }, testInfo) => {
    const tamperedFile = getAuthFileTamperedByProjectName(testInfo.project.name);
    await restoreAuthState(page, tamperedFile);
  });

  test('session with no cookies should be rejected', async ({ page }, testInfo) => {
    await page.goto('/home');
    await expect(page.getByText('Welcome Home, testusername!', { exact: true})).toBeVisible();
    await removeCookiesFromFile(page, getAuthFileTamperedByProjectName(testInfo.project.name));
    await page.goto('/home');
    await expect(page).toHaveURL('/');
    await expect(page.getByText('Welcome Back!', { exact: true})).toBeVisible();
    await setUserTamperedToSameAsUser(testInfo.project.name); // Reset the tampered state to match the regular user state for further tests
  });

  test("session with tampered JWT-token should be rejected", async({page}, testInfo)=>{
    await page.goto('/home');
    await expect(page.getByText('Welcome Home, testusername!', { exact: true})).toBeVisible();
    await tamperWithJWTToken(testInfo.project.name)
    await page.goto('/home');
    await expect(page.getByText('Welcome Home, testusername!', { exact: true})).not.toBeVisible();
    await setUserTamperedToSameAsUser(testInfo.project.name);
  })

  test("session with expired cookies should be rejected when navigating home", async({page}, testInfo)=>{
    await page.goto('/home');
    await expect(page.getByText('Welcome Home, testusername!', { exact: true})).toBeVisible();
    await letCookiesExpire(page);
    await page.goto('/home');
    await expect(page.getByText('Welcome Back!', { exact: true})).toBeVisible();
    await restoreExpiredCookies(page, getAuthFileByProjectName(testInfo.project.name));
  });

  test("session with invalid CSRF token should be rejected", async({page}, testInfo)=>{
    await page.goto('/home');
    await expect(page.getByText('Welcome Home, testusername!', { exact: true})).toBeVisible();
    await tamperWithCSRFToken(testInfo.project.name)
    await page.goto('/home');
    await expect(page.getByText('Welcome Home, testusername!', { exact: true})).not.toBeVisible();
    await setUserTamperedToSameAsUser(testInfo.project.name);
  })

});

// NEED TO CREATE TEST FOR RATE-LIMITING AND BRUTE-FORCE ATTACKS, BUT IT'S NOT POSSIBLE TO TEST IT WITH PLAYWRIGHT. NEED TO TEST IT MANUALLY OR WITH A DIFFERENT TOOL.
/*
testing with expired verification code 10 min
testing with exipred/missing reset token -> hitting /reset-password directlty without going through the forgot password flow
testing 15 min tempEmail expiration for signup flow
*/