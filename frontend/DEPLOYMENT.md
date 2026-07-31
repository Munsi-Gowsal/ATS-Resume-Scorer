# AI Resume Intelligence — Deployment Guide

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Environment Variables](#environment-variables)
3. [Local Development](#local-development)
4. [Docker — Single Container](#docker--single-container)
5. [Docker Compose — Full Stack](#docker-compose--full-stack)
6. [Security Headers](#security-headers)
7. [CI/CD Pipeline](#cicd-pipeline)
8. [Production Deployment](#production-deployment)
9. [Monitoring & Observability](#monitoring--observability)
10. [Troubleshooting](#troubleshooting)

---

## Prerequisites

| Tool           | Version  |
|----------------|----------|
| Node.js        | ≥ 22.x   |
| npm            | ≥ 10.x   |
| Docker         | ≥ 25.x   |
| Docker Compose | ≥ 2.x    |
| Git            | ≥ 2.x    |

---

## Environment Variables

Copy `.env.example` to `.env.local` and populate each value:

```bash
cp .env.example .env.local
```

| Variable | Required | Description |
|---|---|---|
| `NEXT_PUBLIC_API_BASE_URL` | ✅ | Backend API base URL (exposed to browser) |
| `NODE_ENV` | ✅ | `development` \| `production` \| `test` |
| `LOG_LEVEL` | ❌ | `debug` \| `info` \| `warn` \| `error` (default: `info`) |
| `SENTRY_DSN` | ❌ | Sentry project DSN. Leave blank to disable. |
| `SENTRY_ENVIRONMENT` | ❌ | `staging` \| `production` |
| `OTEL_EXPORTER_OTLP_ENDPOINT` | ❌ | OTLP collector URL (e.g. Jaeger). Leave blank to disable. |
| `OTEL_SERVICE_NAME` | ❌ | Service name in traces (default: `ai-resume-frontend`) |

> [!CAUTION]
> Never commit `.env.local`, `.env.production`, or any file containing real credentials.

---

## Local Development

```bash
# Install dependencies
npm ci

# Start dev server with HMR
npm run dev
```

The app is served at `http://localhost:3000`.

---

## Docker — Single Container

### Build

```bash
# From the frontend directory
docker build -t ai-resume-frontend:latest .
```

### Run

```bash
docker run -p 3000:3000 \
  -e NODE_ENV=production \
  -e NEXT_PUBLIC_API_BASE_URL=http://localhost:8000 \
  ai-resume-frontend:latest
```

### Health Check

```bash
curl http://localhost:3000/api/health
# {"status":"ok","uptime":42.3,"version":"0.1.0","timestamp":"2025-01-01T00:00:00.000Z"}
```

---

## Docker Compose — Full Stack

The `docker-compose.yml` at the repository root orchestrates:

- **frontend** — Next.js 16 (port 3000, internal only)
- **backend** — placeholder Node.js service (port 8000, internal only)
- **nginx** — reverse proxy (ports 80, 443 → external)

### First-time Setup

```bash
# 1. Clone and navigate to the repository root
cd ai-resume-intelligence

# 2. Create TLS certificates directory (self-signed for local, real certs for production)
mkdir -p nginx/certs

# Generate self-signed certificates for local testing:
openssl req -x509 -nodes -days 365 \
  -newkey rsa:2048 \
  -keyout nginx/certs/privkey.pem \
  -out nginx/certs/fullchain.pem \
  -subj "/CN=localhost"

# 3. Create environment file
cp frontend/.env.example frontend/.env.local

# 4. Build and start all services
docker compose up --build -d
```

### Useful Commands

```bash
# View running services
docker compose ps

# Follow all logs
docker compose logs -f

# Follow a specific service
docker compose logs -f frontend

# Stop all services
docker compose down

# Stop and remove volumes
docker compose down -v

# Rebuild a single service
docker compose up --build frontend -d
```

---

## Security Headers

The following headers are applied at two layers:

### Next.js (`next.config.ts`) — all routes

| Header | Value |
|---|---|
| `X-Content-Type-Options` | `nosniff` |
| `X-Frame-Options` | `DENY` |
| `Referrer-Policy` | `strict-origin-when-cross-origin` |
| `Permissions-Policy` | camera, microphone, geolocation, cohort disabled |
| `Content-Security-Policy` | `default-src 'self'` with specific allowlists |
| `Strict-Transport-Security` | `max-age=63072000; includeSubDomains; preload` (production only) |

### Nginx (`nginx/default.conf`) — reinforced at proxy layer

Same headers above plus `http2` and TLS-level enforcements.

---

## CI/CD Pipeline

GitHub Actions runs on every push and pull request to `main` / `master` / `develop`.

### Pipeline Stages

```
lint-and-typecheck ──┬──► build ──────► playwright
                     │
                     └──► docker-build
```

| Job | Description |
|---|---|
| `lint-and-typecheck` | `tsc --noEmit` + `eslint --max-warnings=0` |
| `build` | `npm run build`, uploads `.next` artifact |
| `playwright` | Downloads build artifact, runs all 22 E2E tests, uploads report |
| `docker-build` | Validates `Dockerfile` compiles via BuildKit cache |

### Secrets (GitHub → Settings → Secrets)

| Secret | Purpose |
|---|---|
| `NEXT_PUBLIC_API_BASE_URL` | Backend URL injected at build time |

---

## Production Deployment

### Vercel (recommended for Next.js)

```bash
npx vercel --prod
```

Set environment variables in the Vercel dashboard under **Project → Settings → Environment Variables**.

### Self-hosted (Docker Compose on VPS)

```bash
# Pull latest code
git pull origin main

# Rebuild and restart
docker compose pull
docker compose up --build -d

# Verify health
curl https://yourdomain.com/api/health
```

### Self-hosted (Kubernetes)

1. Build and push the Docker image to your container registry:
   ```bash
   docker build -t registry.yourdomain.com/ai-resume-frontend:v1.0.0 .
   docker push registry.yourdomain.com/ai-resume-frontend:v1.0.0
   ```

2. Apply your Kubernetes manifests (Deployment, Service, Ingress).

3. Set environment variables via Kubernetes `ConfigMap` and `Secret`.

---

## Monitoring & Observability

### Logging

All application logs are structured JSON, emitted to stdout:

```json
{"timestamp":"2025-01-01T00:00:00.000Z","level":"info","message":"...","context":{}}
```

Aggregate with any log shipper (Datadog, Loki, CloudWatch).

### Sentry Error Tracking

1. Create a project at [sentry.io](https://sentry.io).
2. Copy the DSN.
3. Set `SENTRY_DSN` in your environment.
4. Install the SDK: `npm install @sentry/nextjs`.

### OpenTelemetry Tracing

1. Deploy an OTLP-compatible collector (Jaeger, Grafana Tempo, Honeycomb).
2. Set `OTEL_EXPORTER_OTLP_ENDPOINT` to your collector's OTLP HTTP endpoint.
3. Install SDK packages:
   ```bash
   npm install @opentelemetry/sdk-node \
               @opentelemetry/exporter-trace-otlp-http \
               @opentelemetry/auto-instrumentations-node
   ```

### Health Check

| Endpoint | Method | Response |
|---|---|---|
| `/api/health` | `GET` | `200 {"status":"ok","uptime":N,"version":"x.x.x","timestamp":"..."}` |

---

## Troubleshooting

### `docker build` fails with `Cannot find module`

Ensure `output: 'standalone'` is set in `next.config.ts`. The Dockerfile copies the standalone output.

### Nginx returns `502 Bad Gateway`

- Verify the `frontend` container is healthy: `docker compose ps`
- Check logs: `docker compose logs frontend`
- Confirm the container started with: `docker compose exec frontend wget -qO- http://localhost:3000/api/health`

### TLS certificate errors (local)

Self-signed certificates will trigger browser warnings. Accept the warning or add the certificate to your system's trust store:

```bash
# macOS
sudo security add-trusted-cert -d -r trustRoot -k /Library/Keychains/System.keychain nginx/certs/fullchain.pem
```

### ESLint fails in CI

Run locally first:
```bash
npx eslint . --max-warnings=0
```

### Playwright tests fail in CI

Ensure browsers are installed:
```bash
npx playwright install --with-deps chromium
```

Check if the dev server is running when tests use `webServer` config in `playwright.config.ts`.

### Out-of-memory during `npm run build`

Increase Node.js heap size:
```bash
NODE_OPTIONS="--max-old-space-size=4096" npm run build
```
