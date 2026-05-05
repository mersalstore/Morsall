require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
  const admins = [
    { email: 'mersalstore122@gmail.com', name: 'Morsall Store Admin' },
    { email: 'zomatube2012@gmail.com', name: 'Morsall Admin' },
    { email: 'Blackhatsd.sd@gmail.com', name: 'Black Hat Admin' },
  ];

  for (const admin of admins) {
    const password = await bcrypt.hash("Morsall@112233", 10);
    
    // Check if user exists
    const existing = await prisma.user.findUnique({ where: { email: admin.email } });
    
    if (existing) {
        await prisma.user.update({
            where: { email: admin.email },
            data: { role: 'ADMIN', isOnboarded: true }
        });
        console.log(`Updated existing user to ADMIN: ${admin.email}`);
    } else {
        await prisma.user.create({
            data: {
                email: admin.email,
                name: admin.name,
                role: 'ADMIN',
                password: password,
                isOnboarded: true,
            },
        });
        console.log(`Created NEW admin user: ${admin.email}`);
    }
  }
}

main().catch(e => {
  console.error(e);
  process.exit(1);
}).finally(async () => {
  await prisma.$disconnect();
});
