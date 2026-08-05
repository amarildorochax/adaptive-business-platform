import type {
  BusinessClassificationRecord,
  BusinessClassificationRecordRepository,
  BusinessProfile,
  BusinessProfileLifecycleState,
  BusinessProfileLifecycleStateRepository,
  BusinessProfileRepository,
  MaturityRecord,
  MaturityRecordRepository,
} from '@abp/business-profile';
import {
  BusinessClassificationService,
  BusinessMaturityService,
  BusinessProfileLifecycleService,
  BusinessProfileManager,
  BusinessProfileService,
} from '@abp/business-profile';
import { describe, expect, it } from 'vitest';
import { AccessibilityValidatorService } from './AccessibilityValidatorService';
import { BrandingManager } from './BrandingManager';
import { BrandThemeService } from './BrandThemeService';
import { DesignTokenService } from './DesignTokenService';
import { LogoService } from './LogoService';
import {
  FakeBrandThemeRepository,
  FakeDesignTokenRepository,
  FakeLogoRepository,
} from './testing/InMemoryFakes';

/**
 * Fakes locais dos contratos públicos de `@abp/business-profile` — nunca reaproveitam os Fakes
 * internos daquele pacote (não exportados pelo seu barrel), apenas implementam suas interfaces de
 * Repository públicas. Constrói um `BusinessProfileManager` real a partir dos seus Services públicos,
 * exatamente como a Sprint exige: "Toda comunicação com o Business Profile Engine deverá utilizar
 * exclusivamente seus contratos públicos."
 */
class FakeBusinessProfileRepository implements BusinessProfileRepository {
  private readonly rows = new Map<string, BusinessProfile>();
  async create(profile: BusinessProfile) {
    this.rows.set(profile.tenantId, profile);
    return profile;
  }
  async findByTenantId(tenantId: string) {
    return this.rows.get(tenantId);
  }
}

class FakeBusinessClassificationRecordRepository implements BusinessClassificationRecordRepository {
  private readonly rows: BusinessClassificationRecord[] = [];
  async create(record: BusinessClassificationRecord) {
    this.rows.push(record);
    return record;
  }
  async listByProfileId(profileId: string) {
    return this.rows.filter((r) => r.profileId === profileId);
  }
}

class FakeMaturityRecordRepository implements MaturityRecordRepository {
  private readonly rows: MaturityRecord[] = [];
  async create(record: MaturityRecord) {
    this.rows.push(record);
    return record;
  }
  async listByProfileId(profileId: string) {
    return this.rows.filter((r) => r.profileId === profileId);
  }
}

class FakeBusinessProfileLifecycleStateRepository implements BusinessProfileLifecycleStateRepository {
  private readonly rows: BusinessProfileLifecycleState[] = [];
  async create(state: BusinessProfileLifecycleState) {
    this.rows.push(state);
    return state;
  }
  async listByProfileId(profileId: string) {
    return this.rows.filter((s) => s.profileId === profileId);
  }
}

function buildBusinessProfileManager() {
  return new BusinessProfileManager({
    profiles: new BusinessProfileService(new FakeBusinessProfileRepository()),
    classification: new BusinessClassificationService(new FakeBusinessClassificationRecordRepository()),
    maturity: new BusinessMaturityService(new FakeMaturityRecordRepository()),
    lifecycle: new BusinessProfileLifecycleService(new FakeBusinessProfileLifecycleStateRepository()),
  });
}

function buildManager() {
  const businessProfile = buildBusinessProfileManager();
  const manager = new BrandingManager({
    logos: new LogoService(new FakeLogoRepository()),
    tokens: new DesignTokenService(new FakeDesignTokenRepository(), new AccessibilityValidatorService()),
    themes: new BrandThemeService(new FakeBrandThemeRepository()),
    accessibility: new AccessibilityValidatorService(),
    businessProfile,
  });

  return { manager, businessProfile };
}

const THEME_PAYLOAD = { tenantId: 'tenant-1', primaryColorHex: '#EEEEEE', backgroundHex: '#FFFFFF', titleFont: 'Poppins', bodyFont: 'Inter' };

