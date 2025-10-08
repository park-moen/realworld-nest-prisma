import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  private readonly round: number;
  constructor(private readonly config: ConfigService) {
    this.round = Number(config.get('BCRYPT_ROUNDS') ?? 12);
  }

  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, this.round);
  }

  async validatePassword(
    password: string,
    storedHash: string,
  ): Promise<boolean> {
    return bcrypt.compare(password, storedHash);
  }
}
