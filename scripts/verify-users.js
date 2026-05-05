require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({
    select: { email: true, role: true }
  });
  fs.writeFileSync('users_snapshot.txt', JSON.stringify(users, null, 2));
}

main().catch(e => {
  fs.writeFileSync('users_snapshot.txt', 'ERROR: ' + e.message);
  process.exit(1);
}).finally(async () => {
  await prisma.$disconnect();
});
