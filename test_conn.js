const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: "mysql://u754458241_Kanan:CODe_2222@localhost/u754458241_Kanan?connection_limit=1"
    }
  }
});
prisma.user.findFirst()
  .then(u => console.log("SUCCESS:", !!u))
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
