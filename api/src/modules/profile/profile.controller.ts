import { Controller, Get, Put, Post, Body, UseGuards } from '@nestjs/common';
import { ProfileService, UserProfileResponse } from './profile.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser, CurrentUserPayload } from '../auth/decorators/current-user.decorator';

@Controller('profile')
@UseGuards(JwtAuthGuard)
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Get()
  async getProfile(@CurrentUser() user: CurrentUserPayload): Promise<UserProfileResponse> {
    return this.profileService.getProfile(user.userId);
  }

  @Put()
  async updateProfile(
    @CurrentUser() user: CurrentUserPayload,
    @Body() dto: UpdateProfileDto,
  ): Promise<UserProfileResponse> {
    return this.profileService.updateProfile(user.userId, dto);
  }

  @Get('restrictions')
  async getRestrictions() {
    return this.profileService.getAllAvailableRestrictions();
  }

  @Post('weight')
  async addWeight(
    @CurrentUser() user: CurrentUserPayload,
    @Body() body: { weight: number; notes?: string },
  ) {
    return this.profileService.addWeightRecord(user.userId, body.weight, body.notes);
  }
}
