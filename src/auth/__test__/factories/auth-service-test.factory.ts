// import { AuthService } from '@app/auth/auth.service';
// import { RefreshTokenRepository } from '@app/auth/refresh-token.repository';
// import { ConfigService } from '@nestjs/config';
// import { JwtService } from '@nestjs/jwt';
// import { Test, TestingModule } from '@nestjs/testing';
// import * as bcrypt from 'bcrypt';

// jest.mock('bcrypt', () => ({
//   hash: jest.fn(),
//   compare: jest.fn(),
// }));

// type MockConfigService = {
//   [K in keyof ConfigService]: ConfigService[K] extends (...args: any[]) => any
//     ? jest.MockedFunction<ConfigService[K]>
//     : ConfigService[K];
// };

// type MockJwtService = {
//   [K in keyof JwtService]: jest.MockedFunction<JwtService[K]>;
// };

// type MockRefreshTokenRepository = {
//   [K in keyof RefreshTokenRepository]: jest.MockedFunction<
//     RefreshTokenRepository[K]
//   >;
// };

// type MockBcrypt = {
//   hash: jest.MockedFunction<typeof bcrypt.hash>;
//   compare: jest.MockedFunction<typeof bcrypt.compare>;
// };

// export interface AuthServiceTestContext {
//   service: AuthService;
//   jwtService: MockJwtService;
//   refreshTokenRepository: MockRefreshTokenRepository;
//   configService: MockConfigService;
//   bcrypt: MockBcrypt;
// }

// const createMockConfigService = (): Pick<MockConfigService, 'get'> => ({
//   get: jest.fn((key: string, def?: any) => {
//     switch (key) {
//       case 'JWT_ACCESS_SECRET':
//         return 'access-secret';
//       case 'JWT_ACCESS_EXPIRES':
//         return '15m';
//       case 'JWT_REFRESH_SECRET':
//         return 'refresh-secret';
//       case 'JWT_REFRESH_EXPIRES':
//         return '7d';
//       case 'BCRYPT_ROUNDS':
//         return 12;
//       default:
//         return def;
//     }
//   }) as unknown as MockConfigService['get'],
// });

// const createMockJwtService = (): Pick<MockJwtService, 'sign' | 'verify'> => ({
//   sign: jest.fn(),
//   verify: jest.fn(),
// });

// const createMockRefreshTokenRepository = (): Pick<
//   MockRefreshTokenRepository,
//   'save'
// > => ({
//   save: jest.fn(),
// });

// const getMockBcrypt = (): MockBcrypt => ({
//   hash: bcrypt.hash as jest.MockedFunction<typeof bcrypt.hash>,
//   compare: bcrypt.compare as jest.MockedFunction<typeof bcrypt.compare>,
// });

// export const setupAuthServiceTest =
//   async (): Promise<AuthServiceTestContext> => {
//     const module: TestingModule = await Test.createTestingModule({
//       providers: [
//         AuthService,
//         { provide: ConfigService, useValue: createMockConfigService() },
//         { provide: JwtService, useValue: createMockJwtService() },
//         {
//           provide: RefreshTokenRepository,
//           useValue: createMockRefreshTokenRepository(),
//         },
//       ],
//     }).compile();

//     return {
//       service: module.get<AuthService>(AuthService),
//       configService: module.get(ConfigService),
//       jwtService: module.get(JwtService),
//       refreshTokenRepository: module.get(RefreshTokenRepository),
//       bcrypt: getMockBcrypt(),
//     };
//   };
