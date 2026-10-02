import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, Length } from 'class-validator';

export class VerifyEmailDto {
  @ApiProperty({ example: 'usuario@exemplo.com' })
  @IsEmail({}, { message: 'Informe um endereço de e-mail válido.' })
  email!: string;

  @ApiProperty({ example: '123456' })
  @IsString()
  @IsNotEmpty({ message: 'O código de verificação é obrigatório.' })
  @Length(6, 6, { message: 'O código deve ter exatamente 6 dígitos.' })
  code!: string;
}
