import type { AccessAuditRecord } from '../AccessAuditRecord';
import type { AccessAuditRecordRepository } from '../AccessAuditRecordRepository';
import type { AccessToken } from '../AccessToken';
import type { AccessTokenRepository } from '../AccessTokenRepository';
import type { Connector } from '../Connector';
import type { ConnectorConfiguration } from '../ConnectorConfiguration';
import type { ConnectorConfigurationRepository } from '../ConnectorConfigurationRepository';
import type { ConnectorContract } from '../ConnectorContract';
import type { ConnectorContractRepository } from '../ConnectorContractRepository';
import type { ConnectorRepository } from '../ConnectorRepository';
import type { Credential } from '../Credential';
import type { CredentialRepository } from '../CredentialRepository';
import type { Identity } from '../Identity';
import type { IndexEntry } from '../IndexEntry';
import type { IndexEntryRepository } from '../IndexEntryRepository';
import type { KnowledgeAsset } from '../KnowledgeAsset';
import type { KnowledgeAssetRepository } from '../KnowledgeAssetRepository';
import type { KnowledgeLifecycleState } from '../KnowledgeLifecycleState';
import type { KnowledgeLifecycleStateRepository } from '../KnowledgeLifecycleStateRepository';
import type { KnowledgeVersion } from '../KnowledgeVersion';
import type { KnowledgeVersionRepository } from '../KnowledgeVersionRepository';
import type { Profile } from '../Profile';
import type { ProfileRepository } from '../ProfileRepository';
import type { Role } from '../Role';
import type { RolePermission } from '../RolePermission';
import type { RolePermissionRepository } from '../RolePermissionRepository';
import type { Session } from '../Session';
import type { SessionRepository } from '../SessionRepository';
import type { WebhookDelivery } from '../WebhookDelivery';
import type { WebhookDeliveryRepository } from '../WebhookDeliveryRepository';
import type { WebhookRegistration } from '../WebhookRegistration';
import type { WebhookRegistrationRepository } from '../WebhookRegistrationRepository';

/**
 * Fakes em memória usados exclusivamente por teste (IMP-011, Etapa de Testes). Mesmo padrão já usado
 * pelos nove domínios anteriores desta série — nunca exportados pelo barrel do pacote, nunca
 * referenciados por nenhum Service em produção.
 */

export class FakeCredentialRepository implements CredentialRepository {
  private readonly rows: Credential[] = [];
  async create(credential: Credential) {
    this.rows.push(credential);
    return credential;
  }
  async listByIdentity(identity: Identity) {
    return this.rows.filter((c) => c.identity === identity);
  }
}

export class FakeProfileRepository implements ProfileRepository {
  private readonly rows = new Map<string, Profile>();
  private key(identity: Identity, tenantId: string) {
    return `${identity}::${tenantId}`;
  }
  async create(profile: Profile) {
    this.rows.set(this.key(profile.identity, profile.tenantId), profile);
    return profile;
  }
  async update(profile: Profile) {
    this.rows.set(this.key(profile.identity, profile.tenantId), profile);
    return profile;
  }
  async find(identity: Identity, tenantId: string) {
    return this.rows.get(this.key(identity, tenantId));
  }
  async listByIdentity(identity: Identity) {
    return [...this.rows.values()].filter((p) => p.identity === identity);
  }
}

export class FakeRolePermissionRepository implements RolePermissionRepository {
  private readonly rows: RolePermission[] = [];
  async grant(rolePermission: RolePermission) {
    this.rows.push(rolePermission);
    return rolePermission;
  }
  async listByRole(role: Role) {
    return this.rows.filter((r) => r.role === role);
  }
}

export class FakeSessionRepository implements SessionRepository {
  private readonly rows = new Map<string, Session>();
  async create(session: Session) {
    this.rows.set(session.sessionId, session);
    return session;
  }
  async update(session: Session) {
    this.rows.set(session.sessionId, session);
    return session;
  }
  async get(sessionId: string) {
    return this.rows.get(sessionId);
  }
}

export class FakeAccessTokenRepository implements AccessTokenRepository {
  private readonly rows: AccessToken[] = [];
  async create(token: AccessToken) {
    this.rows.push(token);
    return token;
  }
  async findBySession(sessionId: string) {
    return this.rows.find((t) => t.sessionId === sessionId);
  }
}

