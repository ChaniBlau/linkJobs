import { createUser } from '../repositories/user.repository';
import { hashPassword } from '../utils/passwordHelper';
import { generateToken } from '../utils/jwtHelper';

export const registerUserService = async (data: {
  name: string;
  email: string;
  password: string;
  organizationId: number;
}) => {
  const hashed = await hashPassword(data.password);
  const user = await createUser({
    name: data.name,
    email: data.email,
    password: hashed,
    organizationId: data.organizationId,
  });
  const token = generateToken({ id: user.id, role: user.role, organizationId: user.organizationId });
  return { user, token };
};