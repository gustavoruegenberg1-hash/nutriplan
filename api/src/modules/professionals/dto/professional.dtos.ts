import { IsNotEmpty, IsEmail, IsString, MinLength, IsOptional, IsInt, Min, Max, IsArray } from 'class-validator';

export class ProfessionalDocumentDto {
  @IsNotEmpty()
  @IsString()
  name!: string;

  @IsNotEmpty()
  @IsString()
  type!: string;

  @IsInt()
  @Min(0)
  size!: number;

  @IsNotEmpty()
  @IsString()
  url!: string;
}

export class RegisterProfessionalDto {
  // ETAPA 1: Dados Pessoais
  @IsNotEmpty({ message: 'O nome completo é obrigatório' })
  @IsString()
  name!: string;

  @IsNotEmpty({ message: 'O e-mail é obrigatório' })
  @IsEmail({}, { message: 'Forneça um e-mail válido' })
  email!: string;

  @IsNotEmpty({ message: 'A senha é obrigatória' })
  @MinLength(6, { message: 'A senha deve ter pelo menos 6 caracteres' })
  password!: string;

  @IsOptional()
  @IsString()
  phone?: string;

  // ETAPA 2: Dados Profissionais
  @IsNotEmpty({ message: 'A profissão é obrigatória (ex: NUTRITIONIST ou TRAINER)' })
  @IsString()
  profession!: string;

  @IsOptional()
  @IsString()
  specialty?: string;

  @IsOptional()
  @IsString()
  registryType?: string; // CRN, CREF

  @IsOptional()
  @IsString()
  registryNumber?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  experienceYears?: number;

  @IsOptional()
  @IsString()
  bio?: string;

  // ETAPA 3: Documentos
  @IsOptional()
  @IsArray()
  documents?: ProfessionalDocumentDto[];
}
