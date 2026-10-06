import { Controller, Get, UseGuards } from '@nestjs/common';
import { DashboardService, DashboardSummary } from './dashboard.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser, CurrentUserPayload } from '../auth/decorators/current-user.decorator';

@Controller('dashboard')
@UseGuards(JwtAuthGuard)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get()
  async getSummary(@CurrentUser() user: CurrentUserPayload): Promise<DashboardSummary> {
    return this.dashboardService.getSummary(user.userId);
  }
}
