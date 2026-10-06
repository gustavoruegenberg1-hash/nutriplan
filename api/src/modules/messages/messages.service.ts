import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { randomUUID } from 'node:crypto';

export interface MessageItem {
  id: string;
  senderId: string;
  receiverId: string;
  senderName: string;
  content: string;
  isRead: boolean;
  createdAt: string;
}

@Injectable()
export class MessagesService {
  constructor(private readonly db: DatabaseService) {}

  async sendMessage(senderId: string, receiverId: string, content: string): Promise<MessageItem> {
    if (!content || !content.trim()) {
      throw new BadRequestException('A mensagem não pode estar vazia.');
    }

    const receiver = this.db.queryOne<{ id: string; name: string }>(
      'SELECT id, name FROM users WHERE id = ?',
      [receiverId]
    );

    if (!receiver) {
      throw new NotFoundException('Destinatário não encontrado.');
    }

    const sender = this.db.queryOne<{ id: string; name: string }>(
      'SELECT id, name FROM users WHERE id = ?',
      [senderId]
    );

    const id = randomUUID();
    const now = new Date().toISOString();

    this.db.run(
      `INSERT INTO messages (id, sender_id, receiver_id, content, is_read, created_at)
       VALUES (?, ?, ?, ?, 0, ?)`,
      [id, senderId, receiverId, content.trim(), now]
    );

    return {
      id,
      senderId,
      receiverId,
      senderName: sender?.name || 'Eu',
      content: content.trim(),
      isRead: false,
      createdAt: now,
    };
  }

  async getConversation(userId: string, contactId: string): Promise<MessageItem[]> {
    // Marca mensagens recebidas como lidas
    this.db.run(
      `UPDATE messages SET is_read = 1 WHERE sender_id = ? AND receiver_id = ? AND is_read = 0`,
      [contactId, userId]
    );

    const rows = this.db.query<any>(
      `SELECT m.id, m.sender_id as senderId, m.receiver_id as receiverId,
              u.name as senderName, m.content, m.is_read as isRead, m.created_at as createdAt
       FROM messages m
       JOIN users u ON u.id = m.sender_id
       WHERE (m.sender_id = ? AND m.receiver_id = ?)
          OR (m.sender_id = ? AND m.receiver_id = ?)
       ORDER BY m.created_at ASC`,
      [userId, contactId, contactId, userId]
    );

    return rows.map((r) => ({
      ...r,
      isRead: Boolean(r.isRead),
    }));
  }

  async listConversations(userId: string) {
    // Busca os contatos com quem o usuário trocou mensagens
    const contacts = this.db.query<any>(
      `SELECT DISTINCT
         CASE WHEN m.sender_id = ? THEN m.receiver_id ELSE m.sender_id END as contactId
       FROM messages m
       WHERE m.sender_id = ? OR m.receiver_id = ?`,
      [userId, userId, userId]
    );

    const results: any[] = [];
    for (const c of contacts) {
      const contactUser = this.db.queryOne<any>(
        `SELECT u.id, u.name, u.email, u.role,
                p.profession, p.specialty
         FROM users u
         LEFT JOIN professional_profiles p ON p.user_id = u.id
         WHERE u.id = ?`,
        [c.contactId]
      );

      if (!contactUser) continue;

      const lastMessage = this.db.queryOne<any>(
        `SELECT content, created_at as createdAt, sender_id as lastSenderId
         FROM messages
         WHERE (sender_id = ? AND receiver_id = ?) OR (sender_id = ? AND receiver_id = ?)
         ORDER BY created_at DESC LIMIT 1`,
        [userId, c.contactId, c.contactId, userId]
      );

      const unreadCount = this.db.queryOne<{ count: number }>(
        `SELECT COUNT(*) as count FROM messages
         WHERE sender_id = ? AND receiver_id = ? AND is_read = 0`,
        [c.contactId, userId]
      );

      results.push({
        contactId: contactUser.id,
        name: contactUser.name,
        email: contactUser.email,
        role: contactUser.role,
        profession: contactUser.profession || null,
        specialty: contactUser.specialty || null,
        lastMessage: lastMessage?.content || '',
        lastMessageAt: lastMessage?.createdAt || '',
        unreadCount: unreadCount ? unreadCount.count : 0,
      });
    }

    return results;
  }
}
