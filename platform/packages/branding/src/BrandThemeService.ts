import type { BrandTheme } from "./BrandTheme.js";
import type { BrandThemeRepository } from "./BrandThemeRepository.js";

/**
 * Brand Theme Service — implementa o "Theme Generator" (`BRANDING_HUB.md`, Capítulo 7 e 10): "compõe,
 * a partir do conjunto completo de Design Tokens de uma empresa, um Theme consumível." O número da
 * versão é sempre calculado a partir do próprio histórico — ADR-012: "Regeneração de Theme é sempre
 * completa, nunca incremental sobre o estado anterior" — cada chamada produz uma nova versão inteira,
 * nunca uma mutação da anterior.
 */
export class BrandThemeService {
  constructor(private readonly repository: BrandThemeRepository) {}

  async generate(tenantId: string): Promise<BrandTheme> {
    const previous = await this.repository.listByTenant(tenantId);
    const theme: BrandTheme = { themeId: crypto.randomUUID(), tenantId, version: previous.length + 1, generatedAt: new Date() };
    return this.repository.create(theme);
  }

  async current(tenantId: string): Promise<BrandTheme | undefined> {
    const themes = await this.repository.listByTenant(tenantId);
    return themes[themes.length - 1];
  }

  async history(tenantId: string): Promise<readonly BrandTheme[]> {
    return this.repository.listByTenant(tenantId);
  }
}
