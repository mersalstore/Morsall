# 🚀 دليل نشر Morsall على Hostinger

## المشكلة الأصلية
موقعك بيظهر بشكل غريب على Hostinger لأن:
1. **LiteSpeed** (الـ Web Server اللي Hostinger بيستخدمه) بيمنع الوصول للفولدرات اللي بتبدأ بنقطة (`.next`)
2. **الـ CSS والـ JavaScript** مش بتتحمل صح لأن الـ Static Assets مش بتتخدم من المسار الصح
3. **الـ Routing** بيحتاج إعدادات خاصة عشان يوجه كل الطلبات لـ `server.js`

## الحل النهائي ✅

### الخطوة 1: تحديث ملف `.htaccess`
تم إنشاء ملف `.htaccess` محسّن يحتوي على:
- ✅ Proxy rules صح لـ LiteSpeed
- ✅ Static file serving من `_next/static` و `public`
- ✅ Security headers
- ✅ Gzip compression
- ✅ Cache control

**الملف موجود في:** `.htaccess`

### الخطوة 2: استخدام Server محسّن (اختياري)
تم إنشاء `server-hostinger.js` بميزات إضافية:
- ✅ Explicit static file serving
- ✅ Correct MIME types
- ✅ Better error handling

**الاستخدام:**
```bash
# بدل ما تستخدم server.js، استخدم server-hostinger.js
node server-hostinger.js
```

أو عدّل `package.json`:
```json
"start": "node server-hostinger.js"
```

### الخطوة 3: إعدادات البيئة
تأكد من أن هذه المتغيرات موجودة في Hostinger Control Panel:

```env
POSTGRES_PRISMA_URL=postgresql://...
POSTGRES_URL_NON_POOLING=postgresql://...
DATABASE_URL=postgresql://...
NEXTAUTH_URL=https://morsall.com
NEXTAUTH_SECRET=MersalEliteSecret2026
GOOGLE_CLIENT_ID=949180865508-uc3av4gfh0he5u7dqub8es9g9crgrduu.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=<your-secret>
PRISMA_CLIENT_ENGINE_TYPE=binary
NODE_ENV=production
```

### الخطوة 4: البناء والنشر
```bash
# 1. بناء المشروع
npm run build

# 2. نسخ الـ Static Assets إلى _next (مهم جداً!)
if exist _next (rmdir /s /q _next)
mkdir _next
xcopy /e /i /y .next\static _next\static

# 3. رفع الملفات على Hostinger
# استخدم FTP أو Git (إذا كان Hostinger مفعّل Git)
```

### الخطوة 5: تفعيل Node.js على Hostinger
1. اذهب إلى **Hostinger Control Panel**
2. ابحث عن **Node.js** أو **Application Manager**
3. اختر **Create Application**
4. اختر **Node.js** كـ Runtime
5. اختر **Port 3000**
6. اختر **Startup File**: `server.js` أو `server-hostinger.js`
7. اختر **Environment**: Production
8. أضف متغيرات البيئة

## ✅ التحقق من النجاح

بعد النشر، تحقق من:

1. **الـ CSS بتظهر صح** ✓
2. **الصور بتحمل** ✓
3. **الـ Navigation بتشتغل** ✓
4. **الـ API calls بتشتغل** ✓
5. **الـ Authentication بتشتغل** ✓

## 🔧 استكشاف الأخطاء

### المشكلة: الـ CSS مش ظاهر
**الحل:**
```bash
# تأكد من أن _next/static موجود
ls -la _next/static/

# إذا كان فارغ، انسخ من .next
mkdir -p _next
cp -r .next/static/* _next/static/
```

### المشكلة: الصور مش ظاهرة
**الحل:**
- تأكد من أن ملفات الصور موجودة في `public/`
- تأكد من أن الـ paths صح في الكود

### المشكلة: الـ API مش بتشتغل
**الحل:**
- تأكد من أن متغيرات البيئة موجودة
- تأكد من أن الـ Database Connection String صح
- شوف الـ Logs في Hostinger

## 📝 ملاحظات مهمة

1. **الـ `.next` folder**: لا تحذفه! هو بيحتوي على الـ Build output
2. **الـ `_next` folder**: هذا للـ Static Assets فقط (CSS, JS, images)
3. **الـ `public` folder**: للـ Public assets (logos, favicons, etc.)
4. **الـ `.htaccess`**: مهم جداً لـ Routing على LiteSpeed

## 🎯 الخطوات السريعة

```bash
# 1. Build
npm run build

# 2. Prepare static assets
rm -rf _next
mkdir -p _next/static
cp -r .next/static/* _next/static/

# 3. Deploy
git add .
git commit -m "Hostinger deployment fix"
git push origin main

# 4. Check Hostinger logs
# Go to Hostinger Control Panel > Logs
```

## 📞 الدعم

إذا استمرت المشكلة:
1. تحقق من Hostinger Logs
2. تأكد من أن Node.js مفعّل
3. تأكد من أن الـ Port 3000 مفتوح
4. تواصل مع Hostinger Support

---

**آخر تحديث:** 2026-05-01
**الإصدار:** 1.0
