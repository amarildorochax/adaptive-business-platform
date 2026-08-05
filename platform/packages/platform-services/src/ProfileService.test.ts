import { describe, expect, it } from 'vitest';
import { ProfileService } from './ProfileService';
import { FakeProfileRepository } from './testing/InMemoryFakes';

describe('ProfileService — um Perfil por Workspace, nunca compartilhado entre Workspaces', () => {
  it('assignRole cria um novo Perfil na primeira chamada', async () => {
    const service = new ProfileService(new FakeProfileRepository());

    const profile = await service.assignRole('identity-1', 'tenant-1', 'Operador');

    expect(profile.role).toBe('Operador');
  });

  it('assignRole atualiza o Papel de um Perfil já existente — "Troca de função", nunca duplica o Perfil', async () => {
    const service = new ProfileService(new FakeProfileRepository());
    const created = await service.assignRole('identity-1', 'tenant-1', 'Operador');

    const promoted = await service.assignRole('identity-1', 'tenant-1', 'Gerente');

    expect(promoted.profileId).toBe(created.profileId);
    expect(promoted.role).toBe('Gerente');
  });

  it('o mesmo Identity tem Perfis independentes em Tenants diferentes', async () => {
    const service = new ProfileService(new FakeProfileRepository());
    await service.assignRole('identity-1', 'tenant-1', 'Owner');
    await service.assignRole('identity-1', 'tenant-2', 'Convidado');

    const profiles = await service.listByIdentity('identity-1');

    expect(profiles).toHaveLength(2);
    expect(profiles.find((p) => p.tenantId === 'tenant-1')?.role).toBe('Owner');
    expect(profiles.find((p) => p.tenantId === 'tenant-2')?.role).toBe('Convidado');
  });
});
