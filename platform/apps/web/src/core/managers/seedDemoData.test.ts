import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { businessProfileClient } from "../http/clients/businessProfileClient.js";
import { brandingClient } from "../http/clients/brandingClient.js";
import { createDemoApiFetchMock } from "../http/testing/demoApiFetchMock.js";
import { buildManagers } from "./buildManagers";
import { DEMO_TENANT_ID, seedDemoData } from "./seedDemoData";

/**
 * Desde a FUN-005, Business Profile, Branding e CRM são consumidos exclusivamente via HTTP
 * (`core/http/clients/*`) — este teste mocka exclusivamente a camada HTTP (`fetch`), nunca um
 * Manager, per a regra explícita da Sprint. Communication, Analytics, Automation e Knowledge
 * continuam via `ManagerRegistry` real (Fakes em memória) e não precisam de mock.
 */
describe("seedDemoData — dado de demonstração através de Commands reais", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn(createDemoApiFetchMock(DEMO_TENANT_ID)));
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("popula os oito domínios: três via HTTP (apps/api) e cinco via Managers Fake (Commerce incluído desde a FUN-104)", async () => {
    const managers = buildManagers();

    const snapshot = await seedDemoData(managers);

    expect(snapshot.tenantId).toBe(DEMO_TENANT_ID);
    expect(snapshot.organization.name).toBe("Floricultura Bela Vista");
    expect(snapshot.opportunity.title).toBe("Contrato anual de fornecimento");
    expect(snapshot.lead.name).toBe("Ana Ferreira");
    expect(snapshot.conversation.status).toBe("Open");
    expect(snapshot.message.content).toContain("proposta");
    expect(snapshot.metric.name).toBe("Receita do mês");
    expect(snapshot.kpi.value).toBe(48000);
    expect(snapshot.dashboard.name).toBe("Visão Geral");
    expect(snapshot.workflow.status).toBe("Active");
    expect(snapshot.execution.status).toBe("Succeeded");
    expect(snapshot.knowledgeAssets).toHaveLength(2);
    // 2 tokens de "Cor" + 2 de "Tipografia" — `generateInitialBrandIdentity` real sempre gera os quatro
    // juntos (`DesignTokenService.generateColorTokens` + `generateTypographyTokens`), corrigido nesta
    // Sprint (FUN-102) junto com o mock, que antes só simulava dois tokens de cor com nomes inventados.
    expect(snapshot.brandTokens).toHaveLength(4);
    expect(snapshot.catalog.name).toBe("Catálogo Principal");
    expect(snapshot.category.name).toBe("Arranjos");
    expect(snapshot.product.name).toBe("Arranjo Floral Executivo");
    expect(snapshot.product.status).toBe("Draft");
    expect(snapshot.price.amount).toBe(189.9);
    expect(snapshot.inventory.quantity).toBe(40);
  });

  it("deixa o Business Profile Engine em estágio 'Perfil Inicial' e o Branding Hub com um Theme gerado", async () => {
    const managers = buildManagers();
    const snapshot = await seedDemoData(managers);

    const stage = await businessProfileClient.currentStage(snapshot.profileId);
    expect(stage?.stage).toBe("Perfil Inicial");

    const theme = await brandingClient.currentTheme(snapshot.tenantId);
    expect(theme?.version).toBe(1);
  });
});
