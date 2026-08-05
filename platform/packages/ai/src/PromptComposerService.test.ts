import { describe, expect, it } from 'vitest';
import { PromptComposerService } from './PromptComposerService';

describe('PromptComposerService — quatro camadas já Frozen (System/Business/Brand/User)', () => {
  it('inclui apenas as camadas com conteúdo — User é sempre obrigatória', () => {
    const composer = new PromptComposerService();

    const result = composer.compose({ userPrompt: 'Resuma este documento.' });

    expect(result.layersUsed).toEqual(['User']);
    expect(result.composedPrompt).toBe('Resuma este documento.');
  });

  it('combina as quatro camadas na ordem de prioridade System → Business → Brand → User', () => {
    const composer = new PromptComposerService();

    const result = composer.compose({
      systemContent: 'Você é a IA da Adaptive Business Platform.',
      businessContext: 'Segmento: Floricultura.',
      brandContext: 'Tom de voz: acolhedor.',
      userPrompt: 'Escreva uma mensagem de boas-vindas.',
    });

    expect(result.layersUsed).toEqual(['System', 'Business', 'Brand', 'User']);
    expect(result.composedPrompt.indexOf('Adaptive Business Platform')).toBeLessThan(result.composedPrompt.indexOf('Floricultura'));
    expect(result.composedPrompt.indexOf('Floricultura')).toBeLessThan(result.composedPrompt.indexOf('acolhedor'));
  });

  it('substitui {{key}} por value — chave sem valor correspondente permanece literal', () => {
    const composer = new PromptComposerService();

    const result = composer.compose({
      userPrompt: 'Olá {{businessName}}, bem-vindo a {{unknownKey}}.',
      variables: { businessName: 'Andreia Rocha Floral' },
    });

    expect(result.composedPrompt).toBe('Olá Andreia Rocha Floral, bem-vindo a {{unknownKey}}.');
  });
});
