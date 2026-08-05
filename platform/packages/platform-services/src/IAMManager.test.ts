import { describe, expect, it } from 'vitest';
import { AccessAuditService } from './AccessAuditService';
import { AuthenticationService } from './AuthenticationService';
import { AuthorizationService } from './AuthorizationService';
import { CredentialService } from './CredentialService';
import { IAMManager } from './IAMManager';
import { ProfileService } from './ProfileService';
import { RolePermissionService } from './RolePermissionService';
import { SecurityContextService } from './SecurityContextService';
import { SessionService } from './SessionService';
import {
  FakeAccessAuditRecordRepository,
  FakeAccessTokenRepository,
  FakeCredentialRepository,
  FakeProfileRepository,
  FakeRolePermissionRepository,
  FakeSessionRepository,
} from './testing/InMemoryFakes';

function buildManager() {
  const credentialService = new CredentialService(new FakeCredentialRepository());
  const profileService = new ProfileService(new FakeProfileRepository());
  const rolePermissionService = new RolePermissionService(new FakeRolePermissionRepository());
  const sessionService = new SessionService(new FakeSessionRepository(), new FakeAccessTokenRepository());
  const auditService = new AccessAuditService(new FakeAccessAuditRecordRepository());

  const manager = new IAMManager({
    credentials: credentialService,
    authentication: new AuthenticationService(credentialService),
    profiles: profileService,
    rolePermissions: rolePermissionService,
    authorization: new AuthorizationService(profileService, rolePermissionService),
    sessions: sessionService,
    securityContext: new SecurityContextService(sessionService, profileService),
    audit: auditService,
  });

  return { manager, auditService };
}

describe('IAMManager — IAM Core', () => {
  it('registerCredential/authenticate/login nunca carregam command nem events — nenhum catálogo aprovado existe para este Hub', async () => {
    const { manager } = buildManager();
    await manager.registerCredential('identity-1', 'Password', 'hash-correto');

    const operation = await manager.login('identity-1', 'tenant-1', 'Password', 'hash-correto');

    expect(operation.result.session.identity).toBe('identity-1');
    expect('command' in operation).toBe(false);
    expect('events' in operation).toBe(false);
  });

  it('authenticate falha com Credential incorreta — Authentication Before Authorization (ADR-006)', async () => {
    const { manager } = buildManager();
    await manager.registerCredential('identity-1', 'Password', 'hash-correto');

    await expect(manager.authenticate('identity-1', 'Password', 'hash-errado')).rejects.toThrow();
  });

  it('fluxo completo: registerCredential → login → assignRole → grantPermission → authorize (concedido)', async () => {
    const { manager } = buildManager();
    await manager.registerCredential('identity-1', 'Passkey', 'chave-publica-1');
    await manager.login('identity-1', 'tenant-1', 'Passkey', 'chave-publica-1');
    await manager.assignRole('identity-1', 'tenant-1', 'Financeiro');
    await manager.grantPermission('Financeiro', 'finance:approve');

    const decision = await manager.authorize('identity-1', 'tenant-1', 'finance:approve');

    expect(decision.result.permitted).toBe(true);
  });

  it('authorize sempre produz um Access Audit Record, concedido ou negado, sem exceção (ADR-007)', async () => {
    const { manager, auditService } = buildManager();

    await manager.authorize('identity-sem-perfil', 'tenant-1', 'finance:approve');

    const auditRecords = await auditService.listByIdentity('identity-sem-perfil');
    expect(auditRecords).toHaveLength(1);
    expect(auditRecords[0]?.granted).toBe(false);
  });

  it('revokeSession invalida a Session imediatamente — buildSecurityContext nunca resolve para uma Session revogada (ADR-010)', async () => {
    const { manager } = buildManager();
    await manager.registerCredential('identity-1', 'Password', 'hash-1');
    const login = await manager.login('identity-1', 'tenant-1', 'Password', 'hash-1');

    await manager.revokeSession(login.result.session.sessionId);

    await expect(manager.buildSecurityContext(login.result.session.sessionId)).rejects.toThrow();
  });

  it('buildSecurityContext resolve identity/tenant/roles a partir de uma Session ativa', async () => {
    const { manager } = buildManager();
    await manager.registerCredential('identity-1', 'Password', 'hash-1');
    const login = await manager.login('identity-1', 'tenant-1', 'Password', 'hash-1');
    await manager.assignRole('identity-1', 'tenant-1', 'Administrador');

    const context = await manager.buildSecurityContext(login.result.session.sessionId);

    expect(context.result.identity).toBe('identity-1');
    expect(context.result.tenantId).toBe('tenant-1');
    expect(context.result.roles).toEqual(['Administrador']);
  });

  it('Tenant Isolation: uma Identity com Perfil em tenant-1 nunca é autorizada no contexto de tenant-2 (ADR-004)', async () => {
    const { manager } = buildManager();
    await manager.assignRole('identity-1', 'tenant-1', 'Owner');
    await manager.grantPermission('Owner', 'platform:manage');

    const decision = await manager.authorize('identity-1', 'tenant-2', 'platform:manage');

    expect(decision.result.permitted).toBe(false);
  });
});
