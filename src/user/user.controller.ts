import { Body, Controller, Post } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/request/create-user.dto';
import { UserResponseDto } from './dto/response/user.response.dto';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  async createUser(
    @Body('user') createUserDto: CreateUserDto,
  ): Promise<UserResponseDto> {
    return await this.userService.createUser(createUserDto);
  }
}
