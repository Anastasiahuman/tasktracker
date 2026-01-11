import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from '../common/guards/auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

class DevLoginDto {
  email: string;
  name?: string;
}

class RegisterDto {
  email: string;
  password: string;
  name?: string;
}

class LoginDto {
  email: string;
  password: string;
}

class RefreshTokenDto {
  refreshToken: string;
}

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('dev-login')
  async devLogin(@Body() dto: DevLoginDto) {
    const { user, tokens } = await this.authService.devLogin(dto.email, dto.name);

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      ...tokens,
    };
  }

  @Post('register')
  async register(@Body() dto: RegisterDto) {
    const { user, tokens } = await this.authService.register(dto.email, dto.password, dto.name);
    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      ...tokens,
    };
  }

  @Post('login')
  async login(@Body() dto: LoginDto) {
    const { user, tokens } = await this.authService.login(dto.email, dto.password);
    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      ...tokens,
    };
  }

  @Post('refresh')
  async refresh(@Body() dto: RefreshTokenDto) {
    return this.authService.refreshToken(dto.refreshToken);
  }

  @Get('me')
  @UseGuards(AuthGuard)
  async getMe(@CurrentUser() user: any) {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    };
  }

  @Post('logout')
  @UseGuards(AuthGuard)
  async logout() {
    return { message: 'Logged out successfully' };
  }
}





