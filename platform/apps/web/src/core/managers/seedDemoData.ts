import type { Conversation, Message } from "@abp/communication-hub";
import type { Dashboard, KPI, Metric } from "@abp/analytics-hub";
import type { Execution, Workflow } from "@abp/automation-engine";
import type { KnowledgeAsset } from "@abp/platform-services";
import type { Catalog, Category, CommerceEvent, Inventory, Price, Product } from "@abp/commerce-hub";
import { brandingClient } from "../http/clients/brandingClient.js";
import { crmClient } from "../http/clients/crmClient.js";
import { businessProfileClient } from "../http/clients/businessProfileClient.js";
import type { DesignTokenResponseDto } from "../http/dtos/branding.dto.js";
import type { LeadResponseDto, OpportunityResponseDto, OrganizationResponseDto, RelationshipResponseDto } from "../http/dtos/crm.dto.js";
import type { ManagerRegistry } from "./buildManagers";

/** Tenant único desta Sprint — nenhuma seleção de Tenant real existe ainda no Frontend (fora de escopo, ver relatório da Sprint). */
export const DEMO_TENANT_ID = "tenant-demo";
const DEMO_IDENTITY_ID = "identity-demo";

/**
 * Fotografia do dado criado por `seedDemoData`. Desde a FUN-005, os campos de Business Profile,
 * Branding e CRM vêm de DTOs HTTP reais (`core/http/dtos/*`) — nunca mais de uma Entity de domínio;
 * os campos de Communication, Analytics, Automation e Knowledge continuam vindo de Entity (esses
 * quatro domínios ainda não têm API própria, ver `buildManagers.ts`). Necessário porque a maioria
 * dos Managers/Endpoints conectados é orientada a Command (per `COMMAND_CATALOG.md`/`QUERY_CATALOG.md`,
 * catálogos formalmente distintos) — o resultado já devolvido por cada Command já executado é a
 * única fonte legítima para popular a interface, sem inventar um método de listagem que nenhum
 * Blueprint aprovou. `relationship` (FUN-103) já era devolvido por `crmClient.createOrganization`
 * desde a FUN-005, mas descartado — capturado agora porque `CrmWorkspaceSnapshot`
 * (`core/crm/crmWorkspace.ts`) precisa de Status/Lifecycle Stage/Account Manager reais, e
 * `CRMManager` não expõe nenhuma Query para buscá-lo de volta depois.
 */
export interface DemoSnapshot {
  readonly profileId: string;
  readonly tenantId: string;
  readonly organization: OrganizationResponseDto;
  readonly relationship: RelationshipResponseDto;
  readonly opportunity: OpportunityResponseDto;
  readonly lead: LeadResponseDto;
  readonly conversation: Conversation;
  readonly message: Message;
  readonly dataset: { readonly datasetId: string };
  readonly metric: Metric;
  readonly kpi: KPI;
  readonly dashboard: Dashboard;
  readonly workflow: Workflow;
  readonly execution: Execution;
  readonly knowledgeAssets: readonly KnowledgeAsset[];
  readonly brandTokens: readonly DesignTokenResponseDto[];
  readonly catalog: Catalog;
  readonly category: Category;
  readonly product: Product;
  readonly price: Price;
  readonly inventory: Inventory;
  /**
   * `CommerceEvent[]` genuinamente reais, devolvidos por `CommerceManager` (FUN-104) — diferente do
   * CRM Workspace (FUN-103), cujo `CRMEvent[]` nunca sobrevive à fronteira HTTP (`apps/api` descarta
   * `events` em toda rota), o Commerce Hub é consumido em processo (nenhuma API própria existe ainda
   * para ele, ver `buildManagers.ts`) — então o Evento em si, não apenas uma etiqueta sintetizada, é
   * real e chega inteiro ao Frontend. Nunca publicado em nenhum Event Bus (nenhum existe na
   * plataforma), apenas coletado, mesmo estado documentado desde a IMP-006.
   */
  readonly commerceEvents: readonly CommerceEvent[];
}

/**
 * Popula o bootstrap de demonstração da sessão — híbrido desde a FUN-005:
 *
 * - Business Profile, Branding e CRM: exclusivamente via HTTP real (`core/http/clients/*`) contra
 *   `apps/api` (FUN-004), que por sua vez resolve `BusinessProfileManager`/`BrandingManager`/
 *   `CRMManager` sobre SQLite real (`@abp/persistence`, FUN-003) — nenhum Manager é construído no
 *   navegador para estes três domínios.
 * - Communication, Analytics, Automation, Knowledge: continuam via `ManagerRegistry` em processo
 *   (Fakes em memória, FUN-001) — nenhuma API própria existe ainda para eles (ver `buildManagers.ts`).
 *
 * Em ambos os casos, exclusivamente Commands e métodos públicos já aprovados — nenhuma regra de
 * negócio nova, nenhum acesso a Repository fora de um Manager/endpoint.
 */
