#!/usr/bin/env bash
# تشغّله من SSH بحساب الاستضافة (بدون sudo). لو رقم حسابك غير الرقم هذا، عدّل المسار.
BASE="${1:-/home/u754458241/domains/morsall.com/public_html}"
SRC="$BASE/.builds/source"

echo "تحقّق إن مسار المصدر صحيح: $SRC"
if [[ ! -d "$SRC" ]]; then
  echo "المجلد مش موجود — غيّر BASE في أول السكربت أو مرّر المسار كأول براميتر."
  exit 1
fi

echo ">>> صلاحيات المجلدات (755) والملفات (644) تحت .builds/source"
find "$SRC" -type d -exec chmod 755 {} \;
find "$SRC" -type f -exec chmod 644 {} \;

echo ">>> التأكد من إن admin/dashboard مجلد وليس ملف:"
ls -la "$SRC/src/app/admin/" 2>/dev/null || ls -la "$SRC/src/app/" 2>/dev/null

echo "تم. جرّب إعادة النشر من hPanel."
