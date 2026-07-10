import { test, expect } from '@playwright/test';
import path from "path";
import { exec } from 'child_process';
import { promisify } from 'util';

const cleanUpScript = path.join(__dirname, '../.github/scripts/cleanUp.js');

const execAsync = promisify(exec);

test("running cleanup for unverified user", async({page})=>{
      const { stdout, stderr } = await execAsync(`node ${cleanUpScript}`);
      console.log('Cleanup stdout:', stdout);
      console.error('Cleanup stderr:', stderr);

      expect(stdout).toContain('Finished checking for users to delete.');
      expect(stderr).toBe('');
  });