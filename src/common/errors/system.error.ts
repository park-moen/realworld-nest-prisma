import { SystemError } from './base-domain.error';

/**
 * 데이터 무결성 오류
 * - DB 제약조건 위반
 * - 데이터 일관성 문제
 */
export class DataIntegrityError extends SystemError {
  constructor(
    message: string,
    public readonly context?: Record<string, any>,
  ) {
    super(message);
  }
}

/**
 * Transaction 실행 오류
 * - Transaction 내부에서 예상치 못한 상황
 */
export class TransactionExecutionError extends SystemError {
  constructor(
    message: string,
    public readonly context?: Record<string, any>,
  ) {
    super(message);
  }
}

/**
 * Repository 오류
 * - DB 연결 실패
 * - 쿼리 실행 실패
 */
export class RepositoryError extends SystemError {
  constructor(
    message: string,
    public readonly cause?: Error,
  ) {
    super(message);
  }
}
