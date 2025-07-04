import { PrismaClient, Role } from '@prisma/client';
const prisma = new PrismaClient();

export const createUser = (data: {
  name: string;
  email: string;
  password: string;
  organizationId: number;
}) => {
  return prisma.user.create({
    data: {
      name: data.name,
      email: data.email,
      hashed_password: data.password,
      role: Role.VIEWER,
      organizationId: data.organizationId,
    },
  });
};

export const getUserById = (id: number) => {
  return prisma.user.findUnique({ where: { id } });
};

export const updateUserById = (id: number, data: Partial<{ role: Role }>) => {
  return prisma.user.update({ where: { id }, data });
};

export const getUserByEmail = (email: string) => {
  return prisma.user.findUnique({ where: { email } });
};