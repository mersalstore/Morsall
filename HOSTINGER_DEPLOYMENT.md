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
DATABASE_URL=postgresql://USER:PASS@HOST:5432/DATABASE?sslmode=require
# اختياري لو عندك رابط pooled منفصل (Neon وهكذا):
POSTGRES_PRISMA_URL=
POSTGRES_URL_NON_POOLING=
NEXTAUTH_URL=https://your-domain.com
NEXTAUTH_SECRET=ضع_هنا_نصًا_طويلًا_عشوائيًا_سريًّا
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
PRISMA_CLIENT_ENGINE_TYPE=binary
NODE_ENV=production
```

**ملاحظة:** لو حطّيت `DATABASE_URL` بس، السيرفر بيكمّل `POSTGRES_*` لوحده. ما تحطش أسرارك في ملف Git.

### الخطوة 4: البناء والنشر
```bash
# 1. بناء المشروع (بعدها يشتغل تلقائيًا نسخ .next/static → _next/static)
npm run build

# على السيرفر: دفع الجداول مرة واحدة قبل أو بعد البناء حسب خطتك، مع متغيرات البيئة مضبوطة:
npx prisma db push

# 2. رفع الملفات على Hostinger
# استخدم FTP أو Git — رفع مجلد _next/static ضروري مع .next وباقي المشروع
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
# Build (بيولّد .next وبعدين postbuild بينسخ لـ _next/static تلقائيًا)
npm run build

# على السيرفر مع DATABASE_URL ظاهر في البيئة:
npx prisma db push

# Deploy: ارفع الملفات أو git push ثم افتح Logs في لوحة Hostinger
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
