# Pomofocus Production Deployment Guide

This guide covers deploying Pomofocus to production with all features enabled, including authentication, database, and real-time sync.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Environment Variables](#environment-variables)
3. [Database Setup](#database-setup)
4. [Authentication Configuration](#authentication-configuration)
5. [Deployment Options](#deployment-options)
6. [Post-Deployment Steps](#post-deployment-steps)
7. [Monitoring & Maintenance](#monitoring--maintenance)
8. [Troubleshooting](#troubleshooting)

---

## Prerequisites

Before deploying, ensure you have:

- Node.js 18+ installed
- A PostgreSQL database (recommended for production)
- A hosting platform account (Vercel, Railway, Render, etc.)
- OAuth credentials (optional, for Google/GitHub login)

---

## Environment Variables

Create a `.env.production` file with the following variables:

### Required Variables

```bash
# Database
DATABASE_URL="postgresql://user:password@host:5432/pomofocus?sslmode=require"

# NextAuth
NEXTAUTH_SECRET="your-super-secret-key-min-32-characters"
NEXTAUTH_URL="https://your-domain.com"
```

### Optional Variables (OAuth Providers)

```bash
# Google OAuth (optional)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# GitHub OAuth (optional)
GITHUB_CLIENT_ID="your-github-client-id"
GITHUB_CLIENT_SECRET="your-github-client-secret"
```

### Generate NEXTAUTH_SECRET

Run this command to generate a secure secret:

```bash
openssl rand -base64 32
```

---

## Database Setup

### Option 1: PostgreSQL (Recommended)

#### Using Supabase (Free tier available)

1. Create a project at [supabase.com](https://supabase.com)
2. Go to Settings → Database
3. Copy the connection string (use "Connection pooling" for serverless)
4. Update `DATABASE_URL` in your environment

#### Using Railway

1. Create a new project at [railway.app](https://railway.app)
2. Add a PostgreSQL plugin
3. Copy the `DATABASE_URL` from the variables tab

#### Using Neon (Free tier available)

1. Create a project at [neon.tech](https://neon.tech)
2. Copy the connection string from the dashboard
3. Add `?sslmode=require` to the connection string

### Update Prisma Schema

Change the datasource provider in `prisma/schema.prisma`:

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

### Run Migrations

```bash
# Generate Prisma client
npx prisma generate

# Push schema to database
npx prisma db push

# Seed initial data (achievements, quotes)
npx tsx prisma/seed.ts
```

---

## Authentication Configuration

### Email/Password Authentication

Email/password authentication works out of the box. Users can register at `/auth/signup`.

### Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Navigate to APIs & Services → Credentials
4. Create OAuth 2.0 Client ID
5. Add authorized redirect URIs:
   - `https://your-domain.com/api/auth/callback/google`
   - `http://localhost:3000/api/auth/callback/google` (for development)
6. Copy Client ID and Client Secret to environment variables

### GitHub OAuth Setup

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Create a new OAuth App
3. Set Authorization callback URL:
   - `https://your-domain.com/api/auth/callback/github`
4. Copy Client ID and Client Secret to environment variables

---

## Deployment Options

### Option 1: Vercel (Recommended)

Vercel offers the best Next.js deployment experience with zero configuration.

#### Steps:

1. Push your code to GitHub/GitLab/Bitbucket

2. Import project at [vercel.com/new](https://vercel.com/new)

3. Add environment variables in Project Settings → Environment Variables

4. Deploy!

#### vercel.json (optional):

```json
{
  "buildCommand": "prisma generate && next build",
  "framework": "nextjs"
}
```

### Option 2: Railway

Railway offers easy database + app deployment in one place.

#### Steps:

1. Create a new project at [railway.app](https://railway.app)

2. Add PostgreSQL service

3. Add a new service from GitHub repo

4. Add environment variables (Railway auto-injects DATABASE_URL)

5. Set start command: `npm run start`

### Option 3: Docker

Use the included Dockerfile for containerized deployment.

```dockerfile
# Build stage
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npx prisma generate
RUN npm run build

# Production stage
FROM node:18-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

EXPOSE 3000
ENV PORT=3000
CMD ["node", "server.js"]
```

Build and run:

```bash
docker build -t pomofocus .
docker run -p 3000:3000 --env-file .env.production pomofocus
```

### Option 4: Self-Hosted (VPS)

For deployment on a VPS (DigitalOcean, Linode, AWS EC2, etc.):

```bash
# Clone repository
git clone https://github.com/your-repo/pomofocus.git
cd pomofocus

# Install dependencies
npm ci

# Set up environment
cp .env.example .env.production
# Edit .env.production with your values

# Build
npx prisma generate
npm run build

# Run with PM2
npm install -g pm2
pm2 start npm --name "pomofocus" -- start

# Set up Nginx reverse proxy (see below)
```

#### Nginx Configuration:

```nginx
server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com;

    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

---

## Post-Deployment Steps

### 1. Verify Database Connection

```bash
# Check database connectivity
npx prisma db push --preview-feature

# Verify seed data
npx prisma studio
```

### 2. Test Authentication Flow

1. Visit `/auth/signup` and create a test account
2. Verify email/password login works
3. Test OAuth providers if configured
4. Check that sessions persist

### 3. Verify API Endpoints

```bash
# Health check
curl https://your-domain.com/api

# Test authentication (should return 401)
curl https://your-domain.com/api/user
```

### 4. Set Up Monitoring (Optional)

#### Sentry (Error Tracking)

```bash
npm install @sentry/nextjs
npx @sentry/wizard -i nextjs
```

#### Vercel Analytics

```bash
npm install @vercel/analytics
```

Add to `layout.tsx`:

```tsx
import { Analytics } from '@vercel/analytics/react';

// In your layout
<Analytics />
```

### 5. Configure Cron Jobs (Optional)

For features like weekly reports and leaderboard updates:

#### Vercel Cron (vercel.json):

```json
{
  "crons": [
    {
      "path": "/api/cron/update-leaderboard",
      "schedule": "0 * * * *"
    },
    {
      "path": "/api/cron/send-weekly-reports",
      "schedule": "0 9 * * 1"
    }
  ]
}
```

---

## Monitoring & Maintenance

### Database Backups

#### Supabase

Automatic daily backups included (Pro plan).

#### Manual PostgreSQL Backup

```bash
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d).sql
```

### Performance Monitoring

1. **Vercel Dashboard**: Built-in performance metrics
2. **Prisma Metrics**: Add to `schema.prisma`:

```prisma
generator client {
  provider        = "prisma-client-js"
  previewFeatures = ["metrics"]
}
```

### Log Management

View logs based on your platform:

- **Vercel**: Functions → Logs
- **Railway**: Deployments → View Logs
- **Docker**: `docker logs pomofocus`
- **PM2**: `pm2 logs pomofocus`

---

## Troubleshooting

### Common Issues

#### "NEXTAUTH_SECRET is not set"

Ensure `NEXTAUTH_SECRET` is set in your environment variables. Generate one with:

```bash
openssl rand -base64 32
```

#### Database Connection Errors

1. Check `DATABASE_URL` format
2. Ensure SSL is configured: `?sslmode=require`
3. Check IP allowlist on database provider
4. Verify connection pooling settings for serverless

#### OAuth Callback Errors

1. Verify redirect URIs match exactly
2. Check that `NEXTAUTH_URL` matches your domain
3. Ensure OAuth credentials are correct

#### Build Errors

```bash
# Clear cache and rebuild
rm -rf .next node_modules
npm install
npx prisma generate
npm run build
```

#### Prisma Client Issues

```bash
# Regenerate Prisma client
npx prisma generate

# If using Docker, ensure Prisma is generated in build stage
```

### Getting Help

- **GitHub Issues**: Report bugs and request features
- **Discord**: Join our community for real-time help
- **Documentation**: Check `/docs` for detailed guides

---

## Security Checklist

Before going live, verify:

- [ ] `NEXTAUTH_SECRET` is a strong, unique value
- [ ] Database credentials are not exposed
- [ ] OAuth redirect URIs are correctly configured
- [ ] HTTPS is enabled and enforced
- [ ] Rate limiting is configured (see API routes)
- [ ] CORS is properly configured
- [ ] Environment variables are not committed to git
- [ ] Database has proper access controls
- [ ] Backups are configured and tested

---

## Scaling Considerations

### Database

- Use connection pooling (PgBouncer, Prisma Data Proxy)
- Add read replicas for heavy read workloads
- Consider Redis for caching sessions and leaderboards

### Application

- Deploy to multiple regions (Vercel Edge, Cloudflare Workers)
- Use CDN for static assets
- Implement proper caching headers

### Real-time Features

For Focus Rooms real-time sync:

- Consider Supabase Realtime or Pusher
- Implement WebSocket connections
- Use Redis Pub/Sub for horizontal scaling

---

## Support

For deployment assistance or enterprise support, contact:

- Email: support@pomofocus.io
- GitHub: [Create an issue](https://github.com/your-repo/pomofocus/issues)

---

*Last updated: January 2025*