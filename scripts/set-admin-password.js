/**
 * سكريبت لإضافة كلمة مرور للحساب المسجل عبر Google
 * Run: node scripts/set-admin-password.js
 */

const bcrypt = require('bcryptjs');

async function main() {
  // Dynamic import for Prisma (ESM compatible)
  const { PrismaClient } = require('@prisma/client');
  const prisma = new PrismaClient();

  const email = 'blackhatsd.sd@gmail.com';
  // كلمة المرور الجديدة - غيرها لما يشتغل
  const newPassword = 'Admin@Morsall2026';

  console.log(`\n🔐 Setting password for: ${email}`);

  try {
    // Check user exists
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      console.error('❌ User not found:', email);
      process.exit(1);
    }
    console.log('✅ Found user:', user.name, '| Current role:', user.role);

    // Hash the new password
    const hashed = await bcrypt.hash(newPassword, 12);

    // Update user: add password + set role to ADMIN
    await prisma.user.update({
      where: { email },
      data: {
        password: hashed,
        role: 'ADMIN',
      },
    });

    console.log('✅ Password set successfully!');
    console.log('📧 Email:', email);
    console.log('🔑 Password:', newPassword);
    console.log('👑 Role: ADMIN');
    console.log('\n✨ You can now login with email + password or Google!');
  } catch (err) {
    console.error('❌ Error:', err.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
