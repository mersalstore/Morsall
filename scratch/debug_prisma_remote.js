const { PrismaClient } = require('@prisma/client');
const path = require('path');
const fs = require('fs');

// Load .env.production manually
const envFile = path.join(__dirname, '.env.production');
if (fs.existsSync(envFile)) {
    const content = fs.readFileSync(envFile, 'utf8');
    const lines = content.split('\n');
    for (const line of lines) {
        const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
        if (match) {
            let key = match[1];
            let value = match[2] || '';
            if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
            process.env[key] = value;
        }
    }
}

console.log("Testing Connection with URL:", process.env.DATABASE_URL);

const prisma = new PrismaClient({
    datasources: {
        db: {
            url: process.env.DATABASE_URL
        }
    }
});

async function main() {
    try {
        const banners = await prisma.siteBanner.findMany();
        const settings = await prisma.settings.findFirst();
        console.log("Banners:", JSON.stringify(banners, null, 2));
        console.log("Settings:", JSON.stringify(settings, null, 2));
    } catch (e) {
        console.error("FAILURE:", e.message);
    } finally {
        await prisma.$disconnect();
    }
}

main();
