import { describe, expect, it } from 'vitest';
import { BusinessProfileLifecycleService } from './BusinessProfileLifecycleService';
import { FakeBusinessProfileLifecycleStateRepository } from './testing/InMemoryFakes';

describe('BusinessProfileLifecycleService — "Cadastro → Perguntas Iniciais → Classificação → Validação → Perfil Inicial"', () => {
  it('percorre a sequência completa de cinco estágios curto-prazo', async () => {
    const service = new BusinessProfileLifecycleService(new FakeBusinessProfileLifecycleStateRepository());
    await service.start('profile-1');

    await service.advance('profile-1', 'Perguntas Iniciais');
    await service.advance('profile-1', 'Classificação');
    await service.advance('profile-1', 'Validação');
    const final = await service.advance('profile-1', 'Perfil Inicial');

    expect(final.stage).toBe('Perfil Inicial');
  });

  it('nunca permite pular um estágio — Cadastro direto para Validação falha', async () => {
    const service = new BusinessProfileLifecycleService(new FakeBusinessProfileLifecycleStateRepository());
    await service.start('profile-1');

    await expect(service.advance('profile-1', 'Validação')).rejects.toThrow();
  });

  it('"Perfil Inicial" é terminal no escopo curto-prazo — nenhuma transição parte dele', async () => {
    const service = new BusinessProfileLifecycleService(new FakeBusinessProfileLifecycleStateRepository());
    await service.start('profile-1');
    await service.advance('profile-1', 'Perguntas Iniciais');
    await service.advance('profile-1', 'Classificação');
    await service.advance('profile-1', 'Validação');
    await service.advance('profile-1', 'Perfil Inicial');

    await expect(service.advance('profile-1', 'Cadastro')).rejects.toThrow();
  });
});
