require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const email = 'mersalstore122@gmail.com';
  console.log(`Checking user: ${email}`);
  const user = await prisma.user.findUnique({ where: { email } });
  if (user) {
    console.log('User found:', JSON.stringify(user, null, 2));
    if (user.role !== 'ADMIN') {
      console.log('Updating user to ADMIN...');
      await prisma.user.update({
        where: { email },
        data: { role: 'ADMIN' }
      });
      console.log('User is now ADMIN!');
    }
  } else {
    console.log('User not found. Creating admin user...');
    // We can't create a password easily here without bcrypt, but we can set the role
    // if they login via Google.
    await prisma.user.create({
      data: {
        email,
        name: 'Admin',
        role: 'ADMIN',
        isOnboarded: true
      }
    });
    console.log('Admin user created (Role: ADMIN). Please login via Google.');
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
