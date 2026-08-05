import type { BusinessClassificationRecord } from '../BusinessClassificationRecord';
import type { BusinessClassificationRecordRepository } from '../BusinessClassificationRecordRepository';
import type { BusinessProfile } from '../BusinessProfile';
import type { BusinessProfileLifecycleState } from '../BusinessProfileLifecycleState';
import type { BusinessProfileLifecycleStateRepository } from '../BusinessProfileLifecycleStateRepository';
import type { BusinessProfileRepository } from '../BusinessProfileRepository';
import type { MaturityRecord } from '../MaturityRecord';
import type { MaturityRecordRepository } from '../MaturityRecordRepository';

/**
 * Fakes em memória usados exclusivamente por teste (IMP-018, Etapa de Testes). Mesmo padrão já usado
 * pelos dezessete domínios anteriores desta série — nunca exportados pelo barrel do pacote, nunca
 * referenciados por nenhum Service em produção.
 */

export class FakeBusinessProfileRepository implements BusinessProfileRepository {
  private readonly rows = new Map<string, BusinessProfile>();
  async create(profile: BusinessProfile) {
    this.rows.set(profile.tenantId, profile);
    return profile;
  }
  async findByTenantId(tenantId: string) {
    return this.rows.get(tenantId);
  }
}

export class FakeBusinessClassificationRecordRepository implements BusinessClassificationRecordRepository {
  private readonly rows: BusinessClassificationRecord[] = [];
  async create(record: BusinessClassificationRecord) {
    this.rows.push(record);
    return record;
  }
  async listByProfileId(profileId: string) {
    return this.rows.filter((r) => r.profileId === profileId);
  }
}

export class FakeMaturityRecordRepository implements MaturityRecordRepository {
  private readonly rows: MaturityRecord[] = [];
  async create(record: MaturityRecord) {
    this.rows.push(record);
    return record;
  }
  async listByProfileId(profileId: string) {
    return this.rows.filter((r) => r.profileId === profileId);
  }
}

export class FakeBusinessProfileLifecycleStateRepository implements BusinessProfileLifecycleStateRepository {
  private readonly rows: BusinessProfileLifecycleState[] = [];
  async create(state: BusinessProfileLifecycleState) {
    this.rows.push(state);
    return state;
  }
  async listByProfileId(profileId: string) {
    return this.rows.filter((s) => s.profileId === profileId);
  }
}
