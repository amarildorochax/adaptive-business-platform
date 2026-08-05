import type { BusinessClassification, BusinessProfileManager, Maturity } from "@abp/business-profile";

import type { AccessibilityValidatorService } from "./AccessibilityValidatorService.js";
import type { BrandingCommand } from "./BrandingCommand.js";
import type { BrandingEvent } from "./BrandingEvent.js";
import type { BrandTheme } from "./BrandTheme.js";
import { BrandThemeService } from "./BrandThemeService.js";
import type { DesignToken } from "./DesignToken.js";
import { DesignTokenService } from "./DesignTokenService.js";
import type { GenerateBrandThemePayload } from "./GenerateBrandThemePayload.js";
import type { Logo } from "./Logo.js";
import { LogoService } from "./LogoService.js";
import type { UpdatePalettePayload } from "./UpdatePalettePayload.js";

export interface BrandingManagerDependencies {
  readonly logos: LogoService;
  readonly tokens: DesignTokenService;
  readonly themes: BrandThemeService;
  readonly accessibility: AccessibilityValidatorService;
  readonly businessProfile: BusinessProfileManager;
}

/**
 * Resultado de uma operação de BrandingManager. `command`/`events` estão presentes apenas quando a
 * operação corresponde a um Command já catalogado em `COMMAND_CATALOG.md` e implementado nesta Sprint
 * (`UpdateTheme`, `UpdatePalette`) — mesmo padrão opcional `{result, command?, events?}` já usado por
 * Knowledge Hub (IMP-015), Integration Hub (IMP-016) e Business Profile Engine (IMP-018).
 * A geração inicial de Theme/Paleta (`generateInitialBrandIdentity`) nunca carrega Command: tanto
 * `UpdateTheme` quanto `UpdatePalette` têm precondição de pré-existência ("Theme existente"/"paleta
 * anterior existente" — `COMMAND_CATALOG.md`) que a primeira geração, por definição, não satisfaz.
 * `PublishBrandAssets`/`BrandAssetChanged` estão declarados em `BrandingCommand`/`BrandingEvent` (o
 * catálogo completo, per o mesmo padrão de `ContentEvent`/`CommerceEvent`), mas não têm Service
 * produtor nesta Sprint — a Asset Library (`BRANDING_HUB.md`, Capítulo 7) não é citada em nenhuma
 * camada do Roadmap (Capítulo 20: curto, médio ou longo prazo), diferente do Logo Manager, do Color
 * Engine, do Typography Engine e do Design Token Engine, os quatro únicos componentes nomeados no
 * curto prazo. Registrado explicitamente no relatório da Sprint — nenhum Command substituto foi
 * inventado.
 */
export interface BrandingOperationResult<TEntity> {
  readonly result: TEntity;
  readonly command?: BrandingCommand;
  readonly events?: readonly BrandingEvent[];
}

let commandSequence = 0;
let eventSequence = 0;

function buildCommand(type: BrandingCommand["type"]): BrandingCommand {
  commandSequence += 1;
  return { operationId: `branding-cmd-${commandSequence}`, type, requestedAt: new Date() };
}

function buildEvent(type: BrandingEvent["type"]): BrandingEvent {
  eventSequence += 1;
  return { eventId: `branding-evt-${eventSequence}`, type, occurredAt: new Date() };
}

/**
 * BrandingManager — implementa o "Brand Manager" (`BRANDING_HUB.md`, Capítulo 7): "o ponto de entrada
 * e o orquestrador central do Hub... coordena os demais componentes especializados e garante que a
 * identidade resultante seja internamente consistente."
 *
 * Integração com o Business Profile Engine (Capítulo 12) é estritamente unidirecional — "Business
 * Profile informa Branding, nunca o contrário" — e realizada exclusivamente através dos métodos
 * públicos de `BusinessProfileManager` (`currentClassification`, `currentMaturity`); nenhum
 * repositório ou entidade interna de `@abp/business-profile` é importado, e nenhuma dependência
 * circular é criada (Branding depende de Business Profile; o inverso nunca ocorre).
 */
export class BrandingManager {
  constructor(private readonly deps: BrandingManagerDependencies) {}

