import type { BrandTheme } from '../BrandTheme';
import type { BrandThemeRepository } from '../BrandThemeRepository';
import type { DesignToken } from '../DesignToken';
import type { DesignTokenRepository } from '../DesignTokenRepository';
import type { Logo } from '../Logo';
import type { LogoRepository } from '../LogoRepository';

/**
 * Fakes em memória usados exclusivamente por teste (IMP-019, Etapa de Testes). Mesmo padrão já usado
 * pelos dezoito domínios anteriores desta série — nunca exportados pelo barrel do pacote, nunca
 * referenciados por nenhum Service em produção.
 */

export class FakeLogoRepository implements LogoRepository {
  private readonly rows: Logo[] = [];
  async create(logo: Logo) {
    this.rows.push(logo);
    return logo;
  }
  async listByTenant(tenantId: string) {
    return this.rows.filter((r) => r.tenantId === tenantId);
  }
}

export class FakeDesignTokenRepository implements DesignTokenRepository {
  private readonly rows: DesignToken[] = [];
  async create(token: DesignToken) {
    this.rows.push(token);
    return token;
  }
  async listByThemeId(themeId: string) {
    return this.rows.filter((r) => r.themeId === themeId);
  }
}

export class FakeBrandThemeRepository implements BrandThemeRepository {
  private readonly rows: BrandTheme[] = [];
  async create(theme: BrandTheme) {
    this.rows.push(theme);
    return theme;
  }
  async listByTenant(tenantId: string) {
    return this.rows.filter((r) => r.tenantId === tenantId);
  }
}
