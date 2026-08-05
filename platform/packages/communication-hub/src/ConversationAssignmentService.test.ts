import { describe, expect, it } from 'vitest';
import { ConversationAssignmentService } from './ConversationAssignmentService';
import { FakeConversationAssignmentRepository } from './testing/InMemoryFakes';

describe('ConversationAssignmentService', () => {
  it('getCurrent resolve sempre a atribuição mais recente, nunca duas simultâneas', async () => {
    const service = new ConversationAssignmentService(new FakeConversationAssignmentRepository());

    await service.assign('conversation-1', 'agent-a');
    await new Promise((resolve) => setTimeout(resolve, 2));
    await service.assign('conversation-1', 'agent-b');

    const current = await service.getCurrent('conversation-1');
    expect(current?.assigneeId).toBe('agent-b');
  });
});
