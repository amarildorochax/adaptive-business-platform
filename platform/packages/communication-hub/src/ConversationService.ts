import type { Conversation, ConversationStatus } from './Conversation';
import type { ConversationRepository } from './ConversationRepository';

/** Campos aceitos por `ConversationService.create()`. */
export type CreateConversationInput = Pick<Conversation, 'tenantId'>;

/**
 * ConversationService — regra de negócio do Aggregate raiz do domínio de comunicação. Nenhuma
 * implementação equivalente existe em `src/core` ou `src/app` (IMP-003, Etapa 1 — inexistente em
 * ambas as árvores); construído diretamente sobre o contrato já existente em `Conversation.ts`,
 * seguindo a mesma disciplina de responsabilidade única já aplicada a `@abp/crm-hub` na IMP-002:
 * nenhuma emissão de Evento aqui, responsabilidade exclusiva do CommunicationManager.
 *
 * Nunca associa a Conversation a um Channel específico — per a regra `ConversationSpansMultipleChannels`
 * (já catalogada em `CommBusinessRule.ts`), o Channel é propriedade de cada Message individual, não
 * da Conversation como um todo.
 */
export class ConversationService {
  constructor(private readonly repository: ConversationRepository) {}

  async create(input: CreateConversationInput): Promise<Conversation> {
    const conversation: Conversation = {
      conversationId: crypto.randomUUID(),
      status: 'Open',
      createdAt: new Date(),
      ...input,
    };

    return this.repository.create(conversation);
  }

  /** Aplica a regra `ConversationHasExactlyOneStatus` — nunca dois status simultâneos, sempre substituição integral. */
  async updateStatus(conversationId: string, status: ConversationStatus): Promise<Conversation> {
    const existing = await this.repository.get(conversationId);

    if (!existing) {
      throw new Error(`Conversation ${conversationId} não encontrada.`);
    }

    return this.repository.update({ ...existing, status });
  }

  async get(conversationId: string): Promise<Conversation | undefined> {
    return this.repository.get(conversationId);
  }

  async list(tenantId: string): Promise<readonly Conversation[]> {
    return this.repository.list(tenantId);
  }
}
