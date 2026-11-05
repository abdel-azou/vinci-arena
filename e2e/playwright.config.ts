import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: 'html',
  use: {
    baseURL: 'http://127.0.0.1:5173/',
    trace: 'on-first-retry',
  },

  webServer: [
    {
      command:
        'mvnw.cmd -q -DskipTests -Dspring-boot.run.profiles=test spring-boot:run',
      cwd: '../api',
      url: 'http://localhost:3000/teams',
      reuseExistingServer: true,
      timeout: 120000,
    },
    {
      command: 'npm --prefix ../frontend run dev -- --host 127.0.0.1 --port 5173',
      url: 'http://127.0.0.1:5173/',
      reuseExistingServer: true,
      timeout: 120000,
    },
  ],

  /* Un seul navigateur pour éviter les conflits sur la DB */
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});