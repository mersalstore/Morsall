const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
  const admins = [
    { email: 'Blackhatsd.sd@gmail.com', name: 'Black Hat Admin' },
    { email: 'zomatube2012@gmail.com', name: 'Morsall Admin' },
    { email: 'hazem@mersal.com', name: 'Hazem Admin' }, // Guessing based on folder name
  ];

  for (const admin of admins) {
    const password = await bcrypt.hash("Morsall@112233", 10);
    const user = await prisma.user.upsert({
      where: { email: admin.email },
      update: { role: 'ADMIN' },
      create: {
        email: admin.email,
        name: admin.name,
        role: 'ADMIN',
        password: password,
        isOnboarded: true,
      },
    });
    console.log(`Ensured admin: ${admin.email}`);
  }
}

main().catch(e => {
  console.error(e);
  process.exit(1);
}).finally(async () => {
  await prisma.$disconnect();
});
