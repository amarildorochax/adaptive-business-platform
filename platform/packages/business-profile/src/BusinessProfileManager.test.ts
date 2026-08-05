import { describe, expect, it } from 'vitest';
import { BusinessClassificationService } from './BusinessClassificationService';
import { BusinessMaturityService } from './BusinessMaturityService';
import { BusinessProfileLifecycleService } from './BusinessProfileLifecycleService';
import { BusinessProfileManager } from './BusinessProfileManager';
import { BusinessProfileService } from './BusinessProfileService';
import {
  FakeBusinessClassificationRecordRepository,
  FakeBusinessProfileLifecycleStateRepository,
  FakeBusinessProfileRepository,
  FakeMaturityRecordRepository,
} from './testing/InMemoryFakes';

function buildManager() {
  const manager = new BusinessProfileManager({
    profiles: new BusinessProfileService(new FakeBusinessProfileRepository()),
    classification: new BusinessClassificationService(new FakeBusinessClassificationRecordRepository()),
    maturity: new BusinessMaturityService(new FakeMaturityRecordRepository()),
    lifecycle: new BusinessProfileLifecycleService(new FakeBusinessProfileLifecycleStateRepository()),
  });

  return { manager };
}

describe('BusinessProfileManager — Profile Manager ("orquestração e consistência, nunca a lógica de domínio")', () => {
  it('createBusinessProfile carrega command "CreateBusinessProfile" e evento "BusinessProfileCreated" — catálogo formal existe para este domínio', async () => {
    const { manager } = buildManager();

    const created = await manager.createBusinessProfile({ tenantId: 'tenant-1', segment: 'Floricultura', maturity: 'baixa' });

    expect(created.result.tenantId).toBe('tenant-1');
    expect(created.command?.type).toBe('CreateBusinessProfile');
    expect(created.events?.[0]?.type).toBe('BusinessProfileCreated');
  });

  it('createBusinessProfile já avança a Jornada até "Classificação" e registra a primeira Classificação/Maturidade', async () => {
    const { manager } = buildManager();
    const created = await manager.createBusinessProfile({ tenantId: 'tenant-1', segment: 'Clínica', subsegment: 'Odontológica', maturity: 'elevada' });
    const profileId = created.result.profileId;

    const stage = await manager.currentStage(profileId);
    const classification = await manager.currentClassification(profileId);
    const maturity = await manager.currentMaturity(profileId);

    expect(stage.result).toBe('Classificação');
    expect(classification.result?.segment).toBe('Clínica');
    expect(classification.result?.subsegment).toBe('Odontológica');
    expect(maturity.result).toBe('elevada');
  });

  it('validateProfile/finalizeInitialProfile nunca carregam command nem events — nenhum Command catalogado cobre essas transições', async () => {
    const { manager } = buildManager();
    const created = await manager.createBusinessProfile({ tenantId: 'tenant-1', segment: 'Academia', maturity: 'baixa' });

    const validated = await manager.validateProfile(created.result.profileId);

    expect(validated.result.stage).toBe('Validação');
    expect('command' in validated).toBe(false);
    expect('events' in validated).toBe(false);
  });

  it('fluxo completo: createBusinessProfile → validateProfile → finalizeInitialProfile', async () => {
    const { manager } = buildManager();
    const created = await manager.createBusinessProfile({ tenantId: 'tenant-1', segment: 'E-commerce', maturity: 'elevada' });
    const profileId = created.result.profileId;

    await manager.validateProfile(profileId);
    const finalized = await manager.finalizeInitialProfile(profileId);

    expect(finalized.result.stage).toBe('Perfil Inicial');
  });

  it('findProfile localiza o Business Profile pelo Tenant', async () => {
    const { manager } = buildManager();
    await manager.createBusinessProfile({ tenantId: 'tenant-1', segment: 'Moda', maturity: 'baixa' });

    const found = await manager.findProfile('tenant-1');

    expect(found.result?.tenantId).toBe('tenant-1');
  });
});
