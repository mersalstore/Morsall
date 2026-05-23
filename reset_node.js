const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function resetAccount() {
  const email = "blackhatsd.sd@gmail.com";
  console.log("--- NODE RESET STARTING ---");
  
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (user) {
      console.log("Found user, deleting...");
      await prisma.vendor.deleteMany({ where: { userId: user.id } });
      await prisma.session.deleteMany({ where: { userId: user.id } });
      await prisma.account.deleteMany({ where: { userId: user.id } });
      await prisma.user.delete({ where: { id: user.id } });
    }
    
    console.log("Re-creating user...");
    const newUser = await prisma.user.create({
      data: {
        email: email,
        name: "System Admin",
        role: "ADMIN",
        isOnboarded: true,
        vendorProfile: {
          create: {
            storeName: "System Store",
            status: "APPROVED"
          }
        }
      }
    });
    console.log("✅ DONE: User re-created with ID:", newUser.id);
  } catch (err) {
    console.error("ERROR:", err);
  } finally {
    await prisma.$disconnect();
    process.exit(0);
  }
}

resetAccount();
