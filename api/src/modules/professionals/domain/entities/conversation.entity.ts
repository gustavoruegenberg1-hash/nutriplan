export interface SharedProfileContext {
  goal?: string;
  weight?: number;
  height?: number;
  dietaryRestrictions?: string[];
  trainingExperience?: string;
  sharedAt: Date;
}

export class ConversationEntity {
  id: string;
  userId: string;
  professionalId: string;
  lastMessageText?: string;
  lastMessageAt?: Date;
  userUnreadCount: number;
  professionalUnreadCount: number;
  sharedProfile?: SharedProfileContext;
  createdAt: Date;
  updatedAt: Date;

  constructor(props: Partial<ConversationEntity>) {
    Object.assign(this, props);
    this.userUnreadCount = props?.userUnreadCount ?? 0;
    this.professionalUnreadCount = props?.professionalUnreadCount ?? 0;
    this.createdAt = props?.createdAt ? new Date(props.createdAt) : new Date();
    this.updatedAt = props?.updatedAt ? new Date(props.updatedAt) : new Date();
    if (props?.lastMessageAt) {
      this.lastMessageAt = new Date(props.lastMessageAt);
    }
  }
}
