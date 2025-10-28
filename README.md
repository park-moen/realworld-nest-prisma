<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://coveralls.io/github/nestjs/nest?branch=master" target="_blank"><img src="https://coveralls.io/repos/github/nestjs/nest/badge.svg?branch=master#9" alt="Coverage" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg" alt="Donate us"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow" alt="Follow us on Twitter"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

## Description

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

## Project setup

```bash
$ npm install
```

## Compile and run the project

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Run tests

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Resources

Check out a few resources that may come in handy when working with NestJS:

- Visit the [NestJS Documentation](https://docs.nestjs.com) to learn more about the framework.
- For questions and support, please visit our [Discord channel](https://discord.gg/G7Qnnhy).
- To dive deeper and get more hands-on experience, check out our official video [courses](https://courses.nestjs.com/).
- Visualize your application graph and interact with the NestJS application in real-time using [NestJS Devtools](https://devtools.nestjs.com).
- Need help with your project (part-time to full-time)? Check out our official [enterprise support](https://enterprise.nestjs.com).
- To stay in the loop and get updates, follow us on [X](https://x.com/nestframework) and [LinkedIn](https://linkedin.com/company/nestjs).
- Looking for a job, or have a job to offer? Check out our official [Jobs board](https://jobs.nestjs.com).

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://twitter.com/kammysliwiec)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).

## 🔀 Git 워크플로우 (TBD)

이 프로젝트는 **Trunk-Based Development (TBD)** 전략을 따릅니다.

### 브랜치 전략

- `main`: 유일한 장기 브랜치, 항상 배포 가능한 상태
- `feat/*`: 짧은 생명주기 (최대 1-2일) / Red -> Green -> Refactor -> E2E 수행 (커밋으로 구분)
- `fix/*`: 버그 수정 (즉시 병합)
- `refactor/*`: 리팩토링 (최대 1일)
- `docs/*`: 문서 작업 (즉시 병합)
- `chore/*`: 설정/유지보수 (최대 1일)
- `spike/*`: 실험/탐색 (main 병합 안 함)

### 개발 워크플로우

1. 최신 main 동기화
   - git checkout main
   - git pull origin main

2. 짧은 feature 브랜치 생성 (4시간 목표)
   - git checkout -b feat/article-create-basic

3. 작업 및 커밋 (Feature Flag 사용)
   - git commit -m "feat(article): add basic article creation (behind FF)"

4. 하루 안에 main에 병합
   - git checkout main
   - git pull --rebase origin main
   - git merge feat/article-create-basic
   - git push origin main
   - git branch -d feat/article-create-basic

### Feature Flag 사용법

```ts
import { FEATURES } from '@/config/features';

// Service에서
if (!FEATURES.ARTICLE_CREATE) {
  throw new NotImplementedException('Feature not available');
}

// Controller에서
@Post('articles')
@ApiExcludeEndpoint(!FEATURES.ARTICLE_CREATE)
async createArticle() {
  if (!FEATURES.ARTICLE_CREATE) {
    throw new NotFoundException();
  }
  // 구현...
}
```

### 규칙

1. **브랜치는 최대 1-2일 생명주기**
2. **미완성 기능은 Feature Flag로 숨기기**
3. **하루 최소 1-2회 main에 병합**
4. **Push 전 항상 테스트 실행**

## 🐳 로컬 Docker 빌드 테스트

배포 전 Docker 이미지가 정상적으로 빌드되고 실행되는지 검증하는 절차입니다.

### 📌 왜 필요한가요?

- 운영 환경(Railway, AWS 등)과 동일한 조건에서 사전 검증
- CI/CD 실패 방지 및 디버깅 시간 단축
- Dockerfile, 환경변수, 빌드 산출물 문제 조기 발견

### 🚀 테스트 순서

#### 1. Docker 이미지 빌드

```bash
docker build -t nestjs-app .
```

**체크포인트:**

- ✅ 빌드가 에러 없이 완료되는가?
- ✅ `dist/src/main.js` 파일이 생성되는가?
- ✅ Prisma Client가 정상 생성되는가?

#### 2. 컨테이너 실행

```bash
docker run -p 3000:3000 \
-e DATABASE_URL="postgresql://postgres:postgres@host.docker.internal:5432/real_world_dev?schema=public" \
-e JWT_ACCESS_SECRET="test-secret-key" \
-e JWT_REFRESH_SECRET="test-refresh-key" \
-e BCRYPT_ROUNDS="10" \
nestjs-app
```

#### 3. API 동작 확인

**Postman/curl 테스트:**

Health check (루트는 404 정상, API 엔드포인트 확인)

```bash
curl http://localhost:3000/api/users
```

또는 Postman으로 실행

**체크포인트:**

- ✅ 서버가 정상 시작되는가? (로그: "Listening on port 3000")
- ✅ DB 연결이 정상인가? (Prisma 연결 로그 확인)
- ✅ API 엔드포인트가 응답하는가?

### 📝 배포 전 체크리스트

- [ ] `docker build` 성공
- [ ] 컨테이너 실행 후 "Listening on port 3000" 로그 확인
- [ ] DB 연결 정상 (Prisma 로그 확인)
- [ ] 최소 1개 API 엔드포인트 정상 응답
- [ ] 환경변수 누락 없음
- [ ] CORS 설정 확인 (필요시)

### 🎯 배포 환경별 주의사항

**Railway 배포 시:**

- DATABASE_URL은 Railway Variables에서 자동 주입 or 직접 주입
- PORT는 Railway가 자동 할당 (코드에서 `process.env.PORT` 사용 필수)
- `host.docker.internal` 대신 실제 Railway DB 연결 문자열 사용

### ✅ 현재 프로세스 개선 제안

#### 1. 자동화 스크립트 추가 (선택)

```bash
# 컨테이너 내부 파일 구조 확인
docker run -it --entrypoint /bin/sh nestjs-app
ls -la /app/dist/src
```

#### 2. 컨테이너 내부 확인 추가 (선택)

```bash
# scripts/docker-test.sh
#!/bin/bash
echo "🔨 Building Docker image..."
docker build -t nestjs-app .

echo "🚀 Starting container..."
docker run -d -p 3000:3000 \
  -e DATABASE_URL="postgresql://postgres:postgres@host.docker.internal:5432/real_world_dev?schema=public" \
  --name nestjs-test \
  nestjs-app

echo "⏳ Waiting for server..."
sleep 5

echo "🧪 Testing API..."
curl http://localhost:3000/api/users

echo "🧹 Cleanup..."
docker stop nestjs-test
docker rm nestjs-test
```
