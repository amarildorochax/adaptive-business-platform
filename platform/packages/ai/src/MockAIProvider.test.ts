import { describe, expect, it } from 'vitest';
import { MockAIProvider } from './MockAIProvider';

describe('MockAIProvider', () => {
  it('gera conteúdo determinístico sem nenhuma chamada de rede', async () => {
    const provider = new MockAIProvider();

    const response = await provider.generate({ tenantId: 'tenant-1', prompt: 'Escreva sobre floriculturas.' });

    expect(response.success).toBe(true);
    expect(response.providerId).toBe('mock');
    expect(response.content).toContain('Escreva sobre floriculturas.');
    expect(response.tokenUsage?.totalTokens).toBeGreaterThan(0);
  });

  it('declara capacidades sem streaming nem function calling', () => {
    const provider = new MockAIProvider();

    const capabilities = provider.getCapabilities();

    expect(capabilities.streaming).toBe(false);
    expect(capabilities.functionCalling).toBe(false);
    expect(capabilities.models).toHaveLength(1);
  });
});
