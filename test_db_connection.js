const { PrismaClient } = require('@prisma/client');

const testConnection = async () => {
  const url = "mysql://u754458241_Kanan:Code_2252@srv2082.hstgr.io:3306/u754458241_Kanan";
  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: url,
      },
    },
  });

  try {
    console.log('Testing connection to Hostinger MySQL...');
    await prisma.$connect();
    console.log('Successfully connected!');
  } catch (error) {
    console.error('Connection failed:', error.message);
  } finally {
    await prisma.$disconnect();
  }
};

testConnection();