  /** Consulta somente-leitura do contexto de negócio que informa decisões de Branding (Capítulo 12). */
  async businessContext(profileId: string): Promise<{
    readonly classification: BusinessClassification | undefined;
    readonly maturity: Maturity | undefined;
  }> {
    const [{ result: classification }, { result: maturity }] = await Promise.all([
      this.deps.businessProfile.currentClassification(profileId),
      this.deps.businessProfile.currentMaturity(profileId),
    ]);

    return { classification, maturity };
  }

  async submitLogo(tenantId: string, assetReference: string): Promise<BrandingOperationResult<Logo>> {
    return { result: await this.deps.logos.submit(tenantId, assetReference) };
  }

  async currentLogo(tenantId: string): Promise<BrandingOperationResult<Logo | undefined>> {
    return { result: await this.deps.logos.current(tenantId) };
  }

  /**
   * Primeira geração de identidade de marca de um tenant. Sem Command: nem `UpdateTheme` nem
   * `UpdatePalette` se aplicam a um tenant que ainda não possui Theme (Capítulo 10, ADR-012).
   */
  async generateInitialBrandIdentity(payload: GenerateBrandThemePayload): Promise<BrandingOperationResult<{
    readonly theme: BrandTheme;
    readonly tokens: readonly DesignToken[];
  }>> {
    const existing = await this.deps.themes.current(payload.tenantId);
    if (existing !== undefined) {
      throw new Error("Theme já existe para este tenant — use regenerateTheme.");
    }

    const theme = await this.deps.themes.generate(payload.tenantId);
    const colorTokens = await this.deps.tokens.generateColorTokens(theme.themeId, payload.tenantId, payload.primaryColorHex, payload.backgroundHex);
    const typographyTokens = await this.deps.tokens.generateTypographyTokens(theme.themeId, payload.tenantId, payload.titleFont, payload.bodyFont);

    return { result: { theme, tokens: [...colorTokens, ...typographyTokens] } };
  }

  /**
   * Command "UpdateTheme". Regeneração completa (ADR-012: "nunca incremental sobre o estado
   * anterior") — precondição "Theme existente" (`COMMAND_CATALOG.md`) verificada explicitamente.
   */
  async regenerateTheme(payload: GenerateBrandThemePayload): Promise<BrandingOperationResult<{
    readonly theme: BrandTheme;
    readonly tokens: readonly DesignToken[];
  }>> {
    const existing = await this.deps.themes.current(payload.tenantId);
    if (existing === undefined) {
      throw new Error("Nenhum Theme existente — use generateInitialBrandIdentity.");
    }

    const theme = await this.deps.themes.generate(payload.tenantId);
    const colorTokens = await this.deps.tokens.generateColorTokens(theme.themeId, payload.tenantId, payload.primaryColorHex, payload.backgroundHex);
    const typographyTokens = await this.deps.tokens.generateTypographyTokens(theme.themeId, payload.tenantId, payload.titleFont, payload.bodyFont);

    const command = buildCommand("UpdateTheme");
    const events = [buildEvent("ThemeUpdated")];

    return { result: { theme, tokens: [...colorTokens, ...typographyTokens] }, command, events };
  }

  /**
   * Command "UpdatePalette". Precondição "paleta anterior existente" (`COMMAND_CATALOG.md`)
   * verificada explicitamente — regenera apenas os Tokens de categoria "Cor" do Theme vigente.
   */
  async updatePalette(payload: UpdatePalettePayload): Promise<BrandingOperationResult<readonly DesignToken[]>> {
    const previousTokens = await this.deps.tokens.listByTheme(payload.themeId);
    const hadPalette = previousTokens.some((token) => token.category === "Cor");
    if (!hadPalette) {
      throw new Error("Nenhuma paleta anterior existente para este Theme — use generateInitialBrandIdentity.");
    }

    const tokens = await this.deps.tokens.generateColorTokens(payload.themeId, payload.tenantId, payload.primaryColorHex, payload.backgroundHex);

    const command = buildCommand("UpdatePalette");
    const events = [buildEvent("BrandPaletteUpdated")];

    return { result: tokens, command, events };
  }

  async currentTheme(tenantId: string): Promise<BrandingOperationResult<BrandTheme | undefined>> {
    return { result: await this.deps.themes.current(tenantId) };
  }
}
