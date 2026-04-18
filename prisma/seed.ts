import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const adminPass = await bcrypt.hash('admin123', 10);
  const managerPass = await bcrypt.hash('manager123', 10);
  const memberPass = await bcrypt.hash('member123', 10);

  await prisma.user.upsert({
    where: { email: 'admin@slooze.com' },
    update: {},
    create: { email: 'admin@slooze.com', password: adminPass, name: 'Admin User', role: 'ADMIN', country: 'INDIA' },
  });
  await prisma.user.upsert({
    where: { email: 'manager@slooze.com' },
    update: {},
    create: { email: 'manager@slooze.com', password: managerPass, name: 'Manager User', role: 'MANAGER', country: 'INDIA' },
  });
  await prisma.user.upsert({
    where: { email: 'member@slooze.com' },
    update: {},
    create: { email: 'member@slooze.com', password: memberPass, name: 'Member User', role: 'MEMBER', country: 'INDIA' },
  });
  await prisma.user.upsert({
    where: { email: 'admin.us@slooze.com' },
    update: {},
    create: { email: 'admin.us@slooze.com', password: adminPass, name: 'US Admin', role: 'ADMIN', country: 'AMERICA' },
  });

  const r1 = await prisma.restaurant.findFirst({ where: { name: 'Spice Garden' } });
  if (!r1) {
    await prisma.restaurant.create({
      data: {
        name: 'Spice Garden', cuisine: 'Indian', country: 'INDIA',
        menuItems: {
          create: [
            { name: 'Butter Chicken', price: 320, description: 'Creamy tomato chicken curry' },
            { name: 'Paneer Tikka', price: 280, description: 'Grilled cottage cheese' },
            { name: 'Biryani', price: 350, description: 'Fragrant rice with spices' },
            { name: 'Naan', price: 60, description: 'Fresh baked bread' },
          ],
        },
      },
    });
  }

  const r2 = await prisma.restaurant.findFirst({ where: { name: 'Mumbai Street Eats' } });
  if (!r2) {
    await prisma.restaurant.create({
      data: {
        name: 'Mumbai Street Eats', cuisine: 'Street Food', country: 'INDIA',
        menuItems: {
          create: [
            { name: 'Vada Pav', price: 40, description: 'Mumbai street burger' },
            { name: 'Pav Bhaji', price: 120, description: 'Spiced vegetable mash' },
            { name: 'Pani Puri', price: 80, description: 'Crispy shells with tangy water' },
          ],
        },
      },
    });
  }

  const r3 = await prisma.restaurant.findFirst({ where: { name: 'The Burger Joint' } });
  if (!r3) {
    await prisma.restaurant.create({
      data: {
        name: 'The Burger Joint', cuisine: 'American', country: 'AMERICA',
        menuItems: {
          create: [
            { name: 'Classic Cheeseburger', price: 12.99, description: 'Beef patty with cheese' },
            { name: 'BBQ Bacon Burger', price: 15.99, description: 'Smoky BBQ burger' },
            { name: 'Crispy Fries', price: 4.99, description: 'Golden crispy fries' },
          ],
        },
      },
    });
  }

  const r4 = await prisma.restaurant.findFirst({ where: { name: 'NYC Pizza Co.' } });
  if (!r4) {
    await prisma.restaurant.create({
      data: {
        name: 'NYC Pizza Co.', cuisine: 'Italian-American', country: 'AMERICA',
        menuItems: {
          create: [
            { name: 'Margherita Pizza', price: 14.99, description: 'Classic tomato and cheese' },
            { name: 'Pepperoni Pizza', price: 17.99, description: 'Loaded with pepperoni' },
            { name: 'Garlic Bread', price: 5.99, description: 'Toasted with garlic butter' },
          ],
        },
      },
    });
  }

  console.log('✅ Database seeded!');
  console.log('Admin: admin@slooze.com / admin123');
  console.log('Manager: manager@slooze.com / manager123');
  console.log('Member: member@slooze.com / member123');
}

main().catch(console.error).finally(() => prisma.$disconnect());