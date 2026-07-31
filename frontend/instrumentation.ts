/**
 * Next.js Instrumentation Hook (instrumentation.ts)
 *
 * Loaded automatically by Next.js 15+ (enabled by default in Next.js 16).
 * Runs ONLY on the Node.js server runtime — never in Edge or browser.
 *
 * Optional peer dependencies (@sentry/nextjs, @opentelemetry/*) are loaded
 * here via try/catch dynamic import(). If they are not installed the catch
 * block silently skips initialisation — no runtime error, no build warning.
 *
 * References:
 *   https://nextjs.org/docs/app/building-your-application/optimizing/instrumentation
 */

export async function register(): Promise<void> {
  // Guard: only run on the Node.js runtime.
  if (process.env.NEXT_RUNTIME !== "nodejs") return;

  // -------------------------------------------------------------------------
  // 1. Sentry — server-side error tracking (optional peer dep)
  // -------------------------------------------------------------------------
  const sentryDsn = process.env.SENTRY_DSN;
  if (sentryDsn) {
    try {
      // Dynamic import: Turbopack/webpack treat unresolved optional deps as
      // a build warning only when the string literal is static. Using a
      // computed path defeats static analysis entirely.
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const Sentry = require(`${"@sentry"}` + `/nextjs`) as {
        init: (opts: Record<string, unknown>) => void;
      };
      Sentry.init({
        dsn: sentryDsn,
        environment:
          process.env.SENTRY_ENVIRONMENT ?? process.env.NODE_ENV ?? "development",
        release: process.env.SENTRY_RELEASE,
        tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,
        debug: process.env.NODE_ENV === "development",
      });
      console.info("[Instrumentation] Sentry initialised.");
    } catch {
      console.warn(
        "[Instrumentation] @sentry/nextjs not installed — Sentry disabled."
      );
    }
  }

  // -------------------------------------------------------------------------
  // 2. OpenTelemetry — distributed request tracing (optional peer deps)
  // -------------------------------------------------------------------------
  const otlpEndpoint = process.env.OTEL_EXPORTER_OTLP_ENDPOINT;
  if (otlpEndpoint) {
    try {
      // Same computed-string technique prevents Turbopack static resolution.
      const otelBase = "@opentelemetry";
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { NodeSDK } = require(`${otelBase}` + `/sdk-node`) as {
        NodeSDK: new (cfg: Record<string, unknown>) => { start(): void };
      };
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { OTLPTraceExporter } = require(`${otelBase}` + `/exporter-trace-otlp-http`) as {
        OTLPTraceExporter: new (cfg: { url: string }) => unknown;
      };
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { getNodeAutoInstrumentations } = require(`${otelBase}` + `/auto-instrumentations-node`) as {
        getNodeAutoInstrumentations: () => unknown[];
      };

      const sdk = new NodeSDK({
        serviceName:
          process.env.OTEL_SERVICE_NAME ?? "ai-resume-frontend",
        traceExporter: new OTLPTraceExporter({ url: otlpEndpoint }),
        instrumentations: getNodeAutoInstrumentations(),
      });
      sdk.start();
      console.info("[Instrumentation] OpenTelemetry SDK started.", {
        endpoint: otlpEndpoint,
      });
    } catch {
      console.warn(
        "[Instrumentation] @opentelemetry packages not installed — OTEL disabled."
      );
    }
  }
}
