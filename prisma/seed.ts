import { PrismaClient, Role} from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const org = await prisma.organization.create({
    data: {
      name: 'Nvidia',
      users: {
        create: {
          name: 'Yohav Bar',
          email: 'yohav12@gmail.com',
          password: '12345678',
          role: Role.ORG_ADMIN
        }
      }
    }
  });

  console.log('✅ Everything works! Organization created', org.name);
}

main()
  .catch((e) => {
    console.error('❌ Connection error:', e);
  })
  .finally(() => {
    prisma.$disconnect();
  });
