require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const email = 'zomatube2012@gmail.com';
  console.log(`Target Email: ${email}`);
  
  try {
    const user = await prisma.user.upsert({
      where: { email },
      update: { role: 'ADMIN' },
      create: {
        email,
        name: 'Admin',
        role: 'ADMIN',
        isOnboarded: true
      }
    });
    console.log('SUCCESS: User is now ADMIN');
    console.log('User Data:', JSON.stringify(user, null, 2));
  } catch (error) {
    console.error('ERROR during update:', error);
  }
}

main()
  .then(() => console.log('Script finished successfully'))
  .catch(err => console.error('Script failed:', err))
  .finally(() => {
    console.log('Disconnecting...');
    prisma.$disconnect();
  });
