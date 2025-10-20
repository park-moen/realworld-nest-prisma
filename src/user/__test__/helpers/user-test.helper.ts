import { UserService } from '@app/user/service/user.service';
import {
  createMockUserRepository,
  MockUserRepository,
} from '../mocks/user-repository.mock';
import {
  createMockAuthService,
  MockAuthService,
} from '../mocks/auth-service.mock';
import {
  createMockRefreshTokenRepository,
  MockRefreshTokenRepository,
} from '../mocks/refresh-token-repository.mock';
import { Test, TestingModule } from '@nestjs/testing';
import { UserRepository } from '@app/user/repository/user.repository';
import { AuthService } from '@app/auth/service/auth.service';
import { RefreshTokenRepository } from '@app/auth/repository/refresh-token.repository';

export interface UserServiceTestContext {
  service: UserService;
  userRepository: MockUserRepository;
  authService: MockAuthService;
  refreshTokenRepository: MockRefreshTokenRepository;
}

export const setupUserServiceTest =
  async (): Promise<UserServiceTestContext> => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        { provide: UserRepository, useValue: createMockUserRepository() },
        { provide: AuthService, useValue: createMockAuthService() },
        {
          provide: RefreshTokenRepository,
          useValue: createMockRefreshTokenRepository(),
        },
      ],
    }).compile();

    return {
      service: module.get<UserService>(UserService),
      userRepository: module.get(UserRepository),
      authService: module.get(AuthService),
      refreshTokenRepository: module.get(RefreshTokenRepository),
    };
  };
