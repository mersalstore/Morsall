# 🔧 دليل استكشاف الأخطاء - Hostinger Deployment

## المشاكل الشائعة والحلول

### 1️⃣ الصفحة بتظهر بدون CSS (كل شيء نص بس)

**السبب:** الـ CSS files مش بتتحمل من الـ `_next/static` directory

**الحل:**
```bash
# تأكد من أن _next/static موجود وفيه ملفات
ls -la _next/static/

# إذا كان فارغ، انسخ من .next
rm -rf _next
mkdir -p _next/static
cp -r .next/static/* _next/static/

# تأكد من أن الملفات موجودة
ls -la _next/static/chunks/
```

**على Hostinger:**
1. اذهب إلى **File Manager**
2. تأكد من أن `_next/static/` موجود
3. تأكد من أن فيه ملفات `.css` داخله
4. إذا كان فارغ، رفع الملفات يدويّاً من `.next/static`

---

### 2️⃣ الصور مش بتظهر

**السبب:** الـ Images مش موجودة في `public/` أو الـ paths غلط

**الحل:**
```bash
# تأكد من أن الصور موجودة في public
ls -la public/

# تأكد من أن الـ Image component بتستخدم الـ paths الصح
# مثال صح:
# <Image src="/logo.png" alt="Logo" />

# مثال غلط:
# <Image src="logo.png" alt="Logo" />
```

**تحقق من:**
- ✓ الصور موجودة في `public/` folder
- ✓ الـ paths تبدأ بـ `/` (مثل `/logo.png`)
- ✓ الـ Image component بتستخدم `src` صح

---

### 3️⃣ الـ Navigation مش بتشتغل (404 errors)

**السبب:** الـ `.htaccess` مش بتوجه الطلبات صح

**الحل:**
```bash
# تأكد من أن .htaccess موجود
ls -la .htaccess

# تأكد من أن محتوى .htaccess صح
cat .htaccess
```

**المحتوى الصح يجب يكون فيه:**
```apache
RewriteEngine On
RewriteBase /
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteCond %{REQUEST_URI} !^/_next/static/
RewriteRule ^(.*)$ http://127.0.0.1:3000/$1 [P,L]
```

**على Hostinger:**
1. اذهب إلى **File Manager**
2. تأكد من أن `.htaccess` موجود في الـ root directory
3. إذا كان مش موجود، رفع الملف يدويّاً

---

### 4️⃣ الـ API calls مش بتشتغل

**السبب:** متغيرات البيئة مش موجودة أو الـ Database connection مش شغالة

**الحل:**

**أولاً: تأكد من متغيرات البيئة**
```bash
# على جهازك المحلي، تأكد من أن .env موجود
cat .env

# يجب يكون فيه:
DATABASE_URL=postgresql://...
NEXTAUTH_URL=https://morsall.com
NEXTAUTH_SECRET=...
```

**ثانياً: على Hostinger Control Panel**
1. اذهب إلى **Node.js** أو **Application Manager**
2. اختر تطبيقك
3. اذهب إلى **Environment Variables**
4. أضف جميع المتغيرات:
   - `POSTGRES_PRISMA_URL`
   - `DATABASE_URL`
   - `NEXTAUTH_URL`
   - `NEXTAUTH_SECRET`
   - `GOOGLE_CLIENT_ID`
   - `GOOGLE_CLIENT_SECRET`

**ثالثاً: تحقق من الـ Logs**
1. اذهب إلى **Logs**
2. شوف الـ Error messages
3. ابحث عن كلمات مثل "Connection refused" أو "Database error"

---

### 5️⃣ الـ Server مش بيرد (500 errors)

**السبب:** Server crashed أو مش بيشتغل

**الحل:**

**على Hostinger:**
1. اذهب إلى **Node.js** أو **Application Manager**
2. اختر تطبيقك
3. اضغط **Restart**
4. شوف الـ Logs للأخطاء

**تحقق من:**
- ✓ Node.js مفعّل
- ✓ Port 3000 مفتوح
- ✓ متغيرات البيئة موجودة
- ✓ Database connection string صح

---

### 6️⃣ الـ Google Authentication مش بتشتغل

**السبب:** `GOOGLE_CLIENT_SECRET` مش موجود أو غلط

**الحل:**
1. اذهب إلى [Google Cloud Console](https://console.cloud.google.com/)
2. اختر مشروعك
3. اذهب إلى **APIs & Services** > **Credentials**
4. اختر OAuth 2.0 Client ID
5. نسخ `Client Secret`
6. على Hostinger، أضف متغير البيئة:
   - `GOOGLE_CLIENT_SECRET=<your-secret>`

**تأكد من:**
- ✓ `GOOGLE_CLIENT_ID` صح
- ✓ `GOOGLE_CLIENT_SECRET` صح
- ✓ Authorized redirect URIs تحتوي على `https://morsall.com/api/auth/callback/google`

---

### 7️⃣ الـ Build فشل

**السبب:** مشكلة في الـ Build process

**الحل:**
```bash
# نظف الـ cache
rm -rf .next node_modules package-lock.json

# أعد تثبيت الـ dependencies
npm install

# جرب البناء مرة أخرى
npm run build

# إذا فشل، شوف الـ Error messages
```

**الأخطاء الشائعة:**
- `Module not found`: تأكد من أن الـ imports صح
- `Type error`: تأكد من أن الـ TypeScript types صح
- `Prisma error`: تأكد من أن `prisma generate` تم تشغيله

---

## 🔍 كيفية قراءة الـ Logs

### على Hostinger:
1. اذهب إلى **Logs**
2. اختر **Node.js** أو **Application Logs**
3. ابحث عن الأخطاء

### الأخطاء الشائعة:
```
Error: ENOENT: no such file or directory
→ ملف مفقود (تحقق من الـ paths)

Error: ECONNREFUSED
→ مشكلة في الـ Database connection

Error: EACCES: permission denied
→ مشكلة في الـ Permissions

Error: listen EADDRINUSE
→ Port 3000 مستخدم بالفعل
```

---

## ✅ Checklist للنشر

قبل النشر على Hostinger:

- [ ] `npm run build` شغال بدون أخطاء
- [ ] `_next/static/` موجود وفيه ملفات
- [ ] `.htaccess` موجود
- [ ] `.env` موجود (أو متغيرات البيئة موجودة على Hostinger)
- [ ] Database connection string صح
- [ ] Google OAuth credentials صح
- [ ] Node.js مفعّل على Hostinger
- [ ] Port 3000 مفتوح

---

## 📞 الدعم الإضافي

### إذا استمرت المشكلة:

1. **شوف الـ Logs:**
   - Hostinger Logs
   - Browser Console (F12)
   - Network tab (F12)

2. **جرب الـ Debugging:**
   ```bash
   # شغل الـ Server محليّاً
   npm run build
   npm start
   
   # ثم اذهب إلى http://localhost:3000
   ```

3. **تواصل مع الدعم:**
   - Hostinger Support
   - Next.js Documentation
   - Prisma Documentation

---

**آخر تحديث:** 2026-05-01
