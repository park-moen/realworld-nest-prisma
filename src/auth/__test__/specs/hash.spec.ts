import {
  AuthServiceTestContext,
  setupAuthServiceTest,
} from '../factories/auth-service-test.factory';

const hashTest = () => {
  describe('AuthService', () => {
    describe('hash', () => {
      let context: AuthServiceTestContext;

      beforeEach(async () => {
        context = await setupAuthServiceTest();
      });

      afterAll(() => {
        jest.clearAllMocks();
      });

      describe('Given 평문 문자열이 주어지면 ', () => {
        const plainText = 'password1234';
        const mockHashedValue = 'hashed-value';

        beforeEach(() => {
          context.bcrypt.hash.mockResolvedValue(mockHashedValue as never);
        });

        it('When hash를 호출하면, Then 암호화된 해시 문자열을 반환한다.', async () => {
          // When
          const result = await context.service.hash(plainText);

          // Then
          expect(result).toBe(mockHashedValue);
          expect(typeof result).toBe('string');
        });
      });
    });
  });
};

export default hashTest;
