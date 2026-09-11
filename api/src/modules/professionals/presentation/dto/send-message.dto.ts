import { IsString, IsNotEmpty, IsOptional, IsIn } from 'class-validator';

export class SendMessageDto {
  @IsString()
  @IsNotEmpty()
  content: string;

  @IsOptional()
  @IsIn(['USER', 'PROFESSIONAL'])
  senderType?: 'USER' | 'PROFESSIONAL';

  @IsOptional()
  @IsString()
  asProfessionalId?: string;
}
