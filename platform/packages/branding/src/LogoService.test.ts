import { describe, expect, it } from 'vitest';
import { LogoService } from './LogoService';
import { FakeLogoRepository } from './testing/InMemoryFakes';

describe('LogoService — Logo Manager ("administra o ativo de logo enviado por uma empresa")', () => {
  it('submit registra um novo Logo imutável para o tenant', async () => {
    const service = new LogoService(new FakeLogoRepository());

    const logo = await service.submit('tenant-1', 'assets/logo-v1.svg');

    expect(logo.tenantId).toBe('tenant-1');
    expect(logo.assetReference).toBe('assets/logo-v1.svg');
  });

  it('current retorna o último Logo em ordem de inserção, nunca por timestamp', async () => {
    const service = new LogoService(new FakeLogoRepository());
    await service.submit('tenant-1', 'assets/logo-v1.svg');
    await service.submit('tenant-1', 'assets/logo-v2.svg');

    const current = await service.current('tenant-1');

    expect(current?.assetReference).toBe('assets/logo-v2.svg');
  });

  it('current retorna undefined quando nenhum Logo foi enviado', async () => {
    const service = new LogoService(new FakeLogoRepository());

    const current = await service.current('tenant-sem-logo');

    expect(current).toBeUndefined();
  });
});
