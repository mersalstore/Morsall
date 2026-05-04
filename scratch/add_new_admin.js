const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const email = 'Blackhatsd.sd@gmail.com';
  const password = 'Morsall@112233';
  
  const hashedPassword = await bcrypt.hash(password, 10);
  
  const user = await prisma.user.upsert({
    where: { email },
    update: {
      role: 'ADMIN',
      password: hashedPassword,
    },
    create: {
      email,
      password: hashedPassword,
      role: 'ADMIN',
      name: 'Black Hat Admin',
      isOnboarded: true,
    },
  });
  
  console.log('Admin user updated/created:', user.email);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
