const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt = require('bcryptjs');

async function main() {
  const email = "test_reg_" + Date.now() + "@example.com";
  const hashedPassword = await bcrypt.hash("password123", 8);
  
  console.log("Attempting to create user:", email);
  try {
    const user = await prisma.user.create({
      data: {
        email,
        name: "Test User",
        password: hashedPassword,
        role: "CUSTOMER",
      }
    });
    console.log("SUCCESS: User created with ID:", user.id);
  } catch (err) {
    console.error("FAILURE: Could not create user");
    console.error(err);
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
