import { describe, expect, it } from 'vitest';
import { MessageService } from './MessageService';
import { FakeMessageRepository } from './testing/InMemoryFakes';

describe('MessageService', () => {
  it('cria uma Message sempre associada a uma Conversation — MessageBelongsToConversation', async () => {
    const service = new MessageService(new FakeMessageRepository());

    const message = await service.create(
      { tenantId: 'tenant-1', threadId: undefined, channelId: 'channel-1', senderId: 'user-1', content: 'Olá!' },
      'conversation-1',
    );

    expect(message.conversationId).toBe('conversation-1');
    expect(message.content).toBe('Olá!');
  });

  it('listByConversation retorna apenas Message da Conversation solicitada', async () => {
    const service = new MessageService(new FakeMessageRepository());
    await service.create(
      { tenantId: 'tenant-1', threadId: undefined, channelId: 'channel-1', senderId: 'user-1', content: 'Msg A' },
      'conversation-1',
    );
    await service.create(
      { tenantId: 'tenant-1', threadId: undefined, channelId: 'channel-1', senderId: 'user-1', content: 'Msg B' },
      'conversation-2',
    );

    const messages = await service.listByConversation('conversation-1');
    expect(messages).toHaveLength(1);
    expect(messages[0]?.content).toBe('Msg A');
  });
});
