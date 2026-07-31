import { NextResponse } from "next/server";

/**
 * GET /api/health
 *
 * Health check endpoint used by Docker HEALTHCHECK and load balancers.
 * Returns a 200 JSON payload with uptime, version, and a timestamp.
 */
export async function GET(): Promise<NextResponse> {
  const version = process.env.npm_package_version ?? "0.1.0";

  const payload = {
    status: "ok",
    uptime: process.uptime(),
    version,
    timestamp: new Date().toISOString(),
  };

  return NextResponse.json(payload, { status: 200 });
}
