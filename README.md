# TextFlow API

A production-grade multi-tenant Text-to-Speech backend API built with TypeScript and Node.js.

## Tech Stack
- **Runtime:** TypeScript / Node.js
- **Framework:** Express.js
- **Database:** PostgreSQL
- **Auth:** JWT (access + refresh tokens)
- **Containerization:** Docker + Docker Compose
- **Cloud:** Designed for GCP Cloud Run deployment

## Features
- JWT authentication with refresh tokens
- Tiered subscription management (Free / Pro / Enterprise)
- Character-based usage tracking and enforcement
- Mock Stripe webhook handling (payment success/failed/cancelled)
- Dockerized for cloud deployment

## API Endpoints

### Auth
- `POST /auth/register` — Register new user
- `POST /auth/login` — Login and get JWT tokens
- `GET /auth/profile` — Get user profile (protected)

### Subscriptions
- `GET /subscription` — Get current subscription (protected)
- `PUT /subscription/plan` — Upgrade/downgrade plan (protected)
- `POST /subscription/webhook` — Mock Stripe webhook

### Usage
- `POST /usage/track` — Track character usage (protected)
- `GET /usage/stats` — Get usage statistics (protected)

## Subscription Tiers
| Plan | Characters/month | Price |
|------|-----------------|-------|
| Free | 10,000 | $0 |
| Pro | 500,000 | $9.99 |
| Enterprise | Unlimited | $49.99 |

## Running Locally
```bash
# Start database
docker-compose up -d

# Install dependencies
npm install

# Start server
npm run dev
```

## Deployment
Containerized with Docker for deployment on GCP Cloud Run.
```bash
docker build -t textflow-api .
docker run -p 3000:3000 textflow-api
```