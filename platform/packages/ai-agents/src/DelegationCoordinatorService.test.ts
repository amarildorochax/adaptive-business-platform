import { describe, expect, it } from 'vitest';
import { DelegationCoordinatorService } from './DelegationCoordinatorService';
import { FakeAgentDelegationRecordRepository } from './testing/InMemoryFakes';

describe('DelegationCoordinatorService — "Requested → Delegated → InProgress → Completed | Failed"', () => {
  it('create registra a delegação em Requested, propagando o Correlation ID quando fornecido', async () => {
    const service = new DelegationCoordinatorService(new FakeAgentDelegationRecordRepository());

    const record = await service.create('request-1', 'corr-1');

    expect(record.status).toBe('Requested');
    expect(record.correlationId).toBe('corr-1');
  });

  it('percorre a sequência completa: Requested → Delegated → InProgress → Completed', async () => {
    const service = new DelegationCoordinatorService(new FakeAgentDelegationRecordRepository());
    const record = await service.create('request-1');

    await service.advance(record.agentDelegationRecordId, 'Delegated');
    await service.advance(record.agentDelegationRecordId, 'InProgress');
    const completed = await service.advance(record.agentDelegationRecordId, 'Completed');

    expect(completed.status).toBe('Completed');
  });

  it('nunca permite pular um estágio — Requested direto para InProgress falha', async () => {
    const service = new DelegationCoordinatorService(new FakeAgentDelegationRecordRepository());
    const record = await service.create('request-1');

    await expect(service.advance(record.agentDelegationRecordId, 'InProgress')).rejects.toThrow();
  });

  it('Completed e Failed são terminais — nenhuma transição parte deles', async () => {
    const service = new DelegationCoordinatorService(new FakeAgentDelegationRecordRepository());
    const record = await service.create('request-1');
    await service.advance(record.agentDelegationRecordId, 'Delegated');
    await service.advance(record.agentDelegationRecordId, 'Failed');

    await expect(service.advance(record.agentDelegationRecordId, 'InProgress')).rejects.toThrow();
  });
});
