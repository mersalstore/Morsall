# Hostinger environment template

Use this as a checklist in Hostinger hPanel or in the Node app `.env` file.
Do not commit real passwords, SSH credentials, database URLs, or auth secrets.

```env
DATABASE_URL=mysql://DB_USER:DB_PASSWORD@localhost:3306/DB_NAME
NEXTAUTH_URL=https://your-domain.com
NEXTAUTH_SECRET=replace_with_a_long_random_secret

GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

UPLOAD_DIR=/home/YOUR_HOSTINGER_USER/domains/your-domain.com/public_html/uploads
MAX_UPLOAD_SIZE_MB=10
PRISMA_CLIENT_ENGINE_TYPE=binary
NODE_ENV=production
```

After setting the variables on Hostinger:

```bash
npm install
npx prisma generate
npx prisma db push
npm run build
npm run start:hostinger
```
