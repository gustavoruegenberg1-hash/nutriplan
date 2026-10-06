import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { ProfessionalsService } from './professionals.service';
import { RegisterProfessionalDto } from './dto/professional.dtos';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser, CurrentUserPayload } from '../auth/decorators/current-user.decorator';

@Controller('professionals')
export class ProfessionalsController {
  constructor(private readonly professionalsService: ProfessionalsService) {}

  @Post('register')
  async register(@Body() dto: RegisterProfessionalDto) {
    return this.professionalsService.register(dto);
  }

  @Get()
  async listApproved() {
    return this.professionalsService.listApproved();
  }

  @Get('me')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('PROFESSIONAL', 'ADMIN')
  async getMe(@CurrentUser() user: CurrentUserPayload) {
    return this.professionalsService.getMe(user.userId);
  }

  @Get('clients')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('PROFESSIONAL', 'ADMIN')
  async getClients(@CurrentUser() user: CurrentUserPayload) {
    return this.professionalsService.getClients(user.userId);
  }

  @Post('clients/:clientId/link')
  @UseGuards(JwtAuthGuard)
  async linkClient(
    @CurrentUser() user: CurrentUserPayload,
    @Param('clientId') clientId: string,
    @Body() body: { notes?: string },
  ) {
    return this.professionalsService.linkClient(user.userId, clientId, body.notes);
  }
}
