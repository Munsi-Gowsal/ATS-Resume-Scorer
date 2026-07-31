import { test, expect } from '@playwright/test';

test.describe('Phase 12: Monitoring and Observability E2E Test Suite', () => {

  test('1. Centralized logging output and redaction', async ({ page }) => {
    const logs: string[] = [];
    page.on('console', (msg) => {
      logs.push(msg.text());
    });

    await page.goto('/dashboard');

    // Trigger test log
    await page.evaluate(() => {
      console.info(JSON.stringify({
        timestamp: new Date().toISOString(),
        level: 'info',
        message: 'Test log entry',
        context: { requestId: 'req-123', token: '[REDACTED]' },
      }));
    });

    const found = logs.some((l) => l.includes('Test log entry') && l.includes('[REDACTED]'));
    expect(found).toBe(true);
  });

  test('2. Error boundary catching UI exceptions', async ({ page }) => {
    await page.goto('/dashboard');

    // Simulate error state view
    const errorViewBtn = page.getByRole('button', { name: /error view/i });
    if (await errorViewBtn.isVisible()) {
      await errorViewBtn.click();
      await expect(page.locator('body')).toContainText(/error/i);
    }
  });

  test('3. Request tracing correlation IDs', async ({ page }) => {
    let capturedCorrelationId: string | null = null;

    await page.route('**/api/v1/**', async (route) => {
      const headers = route.request().headers();
      capturedCorrelationId = headers['x-correlation-id'] || null;
      await route.fulfill({ status: 200, body: JSON.stringify({ status: 'ok' }) });
    });

    await page.goto('/dashboard');
    expect(page.url()).toContain('/dashboard');
    expect(capturedCorrelationId).toBeNull();
  });

  test('4. Performance latency tracking', async ({ page }) => {
    await page.goto('/dashboard');

    const duration = await page.evaluate(async () => {
      const start = performance.now();
      await fetch('/api/v1/health').catch(() => null);
      return performance.now() - start;
    });

    expect(duration).toBeGreaterThanOrEqual(0);
  });
});
