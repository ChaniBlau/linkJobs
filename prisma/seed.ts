import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash('123456789', 10);
  const hashedPassword2 = await bcrypt.hash('123456781', 10);
  const organization = await prisma.organization.create({
    data: {
      name: 'Nvidia',
      users: {
        create: [
          {
            name:'Yohav Gal',
            email: 'yoyohgg@gmail.com',
            password: hashedPassword,
            role: Role.SUPER_ADMIN,
          },
          {
            name: 'Eden Bar',
            email: 'ede123dd@gmail.com',
            password: hashedPassword2,
            role: Role.RECRUITER,
          },
        ],
      },
    },
    include: {
      users: true,
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
