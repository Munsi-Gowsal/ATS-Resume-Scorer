import type { NextConfig } from "next";

/**
 * Optional packages that are dynamically required at runtime.
 * Marking them as serverExternalPackages prevents Turbopack/webpack from
 * emitting "Module not found" warnings when they are not installed.
 */
const OPTIONAL_SERVER_PACKAGES = [
  "@sentry/nextjs",
  "@opentelemetry/sdk-node",
  "@opentelemetry/exporter-trace-otlp-http",
  "@opentelemetry/auto-instrumentations-node",
];

const nextConfig: NextConfig = {
  // Standalone output: required for Docker multi-stage builds
  output: "standalone",

  // Tell Next.js to treat optional observability packages as server externals
  // (they are loaded via require() at runtime, not bundled).
  serverExternalPackages: OPTIONAL_SERVER_PACKAGES,

  // ---------------------------------------------------------------------------
  // Security Headers
  // Applied globally to every HTTP response from Next.js.
  // Note: Nginx adds HSTS and CSP in production; these headers act as a
  //       fallback when the app is accessed directly (e.g. in development).
  // ---------------------------------------------------------------------------
  headers: async () => [
    {
      source: "/(.*)",
      headers: [
        {
          key: "X-Content-Type-Options",
          value: "nosniff",
        },
        {
          key: "X-Frame-Options",
          value: "DENY",
        },
        {
          key: "Referrer-Policy",
          value: "strict-origin-when-cross-origin",
        },
        {
          key: "Permissions-Policy",
          value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
        },
        {
          key: "X-DNS-Prefetch-Control",
          value: "on",
        },
        // Strict-Transport-Security (HSTS) — only meaningful over HTTPS
        ...(process.env.NODE_ENV === "production"
          ? [
              {
                key: "Strict-Transport-Security",
                value: "max-age=63072000; includeSubDomains; preload",
              },
            ]
          : []),
        // Content-Security-Policy
        {
          key: "Content-Security-Policy",
          value: [
            "default-src 'self'",
            "script-src 'self' 'unsafe-eval' 'unsafe-inline'",
            "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
            "font-src 'self' https://fonts.gstatic.com",
            "img-src 'self' data: blob:",
            "connect-src 'self' https:",
            "frame-ancestors 'none'",
          ].join("; "),
        },
      ],
    },
  ],
};

export default nextConfig;
