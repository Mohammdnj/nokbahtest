#!/usr/bin/env bash
# Build + stage a ready-to-upload deployment folder at ./deploy/
# Run on your local machine, then upload `deploy/*` to public_html/ on Hostinger.

set -e
cd "$(dirname "$0")"

echo "▶ Building frontend..."
cd frontend
npm install --silent
npm run build
cd ..

echo "▶ Staging deploy folder..."
rm -rf deploy
mkdir -p deploy

# Static frontend files
cp -r frontend/out/* deploy/
cp -r frontend/out/.* deploy/ 2>/dev/null || true

# Backend PHP files
cp -r backend/api deploy/api
cp -r backend/config deploy/config
cp -r backend/middleware deploy/middleware
cp backend/.htaccess deploy/.htaccess

# Writable folders
mkdir -p deploy/storage deploy/uploads deploy/logs

# Strip unused backend files
rm -f deploy/api/contracts.php  # old contracts endpoint (unused)

echo "✓ Done. Upload the CONTENTS of ./deploy/ to public_html/ on Hostinger."
echo "  Total size:"
du -sh deploy 2>/dev/null || true
