import { describe, expect, it } from 'vitest';
import { KnowledgeLifecycleService } from './KnowledgeLifecycleService';
import { FakeKnowledgeLifecycleStateRepository } from './testing/InMemoryFakes';

describe('KnowledgeLifecycleService — "Criação → Revisão → Aprovação → Publicação → Indexação → Uso → Atualização → Arquivamento → Recuperação"', () => {
  it('percorre a sequência completa de nove estágios', async () => {
    const service = new KnowledgeLifecycleService(new FakeKnowledgeLifecycleStateRepository());
    await service.start('asset-1');

    await service.advance('asset-1', 'Revisão');
    await service.advance('asset-1', 'Aprovação');
    await service.advance('asset-1', 'Publicação');
    await service.advance('asset-1', 'Indexação');
    await service.advance('asset-1', 'Uso');
    await service.advance('asset-1', 'Atualização');
    await service.advance('asset-1', 'Arquivamento');
    const recovered = await service.advance('asset-1', 'Recuperação');

    expect(recovered.stage).toBe('Recuperação');
  });

  it('permite o ciclo explícito de Atualização de volta a Revisão, sem limite de repetições', async () => {
    const service = new KnowledgeLifecycleService(new FakeKnowledgeLifecycleStateRepository());
    await service.start('asset-1');
    await service.advance('asset-1', 'Revisão');
    await service.advance('asset-1', 'Aprovação');
    await service.advance('asset-1', 'Publicação');
    await service.advance('asset-1', 'Indexação');
    await service.advance('asset-1', 'Uso');
    await service.advance('asset-1', 'Atualização');

    const backToReview = await service.advance('asset-1', 'Revisão');

    expect(backToReview.stage).toBe('Revisão');
  });

  it('nunca permite pular um estágio — Criação direto para Publicação falha', async () => {
    const service = new KnowledgeLifecycleService(new FakeKnowledgeLifecycleStateRepository());
    await service.start('asset-1');

    await expect(service.advance('asset-1', 'Publicação')).rejects.toThrow();
  });

  it('Recuperação nunca acontece automaticamente — exige transição explícita a partir de Arquivamento', async () => {
    const service = new KnowledgeLifecycleService(new FakeKnowledgeLifecycleStateRepository());
    await service.start('asset-1');

    await expect(service.advance('asset-1', 'Recuperação')).rejects.toThrow();
  });
});
