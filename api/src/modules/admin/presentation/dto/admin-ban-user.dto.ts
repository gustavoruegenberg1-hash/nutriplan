import { IsBoolean, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AdminBanUserDto {
  @ApiProperty({ example: true, description: 'True para banir/suspender o usuário, false para reativar' })
  @IsBoolean()
  isBanned!: boolean;

  @ApiPropertyOptional({ example: 'Violação das diretrizes da comunidade ou uso indevido' })
  @IsOptional()
  @IsString()
  reason?: string;
}
