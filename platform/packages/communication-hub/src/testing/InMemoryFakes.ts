import type { Attachment } from '../Attachment';
import type { AttachmentRepository } from '../AttachmentRepository';
import type { Conversation } from '../Conversation';
import type { ConversationAssignment } from '../ConversationAssignment';
import type { ConversationAssignmentRepository } from '../ConversationAssignmentRepository';
import type { ConversationRepository } from '../ConversationRepository';
import type { Delivery } from '../Delivery';
import type { DeliveryRepository } from '../DeliveryRepository';
import type { Message } from '../Message';
import type { MessageRepository } from '../MessageRepository';
import type { Participant } from '../Participant';
import type { ParticipantRepository } from '../ParticipantRepository';

/**
 * Fakes em memória usados exclusivamente por teste (IMP-003, Etapa 9). Mesmo padrão já usado por
 * `@abp/crm-hub` na IMP-002 — nunca exportados pelo barrel do pacote, nunca referenciados por
 * nenhum Service em produção.
 */

export class FakeConversationRepository implements ConversationRepository {
  private readonly rows = new Map<string, Conversation>();
  async create(conversation: Conversation) {
    this.rows.set(conversation.conversationId, conversation);
    return conversation;
  }
  async update(conversation: Conversation) {
    this.rows.set(conversation.conversationId, conversation);
    return conversation;
  }
  async get(conversationId: string) {
    return this.rows.get(conversationId);
  }
  async list(tenantId: string) {
    return [...this.rows.values()].filter((c) => c.tenantId === tenantId);
  }
}

export class FakeMessageRepository implements MessageRepository {
  private readonly rows = new Map<string, Message>();
  async create(message: Message) {
    this.rows.set(message.messageId, message);
    return message;
  }
  async get(messageId: string) {
    return this.rows.get(messageId);
  }
  async listByConversation(conversationId: string) {
    return [...this.rows.values()].filter((m) => m.conversationId === conversationId);
  }
}

export class FakeAttachmentRepository implements AttachmentRepository {
  private readonly rows: Attachment[] = [];
  async create(attachment: Attachment) {
    this.rows.push(attachment);
    return attachment;
  }
  async listByMessage(messageId: string) {
    return this.rows.filter((a) => a.messageId === messageId);
  }
}

export class FakeParticipantRepository implements ParticipantRepository {
  private readonly rows: Participant[] = [];
  async create(participant: Participant) {
    this.rows.push(participant);
    return participant;
  }
  async listByConversation(conversationId: string) {
    return this.rows.filter((p) => p.conversationId === conversationId);
  }
}

export class FakeConversationAssignmentRepository implements ConversationAssignmentRepository {
  private readonly rows: ConversationAssignment[] = [];
  async create(assignment: ConversationAssignment) {
    this.rows.push(assignment);
    return assignment;
  }
  async getCurrent(conversationId: string) {
    const forConversation = this.rows.filter((a) => a.conversationId === conversationId);
    return forConversation.sort((a, b) => b.assignedAt.getTime() - a.assignedAt.getTime())[0];
  }
  async listByConversation(conversationId: string) {
    return this.rows.filter((a) => a.conversationId === conversationId);
  }
}

export class FakeDeliveryRepository implements DeliveryRepository {
  private readonly rows: Delivery[] = [];
  async create(delivery: Delivery) {
    this.rows.push(delivery);
    return delivery;
  }
  async listByMessage(messageId: string) {
    return this.rows.filter((d) => d.messageId === messageId);
  }
}