export async function seedDemoData(managers: ManagerRegistry): Promise<DemoSnapshot> {
  const { communication, analytics, automation, knowledge, commerce } = managers;

  const profile = await businessProfileClient.create({ tenantId: DEMO_TENANT_ID, segment: "Floricultura", subsegment: "Varejo especializado", maturity: "elevada" });
  await businessProfileClient.validate(profile.profileId);
  await businessProfileClient.finalize(profile.profileId);

  const brandIdentity = await brandingClient.generateInitialBrandIdentity({
    tenantId: DEMO_TENANT_ID,
    primaryColorHex: "#2E7D32",
    backgroundHex: "#FFFFFF",
    titleFont: "Poppins",
    bodyFont: "Inter",
  });

  const { organization, relationship } = await crmClient.createOrganization({
    tenantId: DEMO_TENANT_ID,
    name: "Floricultura Bela Vista",
    tradeName: "Bela Vista Flores",
    taxId: "12.345.678/0001-90",
    segment: "Floricultura",
    phone: "+55 11 4000-0000",
    email: "contato@belavista.example",
    website: "https://belavista.example",
    accountManagerId: DEMO_IDENTITY_ID,
  });
  const opportunity = await crmClient.createOpportunity({
    tenantId: DEMO_TENANT_ID,
    title: "Contrato anual de fornecimento",
    value: 48000,
    relationshipId: relationship.relationshipId,
    pipelineId: "pipeline-padrao",
    stageId: "stage-qualificacao",
  });
  const lead = await crmClient.createLead({ tenantId: DEMO_TENANT_ID, name: "Ana Ferreira", email: "ana.ferreira@example.com", phone: "+55 11 90000-0000", source: "Indicação" });

  const catalog = await commerce.createCatalog(DEMO_TENANT_ID, "Catálogo Principal");
  const category = await commerce.createCategory(DEMO_TENANT_ID, "Arranjos");
  const product = await commerce.createProduct({
    tenantId: DEMO_TENANT_ID,
    catalogId: catalog.result.catalogId,
    categoryId: category.result.categoryId,
    name: "Arranjo Floral Executivo",
    description: "Item de demonstração do Product Hub — a mesma modelagem (Product/Category/Catalog/Price/Inventory) serve qualquer segmento, não apenas floricultura.",
  });
  const price = await commerce.setPrice({ productId: product.result.productId, variantId: undefined, amount: 189.9, currency: "BRL" });
  const inventory = await commerce.adjustInventory(product.result.productId, 40);

  const conversation = await communication.startConversation({ tenantId: DEMO_TENANT_ID }, [{ type: "External", referenceId: organization.organizationId }]);
  const message = await communication.sendMessage(conversation.result.conversation.conversationId, {
    tenantId: DEMO_TENANT_ID,
    threadId: "thread-principal",
    channelId: "channel-whatsapp",
    senderId: DEMO_IDENTITY_ID,
    content: "Olá! Segue a proposta de fornecimento anual conforme conversamos.",
  });

  const dataset = await analytics.createDataset(DEMO_TENANT_ID);
  const metric = await analytics.calculateMetric(
    {
      tenantId: DEMO_TENANT_ID,
      datasetId: dataset.result.datasetId,
      formula: "SUM(invoice.totalAmount)",
      windowStart: new Date("2026-07-01"),
      windowEnd: new Date("2026-07-31"),
      name: "Receita do mês",
    },
    48000,
  );
  const kpi = await analytics.calculateKPI(DEMO_TENANT_ID, [metric.result.metricId]);
  const dashboard = await analytics.createDashboard(DEMO_TENANT_ID, "Visão Geral");

  const trigger = await automation.registerTrigger(DEMO_TENANT_ID, "Time", "Diariamente às 08:00");
  const action = await automation.defineAction("SendMessage", "Enviar lembrete de renovação de contrato");
  const createdWorkflow = await automation.createWorkflow(
    DEMO_TENANT_ID,
    "Lembrete de renovação de contrato",
    trigger.result.triggerId,
    [action.result.actionId],
    DEMO_IDENTITY_ID,
  );
  const workflow = await automation.activateWorkflow(createdWorkflow.result.workflowId, DEMO_IDENTITY_ID);
  const startedExecution = await automation.startExecution(workflow.result.workflowId, trigger.result.triggerId);
  const completedExecution = await automation.completeExecution(startedExecution.result.executionId, workflow.result.workflowId, "Success");

  const procedure = await knowledge.createKnowledge({
    tenantId: DEMO_TENANT_ID,
    type: "Procedimento",
    category: "Atendimento",
    tags: ["renovação", "contrato"],
  });
  const faq = await knowledge.createKnowledge({
    tenantId: DEMO_TENANT_ID,
    type: "Documento",
    category: "Produtos",
    tags: ["catálogo"],
  });
  await knowledge.submitForReview(faq.result.assetId);
  await knowledge.approve(faq.result.assetId);
  await knowledge.publish(faq.result.assetId);

  return {
    profileId: profile.profileId,
    tenantId: DEMO_TENANT_ID,
    organization,
    relationship,
    opportunity,
    lead,
    conversation: conversation.result.conversation,
    message: message.result,
    dataset: dataset.result,
    metric: metric.result,
    kpi: kpi.result,
    dashboard: dashboard.result,
    workflow: workflow.result,
    execution: completedExecution.result.execution,
    knowledgeAssets: [procedure.result, faq.result],
    brandTokens: brandIdentity.tokens,
    catalog: catalog.result,
    category: category.result,
    product: product.result,
    price: price.result,
    inventory: inventory.result,
    commerceEvents: [...catalog.events, ...category.events, ...product.events, ...price.events, ...inventory.events],
  };
}
