# SaaS Starter Kit

A production-ready SaaS starter kit built with FastAPI, PostgreSQL, SQLAlchemy, Stripe, and Next.js.

## Architecture

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Next.js   │────▶│   FastAPI   │────▶│  PostgreSQL  │
│  Frontend   │◀────│   Backend   │◀────│   Database   │
│  :3000      │     │  :8000      │     │  :5433       │
└─────────────┘     └──────┬──────┘     └─────────────┘
                           │
                    ┌──────┴──────┐
                    │   Stripe    │
                    │   Resend    │
                    └─────────────┘
```

## Stack

| Layer     | Technology                          |
|-----------|-------------------------------------|
| Frontend  | Next.js 14, TypeScript, Tailwind    |
| Backend   | FastAPI, SQLAlchemy, Pydantic       |
| Database  | PostgreSQL 16                       |
| Auth      | JWT (access + refresh tokens)       |
| Payments  | Stripe (subscriptions + webhooks)   |
| Email     | Resend                              |
| DevOps    | Docker Compose                      |

## Quick Start

```bash
# 1. Clone and configure
cp .env.example .env
# Edit .env with your keys

# 2. Start services
docker compose up -d

# 3. Run migrations
docker compose exec backend alembic upgrade head

# 4. Seed the database
docker compose exec backend python seed.py

# 5. Open
# Backend:  http://localhost:8000/health
# API docs: http://localhost:8000/docs
# Frontend: http://localhost:3000
```

## Default Users (after seeding)

| Email              | Password    | Role        | Plan       |
|--------------------|-------------|-------------|------------|
| admin@saaskit.com  | admin123    | super_admin | enterprise |
| alice@example.com  | password123 | user        | starter    |
| bob@example.com    | password123 | user        | free       |

## Project Structure

```
saas-starter-kit/
├── backend/
│   ├── app/
│   │   ├── api/            # Route handlers
│   │   ├── core/           # Config, database, security, deps
│   │   ├── models/         # SQLAlchemy models
│   │   ├── schemas/        # Pydantic schemas
│   │   └── services/       # Business logic (Stripe, email)
│   ├── alembic/            # Database migrations
│   ├── main.py             # FastAPI app entrypoint
│   ├── seed.py             # Database seeder
│   └── Dockerfile
├── frontend/               # Next.js app
├── docker-compose.yml
├── .env.example
└── README.md
```
