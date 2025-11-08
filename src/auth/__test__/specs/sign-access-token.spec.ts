// import { randomUUID } from 'crypto';
// import {
//   AuthServiceTestContext,
//   setupAuthServiceTest,
// } from '../factories/auth-service-test.factory';

// const signAccessTokenTest = () => {
//   describe('AuthService', () => {
//     describe('signAccessToken', () => {
//       let context: AuthServiceTestContext;

//       beforeEach(async () => {
//         context = await setupAuthServiceTest();
//       });

//       afterAll(() => {
//         jest.clearAllMocks();
//       });

//       describe('Scenario: 유효한 사용자 ID로 Access Token 생성', () => {
//         describe('Given 유효한 사용자 ID가 주어진 경우 ', () => {
//           const userId = randomUUID();
//           const accessToken = 'mocked.access.token';

//           beforeEach(() => {
//             context.jwtService.sign.mockReturnValue(accessToken);
//           });

//           it('When signAccessToken을 호출한면, Then Access Token을 반환한다.', () => {
//             // When
//             const result = context.service.signAccessToken(userId);

//             // Then
//             expect(result).toBe(accessToken);
//             expect(typeof result).toBe('string');
//           });

//           it('When signAccessToken을 호출하면, Then payload의 sub 필드에 userId가 포함된다.', () => {
//             // When
//             context.service.signAccessToken(userId);

//             // Then
//             expect(context.jwtService.sign).toHaveBeenCalledWith(
//               { sub: userId },
//               expect.any(Object),
//             );
//           });
//         });
//       });
//     });
//   });
// };

// export default signAccessTokenTest;
