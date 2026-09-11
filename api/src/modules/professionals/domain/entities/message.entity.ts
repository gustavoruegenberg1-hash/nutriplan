export type MessageSenderType = 'USER' | 'PROFESSIONAL';

export class MessageEntity {
  id: string;
  conversationId: string;
  senderId: string;
  senderType: MessageSenderType;
  content: string;
  createdAt: Date;
  readAt?: Date | null;

  constructor(props: Partial<MessageEntity>) {
    Object.assign(this, props);
    this.createdAt = props?.createdAt ? new Date(props.createdAt) : new Date();
    this.readAt = props?.readAt ? new Date(props.readAt) : null;
  }
}
