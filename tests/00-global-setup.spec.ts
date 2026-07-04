// @ts-check
import path from 'path';
import { fileURLToPath } from 'url';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const cleanUpScript = path.join(__dirname, '../.github/scripts/cleanUp.js');

export default async function globalSetup() {
  console.log('[global-setup] Purging leftover unverified test accounts...');
  try {
    const { stdout, stderr } = await execAsync(`node ${cleanUpScript}`);
    if (stdout) console.log(stdout);
    if (stderr) console.error(stderr);
  } catch (err) {

    console.error('[global-setup] Cleanup step failed:', (err as Error).message);
  }
}