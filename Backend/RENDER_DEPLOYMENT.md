# Market-AI Backend Render Deployment

## Service Configuration

- Render service type: Web Service
- Root Directory: `Backend`
- Environment: Node
- Build Command: `npm install`
- Start Command: `npm start`

## Required Environment Variables

Set these in the Render service environment settings. Do not commit `.env` files or secret values.

- `PORT`
- `NODE_ENV`
- `FRONTEND_URL`
- `ALPACA_API_KEY`
- `ALPACA_SECRET_KEY`
- `ALPACA_BASE_URL`
- `WEBULL_APP_KEY`
- `WEBULL_APP_SECRET`
- `WEBULL_ENABLED=false`
- `WEBULL_ENV=paper`

## Frontend CORS

The backend accepts requests from:

- `http://localhost:5173`
- `http://localhost:3001`
- `https://market-ai-one-kappa.vercel.app`
- `FRONTEND_URL` when configured

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
- Simulation fallback remains available for resilience.
- Provider credentials must remain backend-only.
