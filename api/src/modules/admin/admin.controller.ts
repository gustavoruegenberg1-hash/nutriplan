import { Controller, Get, Put, Body, Param, Query, UseGuards } from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser, CurrentUserPayload } from '../auth/decorators/current-user.decorator';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('overview')
  async getOverview() {
    return this.adminService.getOverview();
  }

  @Get('professionals')
  async listProfessionals(@Query('status') status?: string) {
    return this.adminService.listProfessionals(status);
  }

  @Put('professionals/:id/status')
  async updateProfessionalStatus(
    @CurrentUser() user: CurrentUserPayload,
    @Param('id') id: string,
    @Body() body: { status: string; reviewNotes?: string },
  ) {
    return this.adminService.updateProfessionalStatus(user.userId, id, body.status, body.reviewNotes);
  }

  @Get('users')
  async listUsers() {
    return this.adminService.listUsers();
  }
}
