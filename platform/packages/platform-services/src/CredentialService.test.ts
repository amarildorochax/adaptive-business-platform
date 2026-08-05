import { describe, expect, it } from 'vitest';
import { CredentialService } from './CredentialService';
import { FakeCredentialRepository } from './testing/InMemoryFakes';

describe('CredentialService', () => {
  it('matches confirma a Credential mais recente do mesmo tipo', async () => {
    const service = new CredentialService(new FakeCredentialRepository());
    await service.register('identity-1', 'Password', 'hash-antigo');
    await service.register('identity-1', 'Password', 'hash-atual');

    expect(await service.matches('identity-1', 'Password', 'hash-atual')).toBe(true);
    expect(await service.matches('identity-1', 'Password', 'hash-antigo')).toBe(false);
  });

  it('matches nunca confunde Credential de tipos diferentes (Password vs Passkey)', async () => {
    const service = new CredentialService(new FakeCredentialRepository());
    await service.register('identity-1', 'Passkey', 'chave-publica');

    expect(await service.matches('identity-1', 'Password', 'chave-publica')).toBe(false);
  });

  it('matches nunca confunde Identity diferentes', async () => {
    const service = new CredentialService(new FakeCredentialRepository());
    await service.register('identity-1', 'Password', 'segredo-compartilhado');

    expect(await service.matches('identity-2', 'Password', 'segredo-compartilhado')).toBe(false);
  });
});
