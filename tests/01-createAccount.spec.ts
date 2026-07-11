// @ts-check
import { test, expect } from '@playwright/test';
import dotenv from 'dotenv';
dotenv.config();
import { MailpitCodeFetcher,
        getAuthFileTamperedByProjectName,
        readEmailData,
        saveEmailAddressForProject,
        getAuthFileByProjectName,
        getAuthFileUnverified} from "../playwright/helper/functions.ts"



test.describe.serial('create accounts and testing account creation with already registered email', () => {

  // creates new user and saves session/ cookies in user.json file for further testing
  test('create account and verify email', async ({ page }, testInfo) => {
    const projectName = testInfo.project.name;
    const emailAddress = `test-user-${projectName.toLowerCase()}-${Date.now()}@gamil.com`;
    saveEmailAddressForProject(projectName, emailAddress);

    // Filling up Signup Forum
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

    // Wait for navigation to verification page
    await page.waitForURL("https://audaf-testing.onrender.com/verify-email", { timeout: 30000 });
    // trigger the email sender 
    await page.getByText('Send Code').click();

    const code = await MailpitCodeFetcher(emailAddress)
    
    // Enter the code and complete registration
    await page.getByRole('textbox', { name: 'Verification Code' }).click();
    await page.getByRole('textbox', { name: 'Verification Code' }).fill(code);
    await page.getByRole('button', { name: 'Complete Registration' }).click();

    await expect(page.getByText('Email verified!')).toBeVisible({ timeout: 15000 });
    await page.goto('https://audaf-testing.onrender.com/home');
    await expect(page.getByText('Welcome Home, testusername!')).toBeVisible({ timeout: 15000 });
    
    // Save the authenticated state to a file for future tests
    const authFile = getAuthFileByProjectName(projectName);
    await page.context().storageState({ path: authFile });
    // Save the same state to another file for testing with a tampered token/ state
    await page.context().storageState({ path: getAuthFileTamperedByProjectName(testInfo.project.name) });
  });

  // run the create account and veerify email test again to try to create account with already registered email
  test("trying to create account with already registered email", async({page}, testInfo)=>{
    const projectName = testInfo.project.name;
    const emailData = readEmailData();
    const emailAddress = emailData[projectName.toLowerCase()] || `test-user-${projectName.toLowerCase()}@gamil.com`;

    await page.goto('https://audaf-testing.onrender.com/signup');
    await page.getByRole('textbox', { name: 'Password', exact: true }).click();
    await page.getByRole('textbox', { name: 'Password', exact: true }).fill('securepassword123');
    await page.getByRole('textbox', { name: 'Confirm Password' }).click();
    await page.getByRole('textbox', { name: 'Confirm Password' }).fill('securepassword123');
    await page.getByRole('textbox', { name: 'Username' }).click();
    await page.getByRole('textbox', { name: 'Username' }).fill('testusername2');
    await page.getByRole('textbox', { name: 'Email Address' }).click();
    await page.getByRole('textbox', { name: 'Email Address' }).fill(emailAddress);
    await page.locator('input[type="file"]').setInputFiles('jellyfishWallpaper.jpg');
    await page.getByRole('button', { name: '-- Select country --' }).click();
    await page.getByRole('button', { name: 'Albania flag Albania' }).click();
    await page.getByRole('button', { name: 'Create Account' }).click();
    await expect(page.getByText('Email already in use')).toBeVisible({ timeout: 15000 });
  });

  // creates new user without verifying email and saves session/ cookies in userUnverified.json file for further testing
  test("create account and don't verify email", async({page}, testInfo)=>{
    const projectName = testInfo.project.name;
    const unverifiedEmailAddress = `test-user-unverified-${projectName.toLowerCase()}-${Date.now()}@gamil.com`;
    saveEmailAddressForProject(`${projectName}-unverified`, unverifiedEmailAddress);

    // Filling up Signup Forum
    await page.goto('https://audaf-testing.onrender.com/signup');
    await page.getByRole('textbox', { name: 'Password', exact: true }).click();
    await page.getByRole('textbox', { name: 'Password', exact: true }).fill('securepassword123');
    await page.getByRole('textbox', { name: 'Confirm Password' }).click();
    await page.getByRole('textbox', { name: 'Confirm Password' }).fill('securepassword123');
    await page.getByRole('textbox', { name: 'Username' }).click();
    await page.getByRole('textbox', { name: 'Username' }).fill('testuserunverified');
    await page.getByRole('textbox', { name: 'Email Address' }).click();
    await page.getByRole('textbox', { name: 'Email Address' }).fill(unverifiedEmailAddress);
    await page.locator('input[type="file"]').setInputFiles('jellyfishWallpaper.jpg');
    await page.getByRole('button', { name: '-- Select country --' }).click();
    await page.getByRole('button', { name: 'Albania flag Albania' }).click();
    await page.getByRole('button', { name: 'Create Account' }).click();
    await page.waitForURL("https://audaf-testing.onrender.com/verify-email", { timeout: 30000 });

    const authFileUnverified = getAuthFileUnverified(projectName);
    await page.context().storageState({ path: authFileUnverified });
  });
});

// NEED TO CREATE FOLLOWING TESTS:
/*
mismatched password and confirm password
invalid email format
missing fields
dublicate username
weak password rejection
size limit for pic uploads
deleting account but enter the wrong email + verify deletion by trying to log in with deleted account
invalid data when updating profile
testing with expired verification code 10 min
testing with exipred/missing reset token -> hitting /reset-password directlty without going through the forgot password flow
testing 15 min tempEmail expiration for signup flow
*/

// NOTE: update cleanUp script to delete ALL stale testing accounts