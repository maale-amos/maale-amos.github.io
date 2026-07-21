#!/usr/bin/env bash
# deploy-pages.sh — פריסה ידנית של האתר ל-GitHub Pages.
#
# למה ידנית: GitHub Actions מושבת בחשבון שמחזיק את maale-amos.github.io
# ("Actions has been disabled for this user"), ולכן workflow הפריסה לא רץ
# מאז 10/07/2026 — כל דחיפה ל-master לא הגיעה לאוויר. Pages הועבר להגשה
# מענף gh-pages, והסקריפט הזה בונה ודוחף אליו.
#
# שימוש: bash scripts/deploy-pages.sh
set -euo pipefail

REPO_URL="https://github.com/maale-amos/maale-amos.github.io.git"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
STAGE="$(mktemp -d)"

cd "$ROOT"
echo "› בנייה…"
npm run build

echo "› בדיקות לפני פריסה…"
node scripts/content-consistency.mjs

echo "› הכנת ענף gh-pages…"
cp -r _site/. "$STAGE/"
touch "$STAGE/.nojekyll"          # בלי זה Pages מתעלם מתיקיות שמתחילות בקו תחתון
cd "$STAGE"
git init -q -b gh-pages
git add -A
git -c user.email=yosef@beit-hatalmud.org -c user.name="Yosef Schneider" \
    commit -q -m "deploy: $(cd "$ROOT" && git rev-parse --short HEAD)"
git remote add origin "$REPO_URL"
git push -q --force origin gh-pages

echo "› נפרס. אימות בעוד כדקה: https://maale-amos.github.io/"
rm -rf "$STAGE"
