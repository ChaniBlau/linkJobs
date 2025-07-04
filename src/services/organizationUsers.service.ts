import { getUserById, updateUserById } from '../repositories/organizationUsers.repository';
import { Role } from '@prisma/client';
import { createUser } from '../repositories/organizationUsers.repository';
import { hashPassword } from '../utils/passwordHelper';
import { generateToken } from '../utils/jwtHelper';
import { getUserByEmail } from '../repositories/organizationUsers.repository';

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

export const createUserByAdminService = async (data: {
  name: string;
  email: string;
  password: string;
  organizationId: number;
}) => {
  const existing = await getUserByEmail(data.email);
  if (existing) {
    throw new Error('User with this email already exists');
  }
  const hashed = await hashPassword(data.password);
  const user = await createUser({
    name: data.name,
    email: data.email,
    password: hashed,
    organizationId: data.organizationId,
  });

  const token = generateToken({
    id: user.id,
    role: user.role,
    organizationId: user.organizationId,
  });

  return { user, token };
};

