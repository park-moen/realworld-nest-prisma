import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { randomUUID } from 'crypto';
import { AuthService } from './auth.service';

jest.mock('bcrypt', () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}));

import * as bcrypt from 'bcrypt';

describe('AuthService', () => {
  let authService: AuthService;
  let config: ConfigService;
  let jwtService: JwtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockImplementation((key: string) => {
              if (key === 'BCRYPT_ROUNDS') return 12;
              return undefined;
            }),
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn().mockReturnValue('mocked.jwt.token'),
          },
        },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    config = module.get<ConfigService>(ConfigService);
    jwtService = module.get<JwtService>(JwtService);
    jest.clearAllMocks();
  });

  it('hashPassword()는 bcrypt.hash를 Config 라운드로 호출한다.', async () => {
    (bcrypt.hash as jest.Mock).mockResolvedValue('hashed-value');

    const result = await authService.hashPassword('plain');
    expect(bcrypt.hash).toHaveBeenCalledWith('plain', 12);
    expect(result).toBe('hashed-value');
  });

  it('validatePassword()는 bcrypt.compare를 호출하고 결과를 그대로 반환한다.', async () => {
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);

    const ok = await authService.validatePassword('plain', 'stored');
    expect(bcrypt.compare).toHaveBeenCalledWith('plain', 'stored');
    expect(ok).toBe(true);
  });

  it('BCRYPT_ROUNDS가 없으면 기본 12를 사용한다.', async () => {
    (config.get as jest.Mock).mockReturnValueOnce(undefined);

    const module = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: ConfigService, useValue: config },
        {
          provide: JwtService,
          useValue: { sign: jest.fn() },
        },
      ],
    }).compile();

    const service = module.get(AuthService);
    (bcrypt.hash as jest.Mock).mockResolvedValue('hashed12');

    await service.hashPassword('plain');
    expect(bcrypt.hash).toHaveBeenCalledWith('plain', 12);
  });

  it('generateJWT()는 sub에 id를 담아 jwt.sign을 호출한다.', () => {
    const id = randomUUID();
    const token = authService.generateJWT(id);

    // jwt.sign()이 정확히 호출되었는지 확인
    expect(jwtService.sign).toHaveBeenCalledWith({ sub: id });

    // 반환값이 mock된 토큰인지 확인
    expect(token).toBe('mocked.jwt.token');
  });
});
