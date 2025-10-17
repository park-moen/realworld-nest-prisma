import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
} from '@nestjs/common';
import { UserService } from '../service/user.service';
import { CreateUserDto } from '../dto/request/create-user.dto';
import { UserResponseDto } from '../dto/response/user.response.dto';
import { LoginUserDto } from '../dto/request/login-user.dto';
import { AuthService } from '@app/auth/auth.service';
import { Request, Response } from 'express';

@Controller('users')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly authService: AuthService,
  ) {}

  @Post()
  async createUser(
    @Body('user') createUserDto: CreateUserDto,
  ): Promise<UserResponseDto> {
    return await this.userService.createUser(createUserDto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body('user') loginUserDto: LoginUserDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<UserResponseDto> {
    const { result, refreshToken } = await this.userService.login(loginUserDto);
    const cookieName = this.authService.getRefreshCookieName();
    const cookieOptions = this.authService.buildRefreshCookieOptions();

    res.cookie(cookieName, refreshToken, cookieOptions);

    return result;
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<{ user: { token: string } }> {
    const cookieName = this.authService.getRefreshCookieName();
    const token = (req.cookies && req.cookies[cookieName]) as
      | string
      | undefined;

    const { accessToken, refreshToken } = await this.userService.refresh(token);
    const cookieOptions = this.authService.buildRefreshCookieOptions();

    res.cookie(cookieName, refreshToken, cookieOptions);

    return { user: { token: accessToken } };
  }
}
