import { AccessAuditService } from './AccessAuditService';
import type { AccessToken } from './AccessToken';
import type { AuthenticationResult } from './AuthenticationResult';
import { AuthenticationService } from './AuthenticationService';
import type { AuthorizationDecision } from './AuthorizationDecision';
import { AuthorizationService } from './AuthorizationService';
import type { Credential, CredentialKind } from './Credential';
import { CredentialService } from './CredentialService';
import type { Identity } from './Identity';
import type { Permission, Role } from './Role';
import type { Profile } from './Profile';
import { ProfileService } from './ProfileService';
import type { RolePermission } from './RolePermission';
import { RolePermissionService } from './RolePermissionService';
import type { SecurityContext } from './SecurityContext';
import { SecurityContextService } from './SecurityContextService';
import type { Session } from './Session';
import { SessionService } from './SessionService';

export interface IAMManagerDependencies {
  readonly credentials: CredentialService;
  readonly authentication: AuthenticationService;
  readonly profiles: ProfileService;
  readonly rolePermissions: RolePermissionService;
  readonly authorization: AuthorizationService;
  readonly sessions: SessionService;
  readonly securityContext: SecurityContextService;
  readonly audit: AccessAuditService;
}

/**
 * Resultado de uma operação de IAMManager. **Nunca tem um campo `command` nem um campo `events`** —
 * `IDENTITY_HUB.md` nunca cataloga Commands nem um Event Map próprio (22 capítulos, nenhum
 * equivalente a "Comandos"; Capítulo 16 menciona "Eventos de identidade" apenas como publicados no
 * Event Map genérico já descrito em `SYSTEM_BLUEPRINT.md`, nunca um catálogo próprio deste Hub) —
 * mesma ausência já confirmada para o AI Hub (IMP-010) e para o Automation Engine (IMP-009).
 */
export interface IAMOperationResult<TEntity> {
  readonly result: TEntity;
}

/**
 * IAMManager — o "Identity Manager" já catalogado em `IDENTITY_HUB.md`, Capítulo 7: "o ponto de
 * entrada e orquestrador central do Identity Hub... coordena os demais componentes especializados e
 * garante que o resultado de uma resolução de identidade seja consistente antes de ser retornado a
 * qualquer Hub consumidor". Nunca contém, ele mesmo, regra de negócio de nenhum componente
 * individual.
 *
 * Escopo desta Sprint (IAM Core, per o Roadmap de curto prazo, `IDENTITY_HUB.md`, Capítulo 19): o
 * Identity Manager, o Authentication Manager com suporte a Senha e Passkey, o RBAC Engine sobre os
 * oito Papéis já nomeados em `SAAS_ARCHITECTURE.md`, e o Session Manager com criação, renovação e
 * revogação. Nunca ABAC, Policy Engine, Trust Engine, MFA, OAuth/OIDC/SAML/SSO, API Key/Service
 * Account, Identity Federation — todos "médio/longo prazo" per o próprio Roadmap (ver relatório desta
 * Sprint).
 *
 * Authentication Before Authorization (ADR-006): `login()` sempre autentica antes de criar uma
 * Session; `authorize()` nunca é chamado sem uma identidade já autenticada em algum momento anterior.
 * Auditable Everything (ADR-007): `authorize()` sempre produz um Access Audit Record, concedido ou
 * negado, sem exceção.
 */
export class IAMManager {
  constructor(private readonly deps: IAMManagerDependencies) {}

  async registerCredential(identity: Identity, kind: CredentialKind, secretReference: string): Promise<IAMOperationResult<Credential>> {
    const credential = await this.deps.credentials.register(identity, kind, secretReference);
    return { result: credential };
  }

  /** Confirma quem está por trás de uma requisição — nunca resolve Permissão (Authentication Before Authorization, ADR-006). */
  async authenticate(identity: Identity, kind: CredentialKind, secretReference: string): Promise<IAMOperationResult<AuthenticationResult>> {
    const result = await this.deps.authentication.authenticate(identity, kind, secretReference);
    return { result };
  }

  /** Autentica e, em caso de sucesso, cria a Session correspondente — "Criação de sessão acontece imediatamente após uma Authentication bem-sucedida" (`IDENTITY_HUB.md`, Capítulo 11). */
  async login(identity: Identity, tenantId: string, kind: CredentialKind, secretReference: string): Promise<IAMOperationResult<{ authentication: AuthenticationResult; session: Session; token: AccessToken }>> {
    const authentication = await this.deps.authentication.authenticate(identity, kind, secretReference);
    const { session, token } = await this.deps.sessions.create(authentication, tenantId);

    return { result: { authentication, session, token } };
  }

  /** "Troca de função" (`IDENTITY_HUB.md`, Capítulo 18) — associa ou atualiza o Papel de um Perfil, sempre auditado como mudança de Permissão (ADR-007). */
  async assignRole(identity: Identity, tenantId: string, role: Role): Promise<IAMOperationResult<Profile>> {
    const profile = await this.deps.profiles.assignRole(identity, tenantId, role);
    await this.deps.audit.record(identity, tenantId, `role:${role}`, true);

    return { result: profile };
  }

  async grantPermission(role: Role, permissionName: Permission['name']): Promise<IAMOperationResult<RolePermission>> {
    const grant = await this.deps.rolePermissions.grant(role, permissionName);
    return { result: grant };
  }

  /** Resolve autorização via RBAC e sempre produz um Access Audit Record, concedido ou negado, sem exceção (ADR-007). */
  async authorize(identity: Identity, tenantId: string, action: string): Promise<IAMOperationResult<AuthorizationDecision>> {
    const decision = await this.deps.authorization.authorize(identity, tenantId, action);
    await this.deps.audit.record(identity, tenantId, action, decision.permitted);

    return { result: decision };
  }

  async renewSession(sessionId: string): Promise<IAMOperationResult<Session>> {
    const session = await this.deps.sessions.renew(sessionId);
    return { result: session };
  }

  /** Revogação de Permissão invalida Session ativa imediatamente (ADR-010) — aplicada aqui como revogação explícita de Session, mesma disciplina. */
  async revokeSession(sessionId: string): Promise<IAMOperationResult<Session>> {
    const session = await this.deps.sessions.revoke(sessionId);
    return { result: session };
  }

  async buildSecurityContext(sessionId: string): Promise<IAMOperationResult<SecurityContext>> {
    const context = await this.deps.securityContext.build(sessionId);
    return { result: context };
  }
}
