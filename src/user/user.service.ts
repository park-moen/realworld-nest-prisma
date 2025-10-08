import { AuthService } from '@app/auth/auth.service';
import { PrismaService } from '@app/prisma/prisma.service';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UserService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly authService: AuthService,
  ) {}

  async createUser(createUserDto: CreateUserDto): Promise<any> {
    const { email, password } = createUserDto;
    const userExists = await this.prisma.user.findUnique({ where: { email } });

    if (userExists) {
      throw new HttpException('User already exists', HttpStatus.BAD_REQUEST);
    }

    const passwordHashed = await this.authService.hashPassword(password);

    return await this.prisma.user.create({
      data: {
        ...createUserDto,
        passwordHash: passwordHashed,
      },
    });
  }
}
