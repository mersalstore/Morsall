import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

export async function GET() {
  const prisma = new PrismaClient();
  const results: string[] = [];
  
  const statements = [
    // Order Table additions
    "ALTER TABLE `Order` ADD COLUMN `assignedAt` DATETIME NULL",
    "ALTER TABLE `Order` ADD COLUMN `pickedUpAt` DATETIME NULL",
    "ALTER TABLE `Order` ADD COLUMN `deliveredAt` DATETIME NULL",
    "ALTER TABLE `Order` ADD COLUMN `codCollected` TINYINT(1) NOT NULL DEFAULT 0",
    "ALTER TABLE `Order` ADD COLUMN `branchId` VARCHAR(191) NULL",
    
    // DeliveryDriver Table additions
    "ALTER TABLE `DeliveryDriver` ADD COLUMN `isOnline` TINYINT(1) NOT NULL DEFAULT 0",
    "ALTER TABLE `DeliveryDriver` ADD COLUMN `balance` DOUBLE NOT NULL DEFAULT 0",
    
    // Employee Table additions
    "ALTER TABLE `Employee` ADD COLUMN `permissions` JSON NULL",
    
    // Make sure blackhatsd.sd@gmail.com user has ADMIN role
    "UPDATE `User` SET `role` = 'ADMIN' WHERE `email` = 'blackhatsd.sd@gmail.com'"
  ];

  try {
    for (const sql of statements) {
      try {
        await prisma.$executeRawUnsafe(sql);
        results.push(`SUCCESS: ${sql}`);
      } catch (err: any) {
        results.push(`FAILED: ${sql} - Reason: ${err.message}`);
      }
    }
    
    const categoryCount = await prisma.category.count().catch(() => -1);
    
    return NextResponse.json({ 
      success: true, 
      results,
      categoryCount
    });
  } catch (error: any) {
    return NextResponse.json({ 
      success: false, 
      error: error.message,
      results
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
