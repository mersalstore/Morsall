const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    const result = await prisma.$queryRawUnsafe('DESCRIBE User');
    console.log(JSON.stringify(result, null, 2));
  } catch (err) {
    console.error(err);
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