export class FakeAccessAuditRecordRepository implements AccessAuditRecordRepository {
  private readonly rows: AccessAuditRecord[] = [];
  async create(record: AccessAuditRecord) {
    this.rows.push(record);
    return record;
  }
  async listByIdentity(identity: Identity) {
    return this.rows.filter((r) => r.identity === identity);
  }
}

/** IMP-015 (Knowledge Hub Core). */

export class FakeKnowledgeAssetRepository implements KnowledgeAssetRepository {
  private readonly rows = new Map<string, KnowledgeAsset>();
  async create(asset: KnowledgeAsset) {
    this.rows.set(asset.assetId, asset);
    return asset;
  }
  async find(assetId: string) {
    return this.rows.get(assetId);
  }
  async listByTenant(tenantId: string) {
    return [...this.rows.values()].filter((a) => a.tenantId === tenantId);
  }
}

export class FakeKnowledgeLifecycleStateRepository implements KnowledgeLifecycleStateRepository {
  private readonly rows: KnowledgeLifecycleState[] = [];
  async create(state: KnowledgeLifecycleState) {
    this.rows.push(state);
    return state;
  }
  async listByAssetId(assetId: string) {
    return this.rows.filter((s) => s.assetId === assetId);
  }
}

export class FakeKnowledgeVersionRepository implements KnowledgeVersionRepository {
  private readonly rows: KnowledgeVersion[] = [];
  async create(version: KnowledgeVersion) {
    this.rows.push(version);
    return version;
  }
  async listByAssetId(assetId: string) {
    return this.rows.filter((v) => v.assetId === assetId);
  }
}

export class FakeIndexEntryRepository implements IndexEntryRepository {
  private readonly rows = new Map<string, IndexEntry>();
  async create(entry: IndexEntry) {
    this.rows.set(entry.assetId, entry);
    return entry;
  }
  async findByAssetId(assetId: string) {
    return this.rows.get(assetId);
  }
}

/** IMP-016 (Integration Hub Core). */

export class FakeConnectorRepository implements ConnectorRepository {
  private readonly rows = new Map<string, Connector>();
  async create(connector: Connector) {
    this.rows.set(connector.connectorId, connector);
    return connector;
  }
  async find(connectorId: string) {
    return this.rows.get(connectorId);
  }
  async list() {
    return [...this.rows.values()];
  }
}

export class FakeConnectorConfigurationRepository implements ConnectorConfigurationRepository {
  private readonly rows: ConnectorConfiguration[] = [];
  async create(configuration: ConnectorConfiguration) {
    this.rows.push(configuration);
    return configuration;
  }
  async listByConnectorAndTenant(connectorId: string, tenantId: string) {
    return this.rows.filter((c) => c.connectorId === connectorId && c.tenantId === tenantId);
  }
}

export class FakeConnectorContractRepository implements ConnectorContractRepository {
  private readonly rows: ConnectorContract[] = [];
  async create(contract: ConnectorContract) {
    this.rows.push(contract);
    return contract;
  }
  async listByConnectorId(connectorId: string) {
    return this.rows.filter((c) => c.connectorId === connectorId);
  }
}

export class FakeWebhookRegistrationRepository implements WebhookRegistrationRepository {
  private readonly rows = new Map<string, WebhookRegistration>();
  private key(connectorId: string, tenantId: string) {
    return `${connectorId}::${tenantId}`;
  }
  async create(registration: WebhookRegistration) {
    this.rows.set(this.key(registration.connectorId, registration.tenantId), registration);
    return registration;
  }
  async findByConnectorAndTenant(connectorId: string, tenantId: string) {
    return this.rows.get(this.key(connectorId, tenantId));
  }
}

export class FakeWebhookDeliveryRepository implements WebhookDeliveryRepository {
  private readonly rows: WebhookDelivery[] = [];
  async create(delivery: WebhookDelivery) {
    this.rows.push(delivery);
    return delivery;
  }
  async listByConnector(connectorId: string) {
    return this.rows.filter((d) => d.connectorId === connectorId);
  }
}
