import {
  AuthServiceTestContext,
  setupAuthServiceTest,
} from '../factories/auth-service-test.factory';

const compareTest = () => {
  describe('AuthService', () => {
    describe('compare', () => {
      let context: AuthServiceTestContext;

      beforeEach(async () => {
        context = await setupAuthServiceTest();
      });

      afterAll(() => {
        jest.clearAllMocks();
      });

      describe('Given 평문과 해시값이 일치하는 경우', () => {
        const plainText = 'password1234';
        const hashedValue = 'hashed-value';

        beforeEach(() => {
          context.bcrypt.compare.mockResolvedValue(true as never);
        });

        it('When compare를 호출하면, Then true를 반환한다.', async () => {
          // When
          const result = await context.service.compare(plainText, hashedValue);

          // Then
          expect(result).toBeTruthy();
        });
      });

      describe('Give 평문과 해시값이 일치하지 않는 경우', () => {
        const plainText = 'password1234';
        const hashedValue = 'hashed-value';

        beforeEach(() => {
          context.bcrypt.compare.mockResolvedValue(false as never);
        });

        it('When compare를 호출하면, Then false를 반환한다.', async () => {
          // When
          const result = await context.service.compare(plainText, hashedValue);

          // Then
          expect(result).not.toBeTruthy();
        });
      });
    });
  });
};

export default compareTest;
