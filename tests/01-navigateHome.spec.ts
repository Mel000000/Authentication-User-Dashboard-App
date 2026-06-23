import { test, expect } from '@playwright/test';
import path from "path";

const authFile = path.join(__dirname, '../playwright/.auth/user.json');

test.use({ storageState: authFile }); // ← load state for all tests in this file

const serverId = "xyde35zm"
const emailAddress = `test-user@${serverId}.mailosaur.net`

test('navigating home', async ({ page }) => {
  await page.goto('https://audaf-testing.onrender.com/home');
  await expect(page.getByText('Welcome Home, testusername!', { exact: true})).toBeVisible();
});

test("editing profile", async({page})=>{
  await page.goto('https://audaf-testing.onrender.com/home');
  await page.getByRole('button', { name: 'Edit Profile' }).click();
  await page.getByRole('textbox').click();
  await page.getByRole('textbox').fill('newUsername');
  await page.getByRole('button', { name: 'Albania' }).click();
  await page.getByRole('button', { name: 'Austria flag Austria' }).click();
  await page.getByRole('button', { name: 'Austria' }).click(); // gets removed for real testing when users are disposable in the testing circle
  await page.getByRole('button', { name: 'Albania flag Albania' }).click();
  await page.locator('input[type="file"]').setInputFiles('jellyfishWallpaper.jpg');
  await page.getByRole('button', { name: 'Submit Changes' }).click();
  await expect(page.getByText("Profile updated successfully!", { exact: true})).toBeVisible();
})

test("logging out and in", async({page})=>{
  await page.goto('https://audaf-testing.onrender.com/home');
  await page.getByRole('button', { name: 'Logout' }).click();
  await expect(page.getByText("Logged out successfully! Redirecting to login page...", { exact: true})).toBeVisible();
  await page.context().storageState({ path: authFile });
  await page.goto("https://audaf-testing.onrender.com/home")
  await expect(page.getByText('Welcome Home, newUsername!', { exact: true})).not.toBeVisible();
  await page.getByPlaceholder("Enter email").click();
  await page.getByPlaceholder("Enter email").fill(emailAddress);
  await page.getByPlaceholder("Password").click();
  await page.getByPlaceholder("Password").fill('securepassword123');

  // Handle reCAPTCHA (test sitekey)
  const frame = page.frameLocator('iframe[src*="recaptcha"]');
  const checkbox = frame.locator('#recaptcha-anchor');
  await checkbox.waitFor({ state: 'visible' });
  await checkbox.click();


  await page.waitForFunction(
    () => {
      const el = document.querySelector('#g-recaptcha-response');
      return el && el.value && el.value.length > 20;
    },
    { timeout: 10000 }
  );


  const token = await page.inputValue('#g-recaptcha-response');
  console.log('✅ Captcha token length:', token.length);


  const csrfToken = await page.evaluate(() => {

    const meta = document.querySelector('meta[name="csrf-token"]');
    if (meta) return meta.getAttribute('content');

    const input = document.querySelector('input[name="csrf_token"], input[name="_token"], input[name="csrfmiddlewaretoken"]');
    return input ? input.value : null;
  });

  if (csrfToken) {
    await page.evaluate((token) => {

      let field = document.querySelector(
        'input[name="csrf_token"], input[name="_token"], input[name="csrfmiddlewaretoken"]'
      );
      if (!field) {

        const form = document.querySelector('form');
        if (form) {
          const input = document.createElement('input');
          input.type = 'hidden';
          input.name = 'csrf_token'; 
          input.value = token;
          form.appendChild(input);
        }
      } else {

        field.value = token;
      }
    }, csrfToken);
  }

  let postData = null;
  page.on('request', (req) => {
    if (req.url().includes('/login') && req.method() === 'POST') {
      postData = req.postData();
      console.log('📤 Login payload:', postData);
    }
  });


  await page.getByRole('button', { name: 'Sign In' }).click();

  await expect(
    page.getByText('Logged in successfully! Redirecting to login page...')
  ).toBeVisible({ timeout: 10000 });
})
