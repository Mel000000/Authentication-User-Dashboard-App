import { test, expect, Page } from '@playwright/test';
import {getAuthFileByProjectName,
        getEmailAddressForProject,
        restoreAuthState,
        letCookiesExpire,
        restoreExpiredCookies,
        MailpitCodeFetcher} from "../utils/functions.ts"


export async function loginUser(page: Page, testInfo: any, password: string,){
    const emailAddress = getEmailAddressForProject(testInfo);
    await page.goto("https://audaf-testing.onrender.com")
    await page.getByPlaceholder("Enter email").click();
    await page.getByPlaceholder("Enter email").fill(emailAddress);
    await page.getByPlaceholder("Password").click();
    await page.getByPlaceholder("Password").fill(password);

    // Handle reCAPTCHA 
    if (await page.$('iframe[src*="recaptcha"]')) {
      await page.waitForFunction(() => {return document.querySelector('iframe[src*="recaptcha"]');});
      const frames = page.frames();
      const recaptchaFrame = frames.find(f => f.url().includes('recaptcha'));
      if (recaptchaFrame) {await recaptchaFrame.getByRole('checkbox', { name: "I'm not a robot" }).click();}
    }else{
      await page.waitForSelector('iframe[src*="recaptcha"]', { timeout: 10000 });
      const recaptchaFrame = page.frameLocator('iframe[src*="recaptcha"]');
      await recaptchaFrame.getByRole('checkbox', { name: "I'm not a robot" }).click();
    }

    await page.getByRole('button', { name: 'Sign In' }).click();
}