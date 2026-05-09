const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
  try {
    const email = 'admin@morsall.com';
    const password = 'AdminPassword2026!';
    const hashedPassword = await bcrypt.hash(password, 12);
    
    console.log(`Creating admin user: ${email}`);
    
    const user = await prisma.user.upsert({
      where: { email },
      update: {
        role: 'ADMIN',
        password: hashedPassword,
      },
      create: {
        email,
        name: 'Admin',
        password: hashedPassword,
        role: 'ADMIN',
        isOnboarded: true,
      },
    });
    
    console.log('Admin user created/updated successfully:', user.id);
  } catch (e) {
    console.error('Failed to create admin user:', e);
  } finally {
    await prisma.$disconnect();
  }
}

main();
