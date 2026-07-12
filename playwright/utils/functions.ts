import path from "path";
import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'fs';
import { MailpitClient } from 'mailpit-api';

const authDir = path.resolve(__dirname, '..', '.auth');
const emailAddressFile = path.join(authDir, 'emails.json');

const MAILPIT_URL = process.env.MAILPIT_URL || 'https://mailpit-testing.onrender.com';

export function getAuthFileByProjectName(projectName: string) {
  return path.join(authDir, `user-${projectName.toLowerCase()}.json`);
}

export function getAuthFileTamperedByProjectName(projectName: string) {
  if(projectName !== "chromium" || "firefox"){
    projectName = "chromium"
  }
  return path.join(authDir, `userTampered-${projectName.toLowerCase()}.json`);
}

export function getAuthFileUnverified(projectName: string) {
  return path.join(authDir, `userUnverified-${projectName.toLowerCase()}.json`);
}

export const getEmailAddressForProject = function(testInfo: { project: { name: string } }) {
  if (!existsSync(emailAddressFile)) {
    return `test-user-${testInfo.project.name.toLowerCase()}@gamil.com`;
  }

  try {
    const emailData = JSON.parse(readFileSync(emailAddressFile, 'utf8'));
    return emailData[testInfo.project.name.toLowerCase()] || emailData.emailAddress || `test-user-${testInfo.project.name.toLowerCase()}@gamil.com`;
  } catch {
    return `test-user-${testInfo.project.name.toLowerCase()}@gamil.com`;
  }
}

export const readEmailData = function() {
  if (!existsSync(emailAddressFile)) {
    return {};
  }
  try {
    return JSON.parse(readFileSync(emailAddressFile, 'utf8'));
  } catch {
    return {};
  }
}

export const saveEmailAddressForProject = function(projectName: string, emailAddress: string) {
  const emailData = readEmailData();
  emailData[projectName.toLowerCase()] = emailAddress;

  mkdirSync(path.dirname(emailAddressFile), { recursive: true });
  writeFileSync(emailAddressFile, JSON.stringify(emailData, null, 2));
}

export const restoreAuthState = async function(page: any, filePath: string) {
  if (!existsSync(filePath)) {
    return;
  }

  const state = JSON.parse(readFileSync(filePath, 'utf8'));
  const context = page.context();

  if (state.cookies?.length) {
    await context.addCookies(state.cookies);
  }

  for (const originState of state.origins || []) {
    await page.goto(originState.origin, { waitUntil: 'domcontentloaded' }).catch(() => {});
    await page.evaluate((storage: any) => {
      for (const item of storage.localStorage || []) {
        window.localStorage.setItem(item.name, item.value);
      }
    }, originState);
  }
}

export const setUserTamperedToSameAsUser = async function(projectName: string) {
  const userFilePath = getAuthFileByProjectName(projectName);
  const tamperedFilePath = getAuthFileTamperedByProjectName(projectName);
  // Implementation for setting tampered user state to same as regular user
  if (existsSync(userFilePath)) {
    const userState = readFileSync(userFilePath, 'utf8');
    writeFileSync(tamperedFilePath, userState);
  }
}

export const tamperWithJWTToken = async function(projectName: string) {
  const toBeTamperedFilePath = getAuthFileTamperedByProjectName(projectName);

  if (existsSync(toBeTamperedFilePath)) {
    const raw = readFileSync(toBeTamperedFilePath, 'utf8');
    const data = JSON.parse(raw);
    
    const tokenCookie = data.cookies.find((el: any) => el.name === "token");
    
    if (tokenCookie) {
      tokenCookie.value = "wrongJWTtoken";
      writeFileSync(toBeTamperedFilePath, JSON.stringify(data, null, 2), 'utf8');
    }
  } else {
    console.log('File does not exist at path:', toBeTamperedFilePath);
  }
};

export const letCookiesExpire = async function(page: any) {
  const context = page.context();
  const cookies = await context.cookies();
  const expiredCookies = cookies.map((cookie: any) => ({
    ...cookie,
    expires: Math.floor(Date.now() / 1000) - 3600 // Set expiration to 1 hour in the past
  }));
  return context.addCookies(expiredCookies);
}

export const removeCookiesFromFile =async function(page: any, filePath: string) {
  if (!existsSync(filePath)) return;
  const state = JSON.parse(readFileSync(filePath, 'utf8'));
  state.cookies = []; // Remove cookies
  await page.context().clearCookies(); // Clear cookies in the current context to make sure they are removed
  await page.context().addCookies(state.cookies); // add the empty cookies array to the context to make sure no cookies are present
  await page.context().storageState({ path: filePath }); // Save the modified state back to the file
}

export const restoreExpiredCookies = async function (page: any, filePath: string) {
  if (!existsSync(filePath)) {
    return;
  }
  const state = JSON.parse(readFileSync(filePath, 'utf8'));
  const context = page.context();
  if (state.cookies?.length) {
    return context.addCookies(state.cookies);
  }

}

export const MailpitCodeFetcher = async function(emailAddress: String){
  const mailpit = new MailpitClient(MAILPIT_URL);
  await mailpit.deleteMessages();

  let message;
  try {
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Timeout waiting for verification email')), 60000)
    );
    message = await Promise.race([
      mailpit.waitForMessage({
        query: `to:${emailAddress}`,
      }),
      timeoutPromise,
    ]);
  } catch (err) {
    throw new Error('Verification email not received within 60 seconds.');
  }

  const html = (message as any)?.HTML || (message as any)?.Text || '';
  const match = html.match(/\b\d{6}\b/);
  if (!match) {
    throw new Error('Could not find a 6-digit verification code in the email.');
  }
  const codeMatch = match[0]
  return codeMatch;
}
