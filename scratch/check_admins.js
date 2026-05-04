require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Connecting to database...');
  const admins = await prisma.user.findMany({
    where: { role: 'ADMIN' },
    select: { email: true, name: true }
  });
  console.log('Admins:', JSON.stringify(admins, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
