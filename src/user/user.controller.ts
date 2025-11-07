import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Put,
  Res,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/request/create-user.dto';
import { UserResponseDto } from './dto/response/user.response.dto';
import { LoginUserDto } from './dto/request/login-user.dto';
import { AuthService } from '@app/auth/auth.service';
import { Response } from 'express';
import { Feature } from '@app/common/decorators/feature.decorator';
import { FeatureFlagGuard } from '@app/common/guards/feature-flag.guard';
import { AccessTokenGuard } from '@app/common/guards/access-token.guard';
import { CurrentUser } from '@app/common/decorators/current-user-decorator';
import { AuthUser } from '@app/common/types/auth-user';
import { RefreshTokenGuard } from '@app/common/guards/refresh-token.guard';
import { UpdateUserDto } from './dto/request/update-user.dto';

@Controller('users')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly authService: AuthService,
  ) {}

  @Post()
  @UseGuards(FeatureFlagGuard)
  @Feature('USER_SIGNUP')
  async createUser(
    @Body('user') createUserDto: CreateUserDto,
  ): Promise<UserResponseDto> {
    return await this.userService.createUser(createUserDto);
  }

  @UseGuards(AccessTokenGuard)
  @Put('user')
  async updateUser(
    @CurrentUser() user: AuthUser,
    @Body('user') updateUserDto: UpdateUserDto,
  ) {
    return this.userService.updateUser(updateUserDto, user.token);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @UseGuards(FeatureFlagGuard)
  @Feature('USER_LOGIN')
  async login(
    @Body('user') loginUserDto: LoginUserDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<any> {
    const { result, refreshToken } = await this.userService.login(loginUserDto);
    const cookieName = this.authService.getRefreshCookieName();
    const cookieOptions = this.authService.buildRefreshCookieOptions();

    res.cookie(cookieName, refreshToken, cookieOptions);
    return result;
  }

  @UseGuards(AccessTokenGuard)
  @Get('user')
  async getUserCurrent(@CurrentUser() user: AuthUser): Promise<any> {
    return await this.userService.getUserCurrent(user.userId, user.token);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @UseGuards(FeatureFlagGuard, RefreshTokenGuard)
  @Feature('REFRESH_TOKEN')
  async refresh(
    @CurrentUser() user: AuthUser,
    @Res({ passthrough: true }) res: Response,
  ): Promise<{ user: { token: string } }> {
    const { accessToken, refreshToken } = await this.userService.refresh(
      user.refreshToken,
    );
    const cookieName = this.authService.getRefreshCookieName();
    const cookieOptions = this.authService.buildRefreshCookieOptions();

    res.cookie(cookieName, refreshToken, cookieOptions);

    return { user: { token: accessToken } };
  }
}
