import { describe, expect, it } from 'vitest';
import { AIGateway } from './AIGateway';
import { AIManager } from './AIManager';
import { KnowledgeConnectorService } from './KnowledgeConnectorService';
import { MemoryEntryService } from './MemoryEntryService';
import { PromptComposerService } from './PromptComposerService';
import { PromptExecutionService } from './PromptExecutionService';
import { PromptTemplateService } from './PromptTemplateService';
import { ProviderFactory } from './ProviderFactory';
import { ProviderRouter } from './ProviderRouter';
import {
  FakeKnowledgeAssetQuery,
  FakeMemoryEntryRepository,
  FakePromptExecutionRepository,
  FakePromptTemplateRepository,
  FakePromptVersionRepository,
} from './testing/InMemoryFakes';

function buildManager() {
  return new AIManager({
    gateway: new AIGateway(new ProviderRouter(new ProviderFactory())),
    promptTemplates: new PromptTemplateService(new FakePromptTemplateRepository(), new FakePromptVersionRepository()),
    promptExecutions: new PromptExecutionService(new FakePromptExecutionRepository()),
    promptComposer: new PromptComposerService(),
    memory: new MemoryEntryService(new FakeMemoryEntryRepository()),
    knowledge: new KnowledgeConnectorService(new FakeKnowledgeAssetQuery()),
  });
}

describe('AIManager — AI Core', () => {
  it('requestCompletion, sem nenhum recurso adicional, compõe apenas a camada User e retorna uma AIResponse do MockAIProvider', async () => {
    const manager = buildManager();

    const operation = await manager.requestCompletion({ tenantId: 'tenant-1', userPrompt: 'Escreva uma saudação.' });

    expect(operation.result.response.providerId).toBe('mock');
    expect(operation.result.execution.layersUsed).toEqual(['User']);
    expect('command' in operation).toBe(false);
    expect('events' in operation).toBe(false);
  });

  it('requestCompletion com promptTemplateId falha quando o Template não existe', async () => {
    const manager = buildManager();

    await expect(
      manager.requestCompletion({ tenantId: 'tenant-1', userPrompt: 'Teste', promptTemplateId: 'template-inexistente' }),
    ).rejects.toThrow();
  });

  it('requestCompletion resolve o System Prompt a partir de um Prompt Template já criado', async () => {
    const manager = buildManager();
    const { result: template } = await manager.createPromptTemplate('tenant-1', 'Boas-vindas', 'Você é a IA da {{businessName}}.');

    const operation = await manager.requestCompletion({
      tenantId: 'tenant-1',
      userPrompt: 'Cumprimente o cliente.',
      promptTemplateId: template.promptTemplateId,
      variables: { businessName: 'Andreia Rocha Floral' },
    });

    expect(operation.result.execution.layersUsed).toEqual(['System', 'User']);
    expect(operation.result.execution.composedPrompt).toContain('Andreia Rocha Floral');
  });

  it('requestCompletion recupera Memory Entry e prepende ao User Prompt, mesmo padrão já validado pelo ContextBuilder legado', async () => {
    const manager = buildManager();
    await manager.remember({
      tenantId: 'tenant-1',
      type: 'LongDuration',
      scope: 'Organizacional',
      ownership: 'Empresa',
      title: 'Segmento',
      content: 'Floricultura, sazonalidade relevante.',
      tags: ['segmento'],
    });

    const operation = await manager.requestCompletion({
      tenantId: 'tenant-1',
      userPrompt: 'Sugira uma campanha.',
      recallMemoryOwnership: 'Empresa',
    });

    expect(operation.result.execution.composedPrompt).toContain('Floricultura');
  });

  it('requestCompletion nunca vaza Memory Entry de outro Tenant', async () => {
    const manager = buildManager();
    await manager.remember({ tenantId: 'tenant-2', type: 'LongDuration', scope: 'Organizacional', ownership: 'Empresa', title: 'Segmento', content: 'Pet Shop', tags: ['segmento'] });

    const operation = await manager.requestCompletion({
      tenantId: 'tenant-1',
      userPrompt: 'Sugira uma campanha.',
      recallMemoryOwnership: 'Empresa',
    });

    expect(operation.result.execution.composedPrompt).not.toContain('Pet Shop');
  });

  it('createPromptTemplate e updatePromptTemplate nunca carregam command nem events — nenhum catálogo aprovado existe para este Hub', async () => {
    const manager = buildManager();

    const created = await manager.createPromptTemplate('tenant-1', 'Template', 'Conteúdo v1.');
    const updated = await manager.updatePromptTemplate(created.result.promptTemplateId, 'Conteúdo v2.');

    expect('command' in created).toBe(false);
    expect('events' in created).toBe(false);
    expect(updated.result.version).toBe(2);
  });
});
