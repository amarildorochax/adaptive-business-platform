import { describe, expect, it } from 'vitest';
import { AIGateway } from './AIGateway';
import { ProviderFactory } from './ProviderFactory';
import { ProviderRouter } from './ProviderRouter';

function buildGateway() {
  return new AIGateway(new ProviderRouter(new ProviderFactory()));
}

describe('AIGateway → ProviderRouter → ProviderFactory → Provider', () => {
  it('rejeita uma AIRequest com prompt vazio, nunca alcança nenhum Provider', async () => {
    const gateway = buildGateway();

    await expect(gateway.generate({ tenantId: 'tenant-1', prompt: '' })).rejects.toThrow();
  });

  it('rejeita uma AIRequest sem tenantId — isolamento absoluto entre Empresas (ADR-008)', async () => {
    const gateway = buildGateway();

    await expect(gateway.generate({ tenantId: '', prompt: 'Olá' })).rejects.toThrow();
  });

  it('usa o MockAIProvider por padrão, quando nenhum providerId é informado', async () => {
    const gateway = buildGateway();

    const response = await gateway.generate({ tenantId: 'tenant-1', prompt: 'Olá' });

    expect(response.providerId).toBe('mock');
  });

  it('roteia para o Provider explicitamente solicitado', async () => {
    const gateway = buildGateway();

    const response = await gateway.generate({ tenantId: 'tenant-1', prompt: 'Olá', providerId: 'claude' });

    expect(response.providerId).toBe('claude');
  });

  it('rejeita um providerId não registrado — nunca cai silenciosamente para Mock nesse caso', async () => {
    const gateway = buildGateway();

    await expect(gateway.generate({ tenantId: 'tenant-1', prompt: 'Olá', providerId: 'llama-inexistente' })).rejects.toThrow();
  });
});
