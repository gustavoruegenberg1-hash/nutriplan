import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { IProfessionalRepository } from '../ports/professional-repository.port';
import { ProfessionalEntity } from '../../domain/entities/professional.entity';

@Injectable()
export class GetProfessionalUseCase {
  constructor(
    @Inject('PROFESSIONAL_REPOSITORY')
    private readonly repository: IProfessionalRepository
  ) {}

  async execute(id: string): Promise<ProfessionalEntity> {
    const professional = await this.repository.findProfessionalById(id);
    if (!professional) {
      throw new NotFoundException(`Profissional com ID ${id} não foi encontrado.`);
    }
    return professional;
  }
}
