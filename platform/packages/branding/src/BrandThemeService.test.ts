import { describe, expect, it } from 'vitest';
import { BrandThemeService } from './BrandThemeService';
import { FakeBrandThemeRepository } from './testing/InMemoryFakes';

describe('BrandThemeService — Theme Generator (ADR-012: regeneração sempre completa, nunca incremental)', () => {
  it('generate produz a versão 1 para o primeiro Theme de um tenant', async () => {
    const service = new BrandThemeService(new FakeBrandThemeRepository());

    const theme = await service.generate('tenant-1');

    expect(theme.version).toBe(1);
  });

  it('generate incrementa a versão a cada nova geração, nunca reaproveitando a anterior', async () => {
    const service = new BrandThemeService(new FakeBrandThemeRepository());
    await service.generate('tenant-1');

    const second = await service.generate('tenant-1');

    expect(second.version).toBe(2);
  });

  it('current retorna o Theme de versão mais recente', async () => {
    const service = new BrandThemeService(new FakeBrandThemeRepository());
    await service.generate('tenant-1');
    const second = await service.generate('tenant-1');

    const current = await service.current('tenant-1');

    expect(current?.themeId).toBe(second.themeId);
  });

  it('history retorna todas as versões, em ordem', async () => {
    const service = new BrandThemeService(new FakeBrandThemeRepository());
    await service.generate('tenant-1');
    await service.generate('tenant-1');

    const history = await service.history('tenant-1');

    expect(history.map((t) => t.version)).toEqual([1, 2]);
  });
});
