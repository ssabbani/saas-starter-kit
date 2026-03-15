# Deployment Guide

## Prerequisites

- Docker & Docker Compose
- A domain name (for production)
- Stripe account (for billing)
- Resend account (for transactional emails)

---

## Option 1: AWS Lightsail / VPS

### 1. Provision a Server

Create a Lightsail instance (or any VPS) with at least **2 GB RAM** running Ubuntu 22.04.

```bash
# SSH into your server
ssh ubuntu@your-server-ip
```

### 2. Install Docker

```bash
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER
# Log out and back in for group to take effect
```

### 3. Clone and Configure

```bash
git clone https://github.com/your-org/saas-starter-kit.git
cd saas-starter-kit

# Create production .env
cp .env.example .env
nano .env
```

Set these values in `.env`:

```env
ENVIRONMENT=production
SECRET_KEY=<random-64-char-string>
FRONTEND_URL=https://yourdomain.com
BACKEND_URL=https://api.yourdomain.com

POSTGRES_PASSWORD=<strong-random-password>

STRIPE_SECRET_KEY=sk_live_...
STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

RESEND_API_KEY=re_...
FROM_EMAIL=noreply@yourdomain.com
```

### 4. Start Services

```bash
docker compose up -d

# Run migrations
docker compose exec backend alembic upgrade head

# (Optional) Seed demo data
docker compose exec backend python seed.py
```

### 5. Set Up Nginx + SSL

```bash
sudo apt install nginx certbot python3-certbot-nginx

# Create Nginx config
sudo nano /etc/nginx/sites-available/saas
```

```nginx
server {
    server_name yourdomain.com;
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}

server {
    server_name api.yourdomain.com;
    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/saas /etc/nginx/sites-enabled/
sudo certbot --nginx -d yourdomain.com -d api.yourdomain.com
sudo systemctl reload nginx
```

### 6. Configure DNS

Point your domain A records:
- `yourdomain.com` → your server IP
- `api.yourdomain.com` → your server IP

### 7. Configure Stripe Webhooks

In the Stripe Dashboard → Developers → Webhooks:
- Endpoint URL: `https://api.yourdomain.com/api/billing/webhooks/stripe`
- Events: `customer.subscription.created`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.payment_failed`
- Copy the webhook signing secret to `STRIPE_WEBHOOK_SECRET` in `.env`

### 8. Verify Resend Domain

In the Resend Dashboard, add and verify your sending domain to improve deliverability.

---

## Option 2: Railway

### 1. Connect Repo

- Go to [railway.app](https://railway.app) and create a new project
- Connect your GitHub repository

### 2. Add Services

Add three services:
1. **PostgreSQL** — Use Railway's managed Postgres plugin
2. **Backend** — Point to `./backend` directory
3. **Frontend** — Point to `./frontend` directory

### 3. Configure Environment Variables

Set variables on each service. The backend needs:
- `DATABASE_URL` (auto-set by Railway Postgres plugin)
- `SECRET_KEY`, `STRIPE_*`, `RESEND_API_KEY`, `FRONTEND_URL`, `BACKEND_URL`

The frontend needs:
- `NEXT_PUBLIC_API_URL` pointing to the backend service URL

### 4. Deploy

Railway auto-deploys on push to main. Verify:
- Backend health: `https://your-backend.up.railway.app/health`
- Frontend: `https://your-frontend.up.railway.app`

---

## Option 3: Render

### 1. Create Services

In [render.com](https://render.com):
- **Web Service (Backend)**: Docker, root dir `./backend`
- **Static Site (Frontend)**: or Web Service, root dir `./frontend`, build cmd `npm run build`, start cmd `npm start`
- **PostgreSQL**: Managed database

### 2. Configure

Set environment variables on each service (same as Railway).

---

## Production Checklist

### Security
- [ ] Change `SECRET_KEY` to a random 64-character string (`openssl rand -hex 32`)
- [ ] Set `ENVIRONMENT=production`
- [ ] Configure `FRONTEND_URL` and `BACKEND_URL` with production domains
- [ ] Configure CORS to allow only your production domain
- [ ] Set up SSL/TLS (via Nginx + Certbot or platform-managed)
- [ ] Review rate limiting values for production traffic
- [ ] Use a strong `POSTGRES_PASSWORD`

### Stripe
- [ ] Configure Stripe **live** keys (not test keys)
- [ ] Set up webhook endpoint pointing to production URL
- [ ] Copy webhook signing secret to `STRIPE_WEBHOOK_SECRET`
- [ ] Create price IDs in Stripe and update env vars
- [ ] Test full billing flow in Stripe test mode first

### Email
- [ ] Set up Resend account with verified domain
- [ ] Configure `FROM_EMAIL` with your domain
- [ ] Test email delivery (signup verification, password reset)

### Database
- [ ] Configure automated database backups
- [ ] Run `alembic upgrade head` on first deploy
- [ ] Set appropriate connection pool sizes for production load

### Monitoring
- [ ] Set up uptime monitoring on `/health` endpoint
- [ ] Configure error alerting (Sentry, LogDNA, or similar)
- [ ] Set up log aggregation for production debugging

### Testing
- [ ] Test full auth flow (signup → verify → login → logout)
- [ ] Test full billing flow (checkout → subscription → portal → cancel)
- [ ] Test webhook delivery from Stripe
- [ ] Test password reset email flow
- [ ] Test admin panel access and operations
- [ ] Verify rate limiting works correctly
- [ ] Test on mobile devices

### Performance
- [ ] Enable gzip/brotli compression in Nginx
- [ ] Set `Cache-Control` headers for static assets
- [ ] Verify database indexes are in place
- [ ] Load test critical API endpoints
