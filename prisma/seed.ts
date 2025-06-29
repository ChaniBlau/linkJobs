import { PrismaClient , Role } from '@prisma/client';
// import { PrismaClient, Prisma } from '@prisma/client'; // ✅ כן תקין

import bcrypt from 'bcryptjs';
// import { PrismaClient  } from '@prisma/client';

const prisma = new PrismaClient();
// const { Role } = Prisma;
async function main() {
  const hashedPassword = await bcrypt.hash('temp_password_1', 10);
  const hashedPassword2 = await bcrypt.hash('temp_password_2', 10);
  const organization = await prisma.organization.create({
    data: {
      name: 'Nvidia',
      User: {
        create: [
          {
            name:'Yohav Gal',
            email: 'yoyohgg@gmail.com',
            hashed_password: hashedPassword,
            role: Role.SUPER_ADMIN,
            // role: Prisma.Role.SUPER_ADMIN,

            // role: Prisma.Role.SUPER_ADMIN

          },
          {
            name: 'Eden Bar',
            email: 'ede123dd@gmail.com',
            hashed_password: hashedPassword2,
            role: Role.RECRUITER,
            // role: Prisma.Role.RECRUITER

          },
        ],
      },
    },
    include: {
      User: true,
    },
  });

  console.log('Seeded Organization with users:', organization);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
