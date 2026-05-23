const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  try {
    const users = await prisma.user.count()
    console.log("DB Connection SUCCESS. User count:", users)
  } catch (e) {
    console.error("DB Connection FAILED:", e)
  } finally {
    await prisma.$disconnect()
  }
}

main()
