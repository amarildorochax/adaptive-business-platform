import type { AccessibilityValidatorService } from "./AccessibilityValidatorService.js";
import type { DesignToken } from "./DesignToken.js";
import type { DesignTokenRepository } from "./DesignTokenRepository.js";

/**
 * Design Token Service — consolida o "Color Engine", o "Typography Engine" e o "Design Token Engine"
 * (`BRANDING_HUB.md`, Capítulo 7): os dois primeiros "não decidem o que fazer" com sua própria
 * decisão — apenas a produzem; o Design Token Engine "converte as decisões produzidas pelo Color
 * Engine, pelo Typography Engine... em Design Tokens estruturados e nomeados." Nenhum dos três tem
 * Entity própria além do `DesignToken` resultante — consolidados em um único Service pela mesma razão
 * já registrada para "Segment Engine" dentro de `BusinessClassificationService` (IMP-018): nenhuma
 * sub-estrutura própria a justificar Services distintos.
 *
 * A geração de cor sempre passa pelo Accessibility Validator antes de produzir o Token de texto —
 * "Nenhuma paleta é distribuída a um Theme sem que essa verificação tenha sido aplicada e aprovada"
 * (Capítulo 14) — preservando a cor original para uso de destaque visual (Caso de Uso 1: "preservando
 * a identidade de cor original para uso em elemento de destaque visual").
 */
export class DesignTokenService {
  constructor(
    private readonly repository: DesignTokenRepository,
    private readonly accessibility: AccessibilityValidatorService,
  ) {}

  /** Color Engine + Accessibility Validator (Capítulo 14, ADR-003/ADR-008/ADR-009). */
  async generateColorTokens(themeId: string, tenantId: string, primaryColorHex: string, backgroundHex: string): Promise<readonly DesignToken[]> {
    const accent: DesignToken = {
      tokenId: crypto.randomUUID(),
      tenantId,
      themeId,
      category: "Cor",
      name: "cor-destaque-primaria",
      value: primaryColorHex,
    };

    const { value: accessibleValue } = this.accessibility.ensureAccessible(primaryColorHex, backgroundHex);
    const text: DesignToken = {
      tokenId: crypto.randomUUID(),
      tenantId,
      themeId,
      category: "Cor",
      name: "cor-texto-primaria",
      value: accessibleValue,
    };

    return [await this.repository.create(accent), await this.repository.create(text)];
  }

  /** Typography Engine — nomes funcionais literais do Capítulo 9: "fonte-titulo", "fonte-corpo". */
  async generateTypographyTokens(themeId: string, tenantId: string, titleFont: string, bodyFont: string): Promise<readonly DesignToken[]> {
    const title: DesignToken = { tokenId: crypto.randomUUID(), tenantId, themeId, category: "Tipografia", name: "fonte-titulo", value: titleFont };
    const body: DesignToken = { tokenId: crypto.randomUUID(), tenantId, themeId, category: "Tipografia", name: "fonte-corpo", value: bodyFont };

    return [await this.repository.create(title), await this.repository.create(body)];
  }

  async listByTheme(themeId: string): Promise<readonly DesignToken[]> {
    return this.repository.listByThemeId(themeId);
  }
}
