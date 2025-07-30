import {
  getUserById,
  updateUserById,
  getUserByEmail,
  createUser,
} from '../repositories/organizationUsers.repository';
import { Role } from '@prisma/client';
import { hashPassword } from '../utils/passwordHelper';
import { generateToken } from '../utils/jwtHelper';
import { RegisterUserInput } from '../types/User';
import { CreateUserByAdminInput } from '../types/CreateUserByAdmin';
import { HttpError } from '../errors/HttpError';
import { number } from 'zod';

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

export const createUserByAdminService = async (data: CreateUserByAdminInput) => {
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

export const registerNewUserService = async (data: RegisterUserInput) => {
  const existing = await getUserByEmail(data.email);
  if (existing) {
    throw new HttpError('User with this email already exists', 400);
  }

  const hashed = await hashPassword(data.password);

  const user = await createUser({
    name: data.name,
    email: data.email,
    password: hashed,
    organizationId: null
  });

  const token = generateToken({
    id: user.id,
    role: user.role,
    organizationId: user.organizationId
  });

  return { user, token };
};
