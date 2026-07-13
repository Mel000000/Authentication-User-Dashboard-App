import { test, expect, Page } from '@playwright/test';
import {getEmailAddressForProject} from "../utils/functions.ts"


export async function loginUser(page: Page, testInfo: any, password: string,){
    const emailAddress = getEmailAddressForProject(testInfo);
    await page.goto("/")
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
};

export async function fillUpSignUpForm(page: Page, emailAddress: string, password: string, secondPassword: string, PicName: string, username: string){
  await page.goto('/signup');
  await page.getByRole('textbox', { name: 'Password', exact: true }).click();
  await page.getByRole('textbox', { name: 'Password', exact: true }).fill(password);
  await page.getByRole('textbox', { name: 'Confirm Password' }).click();
  await page.getByRole('textbox', { name: 'Confirm Password' }).fill(secondPassword);
  await page.getByRole('textbox', { name: 'Username' }).click();
  await page.getByRole('textbox', { name: 'Username' }).fill(username);
  await page.getByRole('textbox', { name: 'Email Address' }).click();
  await page.getByRole('textbox', { name: 'Email Address' }).fill(emailAddress);
  await page.locator('input[type="file"]').setInputFiles(PicName);
  await page.getByRole('button', { name: '-- Select country --' }).click();
  await page.getByRole('button', { name: 'Albania flag Albania' }).click();
}
