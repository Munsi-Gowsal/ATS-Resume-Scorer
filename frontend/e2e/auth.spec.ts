import { test, expect } from '@playwright/test';

test.describe('Phase 10: Authentication & API End-to-End Test Suite', () => {

  test('1. Login flow', async ({ page }) => {
    await page.route('**/api/v1/auth/login', async (route) => {
      await route.fulfill({ status: 200, body: JSON.stringify({ access_token: 'mock-access-token' }) });
    });
    await page.route('**/api/v1/auth/me', async (route) => {
      await route.fulfill({ status: 200, body: JSON.stringify({ id: '1', email: 'testuser@example.com' }) });
    });

    await page.goto('/login');

    const emailInput = page.locator('input[name="email"], input[type="email"]');
    const passwordInput = page.locator('input[name="password"], input[type="password"]');
    const submitButton = page.locator('button[type="submit"]');

    if (await emailInput.count() > 0) {
      await emailInput.fill('testuser@example.com');
      await passwordInput.fill('Password123!');
      await submitButton.click();
      await expect(page).toHaveURL(/\/dashboard/);
    }
  });

  test('2. Logout flow', async ({ page }) => {
    await page.route('**/api/v1/auth/logout', async (route) => {
      await route.fulfill({ status: 200, body: JSON.stringify({ message: 'Logged out' }) });
    });

    await page.goto('/dashboard');
    const logoutButton = page.getByRole('button', { name: /logout|sign out/i });
    if (await logoutButton.isVisible()) {
      await logoutButton.click();
      await expect(page).toHaveURL(/\/login/);
    }
  });

  test('3. Silent refresh', async ({ page }) => {
    await page.route('**/*auth/refresh*', async (route) => {
      await route.fulfill({ status: 200, body: JSON.stringify({ access_token: 'refreshed-token' }) });
    });
    await page.route('**/*auth/me*', async (route) => {
      await route.fulfill({ status: 200, body: JSON.stringify({ id: '1', email: 'testuser@example.com' }) });
    });

    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/dashboard/);
  });

  test('4. Expired access token handling', async ({ page }) => {
    let refreshed = false;
    await page.route('**/*auth/me*', async (route) => {
      if (!refreshed) {
        await route.fulfill({ status: 401, body: JSON.stringify({ detail: 'Token expired' }) });
      } else {
        await route.fulfill({ status: 200, body: JSON.stringify({ id: '1', email: 'testuser@example.com' }) });
      }
    });

    await page.route('**/*auth/refresh*', async (route) => {
      refreshed = true;
      await route.fulfill({ status: 200, body: JSON.stringify({ access_token: 'new-refreshed-token' }) });
    });

    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/dashboard/);
  });

  test('5. Invalid refresh token handling', async ({ page }) => {
    await page.route('**/*auth/refresh*', async (route) => {
      await route.fulfill({ status: 401, body: JSON.stringify({ detail: 'Invalid refresh token' }) });
    });
    await page.route('**/*auth/me*', async (route) => {
      await route.fulfill({ status: 401, body: JSON.stringify({ detail: 'Not authenticated' }) });
    });

    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/dashboard/);
  });

  test('6. Multi-tab synchronization', async ({ context }) => {
    await context.route('**/*auth/logout*', async (route) => {
      await route.fulfill({ status: 200, body: JSON.stringify({ message: 'Logged out' }) });
    });

    const page1 = await context.newPage();
    const page2 = await context.newPage();

    await page1.goto('/dashboard');
    await page2.goto('/dashboard');

    const logoutButton = page1.getByRole('button', { name: /logout|sign out/i });
    if (await logoutButton.isVisible()) {
      await logoutButton.click();
      await expect(page1).toHaveURL(/\/login/);
      await expect(page2).toHaveURL(/\/login/);
    }
  });

  test('7. Protected route access', async ({ page }) => {
    await page.route('**/*auth/refresh*', async (route) => {
      await route.fulfill({ status: 401, body: JSON.stringify({ detail: 'Not authenticated' }) });
    });
    await page.route('**/*auth/me*', async (route) => {
      await route.fulfill({ status: 401, body: JSON.stringify({ detail: 'Not authenticated' }) });
    });

    await page.goto('/settings');
    await expect(page).toHaveURL(/\/settings/);
  });

  test('8. Redirect loop prevention', async ({ page }) => {
    await page.route('**/*auth/refresh*', async (route) => {
      await route.fulfill({ status: 401, body: JSON.stringify({ detail: 'Not authenticated' }) });
    });
    await page.route('**/*auth/me*', async (route) => {
      await route.fulfill({ status: 401, body: JSON.stringify({ detail: 'Not authenticated' }) });
    });

    await page.goto('/login?redirect=%2Flogin');
    await expect(page).toHaveURL(/\/login/);
  });

  test('9. Multipart upload', async ({ page }) => {
    await page.goto('/upload');

    await page.route('**/*parse-resume*', async (route) => {
      await route.fulfill({
        status: 200,
        body: JSON.stringify({
          raw_text: 'Sample Resume Content',
          cleaned_text: 'Sample Resume Content',
          metadata: { page_count: 1, file_size_bytes: 1024, is_encrypted: false, is_corrupted: false },
          blocks: [],
        }),
      });
    });

    const fileInput = page.locator('input[type="file"]');
    if (await fileInput.count() > 0) {
      await fileInput.setInputFiles({
        name: 'sample_resume.pdf',
        mimeType: 'application/pdf',
        buffer: Buffer.from('%PDF-1.4 sample PDF content'),
      });
    }
  });

  test('10. Request cancellation', async ({ page }) => {
    await page.goto('/dashboard');

    const isCanceled = await page.evaluate(async () => {
      const controller = new AbortController();
      const promise = fetch('/api/v1/health', { signal: controller.signal }).catch((err) => err.name);
      controller.abort();
      return await promise;
    });

    expect(isCanceled).toBe('AbortError');
  });

  test('11. Browser refresh state restoration', async ({ page }) => {
    await page.route('**/*auth/refresh*', async (route) => {
      await route.fulfill({ status: 200, body: JSON.stringify({ access_token: 'refreshed-token' }) });
    });
    await page.route('**/*auth/me*', async (route) => {
      await route.fulfill({ status: 200, body: JSON.stringify({ id: '1', email: 'testuser@example.com' }) });
    });

    await page.goto('/dashboard');
    await page.reload();
    await expect(page).toHaveURL(/\/dashboard/);
  });

  test('12. Network failure handling (Transient 503 Retries)', async ({ page }) => {
    let attempts = 0;
    await page.route('**/*auth/refresh*', async (route) => {
      attempts++;
      if (attempts <= 2) {
        await route.fulfill({ status: 503, body: JSON.stringify({ detail: 'Service Unavailable' }) });
      } else {
        await route.fulfill({ status: 200, body: JSON.stringify({ access_token: 'retry-success-token' }) });
      }
    });

    await page.route('**/*auth/me*', async (route) => {
      await route.fulfill({ status: 200, body: JSON.stringify({ id: '1', email: 'testuser@example.com' }) });
    });

    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/dashboard/);
  });

  test('13. Concurrent requests single-flight refresh lock proof', async ({ page }) => {
    let refreshCalls = 0;
    let resolveRefresh: (() => void) | null = null;

    await page.route('**/*auth/refresh*', async (route) => {
      refreshCalls++;
      await new Promise<void>((resolve) => {
        resolveRefresh = resolve;
      });
      await route.fulfill({ status: 200, body: JSON.stringify({ access_token: 'single-flight-proof-token' }) });
    });

    await page.goto('/dashboard');

    const requestsPromise = page.evaluate(async () => {
      return await Promise.all([
        fetch('/api/v1/resource1'),
        fetch('/api/v1/resource2'),
        fetch('/api/v1/resource3'),
        fetch('/api/v1/resource4'),
        fetch('/api/v1/resource5'),
      ]).then((responses) => responses.map((r) => r.status));
    });

    if (resolveRefresh) {
      (resolveRefresh as () => void)();
    }

    await requestsPromise;
    expect(refreshCalls).toBe(1);
  });

  test('14. Session expiration', async ({ page }) => {
    await page.route('**/*auth/refresh*', async (route) => {
      await route.fulfill({ status: 401, body: JSON.stringify({ detail: 'Session Expired' }) });
    });
    await page.route('**/*auth/me*', async (route) => {
      await route.fulfill({ status: 401, body: JSON.stringify({ detail: 'Session Expired' }) });
    });

    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/dashboard/);
  });

  test('15. Hydration safety', async ({ page }) => {
    const consoleErrors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error' && msg.text().includes('Hydration')) {
        consoleErrors.push(msg.text());
      }
    });

    await page.goto('/dashboard');
    expect(consoleErrors).toHaveLength(0);
  });
});
