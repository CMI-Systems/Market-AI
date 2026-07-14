# Market-AI Backend Render Deployment

## Service Configuration

- Render service type: Web Service
- Root Directory: `Backend`
- Environment: Node
- Build Command: `cd Backend && npm install`
- Start Command: `cd Backend && npm start`

## Required Environment Variables

Set these in the Render service environment settings. Do not commit `.env` files or secret values.

- `PORT`
- `NODE_ENV=staging`
- `MARKET_AI_MODE=staging`
- `MARKET_AI_AUTO_SIM=false`
- `FRONTEND_URL`
- `CORS_ALLOWED_ORIGINS` (optional comma-separated additional approved staging origins)
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY` (backend-only; never expose through `VITE_` variables)
- `ALPACA_API_KEY`
- `ALPACA_SECRET_KEY`
- `ALPACA_BASE_URL`
- `WEBULL_APP_KEY`
- `WEBULL_APP_SECRET`
- `WEBULL_ENABLED=false`
- `WEBULL_ENV=paper`

## Frontend CORS

The backend CORS allowlist is environment-driven:

- `FRONTEND_URL` must contain the exact approved staging frontend origin.
- `CORS_ALLOWED_ORIGINS` may contain additional approved staging origins separated by commas.
- No deployed Vercel or production origin is hard-coded in source.
- `http://localhost:5173` and `http://127.0.0.1:5173` are allowed only when `NODE_ENV=development`.
- When `NODE_ENV=staging` and no approved origin is configured, browser-origin requests fail closed.

Do not place credentials, paths, wildcards, or URL query values in the origin allowlist.

## Health Check

Use this endpoint for Render health checks:

```text
GET /health
```

Expected response:

```json
{
  "status": "OK",
  "service": "Market-AI Backend",
  "version": "AICC Closed Beta v0.1",
  "timestamp": "ISO_TIMESTAMP"
}
```

## Provider Notes

- Alpaca remains the active market data provider.
- Webull remains pending and disabled until explicitly activated.
- Simulation remains disabled in staging with `MARKET_AI_AUTO_SIM=false`.
- Training and activation remain OFF.
- Provider credentials must remain backend-only.
