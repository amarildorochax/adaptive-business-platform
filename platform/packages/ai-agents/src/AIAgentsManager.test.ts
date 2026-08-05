import { describe, expect, it } from 'vitest';
import { AgentCapabilityRequestService } from './AgentCapabilityRequestService';
import { AIAgentsManager } from './AIAgentsManager';
import { DelegationCoordinatorService } from './DelegationCoordinatorService';
import { OversightGateService } from './OversightGateService';
import { TaskResultHandlerService } from './TaskResultHandlerService';
import {
  FakeAgentCapabilityRequestRepository,
  FakeAgentDelegationRecordRepository,
  FakeAgentTaskResultRepository,
  FakeOversightCheckpointRepository,
} from './testing/InMemoryFakes';

function buildManager() {
  const manager = new AIAgentsManager({
    capabilityRequests: new AgentCapabilityRequestService(new FakeAgentCapabilityRequestRepository()),
    delegation: new DelegationCoordinatorService(new FakeAgentDelegationRecordRepository()),
    taskResults: new TaskResultHandlerService(new FakeAgentTaskResultRepository()),
    oversight: new OversightGateService(new FakeOversightCheckpointRepository()),
  });

  return { manager };
}

describe('AIAgentsManager — "Agent Capability Request → Delegation Coordinator → AI Hub → Task Result Handler → Oversight Gate → Agent Task Result"', () => {
  it('requestCapability/delegate/completeDelegation nunca carregam command nem events — nenhum catálogo aprovado existe para este domínio', async () => {
    const { manager } = buildManager();

    const requested = await manager.requestCapability('BusinessHub', 'classificar prioridade de Lead');

    expect(requested.result.request.requesterKind).toBe('BusinessHub');
    expect(requested.result.delegation.status).toBe('Requested');
    expect('command' in requested).toBe(false);
    expect('events' in requested).toBe(false);
  });

  it('fluxo completo sem exigência de confirmação: requestCapability → delegate → markInProgress → completeDelegation, resultado liberado imediatamente', async () => {
    const { manager } = buildManager();
    const requested = await manager.requestCapability('AutomationEngine', 'sumarizar Ticket');
    const delegationId = requested.result.delegation.agentDelegationRecordId;

    await manager.delegate(delegationId);
    await manager.markInProgress(delegationId);
    const completed = await manager.completeDelegation(delegationId, 'Ticket sumarizado', 0.7, false);

    expect(completed.result.delegation.status).toBe('Completed');
    expect(completed.result.checkpoint).toBeUndefined();
    const released = await manager.isReleased(completed.result.result.agentTaskResultId);
    expect(released.result).toBe(true);
  });

  it('fluxo com exigência de confirmação: resultado permanece retido até approveOversight', async () => {
    const { manager } = buildManager();
    const requested = await manager.requestCapability('BusinessHub', 'aprovar Desconto acima do limite');
    const delegationId = requested.result.delegation.agentDelegationRecordId;
    await manager.delegate(delegationId);
    await manager.markInProgress(delegationId);

    const completed = await manager.completeDelegation(delegationId, 'Desconto de 30% recomendado', 0.61, true);
    const beforeApproval = await manager.isReleased(completed.result.result.agentTaskResultId);

    expect(completed.result.checkpoint?.status).toBe('Pending');
    expect(beforeApproval.result).toBe(false);

    await manager.approveOversight(completed.result.checkpoint!.oversightCheckpointId, 'identity-1');
    const afterApproval = await manager.isReleased(completed.result.result.agentTaskResultId);

    expect(afterApproval.result).toBe(true);
  });

  it('failDelegation marca a delegação como Failed a partir de Delegated', async () => {
    const { manager } = buildManager();
    const requested = await manager.requestCapability('Runtime', 'gerar embedding');
    const delegationId = requested.result.delegation.agentDelegationRecordId;
    await manager.delegate(delegationId);

    const failed = await manager.failDelegation(delegationId);

    expect(failed.result.status).toBe('Failed');
  });

  it('nunca permite completeDelegation antes de markInProgress — Delegated não pode ir direto para Completed', async () => {
    const { manager } = buildManager();
    const requested = await manager.requestCapability('BusinessHub', 'classificar Lead');
    const delegationId = requested.result.delegation.agentDelegationRecordId;
    await manager.delegate(delegationId);

    await expect(manager.completeDelegation(delegationId, 'resultado prematuro', 0.5, false)).rejects.toThrow();
  });
});
