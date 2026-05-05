require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany();
  console.log(users.map(u => `${u.email} - ${u.role}`).join('\n'));
}
main().catch(console.error).finally(() => prisma.$disconnect());
