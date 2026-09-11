import { Injectable, Inject } from '@nestjs/common';
import { IProfessionalRepository, ProfessionalFilterOptions } from '../ports/professional-repository.port';
import { ProfessionalEntity } from '../../domain/entities/professional.entity';

@Injectable()
export class ListProfessionalsUseCase {
  constructor(
    @Inject('PROFESSIONAL_REPOSITORY')
    private readonly repository: IProfessionalRepository
  ) {}

  async execute(filters?: ProfessionalFilterOptions): Promise<ProfessionalEntity[]> {
    return this.repository.findAllProfessionals(filters);
  }
}
