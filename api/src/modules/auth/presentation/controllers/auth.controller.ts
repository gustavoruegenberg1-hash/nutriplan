import { Controller, Post, Body, Get, Patch, UseGuards } from '@nestjs/common';
import { RegisterUseCase } from '../../application/use-cases/register.use-case';
import { LoginUseCase } from '../../application/use-cases/login.use-case';
import { GetProfileUseCase } from '../../application/use-cases/get-profile.use-case';
import { UpdateProfileUseCase } from '../../application/use-cases/update-profile.use-case';
import { VerifyEmailUseCase } from '../../application/use-cases/verify-email.use-case';
import { ResendCodeUseCase } from '../../application/use-cases/resend-code.use-case';
import { GoogleAuthUseCase } from '../../application/use-cases/google-auth.use-case';
import { RegisterDto } from '../dto/register.dto';
import { LoginDto } from '../dto/login.dto';
import { UpdateProfileDto } from '../dto/update-profile.dto';
import { VerifyEmailDto } from '../dto/verify-email.dto';
import { ResendCodeDto } from '../dto/resend-code.dto';
import { GoogleAuthDto } from '../dto/google-auth.dto';
import { JwtAuthGuard } from '../../../../shared/guards/jwt-auth.guard';
import { CurrentUser } from '../../../../shared/decorators/current-user.decorator';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { UserResponseDto } from '../dto/user-response.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly registerUseCase: RegisterUseCase,
    private readonly loginUseCase: LoginUseCase,
    private readonly getProfileUseCase: GetProfileUseCase,
    private readonly updateProfileUseCase: UpdateProfileUseCase,
    private readonly verifyEmailUseCase: VerifyEmailUseCase,
    private readonly resendCodeUseCase: ResendCodeUseCase,
    private readonly googleAuthUseCase: GoogleAuthUseCase,
  ) {}

  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({ status: 201, description: 'User registered successfully', type: UserResponseDto })
  async register(@Body() dto: RegisterDto) {
    return this.registerUseCase.execute(dto);
  }

  @Post('login')
  @ApiOperation({ summary: 'Login and get JWT tokens' })
  @ApiResponse({ status: 200, description: 'Successful login' })
  async login(@Body() dto: LoginDto) {
    return this.loginUseCase.execute(dto);
  }

  @Post('verify-email')
  @ApiOperation({ summary: 'Verify user email with 6-digit code' })
  @ApiResponse({ status: 200, description: 'Email verified successfully' })
  async verifyEmail(@Body() dto: VerifyEmailDto) {
    return this.verifyEmailUseCase.execute(dto);
  }

  @Post('resend-code')
  @ApiOperation({ summary: 'Resend email verification code' })
  @ApiResponse({ status: 200, description: 'Verification code resent' })
  async resendCode(@Body() dto: ResendCodeDto) {
    return this.resendCodeUseCase.execute(dto);
  }

  @Post('google')
  @ApiOperation({ summary: 'Authenticate or register with Google/Gmail' })
  @ApiResponse({ status: 200, description: 'Google authentication successful' })
  async googleAuth(@Body() dto: GoogleAuthDto) {
    return this.googleAuthUseCase.execute(dto);
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({ status: 200, description: 'User profile returned', type: UserResponseDto })
  async getProfile(@CurrentUser() user: any) {
    return this.getProfileUseCase.execute(user.id);
  }

  @Patch('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update current user profile' })
  @ApiResponse({ status: 200, description: 'User profile updated', type: UserResponseDto })
  async updateProfile(@CurrentUser() user: any, @Body() dto: UpdateProfileDto) {
    return this.updateProfileUseCase.execute(user.id, dto);
  }
}
