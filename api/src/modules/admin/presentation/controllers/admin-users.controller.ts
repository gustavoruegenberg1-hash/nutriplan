import {
  Controller,
  Get,
  Patch,
  Post,
  Delete,
  Param,
  Body,
  Query,
  Req,
  UseGuards,
  NotFoundException,
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Inject,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../../shared/guards/jwt-auth.guard';
import { RolesGuard } from '../../../../shared/guards/roles.guard';
import { Roles } from '../../../../shared/decorators/roles.decorator';
import { IUserRepository } from '../../../auth/application/ports/user-repository.port';
import { UserResponseDto } from '../../../auth/presentation/dto/user-response.dto';
import { AdminUpdateUserDto } from '../dto/admin-update-user.dto';
import { AdminBanUserDto } from '../dto/admin-ban-user.dto';

@ApiTags('Admin')
@Controller('admin')
export class AdminUsersController {
  constructor(
    @Inject('USER_REPOSITORY')
    private readonly userRepository: IUserRepository,
  ) {}

  @ApiOperation({ summary: 'Reivindicar acesso de administrador inicial (se nenhum admin existir ou se email estiver em ADMIN_EMAILS)' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('claim-initial-admin')
  async claimInitialAdmin(@Req() req: any) {
    const callerId = req.user?.id;
    if (!callerId) {
      throw new BadRequestException('Usuário não identificado.');
    }

    const caller = await this.userRepository.findById(callerId);
    if (!caller) {
      throw new NotFoundException('Usuário não encontrado.');
    }

    // Se já for admin, retorna sucesso
    if (caller.role === 'ADMIN') {
      return { success: true, message: 'Você já possui permissão de Administrador.' };
    }

    // Verifica se o email está configurado na variável de ambiente
    const adminEmails = (process.env.ADMIN_EMAILS || '')
      .split(',')
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean);

    if (adminEmails.includes(caller.email.toLowerCase())) {
      await this.userRepository.update(callerId, { role: 'ADMIN' });
      return { success: true, message: 'Conta promovida a Administrador com base na lista autorizada.' };
    }

    // Caso contrário, só permite se não houver NENHUM admin existente no sistema
    const allUsers = await this.userRepository.findAll();
    const hasAdmin = allUsers.some((u) => u.role === 'ADMIN');

    if (hasAdmin) {
      throw new ForbiddenException(
        'O sistema já possui um Administrador cadastrado. Solicite a elevação ao administrador responsável.',
      );
    }

    // Primeiro usuário se torna administrador
    await this.userRepository.update(callerId, { role: 'ADMIN' });
    return { success: true, message: 'Você foi registrado como o primeiro Administrador do sistema!' };
  }

  @ApiOperation({ summary: 'Estatísticas gerais de usuários para o painel administrativo' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Get('stats')
  async getStats() {
    const users = await this.userRepository.findAll();
    const totalUsers = users.length;
    const bannedUsers = users.filter((u) => !!u.isBanned).length;
    const activeUsers = totalUsers - bannedUsers;
    const totalAdmins = users.filter((u) => u.role === 'ADMIN').length;
    const totalProfessionals = users.filter((u) => u.role === 'PROFESSIONAL').length;

    return {
      totalUsers,
      activeUsers,
      bannedUsers,
      totalAdmins,
      totalProfessionals,
    };
  }

  @ApiOperation({ summary: 'Listar todos os usuários com filtros' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Get('users')
  async listUsers(
    @Query('search') search?: string,
    @Query('role') role?: string,
    @Query('status') status?: string,
  ): Promise<UserResponseDto[]> {
    let users = await this.userRepository.findAll();

    // Filtro de busca textual (nome ou e-mail)
    if (search && search.trim() !== '') {
      const term = search.toLowerCase().trim();
      users = users.filter(
        (u) =>
          (u.name && u.name.toLowerCase().includes(term)) ||
          (u.email && u.email.toLowerCase().includes(term)),
      );
    }

    // Filtro de papel (role)
    if (role && role.trim() !== '' && role !== 'ALL') {
      const targetRole = role.toUpperCase().trim();
      users = users.filter((u) => u.role === targetRole);
    }

    // Filtro de status de banimento
    if (status === 'banned') {
      users = users.filter((u) => !!u.isBanned);
    } else if (status === 'active') {
      users = users.filter((u) => !u.isBanned);
    }

    // Ordenação: mais recentes primeiro, ou alfabético
    users.sort((a, b) => {
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return dateB - dateA;
    });

    return users.map((u) => UserResponseDto.fromEntity(u));
  }

  @ApiOperation({ summary: 'Obter detalhes de um usuário específico' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Get('users/:id')
  async getUserById(@Param('id') id: string): Promise<UserResponseDto> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new NotFoundException('Usuário não encontrado.');
    }
    return UserResponseDto.fromEntity(user);
  }

  @ApiOperation({ summary: 'Atualizar dados de um usuário pelo administrador' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Patch('users/:id')
  async updateUser(
    @Param('id') id: string,
    @Body() dto: AdminUpdateUserDto,
    @Req() req: any,
  ): Promise<UserResponseDto> {
    const targetUser = await this.userRepository.findById(id);
    if (!targetUser) {
      throw new NotFoundException('Usuário não encontrado.');
    }

    // Impedir que o administrador remova seu próprio papel de ADMIN
    if (req.user?.id === id && dto.role && dto.role !== 'ADMIN') {
      throw new BadRequestException('Você não pode revogar seus próprios privilégios de administrador.');
    }

    // Validação de unicidade de e-mail se alterado
    if (dto.email && dto.email.toLowerCase().trim() !== targetUser.email.toLowerCase().trim()) {
      const existingUser = await this.userRepository.findByEmail(dto.email.trim());
      if (existingUser && existingUser.id !== id) {
        throw new ConflictException('Este endereço de e-mail já está sendo utilizado por outro usuário.');
      }
    }

    const updated = await this.userRepository.update(id, dto as any);
    return UserResponseDto.fromEntity(updated);
  }

  @ApiOperation({ summary: 'Banir ou reativar a conta de um usuário' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Post('users/:id/ban')
  async banUser(
    @Param('id') id: string,
    @Body() dto: AdminBanUserDto,
    @Req() req: any,
  ): Promise<UserResponseDto> {
    const targetUser = await this.userRepository.findById(id);
    if (!targetUser) {
      throw new NotFoundException('Usuário não encontrado.');
    }

    // Impedir que o admin suspenda a si mesmo
    if (req.user?.id === id && dto.isBanned) {
      throw new BadRequestException('Você não pode suspender sua própria conta de administrador.');
    }

    const updated = await this.userRepository.update(id, {
      isBanned: dto.isBanned,
      bannedAt: dto.isBanned ? new Date() : null,
      banReason: dto.isBanned ? (dto.reason?.trim() || 'Suspenso pela administração') : null,
    });

    return UserResponseDto.fromEntity(updated);
  }

  @ApiOperation({ summary: 'Excluir definitivamente a conta de um usuário' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Delete('users/:id')
  async deleteUser(@Param('id') id: string, @Req() req: any) {
    const targetUser = await this.userRepository.findById(id);
    if (!targetUser) {
      throw new NotFoundException('Usuário não encontrado.');
    }

    // Impedir que o admin exclua a si mesmo
    if (req.user?.id === id) {
      throw new BadRequestException('Você não pode excluir sua própria conta de administrador.');
    }

    await this.userRepository.delete(id);
    return { success: true, message: `Usuário ${targetUser.name} (${targetUser.email}) foi excluído com sucesso.` };
  }
}
