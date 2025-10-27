# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Alpine 패키지 업데이트 추가
RUN apk update && apk upgrade --no-cache

# package.json과 lock 파일 복사 (캐싱 최적화)
COPY package*.json ./
COPY prisma ./prisma/

# 의존성 설치
RUN npm ci

# 소스 코드 복사
COPY . .

# Prisma 클라이언트 생성
RUN npx prisma generate

# NestJS 앱 빌드
RUN npm run build

# Production stage
FROM node:20-alpine AS production

WORKDIR /app

# Production에도 패키지 업데이트
RUN apk update && apk upgrade --no-cache

# package.json 복사
COPY package*.json ./

# prepare 스크립트 제거 후 프로덕션 의존성 설치
RUN npm pkg delete scripts.prepare && \
    npm ci --only=production

# Prisma schema 복사 (마이그레이션에 필요)
COPY --from=builder /app/prisma ./prisma

# Prisma 클라이언트 복사 (빌드 단계에서 생성됨)
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma

# 빌드된 파일 복사
COPY --from=builder /app/dist ./dist

# Railway는 PORT 환경변수를 자동 제공
ENV NODE_ENV=staging

# Prisma 마이그레이션 실행 후 앱 시작
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/src/main"]
