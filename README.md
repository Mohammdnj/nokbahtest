# النخبة — Nokba Rental Contract Platform

Arabic RTL rental contract platform. Next.js static frontend + PHP/MySQL backend.
OTP via 4jawaly SMS. Real-time updates via SSE. Designed for Hostinger shared hosting.

## Local development

You need **two servers running at the same time**: Next.js dev (port 3000/3002)
and PHP built-in server (port 8000).

### 1. Install dependencies
```bash
cd frontend
npm install
```

### 2. Configure the frontend to call the local PHP server
```bash
cp .env.local.example .env.local
```

### 3. Start the PHP backend (terminal 1)
```bash
cd backend
php -S localhost:8000 router.php
```

### 4. Start the Next.js frontend (terminal 2)
```bash
cd frontend
npm run dev
```

Open **http://localhost:3000** (or whatever port Next picks). Register/login
will now call the PHP backend at `http://localhost:8000/api/*`.

### MySQL setup
You need a local MySQL database. Either:
- Install XAMPP / MAMP and run MySQL, then import `backend/config/schema.sql`
- Or use a remote MySQL host and edit `backend/config/database.php` or `.env`

Default credentials in `database.php` point to the Hostinger production DB,
so you can even use that for dev — just be aware you're writing to prod data.

## Deployment
See [DEPLOY.md](DEPLOY.md) for the Hostinger deployment steps.

## Stack
- **Frontend**: Next.js 16 (App Router, static export), TypeScript, Tailwind 4,
  zod, motion, @tabler/icons-react, shadcn/ui
- **Backend**: PHP 8+, MySQL (PDO), JWT (HS256), 4jawaly SMS API
- **Deployment**: Hostinger shared hosting, single domain for frontend+backend
