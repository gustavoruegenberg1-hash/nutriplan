export type ProfessionalType = 'NUTRITIONIST' | 'TRAINER';
export type ProfessionalStatus = 'ACTIVE' | 'INACTIVE' | 'UNAVAILABLE';

export interface Professional {
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
  userId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface SharedProfileContext {
  goal?: string;
  weight?: number;
  height?: number;
  dietaryRestrictions?: string[];
  trainingExperience?: string;
  sharedAt?: string;
}

export interface Conversation {
  id: string;
  userId: string;
  userName?: string;
  professionalId: string;
  professionalName?: string;
  professionalAvatar?: string;
  professionalType?: ProfessionalType;
  professionalSpecialty?: string;
  professionalStatus?: ProfessionalStatus;
  lastMessageText?: string;
  lastMessageAt?: string;
  unreadCount: number;
  sharedProfile?: SharedProfileContext;
  createdAt: string;
  updatedAt: string;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderType: 'USER' | 'PROFESSIONAL';
  content: string;
  createdAt: string;
  readAt?: string | null;
}

export interface ProfessionalFilterOptions {
  type?: 'ALL' | ProfessionalType;
  search?: string;
  status?: string;
}
