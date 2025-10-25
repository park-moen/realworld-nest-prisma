import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext, HttpException, HttpStatus } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { FeatureFlagGuard } from '../feature-flag.guard';
import { FeatureFlagService } from '@app/core/feature-flag/service/feature-flag.service';

describe('FeatureFlagGuard', () => {
  let guard: FeatureFlagGuard;
  let reflector: jest.Mocked<Reflector>;
  let featureFlagsService: jest.Mocked<FeatureFlagService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FeatureFlagGuard,
        {
          provide: Reflector,
          useValue: {
            get: jest.fn(),
          },
        },
        {
          provide: FeatureFlagService,
          useValue: {
            isFeatureEnabled: jest.fn(),
          },
        },
      ],
    }).compile();

    guard = module.get<FeatureFlagGuard>(FeatureFlagGuard);
    reflector = module.get(Reflector) as jest.Mocked<Reflector>;
    featureFlagsService = module.get(
      FeatureFlagService,
    ) as jest.Mocked<FeatureFlagService>;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // Mock ExecutionContext Helper
  const createMockExecutionContext = (): jest.Mocked<ExecutionContext> => {
    return {
      getHandler: jest.fn(),
      getClass: jest.fn(),
      switchToHttp: jest.fn(),
      switchToRpc: jest.fn(),
      switchToWs: jest.fn(),
      getType: jest.fn(),
      getArgs: jest.fn(),
      getArgByIndex: jest.fn(),
    } as any;
  };

  describe('canActivate', () => {
    describe('Given Feature 데코레이터가 없는 엔드포인트인 경우', () => {
      const mockExecutionContext = createMockExecutionContext();

      beforeEach(() => {
        reflector.get.mockReturnValue(undefined);
      });

      it('When canActivate를 호출하면, Then true를 반환하여 접근을 허용한다', () => {
        // When
        const result = guard.canActivate(mockExecutionContext);

        // Then
        expect(result).toBe(true);
        expect(featureFlagsService.isFeatureEnabled).not.toHaveBeenCalled();
      });
    });

    describe('Given Feature Flag가 활성화된 경우', () => {
      const mockExecutionContext = createMockExecutionContext();
      const mockHandler = jest.fn();

      beforeEach(() => {
        mockExecutionContext.getHandler.mockReturnValue(mockHandler);
        reflector.get.mockReturnValue('REFRESH_TOKEN');
        featureFlagsService.isFeatureEnabled.mockReturnValue(true);
      });

      it('When canActivate를 호출하면, Then true를 반환하여 접근을 허용한다', () => {
        // When
        const result = guard.canActivate(mockExecutionContext);

        // Then
        expect(result).toBe(true);
        expect(reflector.get).toHaveBeenCalledWith('feature', mockHandler);
        expect(featureFlagsService.isFeatureEnabled).toHaveBeenCalledWith(
          'REFRESH_TOKEN',
        );
      });
    });

    describe('Given Feature Flag가 비활성화된 경우', () => {
      const mockExecutionContext = createMockExecutionContext();
      const mockHandler = jest.fn();

      beforeEach(() => {
        mockExecutionContext.getHandler.mockReturnValue(mockHandler);
        reflector.get.mockReturnValue('DISABLED_FEATURE');
        featureFlagsService.isFeatureEnabled.mockReturnValue(false);
      });

      it('When canActivate를 호출하면, Then HttpException을 던진다', () => {
        // When
        const guardExecution = () => guard.canActivate(mockExecutionContext);

        // Then
        expect(guardExecution).toThrow(HttpException);
        expect(guardExecution).toThrow(
          new HttpException(
            'Feature not implemented',
            HttpStatus.NOT_IMPLEMENTED,
          ),
        );
      });
    });

    describe('Given 올바른 handler에서 메타데이터를 읽어야 하는 경우', () => {
      const mockExecutionContext = createMockExecutionContext();
      const mockHandler = jest.fn();

      beforeEach(() => {
        mockExecutionContext.getHandler.mockReturnValue(mockHandler);
        reflector.get.mockReturnValue('TEST_FEATURE');
        featureFlagsService.isFeatureEnabled.mockReturnValue(true);
      });

      it('When canActivate를 호출하면, Then ExecutionContext에서 가져온 handler를 사용한다', () => {
        // When
        guard.canActivate(mockExecutionContext);

        // Then
        expect(mockExecutionContext.getHandler).toHaveBeenCalled();
        expect(reflector.get).toHaveBeenCalledWith('feature', mockHandler);
      });
    });
  });
});
