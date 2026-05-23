const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const email = "blackhatsd.sd@gmail.com";
  const user = await prisma.user.findUnique({
    where: { email },
    include: { vendorProfile: true }
  });
  
  if (!user) {
    console.log("User not found:", email);
  } else {
    console.log("User found:");
    console.log("ID:", user.id);
    console.log("Email:", user.email);
    console.log("Role:", user.role);
    console.log("isVendor:", !!user.vendorProfile);
    if (user.vendorProfile) {
      console.log("Vendor ID:", user.vendorProfile.id);
      console.log("Vendor Store Name:", user.vendorProfile.storeName);
      console.log("Vendor Status:", user.vendorProfile.status);
    }
  }
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
