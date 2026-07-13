// @ts-check
import { test, expect } from '@playwright/test';
import dotenv from 'dotenv';
dotenv.config();
import { MailpitCodeFetcher,
        getAuthFileTamperedByProjectName,
        readEmailData,
        saveEmailAddressForProject,
        getAuthFileByProjectName,
        getAuthFileUnverified} from "../playwright/utils/functions.ts";
import {fillUpSignUpForm} from "../playwright/helpers/recycle.ts";



test.describe.serial('create accounts and testing account creation with already registered email', () => {

  // creates new user and saves session/ cookies in user.json file for further testing
  test('create account and verify email', async ({ page }, testInfo) => {
    const projectName = testInfo.project.name;
    const emailAddress = `test-user-${projectName.toLowerCase()}-${Date.now()}@gamil.com`;
    saveEmailAddressForProject(projectName, emailAddress);

    // Filling up Signup Forum
    await fillUpSignUpForm(page, emailAddress, "securepassword123", "securepassword123", "jellyfishWallpaper.jpg", "testusername" )
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
    
    await fillUpSignUpForm(page, emailAddress, "securepassword123", "securepassword123", "jellyfishWallpaper.jpg", "testusername2" )
    await page.getByRole('button', { name: 'Create Account' }).click();
    await expect(page.getByText('Email already in use')).toBeVisible({ timeout: 15000 });
  });

  test("trying to create account with mismatched password and confirm password", async({page}, testInfo)=>{
    const projectName = testInfo.project.name;
    const emailAddress = `test-user-${projectName.toLowerCase()}-${Date.now()}@gamil.com`;

    await fillUpSignUpForm(page, emailAddress, "securepassword123", "mismatched1", "jellyfishWallpaper.jpg", "testusername2" )
    await expect(page.getByRole('button', { name: 'Create Account' })).toBeDisabled();
  });

  test("trying to create account with invalid email format", async({page}, testInfo)=>{
    const projectName = testInfo.project.name;
    const emailAddress = `test-user-${projectName.toLowerCase()}-${Date.now()}gamil.com`; // <- invalid format

    await fillUpSignUpForm(page, emailAddress, "securepassword123", "securepassword123", "jellyfishWallpaper.jpg", "testusername2" )
    await expect(page.getByRole('button', { name: 'Create Account' })).toBeDisabled();
  });

  test("trying to create account with weak password", async({page}, testInfo)=>{
    const projectName = testInfo.project.name;
    const emailAddress = `test-user-${projectName.toLowerCase()}-${Date.now()}@gamil.com`;

    await fillUpSignUpForm(page, emailAddress, "weak", "weak", "jellyfishWallpaper.jpg", "testusername2" )
    await expect(page.getByRole('button', { name: 'Create Account' })).toBeDisabled();
  });

  test("trying to create account with a profile picture in the wrong format", async({page}, testInfo)=>{
    const projectName = testInfo.project.name;
    const emailAddress = `test-user-${projectName.toLowerCase()}-${Date.now()}@gamil.com`; 

    await fillUpSignUpForm(page, emailAddress, "securepassword123", "securepassword123", "ghibli-gif.gif", "testusername2" )
    await page.getByRole('button', { name: 'Create Account' }).click();
    await page.waitForURL("https://audaf-testing.onrender.com/verify-email", { timeout: 30000 });
    const allMessages = await page.consoleMessages();
    const uploadFailed = allMessages.some(msg => msg.text().includes("avatar upload failed"));
    expect(uploadFailed).toBe(true);
  });

  // creates new user without verifying email and saves session/ cookies in userUnverified.json file for further testing
  test("create account and don't verify email", async({page}, testInfo)=>{
    const projectName = testInfo.project.name;
    const unverifiedEmailAddress = `test-user-unverified-${projectName.toLowerCase()}-${Date.now()}@gamil.com`;
    saveEmailAddressForProject(`${projectName}-unverified`, unverifiedEmailAddress);

    // Filling up Signup Forum
    await fillUpSignUpForm(page, unverifiedEmailAddress, "securepassword123", "securepassword123", "jellyfishWallpaper.jpg", "testuserunverified" )
    await page.getByRole('button', { name: 'Create Account' }).click();
    await page.waitForURL("https://audaf-testing.onrender.com/verify-email", { timeout: 30000 });

    const authFileUnverified = getAuthFileUnverified(projectName);
    await page.context().storageState({ path: authFileUnverified });
  });
});

// NEED TO CREATE FOLLOWING TESTS:
/*
testing with expired verification code 10 min
testing with exipred/missing reset token -> hitting /reset-password directlty without going through the forgot password flow
testing 15 min tempEmail expiration for signup flow

clean up the dublications by moving them to the recycle file
use the baseURL feature
fix the ordering in file 02
*/

// NOTE: update cleanUp script to delete ALL stale testing accounts