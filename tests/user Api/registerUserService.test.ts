import { registerUserService } from '../../src/services/auth.service';
import * as userRepo from '../../src/repositories/user.repository';
import * as passwordHelper from '../../src/utils/passwordHelper';
import * as jwtHelper from '../../src/utils/jwtHelper';

jest.mock('../../src/repositories/user.repository');
jest.mock('../../src/utils/passwordHelper');
jest.mock('../../src/utils/jwtHelper');

describe('registerUserService', () => {
  it('should create user and return token', async () => {
    const mockUser = {
      id: 1,
      name: 'Alice',
      email: 'alice@example.com',
      role: 'VIEWER',
      organizationId: 1
    };

    (passwordHelper.hashPassword as jest.Mock).mockResolvedValue('hashed_pw');
    (userRepo.createUser as jest.Mock).mockResolvedValue(mockUser);
    (jwtHelper.generateToken as jest.Mock).mockReturnValue('mocked.token');

    const result = await registerUserService({
      name: 'Alice',
      email: 'alice@example.com',
      password: '123456',
      organizationId: 1
    });

    expect(passwordHelper.hashPassword).toHaveBeenCalledWith('123456');
    expect(userRepo.createUser).toHaveBeenCalledWith({
      name: 'Alice',
      email: 'alice@example.com',
      password: 'hashed_pw',
      organizationId: 1
    });
    expect(jwtHelper.generateToken).toHaveBeenCalledWith({
      id: 1,
      role: 'VIEWER',
      organizationId: 1
    });
    expect(result).toEqual({ user: mockUser, token: 'mocked.token' });
  });
});
