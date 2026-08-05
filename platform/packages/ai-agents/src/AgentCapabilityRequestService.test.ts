import { describe, expect, it } from 'vitest';
import { AgentCapabilityRequestService } from './AgentCapabilityRequestService';
import { FakeAgentCapabilityRequestRepository } from './testing/InMemoryFakes';

describe('AgentCapabilityRequestService', () => {
  it('register cria uma Agent Capability Request com requesterKind e purposeDescription opacos', async () => {
    const service = new AgentCapabilityRequestService(new FakeAgentCapabilityRequestRepository());

    const request = await service.register('BusinessHub', 'classificar prioridade de Lead');

    expect(request.requesterKind).toBe('BusinessHub');
    expect(request.purposeDescription).toBe('classificar prioridade de Lead');
  });

  it('find recupera uma Agent Capability Request já registrada', async () => {
    const service = new AgentCapabilityRequestService(new FakeAgentCapabilityRequestRepository());
    const request = await service.register('Runtime', 'resumir Conversation');

    const found = await service.find(request.agentCapabilityRequestId);

    expect(found?.agentCapabilityRequestId).toBe(request.agentCapabilityRequestId);
  });
});
