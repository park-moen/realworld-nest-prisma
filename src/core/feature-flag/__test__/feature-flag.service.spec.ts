import { Test, TestingModule } from '@nestjs/testing';
import { FeatureFlagService } from '../service/feature-flag.service';
import { ConfigService } from '@nestjs/config';

describe('FeatureFlagService', () => {
  let service: FeatureFlagService;
  let config: jest.Mocked<ConfigService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FeatureFlagService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<FeatureFlagService>(FeatureFlagService);
    config = module.get(ConfigService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('isFeatureEnabled', () => {
    describe('Given Feature Flag가 문자열 "true"인 경우', () => {
      beforeEach(() => {
        config.get.mockReturnValue('true');
      });
      it('When isFeatureEnabled를 호출하면, Then boolean true를 반환한다.', () => {
        // When
        const result = service.isFeatureEnabled('REFRESH_TOKEN');

        // Then
        expect(result).toBe(true);
        expect(config.get).toHaveBeenCalledWith('FF_REFRESH_TOKEN');
      });
    });

    describe('Given Feature Flag가 문자열 "false"인 경우', () => {
      beforeEach(() => {
        config.get.mockReturnValue('false');
      });

      it('When isFeatureEnabled를 호출하면, Then boolean false를 반환한다.', () => {
        // When
        const result = service.isFeatureEnabled('REFRESH_TOKEN');

        // Then
        expect(result).toBe(false);
      });
    });

    describe('Given Feature Flag가 숫자 문자열 "1"인 경우', () => {
      beforeEach(() => {
        config.get.mockReturnValue('1');
      });

      it('When isEnabled를 호출하면, Then boolean true를 반환한다', () => {
        // When
        const result = service.isFeatureEnabled('REFRESH_TOKEN');

        // Then
        expect(result).toBe(true);
      });
    });

    describe('Given Feature Flag가 undefined인 경우', () => {
      beforeEach(() => {
        config.get.mockReturnValue(undefined);
      });

      it('When isEnabled를 호출하면, Then 기본값 false를 반환한다', () => {
        // When
        const result = service.isFeatureEnabled('UNKNOWN_FEATURE');

        // Then
        expect(result).toBe(false);
      });
    });

    describe('Given Feature Flag가 null인 경우', () => {
      beforeEach(() => {
        config.get.mockReturnValue(null);
      });

      it('When isEnabled를 호출하면, Then 기본값 false를 반환한다', () => {
        // When
        const result = service.isFeatureEnabled('UNKNOWN_FEATURE');

        // Then
        expect(result).toBe(false);
      });
    });

    describe('Given 소문자 Feature 이름이 주어진 경우', () => {
      beforeEach(() => {
        config.get.mockReturnValue('true');
      });

      it('When isEnabled를 호출하면, Then 대문자로 변환하여 조회한다', () => {
        // When
        service.isFeatureEnabled('refresh_token');

        // Then
        expect(config.get).toHaveBeenCalledWith('FF_REFRESH_TOKEN');
      });
    });

    describe('Given 하이픈이 포함된 Feature 이름이 주어진 경우', () => {
      beforeEach(() => {
        config.get.mockReturnValue('true');
      });

      it('When isEnabled를 호출하면, Then 언더스코어로 변환하여 조회한다', () => {
        // When
        service.isFeatureEnabled('user-profile');

        // Then
        expect(config.get).toHaveBeenCalledWith('FF_USER_PROFILE');
      });
    });

    describe('Given Feature Flag 값에 공백이 포함된 경우', () => {
      beforeEach(() => {
        config.get.mockReturnValue('  true  ');
      });

      it('When isEnabled를 호출하면, Then 공백을 제거하고 true를 반환한다', () => {
        // When
        const result = service.isFeatureEnabled('REFRESH_TOKEN');

        // Then
        expect(result).toBe(true);
      });
    });
  });
});
