import { describe, expect, it } from 'vitest';
import { ClaudeProvider } from './ClaudeProvider';
import { GeminiProvider } from './GeminiProvider';
import { OpenAIProvider } from './OpenAIProvider';

describe('OpenAIProvider/ClaudeProvider/GeminiProvider — todos delegam a MockAIProvider, nenhuma chamada de rede', () => {
  it('OpenAIProvider identifica a resposta como "openai", nunca "mock"', async () => {
    const provider = new OpenAIProvider();

    const response = await provider.generate({ tenantId: 'tenant-1', prompt: 'Teste' });

    expect(response.providerId).toBe('openai');
    expect(response.success).toBe(true);
  });

  it('ClaudeProvider identifica a resposta como "claude"', async () => {
    const provider = new ClaudeProvider();

    const response = await provider.generate({ tenantId: 'tenant-1', prompt: 'Teste' });

    expect(response.providerId).toBe('claude');
  });

  it('GeminiProvider identifica a resposta como "gemini"', async () => {
    const provider = new GeminiProvider();

    const response = await provider.generate({ tenantId: 'tenant-1', prompt: 'Teste' });

    expect(response.providerId).toBe('gemini');
  });
});
