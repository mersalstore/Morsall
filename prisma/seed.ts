import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // 0. Ensure Admin User
  await prisma.user.upsert({
    where: { email: 'zomatube2012@gmail.com' },
    update: { role: 'ADMIN' },
    create: {
      email: 'zomatube2012@gmail.com',
      name: 'Morsall Admin',
      role: 'ADMIN',
      isOnboarded: true,
    },
  });
  console.log("Admin account set for zomatube2012@gmail.com");

  // 1. Create a Vendor (which needs a User)
  const vendorUser = await prisma.user.upsert({
    where: { email: 'vendor@mersal.com' },
    update: {},
    create: {
      email: 'vendor@mersal.com',
      name: 'مرسال جادجتس',
      role: 'VENDOR',
    },
  });

  const vendor = await prisma.vendor.upsert({
    where: { userId: vendorUser.id },
    update: {},
    create: {
      userId: vendorUser.id,
      storeName: 'مرسال جادجتس',
      storeDescription: 'أحدث الأجهزة الإلكترونية والهواتف',
      bankStatementUrl: '/mock/bank.pdf',
      location: 'الخرطوم',
      status: 'APPROVED',
    },
  });

  // 2. Create Categories
  const categories = [
    { name: 'إلكترونيات', icon: 'devices' },
    { name: 'أزياء', icon: 'apparel' },
    { name: 'منزل', icon: 'home_remodel' },
  ];

  for (const cat of categories) {
    await prisma.category.upsert({
      where: { name: cat.name },
      update: { icon: cat.icon },
      create: { name: cat.name, icon: cat.icon },
    });
  }

  const electronics = await prisma.category.findUnique({ where: { name: 'إلكترونيات' } });

  // 3. Create Sample Products
  const products = [
    {
      title: "سماعات سوني WH-1000XM5 الفاخرة",
      description: "أفضل سماعات عازلة للضوضاء في العالم مع جودة صوت استثنائية.",
      price: 185000,
      stock: 10,
      vendorId: vendor.id,
      categoryId: electronics?.id,
      status: "APPROVED"
    },
    {
      title: "آيفون 15 بريميوم - تيتانيوم",
      description: "الهاتف الأقوى من أبل مع تصميم تيتانيوم وكاميرا احترافية.",
      price: 980000,
      stock: 5,
      vendorId: vendor.id,
      categoryId: electronics?.id,
      status: "APPROVED"
    },
    {
      title: "ماك بوك برو 14 - M3 Pro",
      description: "قوة لا تضاهى للمحترفين مع معالج M3 الجديد.",
      price: 1450000,
      stock: 3,
      vendorId: vendor.id,
      categoryId: electronics?.id,
      status: "APPROVED"
    },
    {
      title: "بلاي ستيشن 5 - النسخة الرقمية",
      description: "تجربة ألعاب الجيل القادم مع سرعة خارقة ورسومات مذهلة.",
      price: 480000,
      stock: 7,
      vendorId: vendor.id,
      categoryId: electronics?.id,
      status: "APPROVED"
    }
  ];

  for (const p of products) {
    await prisma.product.create({
      data: p
    });
  }

  console.log("Seeding complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
