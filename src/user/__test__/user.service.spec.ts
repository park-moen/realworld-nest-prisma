import createUserTest from './specs/create-user';
import loginTest from './specs/login';
import refreshTest from './specs/refresh';

// 진입점 확인을 위한 스모크 테스트만 포함
describe('UserService', () => {
  createUserTest();
  loginTest();
  refreshTest();

  it('should run all specs', () => {
    expect(true).toBe(true);
  });
});
