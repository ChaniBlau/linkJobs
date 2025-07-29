// prisma/seed.ts
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash('12345678', 10);

  // יצירת משתמש רגיל
  const user = await prisma.user.create({
    data: {
      name: 'User One',
      email: 'user1@example.com',
      hashed_password: hashedPassword,
      role: 'VIEWER',
    },
  });

  // יצירת ארגון עם משתמש מנהל
  const orgAdmin = await prisma.user.create({
    data: {
      name: 'Org Admin',
      email: 'admin@org.com',
      hashed_password: hashedPassword,
      role: 'ORG_ADMIN',
    },
  });

  const organization = await prisma.organization.create({
    data: {
      name: 'Tech Co',
      users: {
        connect: { id: orgAdmin.id },
      },
    },
  });

  // עדכון קשר בין האדמין לארגון
  await prisma.user.update({
    where: { id: orgAdmin.id },
    data: {
      organizationId: organization.id,
    },
  });

  // יצירת עובד נוסף
  const employee = await prisma.user.create({
    data: {
      name: 'Employee A',
      email: 'employee@org.com',
      hashed_password: hashedPassword,
      role: 'RECRUITER',
      organizationId: organization.id,
    },
  });

  console.log('✅ Seed completed');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
