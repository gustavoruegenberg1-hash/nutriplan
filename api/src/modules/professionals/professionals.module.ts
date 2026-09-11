import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { ProfessionalsController } from './presentation/controllers/professionals.controller';
import { ListProfessionalsUseCase } from './application/use-cases/list-professionals.use-case';
import { GetProfessionalUseCase } from './application/use-cases/get-professional.use-case';
import { GetOrCreateConversationUseCase } from './application/use-cases/get-or-create-conversation.use-case';
import { ListConversationsUseCase } from './application/use-cases/list-conversations.use-case';
import { GetMessagesUseCase } from './application/use-cases/get-messages.use-case';
import { SendMessageUseCase } from './application/use-cases/send-message.use-case';
import { ShareProfileUseCase } from './application/use-cases/share-profile.use-case';
import { MarkReadUseCase } from './application/use-cases/mark-read.use-case';
import { FirestoreProfessionalRepository } from './infrastructure/repositories/firestore-professional.repository';

@Module({
  imports: [AuthModule],
  controllers: [ProfessionalsController],
  providers: [
    ListProfessionalsUseCase,
    GetProfessionalUseCase,
    GetOrCreateConversationUseCase,
    ListConversationsUseCase,
    GetMessagesUseCase,
    SendMessageUseCase,
    ShareProfileUseCase,
    MarkReadUseCase,
    {
      provide: 'PROFESSIONAL_REPOSITORY',
      useClass: FirestoreProfessionalRepository,
    },
  ],
  exports: [
    'PROFESSIONAL_REPOSITORY',
    ListProfessionalsUseCase,
    GetProfessionalUseCase,
  ],
})
export class ProfessionalsModule {}
