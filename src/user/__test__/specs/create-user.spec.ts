import { HttpException, HttpStatus } from '@nestjs/common';
import {
  createUserDtoFixture,
  createUserFixture,
} from '../fixtures/user.fixture';
import {
  setupUserServiceTest,
  UserServiceTestContext,
} from '../helpers/user-test.helper';
import { randomUUID } from 'crypto';

describe('UserService', () => {
  describe('createUser', () => {
    let context: UserServiceTestContext;

    beforeEach(async () => {
      context = await setupUserServiceTest();
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    describe('createUser', () => {
      describe('Given 이미 존재하는 이멜일인 경우', () => {
        const existingUser = createUserFixture({
          email: 'existing@example.com',
        });
        const createUserDto = createUserDtoFixture({
          email: 'existing@example.com',
        });

        beforeEach(() => {
          context.userRepository.findByEmail.mockResolvedValue(
            existingUser as any,
          );
        });

        it('When 사용자 생성을 시도하면, Then BAD_REQUEST 예외를 던진다.', async () => {
          // When
          const createUserPromise = context.service.createUser(createUserDto);

          // Then
          await expect(createUserPromise).rejects.toEqual(
            new HttpException('User already exists', HttpStatus.BAD_REQUEST),
          );
          expect(context.userRepository.findByEmail).toHaveBeenCalledWith(
            createUserDto.email,
          );
          expect(context.authService.hash).not.toHaveBeenCalled();
          expect(context.userRepository.create).not.toHaveBeenCalled();
        });
      });

      describe('Given 신규 사용자인 경우', () => {
        const newUserId = randomUUID();
        const createUserDto = createUserDtoFixture();
        const hashedPassword = 'bcrypt-hashed-password';
        const accessToken = 'mocked.access.token';

        beforeEach(() => {
          context.userRepository.findByEmail.mockResolvedValue(null);
          context.authService.hash.mockResolvedValue(hashedPassword);
          context.userRepository.create.mockResolvedValue({
            id: newUserId,
            email: createUserDto.email,
            password: createUserDto.password,
            username: createUserDto.username,
          } as any);
          context.authService.signAccessToken.mockReturnValue(accessToken);
        });

        it('When 사용자가 생성을 시도하면, Then 비밀번호를 해싱하고 사용자를 생성한다.', async () => {
          // When
          const result = await context.service.createUser(createUserDto);

          // Then
          expect(context.userRepository.findByEmail).toHaveBeenCalledWith(
            createUserDto.email,
          );
          expect(context.authService.hash).toHaveBeenCalledWith(
            createUserDto.password,
          );
          expect(context.userRepository.create).toHaveBeenCalledWith(
            expect.objectContaining({ password: hashedPassword }),
          );
          expect(result.user.email).toBe(createUserDto.email);
          expect(result.user.token).toBe(accessToken);
        });
      });
    });

    describe('Given 비밀번호가 너무 짧은 경우', () => {
      // 추가 시나리오 작성
    });

    describe('Given 이멜일 형식이 잘못된 경우', () => {
      // 추가 시나리오 작성
    });
  });
});
