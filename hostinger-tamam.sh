#!/usr/bin/env bash
# بعد ما ترفع المشروع وتفك أي ضغط: شغّل الملف ده مرة واحدة من الطرفية (SSH أو Terminal بتاع Hostinger)
# تأكد: Node 20+ من إعدادات التطبيق، وملف .env موجود وفيه DATABASE_URL و NEXTAUTH_URL و NEXTAUTH_SECRET

set -e
cd "$(dirname "$0")"

echo ">>> [1/5] تصحيح صلاحيات المجلدات (علشان ما يطلعش EACCES)..."
chmod -R u+rwX . 2>/dev/null || true
find . -type d -exec chmod u+rx {} \; 2>/dev/null || true

echo ">>> [2/5] تثبيت الحزم..."
npm ci

echo ">>> [3/5] Prisma generate..."
npx prisma generate

echo ">>> [4/5] دفع مخطط قاعدة البيانات..."
npx prisma db push

echo ">>> [5/5] البناء..."
npm run build

echo ""
echo "======== تمام ✅ ========"
echo "شغّل الموقع بـ:"
echo "  npm run start:hostinger"
echo ""
