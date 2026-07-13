// @ts-check
import { test, expect } from '@playwright/test';
import {getAuthFileByProjectName,
        getEmailAddressForProject,
        restoreAuthState,
        MailpitCodeFetcher} from "../playwright/utils/functions.ts"
import {loginUser} from "../playwright/helpers/recycle.ts"

test.describe.serial('CRUD Actions and Navigation', () => {
  test.beforeEach(async ({ page }, testInfo) => {
    const authFile = getAuthFileByProjectName(testInfo.project.name);
    await restoreAuthState(page, authFile);
  });

  test('navigating home', async ({ page }) => {
    await page.goto('/home');
    await expect(page.getByText('Welcome Home, testusername!', { exact: true})).toBeVisible();
  });

  test("editing profile", async({page})=>{
    await page.goto('/home');
    await page.getByRole('button', { name: 'Edit Profile' }).click();
    await page.getByRole('textbox').click();
    // trying to update profile with invalid username first
    await page.getByRole('textbox').fill('x'); // <- too short
    await page.getByRole('button', { name: 'Albania' }).click();
    await page.getByRole('button', { name: 'Austria flag Austria' }).click();
    await page.getByRole('button', { name: 'Austria' }).click();
    await page.getByRole('button', { name: 'Albania flag Albania' }).click();
    await page.locator('input[type="file"]').setInputFiles('jellyfishWallpaper.jpg');
    await page.getByRole('button', { name: 'Submit Changes' }).click();
    await expect(page.getByText("Failed to update profile. Please try again.", { exact: true})).toBeVisible();
    // now the valid username
    await page.getByRole('textbox').fill('newUsername');
    await page.getByRole('button', { name: 'Submit Changes' }).click();
    await expect(page.getByText("Profile updated successfully!", { exact: true})).toBeVisible();
  })

  test("logging out", async({page}, testInfo)=>{
    await page.goto('/home');
    await page.getByRole('button', { name: 'Logout' }).click();
    await expect(page.getByText("Logged out successfully! Redirecting to login page...", { exact: true})).toBeVisible();
    await page.context().storageState({ path: getAuthFileByProjectName(testInfo.project.name) });
    await page.goto("/home")
    await expect(page.getByText('Welcome Home, newUsername!', { exact: true})).not.toBeVisible();
  })

  test("logging in with wrong credentials", async({page}, testInfo)=>{
    await loginUser(page, testInfo, 'wrongPassword')

    await page.waitForTimeout(3000);
    await expect(page.locator('form')).toBeVisible({ timeout: 10000 });
  });

  test("resetting password with correct and incorrect verification code", async({page}, testInfo)=>{
    const emailAddress = getEmailAddressForProject(testInfo);
    
    await page.goto("/")
    await page.getByRole('link', { name: 'Forgot Password?' }).click();
    await page.getByRole('textbox', { name: 'Email Address' }).click();
    // testing with wrong email first to see if the system handles it correctly
    await page.getByRole('textbox', { name: 'Email Address' }).fill("wrong@example.com");
    await page.getByRole('button', { name: 'Send Code' }).click();
    await expect(page.getByText("User not found")).toBeVisible({ timeout: 10000 });
    await page.getByRole('textbox', { name: 'Email Address' }).fill(emailAddress);
    await page.getByRole('button', { name: 'Send Code' }).click();
    
    const code = await MailpitCodeFetcher(emailAddress)
    console.log("CODE",code)
    await page.getByRole('textbox', { name: 'Verification Code' }).click();
    // testing with wrong verification code first to see if the system handles it correctly
    await page.getByRole('textbox', { name: 'Verification Code' }).fill("000000"); // incorrect code
    await page.locator('div').filter({ hasText: /^Verify$/ }).click();
    await expect(page.getByText("Invalid code")).toBeVisible({ timeout: 10000 });
    await page.getByRole('textbox', { name: 'Verification Code' }).fill(code);
    await page.locator('div').filter({ hasText: /^Verify$/ }).click();
    await page.waitForURL("/reset-password", { timeout: 30000 });
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
    await page.waitForURL("/", { timeout: 30000 });
  });

  test("logging in with correct credentials and verified email", async({page}, testInfo)=>{

    await loginUser(page, testInfo, "newSecurePassword123")

    await page.waitForTimeout(3000);
    await expect(page.locator('form')).toBeVisible({ timeout: 10000 });
    await page.waitForURL("/home", { timeout: 10000 }).catch(() => {});
    await page.context().storageState({ path: getAuthFileByProjectName(testInfo.project.name) });
  });

  test("deleting test account", async({page}, testInfo)=>{
    const emailAddress = getEmailAddressForProject(testInfo);
    await page.goto('/home');
    await page.getByRole('button', { name: 'Delete Account' }).click();
    await page.getByRole('textbox', { name: 'Enter your email' }).click();
    // trying to delete with wrong email and failing
    await page.getByRole('textbox', { name: 'Enter your email' }).fill("wrongemail@gmail.com");
    await expect(page.getByRole('button', { name: 'Yes, Delete My Account' })).toBeDisabled();
    // deleting with correct email
    await page.getByRole('textbox', { name: 'Enter your email' }).fill(emailAddress);
    await page.getByRole('button', { name: 'Yes, Delete My Account' }).click();
    await expect(page.getByText("Account deleted successfully! Redirecting to login page...")).toBeVisible({timeout: 10000});
    await page.waitForURL("/");
    await page.context().storageState({ path: getAuthFileByProjectName(testInfo.project.name) });
    await page.goto("/home");
    await expect(page.getByText('Welcome Home, newUsername!', { exact: true})).not.toBeVisible();
    await loginUser(page, testInfo, "newSecurePassword123");
    await expect(page.getByText("Invalid credentials")).toBeVisible();
  });

});