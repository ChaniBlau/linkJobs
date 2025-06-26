import { getUserById, updateUserById } from '../repositories/user.repository';
import { Role } from '@prisma/client';

export const updateUserRoleService = async (id: number, role: Role) => {
  if (!Object.values(Role).includes(role)) {
    throw new Error('Invalid role value');
  }

  const user = await getUserById(id);
  if (!user) {
    throw new Error('User not found');
  }

  return await updateUserById(id, { role });
};
