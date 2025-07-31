import { PrismaClient, Role } from '@prisma/client';
const prisma = new PrismaClient();


export const getUserById = (id: number) => {
  return prisma.user.findUnique({ where: { id } });
};

export const updateUserById = (id: number, data: Partial<{ role: Role }>) => {
  return prisma.user.update({ where: { id }, data });
};

export const getUserByEmail = (email: string) => {
  return prisma.user.findUnique({ where: { email } });
};

export const createUser = async ({
  name,
  email,
  password,
  organizationId,
}: {
  name: string;
  email: string;
  password: string;
  organizationId: number | null;
}) => {
  return prisma.user.create({
    data: {
      name,
      email,
      hashed_password: password,
      organizationId,
    },
  });
};

