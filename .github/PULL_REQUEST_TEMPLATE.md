## Summary

TDD(Unit -> E2E) 흐름을 기반으로 사용자 로그인 기능을 구현했습니다.
이메일/비밀번호 검증, JWT 발급, DTO 응답 구조를 RealWorld API 스펙에 맞춰 구현했습니다.

## Changes

- **Add**
  - `UserService.login()` 구현 (이메일/비밀번호 검증, JWT 발급)
  - `LoginUserDto` 생성 (`@IsEmail`, `@IsNotEmpty`, `@MinLength` 적용)
  - `POST /users/login` 엔드포인트 추가 및 `@HttpCode(200)` 명시
- **Test**
  - **Unit Test**: 비즈니스 로직 중심 검증 (존재하지 않는 이메일, 비밀번호 불일치, 성공 케이스)
  - **E2E Test**: `/users/login` 요청 흐름 전체 검증 (200 OK, JWT 발급, 응답 스키마)
- **etc**
  - 회원가입(`POST /users`)은 201 유지, 로그인은 200 OK로 명시
  - 테스트 중복 제거 및 코드 정리

## Verification

- [x] 모든 단위/E2E 테스트 통과
- [x] 로그인 요청 시 200 OK 반환 확인 (NestJS 기본 201 → 수정 완료)
- [x] JWT 토큰 정상 발급 및 응답 구조 일치 확인
- [x] 로그인 시 DB 변경 없음(조회 전용) 확인

## Next Step

- [ ] Github PR Template 생성
