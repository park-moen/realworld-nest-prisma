import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';

jest.mock('bcrypt', () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}));

import * as bcrypt from 'bcrypt';

describe('AuthService', () => {
  let service: AuthService;
  let config: ConfigService;

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
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    config = module.get<ConfigService>(ConfigService);
    jest.clearAllMocks();
  });

  it('hashPassword()는 bcrypt.hash를 Config 라운드로 호출한다.', async () => {
    (bcrypt.hash as jest.Mock).mockResolvedValue('hashed-value');

    const result = await service.hashPassword('plain');
    expect(bcrypt.hash).toHaveBeenCalledWith('plain', 12);
    expect(result).toBe('hashed-value');
  });

  it('validatePassword()는 bcrypt.compare를 호출하고 결과를 그대로 반환한다.', async () => {
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);

    const ok = await service.validatePassword('plain', 'stored');
    expect(bcrypt.compare).toHaveBeenCalledWith('plain', 'stored');
    expect(ok).toBe(true);
  });

  it('BCRYPT_ROUNDS가 없으면 기본 12를 사용한다.', async () => {
    (config.get as jest.Mock).mockReturnValueOnce(undefined);

    const module = await Test.createTestingModule({
      providers: [AuthService, { provide: ConfigService, useValue: config }],
    }).compile();

    const service = module.get(AuthService);
    (bcrypt.hash as jest.Mock).mockResolvedValue('hashed12');

    await service.hashPassword('plain');
    expect(bcrypt.hash).toHaveBeenCalledWith('plain', 12);
  });
});
