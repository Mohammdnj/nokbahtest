# Deployment to Hostinger (alnokbh.sa)

This is a static Next.js frontend + PHP backend that share the same domain.
Frontend lives at `public_html/`, backend lives inside the same folder.
Frontend calls `/api/*` which is rewritten by `.htaccess` to the PHP files.

## One-time setup

### 1. Create the MySQL database
- hPanel → Databases → MySQL → create `u902557766_nokbh`, user `u902557766_Mnajashi122`
- phpMyAdmin → Import → upload `backend/config/schema.sql` → Go

### 2. Clone the repo via SSH
```bash
ssh -p 65002 u902557766@147.93.49.196
cd ~/domains/alnokbh.sa
rm -rf public_html
git clone https://github.com/Mohammdnj/nokbahtest.git public_html
cd public_html
```

### 3. Build the frontend
```bash
cd frontend
npm install
npm run build
cd ..
```

This generates `frontend/out/` with the static HTML/JS/CSS.

### 4. Lay out the public web root
Copy the frontend static files and backend PHP files into the web root.
On Hostinger, `public_html/` IS the web root. So:

```bash
# From inside ~/domains/alnokbh.sa/public_html
# Move static frontend files up
cp -r frontend/out/* .
cp -r frontend/out/.* . 2>/dev/null || true

# Move backend files up
cp -r backend/api .
cp -r backend/config .
cp -r backend/middleware .
cp backend/.htaccess .
mkdir -p storage uploads logs
chmod 755 storage uploads logs

# Optionally remove the source folders to keep the web root clean
rm -rf frontend backend node_modules
```

### 5. Create `.env` at the web root
```bash
cat > .env <<'EOF'
DB_HOST=localhost
DB_NAME=u902557766_nokbh
DB_USER=u902557766_Mnajashi122
DB_PASS=@Mm101010
JWT_SECRET=replace-with-random-64-char-string
JWT_EXPIRY=86400
ALLOWED_ORIGINS=https://alnokbh.sa,https://www.alnokbh.sa
SMS_API_KEY=ltO6o19GrWxaRMZF7EehTzfplPA6UPBLjU0scnD6
SMS_API_SECRET=lS4wV9edqMR6jzt1qpC3rcDap6i3zXe3GhPxx3wKMy2PZx9OphBdHu1Unzfo6OKuIF7Yu8niP76qf8dHXcRojB2FoJBNHLg4unvk
SMS_SENDER=WillEDU
EOF
chmod 600 .env
```

Note: `backend/config/database.php` and `backend/config/sms.php` already have
hard-coded fallbacks matching these values, so the site will work even without
the `.env` file — but creating it is still the production-correct approach.

`.env` loading is done by `config/database.php` — but it looks for `../env`
relative to `config/`. Since we moved `config/` into the web root, `.env`
needs to be at the web root, which is already handled by the script above.

### 6. Fix the `.env` path in `config/database.php`
Open `config/database.php` and verify:
```php
$envFile = __DIR__ . '/../.env';
```
After flattening the layout, `config/` lives at `public_html/config/`, so
`__DIR__ . '/../.env'` resolves to `public_html/.env` ✓ — no change needed.

### 7. Verify
- Open `https://alnokbh.sa/` → landing page should load
- Open `https://alnokbh.sa/api/auth?action=me` → should return
  `{"error":"Token required"}` with 401 (confirms PHP + routing work)
- Try register → should receive SMS OTP on the phone via 4jawaly

## Re-deploy (after code changes)

```bash
ssh -p 65002 u902557766@147.93.49.196
cd ~/domains/alnokbh.sa/public_html
git pull
cd frontend && npm install && npm run build && cd ..
cp -rf frontend/out/* .
cp -rf backend/api backend/config backend/middleware .
cp -f backend/.htaccess .
```

## Troubleshooting

| Symptom | Cause | Fix |
|---|---|---|
| `ERR_CONNECTION_REFUSED` on register | frontend was built with localhost baked in | rebuild frontend on the server — `api.ts` defaults to `/api` |
| 404 on `/api/auth?action=register` | `.htaccess` missing from web root | copy `backend/.htaccess` to `public_html/.htaccess` |
| `Database connection failed` | `.env` not found or wrong creds | check `public_html/.env` exists + permissions + values |
| `CORS blocked` | origin not whitelisted | add domain to `ALLOWED_ORIGINS` in `.env` and refresh |
| SMS not sent | 4jawaly sender not approved | OTP still saves in DB; check `logs/error.log` |
