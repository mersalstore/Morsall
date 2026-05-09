const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    console.log("Attempting to connect to database...");
    const userCount = await prisma.user.count();
    console.log("User count:", userCount);
    const users = await prisma.user.findMany({ take: 5 });
    console.log("Recent users:", users);
  } catch (e) {
    console.error("Database connection failed:", e);
  } finally {
    await prisma.$disconnect();
  }
}

main();
