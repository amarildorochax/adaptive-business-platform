import { describe, expect, it } from 'vitest';
import { ConversationService } from './ConversationService';
import { FakeConversationRepository } from './testing/InMemoryFakes';

describe('ConversationService', () => {
  it('cria uma Conversation com status Open', async () => {
    const service = new ConversationService(new FakeConversationRepository());
    const conversation = await service.create({ tenantId: 'tenant-1' });

    expect(conversation.status).toBe('Open');
  });

  it('aplica ConversationHasExactlyOneStatus — updateStatus substitui integralmente o status anterior', async () => {
    const service = new ConversationService(new FakeConversationRepository());
    const created = await service.create({ tenantId: 'tenant-1' });

    const updated = await service.updateStatus(created.conversationId, 'InProgress');
    expect(updated.status).toBe('InProgress');

    const closed = await service.updateStatus(created.conversationId, 'Closed');
    expect(closed.status).toBe('Closed');
  });

  it('lança erro ao atualizar status de Conversation inexistente', async () => {
    const service = new ConversationService(new FakeConversationRepository());
    await expect(service.updateStatus('inexistente', 'Closed')).rejects.toThrow();
  });
});
