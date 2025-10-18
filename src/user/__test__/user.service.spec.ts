import './specs/create-user.spec';
import './specs/login.spec';
import './specs/refresh.spec';

// 진입점 확인을 위한 스모크 테스트만 포함
describe('UserService', () => {
  it('should run all specs', () => {
    expect(true).toBe(true);
  });
});
