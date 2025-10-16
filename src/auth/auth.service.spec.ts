import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service';

jest.mock('bcrypt', () => ({
  hash: jest.fn(async (value: string) => `hashed-${value}`),
  compare: jest.fn(
    async (plain: string, hashed: string) => hashed === `hashed-${plain}`,
  ),
}));

describe('AuthService', () => {
  let authService: AuthService;
  // let jwtService: JwtService;

  beforeEach(async () => {
    const jwtMock: Partial<jest.Mocked<JwtService>> = {
      sign: jest.fn((payload: any) => {
        const parts = ['sub:' + payload?.sub];

        if (payload?.jti) {
          parts.push('jti:' + payload?.jti);
        }

        return 'jwt(' + parts.join(',') + ')';
      }),
      verify: jest.fn((token: string) => {
        if (token.includes('user-err')) {
          throw new Error('invalid token');
        }
        if (token.includes('jti:')) {
          const sub = token.match(/sub:([^,)]+)/)?.[1] ?? '';
          const jti = token.match(/jti:([^,)]+)/)?.[1] ?? '';
          return { sub, jti } as any;
        }
        const sub = token.match(/sub:([^,)]+)/)?.[1] ?? '';
        return { sub } as any;
      }),
    };

    const configMock: Partial<ConfigService> = {
      get: (key: string, def?: any) => {
        switch (key) {
          case 'JWT_ACCESS_SECRET':
            return 'access-secret';
          case 'JWT_ACCESS_EXPIRES':
            return '15m';
          case 'JWT_REFRESH_SECRET':
            return 'refresh-secret';
          case 'JWT_REFRESH_EXPIRES':
            return '7d';
          case 'BCRYPT_ROUNDS':
            return 12;
          default:
            return def;
        }
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: JwtService, useValue: jwtMock },
        { provide: ConfigService, useValue: configMock },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    // jwtService = module.get(JwtService) as jest.Mocked<JwtService>;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('signAccessToken', () => {
    it('userId를 주면 "검증 가능한 토큰 문자열"을 반환한다.(문자열/비어있지 않음)', () => {
      const test1 = authService.signAccessToken('u-1');
      const test2 = authService.signAccessToken('u-2');

      expect(typeof test1).toBe('string');
      expect(test1).not.toHaveLength(0);
      expect(test2).not.toHaveLength(0);
      expect(test1).not.toEqual(test2);
    });
  });

  describe('signRefreshToken', () => {
    it('userId와 jti를 주면 jti를 포함한 토큰 문자열을 반환한다.', () => {
      const token = authService.signRefreshToken('u-1', 'jti-1');

      expect(typeof token).toBe('string');
      expect(token).toContain('sub:u-1');
      expect(token).toContain('jti:jti-1');
    });
  });

  describe('verifyRefreshToken', () => {
    it('올바른 토큰이면 sub/jti/exp를 가진 payload를 반환한다.', () => {
      const rt = 'jwt(sub:u-1,jti:rt-1)';
      const payload = authService.verifyRefreshToken(rt);

      expect(payload).toEqual({
        sub: 'u-1',
        jti: 'rt-1',
      });
    });

    it('변조/잘못된 토큰이면 예외를 던진다.', () => {
      const bad = 'jwt(sub:user-err,jti:any)';

      expect(() => authService.verifyRefreshToken(bad)).toThrow();
    });
  });

  describe('hash / compare', () => {
    it('hash는 원문을 기반으로 한 "비어있지 않은" 해시 문자열을 반환한다.', async () => {
      const hash = await authService.hash('secret');

      expect(typeof hash).toBe('string');
      expect(hash).toContain('hashed-');
      expect(hash.length).toBeGreaterThan('hashed-'.length);
    });

    it('compare는 같은 원문/해시이면 true, 아니면 false를 반환한다.', async () => {
      const hashed = await authService.hash('secret');

      await expect(authService.compare('secret', hashed)).resolves.toBe(true);
      await expect(authService.compare('wrong', hashed)).resolves.toBe(false);
    });
  });
});
