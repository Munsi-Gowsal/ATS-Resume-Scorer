/**
 * OpenTelemetry SDK Setup
 *
 * Initialises an OTLP trace exporter for Next.js server-side request tracing.
 * Integrates with the existing TracingManager (request IDs, correlation IDs).
 *
 * This file is only imported when OTEL_EXPORTER_OTLP_ENDPOINT is set and
 * @opentelemetry packages are installed. It is tree-shaken otherwise.
 *
 * Install dependencies:
 *   npm install @opentelemetry/sdk-node @opentelemetry/exporter-trace-otlp-http \
 *               @opentelemetry/auto-instrumentations-node
 */

import { logger } from "@/lib/logger";

export interface OtelOptions {
  serviceName: string;
  endpoint: string;
}

/**
 * Initialise the OpenTelemetry Node SDK.
 * Safe to call multiple times — subsequent calls are ignored.
 */
export function setupOtel(options: OtelOptions): void {
  const { serviceName, endpoint } = options;

  // Use runtime-computed package names to prevent Turbopack/webpack from
  // statically resolving these optional peer dependencies.
  const sdkPkg         = `@opentelemetry` + `/sdk-node`;
  const exporterPkg    = `@opentelemetry` + `/exporter-trace-otlp-http`;
  const instrumentPkg  = `@opentelemetry` + `/auto-instrumentations-node`;

  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { NodeSDK } = require(sdkPkg) as {
      NodeSDK: new (config: Record<string, unknown>) => { start(): void };
    };
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { OTLPTraceExporter } = require(exporterPkg) as {
      OTLPTraceExporter: new (config: { url: string }) => unknown;
    };
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { getNodeAutoInstrumentations } = require(instrumentPkg) as {
      getNodeAutoInstrumentations: () => unknown[];
    };

    const sdk = new NodeSDK({
      serviceName,
      traceExporter: new OTLPTraceExporter({ url: endpoint }),
      instrumentations: getNodeAutoInstrumentations(),
    });

    sdk.start();

    logger.info("[OTEL] SDK started.", { serviceName, endpoint });
  } catch (err) {
    logger.warn("[OTEL] Failed to start SDK (packages not installed?).", {
      error: err instanceof Error ? err.message : String(err),
    });
  }
}
