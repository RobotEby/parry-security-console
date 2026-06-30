# Parry Security Console

Read-only security dashboard for the Parry Admin API.

## Overview

Parry Security Console is the frontend dashboard for the Parry ecosystem. It connects to the Admin API exposed by `@roboteby/parry` and presents operational security data for application-layer defenses.

The console shows service health, metrics, Threat Events, active bans/blocks, and configured policies. It is read-only in this version: it does not run middleware logic, does not create a backend, does not execute payloads, and is not a scanner.

Parry Security Console complements Parry's Express middleware. It does not replace CloudFront, AWS WAF, Shield, a CDN, a load balancer, or edge/network DDoS protection.

## Features

- Dashboard overview for request and event metrics
- Threat Events list with filters and pagination
- Event detail view with sanitized metadata
- Bans and blocks view
- Route policies view
- Health page for Admin API status
- Settings for Admin API URL and optional local/demo token
- Mock Mode for local UI work without a backend
- Remote API mode for a real Parry Admin API

## Architecture

The console is a Vite single-page application built with:

- React
- TypeScript
- React Router
- TanStack Query
- Zod
- Recharts
- Tailwind CSS
- Vitest and React Testing Library

The application validates Admin API responses with Zod before rendering them and redacts sensitive metadata fields before display.

## Local Development

```bash
npm install
npm run dev
```

Open the URL printed by Vite.

For local end-to-end development, run the backend Docker demo in the Parry middleware repository:

```bash
# in parry-express-security-middleware
docker compose up --build

# in parry-security-console
npm run dev
```

## Configuration

Create a local `.env.local` file for development:

```env
VITE_PARRY_API_URL=/api/parry
VITE_PARRY_ADMIN_TOKEN=change-me
```

The Vite development server proxies `/api/parry` to `http://localhost:3000/_parry`, so the browser can use the backend demo without enabling CORS.

Direct API access is also possible when the backend explicitly enables CORS for the console origin:

```env
VITE_PARRY_API_URL=http://localhost:3000/_parry
VITE_PARRY_ADMIN_TOKEN=change-me
```

Do not commit `.env.local`. Keep real tokens in local development files or deployment secret managers.

## Mock Mode

Leaving `VITE_PARRY_API_URL` empty enables Mock Mode. The console then renders realistic local fixtures and does not call a remote Admin API.

Mock Mode is useful for UI development, demos, and tests that do not need a running backend.

## Connecting to Parry

With the backend Docker demo running:

```bash
curl http://localhost:3000/health

curl http://localhost:3000/_parry/health \
  -H "x-parry-admin-token: change-me"
```

Then start the console with:

```env
VITE_PARRY_API_URL=/api/parry
VITE_PARRY_ADMIN_TOKEN=change-me
```

The console sends `x-parry-admin-token` only when a non-empty token is configured.

## Production Security

Browser-visible Admin API tokens are appropriate only for local development and demos.

For production, protect the Admin API with an external access boundary such as:

- VPN or private network access
- Cloudflare Access
- AWS ALB Auth or Cognito
- private reverse proxy authentication
- IP allowlists
- a backend/admin gateway

In those deployments, leave the browser token empty and let the external gateway own the session and access decision:

```env
VITE_PARRY_API_URL=https://admin.example.com/_parry
VITE_PARRY_ADMIN_TOKEN=
```

The console does not implement a login screen, OAuth provider, user database, scanner, or mutation workflow.

## Scripts

```bash
npm run typecheck
npm run test
npm run build
npm run lint
```

## Testing

Vitest uses the committed `.env.test` file with empty `VITE_PARRY_API_URL` and `VITE_PARRY_ADMIN_TOKEN` values. This keeps tests in Mock Mode even when `.env.local` points to the local Docker demo.

```bash
npm run test
```

## Deployment

Parry Security Console is a static frontend. It can be deployed to platforms such as:

- S3 and CloudFront
- Cloudflare Pages
- Vercel
- Netlify
- any static hosting service

Protect the Admin API separately. Deploying the console publicly does not make the Admin API safe to expose without authentication and network controls.

## License

MIT
