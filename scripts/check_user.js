const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkUser() {
  try {
    const users = await prisma.user.findMany({
      where: {
        email: {
          contains: 'admin'
        }
      }
    });
    console.log('=== ADMIN USERS FOUND ===');
    console.log(JSON.stringify(users, null, 2));
    
    const allUsers = await prisma.user.findMany({
      take: 5
    });
    console.log('=== FIRST 5 USERS ===');
    console.log(JSON.stringify(allUsers.map(u => ({ id: u.id, name: u.name, email: u.email, role: u.role, permissions: u.permissions })), null, 2));
    
  } catch (err) {
    console.error('Error querying database:', err);
  } finally {
    await prisma.$disconnect();
  }
}

checkUser();
