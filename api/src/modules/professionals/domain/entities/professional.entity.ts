export type ProfessionalType = 'NUTRITIONIST' | 'TRAINER';
export type ProfessionalStatus = 'ACTIVE' | 'INACTIVE' | 'UNAVAILABLE';

export class ProfessionalEntity {
  id: string;
  name: string;
  avatarUrl: string;
  type: ProfessionalType;
  specialty: string;
  bio: string;
  experienceYears: number;
  location: string;
  registrationNumber: string; // Ex: CRN-3 45892, CREF 089412-G/SP
  status: ProfessionalStatus;
  isVerified: boolean;
  rating: number;
  reviewCount: number;
  pricing?: string;
  services?: string[];
  userId?: string; // ID do usuário do app vinculado (para login do profissional)
  createdAt: Date;
  updatedAt: Date;

  constructor(props: Partial<ProfessionalEntity>) {
    Object.assign(this, props);
    this.status = props?.status ?? 'ACTIVE';
    this.isVerified = props?.isVerified ?? true;
    this.rating = props?.rating ?? 5.0;
    this.reviewCount = props?.reviewCount ?? 0;
    this.createdAt = props?.createdAt ? new Date(props.createdAt) : new Date();
    this.updatedAt = props?.updatedAt ? new Date(props.updatedAt) : new Date();
  }

  isAvailableForNewConversations(): boolean {
    return this.status === 'ACTIVE';
  }
}