describe('BrandingManager — Brand Manager ("orquestração e consistência, nunca a lógica de domínio")', () => {
  it('generateInitialBrandIdentity nunca carrega command — nem UpdateTheme nem UpdatePalette se aplicam sem Theme prévio', async () => {
    const { manager } = buildManager();

    const created = await manager.generateInitialBrandIdentity(THEME_PAYLOAD);

    expect(created.result.theme.version).toBe(1);
    expect(created.result.tokens).toHaveLength(4);
    expect('command' in created).toBe(false);
    expect('events' in created).toBe(false);
  });

  it('generateInitialBrandIdentity rejeita uma segunda chamada quando um Theme já existe', async () => {
    const { manager } = buildManager();
    await manager.generateInitialBrandIdentity(THEME_PAYLOAD);

    await expect(manager.generateInitialBrandIdentity(THEME_PAYLOAD)).rejects.toThrow();
  });

  it('regenerateTheme carrega command "UpdateTheme" e evento "ThemeUpdated" quando um Theme já existe', async () => {
    const { manager } = buildManager();
    await manager.generateInitialBrandIdentity(THEME_PAYLOAD);

    const regenerated = await manager.regenerateTheme({ ...THEME_PAYLOAD, primaryColorHex: '#112233' });

    expect(regenerated.result.theme.version).toBe(2);
    expect(regenerated.command?.type).toBe('UpdateTheme');
    expect(regenerated.events?.[0]?.type).toBe('ThemeUpdated');
  });

  it('regenerateTheme rejeita quando nenhum Theme existe ainda (precondição "Theme existente")', async () => {
    const { manager } = buildManager();

    await expect(manager.regenerateTheme(THEME_PAYLOAD)).rejects.toThrow();
  });

  it('updatePalette carrega command "UpdatePalette" e evento "BrandPaletteUpdated" quando uma paleta anterior existe', async () => {
    const { manager } = buildManager();
    const created = await manager.generateInitialBrandIdentity(THEME_PAYLOAD);

    const updated = await manager.updatePalette({ tenantId: 'tenant-1', themeId: created.result.theme.themeId, primaryColorHex: '#334455', backgroundHex: '#FFFFFF' });

    expect(updated.command?.type).toBe('UpdatePalette');
    expect(updated.events?.[0]?.type).toBe('BrandPaletteUpdated');
  });

  it('updatePalette rejeita quando nenhuma paleta anterior existe para o Theme (precondição "paleta anterior existente")', async () => {
    const { manager } = buildManager();

    await expect(manager.updatePalette({ tenantId: 'tenant-1', themeId: 'theme-inexistente', primaryColorHex: '#334455', backgroundHex: '#FFFFFF' })).rejects.toThrow();
  });

  it('submitLogo/currentLogo nunca carregam command — Logo Manager não está no catálogo de Commands', async () => {
    const { manager } = buildManager();
    const submitted = await manager.submitLogo('tenant-1', 'assets/logo.svg');

    const current = await manager.currentLogo('tenant-1');

    expect('command' in submitted).toBe(false);
    expect(current.result?.logoId).toBe(submitted.result.logoId);
  });

  it('businessContext lê Classification/Maturity do Business Profile Engine exclusivamente via contratos públicos (integração unidirecional)', async () => {
    const { manager, businessProfile } = buildManager();
    const created = await businessProfile.createBusinessProfile({ tenantId: 'tenant-1', segment: 'Floricultura', maturity: 'elevada' });

    const context = await manager.businessContext(created.result.profileId);

    expect(context.classification?.segment).toBe('Floricultura');
    expect(context.maturity).toBe('elevada');
  });

  it('businessContext retorna undefined quando o Business Profile ainda não foi classificado', async () => {
    const { manager } = buildManager();

    const context = await manager.businessContext('profile-inexistente');

    expect(context.classification).toBeUndefined();
    expect(context.maturity).toBeUndefined();
  });
});
