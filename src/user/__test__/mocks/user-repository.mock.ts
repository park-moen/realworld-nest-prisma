import { UserRepository } from '@app/user/repository/user.repository';

export type MockUserRepository = {
  [K in keyof UserRepository]: jest.MockedFunction<UserRepository[K]>;
};

export const createMockUserRepository = (): MockUserRepository =>
  ({
    findByEmail: jest.fn(),
    findUserById: jest.fn(),
    create: jest.fn(),
  }) as any;

export const mockUserRepositoryWithExistingUser = (
  email: string,
): Partial<MockUserRepository> => {
  const existingUser = {
    id: 'existing-user-id',
    email,
    username: 'test-user',
    password: 'hashed-password',
  };

  return {
    findByEmail: jest.fn().mockResolvedValue(existingUser),
  };
};
