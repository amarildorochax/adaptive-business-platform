/**
 * Mock de `fetch` compartilhado entre testes que exercitam `seedDemoData`/`useDashboardBootstrap`/
 * `useMoveOpportunity` — simula exatamente as respostas de `apps/api` (FUN-004) para o roteiro fixo
 * de Commands executado por `seedDemoData` (ver `core/managers/seedDemoData.ts`). Único ponto desta
 * Sprint (FUN-005) que conhece o formato das respostas HTTP para fins de teste — nenhum teste mocka
 * um Manager, per a regra explícita da Sprint ("Mockar exclusivamente a camada HTTP").
 */
export const DEMO_PROFILE_ID = "profile-demo-1";
export const DEMO_THEME_ID = "theme-demo-1";
export const DEMO_ORGANIZATION_ID = "org-demo-1";
export const DEMO_RELATIONSHIP_ID = "relationship-demo-1";
export const DEMO_OPPORTUNITY_ID = "opportunity-demo-1";
export const DEMO_IDENTITY = "demo@example.com";
export const DEMO_SESSION_ID = "session-demo-1";

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });
}

interface DemoSupplierContact {
  readonly contactId: string;
  readonly supplierId: string;
  readonly name: string;
  readonly channelId?: string;
  readonly role: string;
}

interface DemoSupplier {
  supplierId: string;
  tenantId: string;
  legalName: string;
  taxId: string;
  status: "Active" | "Disabled";
  supplyCategory?: string;
  contacts: DemoSupplierContact[];
  createdAt: string;
  updatedAt: string;
}

interface DemoMoney {
  readonly amount: number;
  readonly currencyCode: string;
}

interface DemoPurchaseOrderItem {
  readonly purchaseOrderItemId: string;
  readonly purchaseOrderId: string;
  readonly productId: string;
  readonly quantityOrdered: number;
  quantityReceived: number;
  readonly acquisitionCost: DemoMoney;
  status: string;
}

interface DemoPurchaseOrder {
  readonly purchaseOrderId: string;
  readonly tenantId: string;
  readonly supplierId: string;
  requisitionId?: string;
  status: string;
  items: DemoPurchaseOrderItem[];
  approvedByIdentityId?: string;
  readonly createdAt: string;
  updatedAt: string;
}

interface DemoReceiving {
  readonly receivingId: string;
  readonly purchaseOrderId: string;
  readonly tenantId: string;
  readonly lines: readonly { readonly purchaseOrderItemId: string; readonly quantityReceived: number }[];
  readonly receivedAt: string;
}

interface DemoRequisition {
  readonly requisitionId: string;
  readonly tenantId: string;
  readonly origin: string;
  readonly lines: readonly { readonly productId: string; readonly suggestedQuantity: number }[];
  status: string;
  purchaseOrderId?: string;
  readonly createdAt: string;
  updatedAt: string;
}

interface DemoReorderRule {
  readonly ruleId: string;
  readonly tenantId: string;
  readonly productId: string;
  readonly thresholdQuantity: number;
  readonly reorderQuantity: number;
  readonly preferredSupplierId?: string;
  active: boolean;
  readonly createdAt: string;
  updatedAt: string;
}

interface DemoStockMovement {
  readonly movementId: string;
  readonly tenantId: string;
  readonly productId: string;
  readonly variantId?: string;
  readonly locationId?: string;
  readonly quantityDelta: number;
  readonly origin: string;
  readonly originReferenceId?: string;
  readonly occurredAt: string;
}

interface DemoStockPosition {
  readonly productId: string;
  readonly locationId?: string;
  readonly quantityOnHand: number;
  readonly quantityReserved: number;
  readonly quantityAvailable: number;
  readonly recalculatedAt: string;
}

interface DemoStockReservation {
  readonly reservationId: string;
  readonly tenantId: string;
  readonly productId: string;
  readonly variantId?: string;
  readonly locationId?: string;
  readonly quantity: number;
  readonly orderId: string;
  status: string;
  readonly expiresAt?: string;
  readonly createdAt: string;
  updatedAt: string;
}

interface DemoStockLocation {
  readonly locationId: string;
  readonly tenantId: string;
  readonly name: string;
  readonly address?: { readonly line: string };
  readonly active: boolean;
  readonly createdAt: string;
}

interface DemoStockAlertRule {
  readonly ruleId: string;
  readonly tenantId: string;
  readonly productId: string;
  readonly variantId?: string;
  readonly locationId?: string;
  readonly thresholdQuantity: number;
  active: boolean;
  readonly createdAt: string;
  updatedAt: string;
}

interface DemoBOMLine {
  readonly inputProductId: string;
  readonly variantId?: string;
  readonly quantityPerOutputUnit: number;
  readonly unitOfMeasure: string;
}

interface DemoBillOfMaterials {
  readonly billOfMaterialsId: string;
  readonly tenantId: string;
  readonly outputProductId: string;
  readonly version: number;
  readonly lines: DemoBOMLine[];
  status: string;
  readonly createdAt: string;
  supersededAt?: string;
}

interface DemoProductionConsumption {
  readonly consumptionId: string;
  readonly productionOrderId: string;
  readonly inputProductId: string;
  readonly quantityConsumed: number;
  readonly acquisitionCost: number;
  readonly consumedAt: string;
}

interface DemoProductionOutput {
  readonly outputId: string;
  readonly productionOrderId: string;
  readonly outputProductId: string;
  readonly quantityGenerated: number;
  readonly generatedAt: string;
}

interface DemoProductionOrder {
  readonly productionOrderId: string;
  readonly tenantId: string;
  readonly billOfMaterialsId: string;
  readonly plannedOutputQuantity: number;
  status: string;
  readonly workCenterId?: string;
  readonly orderId?: string;
  consumptions: DemoProductionConsumption[];
  outputs: DemoProductionOutput[];
  cancelReason?: string;
  startedAt?: string;
  completedAt?: string;
  readonly createdAt: string;
  updatedAt: string;
}

interface DemoWorkCenter {
  readonly workCenterId: string;
  readonly tenantId: string;
  readonly name: string;
  readonly nominalCapacity?: number;
  active: boolean;
  readonly createdAt: string;
}

/**
 * Cria uma função compatível com `fetch` para um Tenant de demonstração — estado de Opportunity mutável entre chamadas (para refletir `moveOpportunity`), e contadores próprios para simular múltiplos registros de CRM criados na mesma sessão (FUN-103). Estado de Supplier real (IMP-205) — `suppliers`/`catalogItemSequence`/`contractSequence` simulam `apps/api` (IMP-203) o suficiente para exercitar o Supplier Workspace sem depender de um servidor real. Estado de Purchase real (IMP-305) — `purchaseOrders`/`requisitions`/`reorderRules`/`receivings` simulam `apps/api` (IMP-303) o suficiente para exercitar o Purchase Workspace sem depender de um servidor real; a máquina de estados (`PendingApproval` no primeiro item, teto de aprovação, `PartiallyReceived`/`Received`) espelha `PurchasePolicy`/`PurchaseOrderService` (Core, IMP-301) apenas na medida do necessário para os cenários exercitados por `PurchasePage.test.tsx` — nunca uma reimplementação completa do domínio.
 *
 * Estado de Inventory Movement real (IMP-405) — `stockMovements`/`stockPositions`/`stockReservations`/
 * `stockLocations`/`stockAlertRules` simulam `apps/api` (IMP-403) o suficiente para exercitar o
 * Inventory Movement Workspace sem depender de um servidor real. **Réplica deliberada de uma
 * limitação real do Core (IMP-401), nunca uma correção silenciosa**: `createStockReservation`/
 * `releaseStockReservation` (`InventoryMovementManager`, Core) nunca chamam
 * `StockPositionProjectionService.recalculate` — apenas `registerStockMovement`/
 * `convertReservationToMovement` recalculam a Stock Position. Este mock replica exatamente esse
 * comportamento: criar/liberar uma Reservation nunca atualiza `stockPositions` — `quantityReserved`/
 * `quantityAvailable` só refletem uma Reservation ativa depois que o próximo Movement/Conversion real
 * recalcula. Documentado em `IMP_405_INVENTORY_MOVEMENT_WORKSPACE_REPORT.md`, "Limitações".
 *
 * Estado de Production real (IMP-505) — `billsOfMaterials`/`productionOrders`/`workCenters` simulam
 * `apps/api` (IMP-503) o suficiente para exercitar o Production Workspace sem depender de um servidor
 * real. `startProduction` replica a mesma verificação de disponibilidade de insumo do Core
 * (`ProductionPolicy.hasSufficientInput`, IMP-501) apenas na medida do necessário para os cenários
 * exercitados por `ProductionPage.test.tsx` — nunca uma reimplementação completa do domínio.
 */
export function createDemoApiFetchMock(tenantId: string): typeof fetch {
  let opportunitySequence = 0;
  let leadSequence = 0;
  let customerSequence = 0;
  let organizationSequence = 0;
  let contactSequence = 0;
  const opportunities = new Map<string, { title: string; value: number; relationshipId: string; pipelineId: string; stageId: string; outcome: "Open" | "Won" | "Lost"; createdAt: string }>();

  let supplierSequence = 0;
  let supplierContactSequence = 0;
  let catalogItemSequence = 0;
  let contractSequence = 0;
  const suppliers = new Map<string, DemoSupplier>();

  let purchaseOrderSequence = 0;
  let purchaseOrderItemSequence = 0;
  let requisitionSequence = 0;
  let reorderRuleSequence = 0;
  let receivingSequence = 0;
  const purchaseOrders = new Map<string, DemoPurchaseOrder>();
  const requisitions = new Map<string, DemoRequisition>();
  const reorderRules = new Map<string, DemoReorderRule>();
  const receivingsByPurchaseOrder = new Map<string, DemoReceiving[]>();
  const OPEN_PURCHASE_ORDER_STATUSES = new Set(["Draft", "PendingApproval", "Approved", "Sent", "PartiallyReceived"]);

  let movementSequence = 0;
  let reservationSequence = 0;
  let stockLocationSequence = 0;
  let stockAlertRuleSequence = 0;
  const stockMovements: DemoStockMovement[] = [];
  const stockPositions = new Map<string, DemoStockPosition>();
  const stockReservations = new Map<string, DemoStockReservation>();
  const stockLocations = new Map<string, DemoStockLocation>();
  const stockAlertRules = new Map<string, DemoStockAlertRule>();

  let billOfMaterialsSequence = 0;
  let productionOrderSequence = 0;
  let consumptionSequence = 0;
  let outputSequence = 0;
  let workCenterSequence = 0;
  const billsOfMaterials = new Map<string, DemoBillOfMaterials>();
  const productionOrders = new Map<string, DemoProductionOrder>();
  const workCenters = new Map<string, DemoWorkCenter>();

  function positionKey(productId: string, locationId: string | undefined): string {
    return `${productId}::${locationId ?? ""}`;
  }

  function recalculateStockPosition(productId: string, locationId: string | undefined): DemoStockPosition {
    const quantityOnHand = stockMovements.filter((m) => m.productId === productId && m.locationId === locationId).reduce((sum, m) => sum + m.quantityDelta, 0);
    const quantityReserved = [...stockReservations.values()].filter((r) => r.productId === productId && r.locationId === locationId && r.status === "Active").reduce((sum, r) => sum + r.quantity, 0);
    const position: DemoStockPosition = { productId, locationId, quantityOnHand, quantityReserved, quantityAvailable: quantityOnHand - quantityReserved, recalculatedAt: new Date().toISOString() };
    stockPositions.set(positionKey(productId, locationId), position);
    return position;
  }

  return async function demoApiFetchMock(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
    const url = typeof input === "string" ? input : input.toString();
    const method = (init?.method ?? "GET").toUpperCase();
    const rawPath = url.replace(/^https?:\/\/[^/]+/, "");
    const [path, queryString] = rawPath.split("?");
    const query = new URLSearchParams(queryString ?? "");
    const locationIdParam = query.get("locationId") ?? undefined;

    if (method === "GET" && path === "/auth/me") {
      return jsonResponse({ identity: DEMO_IDENTITY, tenantId, sessionId: DEMO_SESSION_ID, roles: [] });
    }

    if (method === "POST" && path === "/business-profiles") {
      return jsonResponse({ profileId: DEMO_PROFILE_ID, tenantId, createdAt: new Date().toISOString() });
    }
    if (method === "GET" && path === `/business-profiles/by-tenant/${tenantId}`) {
      return jsonResponse({ profileId: DEMO_PROFILE_ID, tenantId, createdAt: new Date().toISOString() });
    }
    if (method === "POST" && path === `/business-profiles/${DEMO_PROFILE_ID}/validate`) {
      return jsonResponse({ profileId: DEMO_PROFILE_ID, stage: "Perfil Validado", enteredAt: new Date().toISOString() });
    }
    if (method === "POST" && path === `/business-profiles/${DEMO_PROFILE_ID}/finalize`) {
      return jsonResponse({ profileId: DEMO_PROFILE_ID, stage: "Perfil Inicial", enteredAt: new Date().toISOString() });
    }
    if (method === "GET" && path === `/business-profiles/${DEMO_PROFILE_ID}/stage`) {
      return jsonResponse({ stage: "Perfil Inicial" });
    }
    if (method === "GET" && path === `/business-profiles/${DEMO_PROFILE_ID}/classification`) {
      return jsonResponse({ segment: "Floricultura", subsegment: "Varejo especializado" });
    }
    if (method === "GET" && path === `/business-profiles/${DEMO_PROFILE_ID}/maturity`) {
      return jsonResponse({ maturity: "elevada" });
    }
    if (method === "POST" && path === "/branding/identity") {
      return jsonResponse({
        theme: { themeId: DEMO_THEME_ID, tenantId, version: 1, generatedAt: new Date().toISOString() },
        tokens: [
          { tokenId: "token-1", tenantId, themeId: DEMO_THEME_ID, category: "Cor", name: "cor-destaque-primaria", value: "#2E7D32" },
          { tokenId: "token-2", tenantId, themeId: DEMO_THEME_ID, category: "Cor", name: "cor-texto-primaria", value: "#FFFFFF" },
          { tokenId: "token-3", tenantId, themeId: DEMO_THEME_ID, category: "Tipografia", name: "fonte-titulo", value: "Poppins" },
          { tokenId: "token-4", tenantId, themeId: DEMO_THEME_ID, category: "Tipografia", name: "fonte-corpo", value: "Inter" },
        ],
      });
    }
    if (method === "POST" && path === "/branding/theme") {
      return jsonResponse({
        theme: { themeId: "theme-demo-2", tenantId, version: 2, generatedAt: new Date().toISOString() },
        tokens: [
          { tokenId: "token-5", tenantId, themeId: "theme-demo-2", category: "Cor", name: "cor-destaque-primaria", value: "#2E7D32" },
          { tokenId: "token-6", tenantId, themeId: "theme-demo-2", category: "Cor", name: "cor-texto-primaria", value: "#FFFFFF" },
          { tokenId: "token-7", tenantId, themeId: "theme-demo-2", category: "Tipografia", name: "fonte-titulo", value: "Poppins" },
          { tokenId: "token-8", tenantId, themeId: "theme-demo-2", category: "Tipografia", name: "fonte-corpo", value: "Inter" },
        ],
      });
    }
    if (method === "POST" && path === "/branding/palette") {
      const body = init?.body ? (JSON.parse(init.body.toString()) as { readonly primaryColorHex: string; readonly backgroundHex: string }) : undefined;
      return jsonResponse([
        { tokenId: "token-9", tenantId, themeId: DEMO_THEME_ID, category: "Cor", name: "cor-destaque-primaria", value: body?.primaryColorHex ?? "#2E7D32" },
        { tokenId: "token-10", tenantId, themeId: DEMO_THEME_ID, category: "Cor", name: "cor-texto-primaria", value: body?.backgroundHex ?? "#FFFFFF" },
      ]);
    }
    if (method === "GET" && path === `/branding/theme/${tenantId}`) {
      return jsonResponse({ themeId: DEMO_THEME_ID, tenantId, version: 1, generatedAt: new Date().toISOString() });
    }
    if (method === "GET" && path === `/branding/logos/${tenantId}`) {
      return new Response(null, { status: 404 });
    }
    if (method === "POST" && path === "/branding/logos") {
      const body = init?.body ? (JSON.parse(init.body.toString()) as { readonly assetReference: string }) : undefined;
      return jsonResponse({ logoId: "logo-demo-1", tenantId, assetReference: body?.assetReference ?? "logo.svg", uploadedAt: new Date().toISOString() }, 201);
    }
    if (method === "GET" && path === `/branding/context/${DEMO_PROFILE_ID}`) {
      return jsonResponse({ segment: "Floricultura", subsegment: "Varejo especializado", maturity: "elevada" });
    }
    if (method === "POST" && path === "/crm/organizations") {
      organizationSequence += 1;
      const body = init?.body ? (JSON.parse(init.body.toString()) as { readonly name: string; readonly accountManagerId: string }) : undefined;
      const organizationId = organizationSequence === 1 ? DEMO_ORGANIZATION_ID : `org-demo-${organizationSequence}`;
      const relationshipId = organizationSequence === 1 ? DEMO_RELATIONSHIP_ID : `relationship-demo-org-${organizationSequence}`;
      return jsonResponse({
        organization: {
          organizationId,
          tenantId,
          relationshipId,
          name: body?.name ?? "Floricultura Bela Vista",
          tradeName: organizationSequence === 1 ? "Bela Vista Flores" : undefined,
          createdAt: new Date().toISOString(),
        },
        relationship: {
          relationshipId,
          tenantId,
          partyType: "Organization",
          partyId: organizationId,
          status: "Active",
          lifecycleStage: "New",
          accountManagerId: body?.accountManagerId ?? "identity-demo",
          createdAt: new Date().toISOString(),
        },
      });
    }
    if (method === "POST" && path === "/crm/customers") {
      customerSequence += 1;
      const body = init?.body ? (JSON.parse(init.body.toString()) as { readonly name: string; readonly email?: string; readonly phone?: string; readonly accountManagerId: string }) : undefined;
      const customerId = `customer-demo-${customerSequence}`;
      const relationshipId = `relationship-demo-customer-${customerSequence}`;
      return jsonResponse({
        customer: { customerId, tenantId, relationshipId, name: body?.name ?? "Customer", email: body?.email, phone: body?.phone, createdAt: new Date().toISOString() },
        relationship: { relationshipId, tenantId, partyType: "Customer", partyId: customerId, status: "Active", lifecycleStage: "New", accountManagerId: body?.accountManagerId ?? "identity-demo", createdAt: new Date().toISOString() },
      });
    }
    if (method === "PATCH" && /^\/crm\/customers\/[^/]+$/.test(path)) {
      const customerId = path.split("/").pop()!;
      const body = init?.body ? (JSON.parse(init.body.toString()) as { readonly name?: string; readonly email?: string; readonly phone?: string }) : undefined;
      return jsonResponse({ customerId, tenantId, relationshipId: `relationship-demo-customer-${customerSequence}`, name: body?.name ?? "Customer atualizado", email: body?.email, phone: body?.phone, createdAt: new Date().toISOString() });
    }
    if (method === "POST" && path === "/crm/contacts") {
      contactSequence += 1;
      const body = init?.body ? (JSON.parse(init.body.toString()) as { readonly name: string; readonly role?: string; readonly email?: string; readonly phone?: string; readonly associationType: "Customer" | "Organization"; readonly associationId: string }) : undefined;
      return jsonResponse(
        { contactId: `contact-demo-${contactSequence}`, tenantId, name: body?.name ?? "Contact", role: body?.role, email: body?.email, phone: body?.phone, associationType: body?.associationType ?? "Organization", associationId: body?.associationId ?? DEMO_ORGANIZATION_ID, createdAt: new Date().toISOString() },
        201,
      );
    }
    if (method === "POST" && path === "/crm/opportunities") {
      opportunitySequence += 1;
      const opportunityId = opportunitySequence === 1 ? DEMO_OPPORTUNITY_ID : `opportunity-demo-${opportunitySequence}`;
      const body = init?.body ? (JSON.parse(init.body.toString()) as { readonly title: string; readonly value: number; readonly relationshipId: string; readonly pipelineId: string; readonly stageId: string }) : undefined;
      const record = { title: body?.title ?? "Contrato anual de fornecimento", value: body?.value ?? 48000, relationshipId: body?.relationshipId ?? DEMO_RELATIONSHIP_ID, pipelineId: body?.pipelineId ?? "pipeline-padrao", stageId: body?.stageId ?? "stage-qualificacao", outcome: "Open" as const, createdAt: new Date().toISOString() };
      opportunities.set(opportunityId, record);
      return jsonResponse({ opportunityId, tenantId, ...record });
    }
    if (method === "POST" && /^\/crm\/opportunities\/[^/]+\/move$/.test(path)) {
      const opportunityId = path.split("/")[3];
      const body = init?.body ? (JSON.parse(init.body.toString()) as { readonly stageId: string; readonly outcome?: "Open" | "Won" | "Lost" }) : undefined;
      const existing = opportunities.get(opportunityId) ?? { title: "Contrato anual de fornecimento", value: 48000, relationshipId: DEMO_RELATIONSHIP_ID, pipelineId: "pipeline-padrao", stageId: "stage-qualificacao", outcome: "Open" as const, createdAt: new Date().toISOString() };
      const updated = { ...existing, stageId: body?.stageId ?? existing.stageId, outcome: body?.outcome ?? existing.outcome };
      opportunities.set(opportunityId, updated);
      return jsonResponse({ opportunityId, tenantId, ...updated });
    }
    if (method === "POST" && path === "/crm/leads") {
      leadSequence += 1;
      const body = init?.body ? (JSON.parse(init.body.toString()) as { readonly name: string; readonly email?: string; readonly phone?: string; readonly source: string }) : undefined;
      const leadId = leadSequence === 1 ? "lead-demo-1" : `lead-demo-${leadSequence}`;
      return jsonResponse({ leadId, tenantId, name: body?.name ?? "Ana Ferreira", email: body?.email ?? "ana.ferreira@example.com", phone: body?.phone ?? "+55 11 90000-0000", source: body?.source ?? "Indicação", createdAt: new Date().toISOString() });
    }
    if (method === "POST" && /^\/crm\/leads\/[^/]+\/convert$/.test(path)) {
      customerSequence += 1;
      const body = init?.body ? (JSON.parse(init.body.toString()) as { readonly accountManagerId: string }) : undefined;
      const customerId = `customer-demo-${customerSequence}`;
      const relationshipId = `relationship-demo-customer-${customerSequence}`;
      return jsonResponse({
        customer: { customerId, tenantId, relationshipId, name: "Ana Ferreira", email: "ana.ferreira@example.com", phone: "+55 11 90000-0000", createdAt: new Date().toISOString() },
        relationship: { relationshipId, tenantId, partyType: "Customer", partyId: customerId, status: "Active", lifecycleStage: "New", accountManagerId: body?.accountManagerId ?? "identity-demo", createdAt: new Date().toISOString() },
      });
    }

    if (method === "POST" && path === "/suppliers") {
      const body = init?.body ? (JSON.parse(init.body.toString()) as { readonly tenantId: string; readonly legalName: string; readonly taxId: string; readonly supplyCategory?: string }) : undefined;
      const existing = [...suppliers.values()].find((candidate) => candidate.tenantId === (body?.tenantId ?? tenantId) && candidate.taxId === body?.taxId);
      if (existing) {
        return jsonResponse({ error: { code: "CONFLICT", message: "Já existe um Supplier com este identificador fiscal.", correlationId: "demo-corr-1" } }, 409);
      }
      supplierSequence += 1;
      const now = new Date().toISOString();
      const supplier: DemoSupplier = { supplierId: `supplier-demo-${supplierSequence}`, tenantId: body?.tenantId ?? tenantId, legalName: body?.legalName ?? "Fornecedor", taxId: body?.taxId ?? "12345678000199", status: "Active", supplyCategory: body?.supplyCategory, contacts: [], createdAt: now, updatedAt: now };
      suppliers.set(supplier.supplierId, supplier);
      return jsonResponse(supplier, 201);
    }
    if (method === "GET" && path === `/suppliers/by-tenant/${tenantId}`) {
      return jsonResponse([...suppliers.values()].filter((supplier) => supplier.status === "Active"));
    }
    if (method === "GET" && /^\/suppliers\/[^/]+$/.test(path)) {
      const supplierId = path.split("/").pop()!;
      const supplier = suppliers.get(supplierId);
      return supplier ? jsonResponse(supplier) : jsonResponse({ error: { code: "NOT_FOUND", message: "Supplier não encontrado.", correlationId: "demo-corr-1" } }, 404);
    }
    if (method === "PATCH" && /^\/suppliers\/[^/]+$/.test(path)) {
      const supplierId = path.split("/").pop()!;
      const existing = suppliers.get(supplierId);
      if (!existing) {
        return jsonResponse({ error: { code: "NOT_FOUND", message: "Supplier não encontrado.", correlationId: "demo-corr-1" } }, 404);
      }
      const body = init?.body ? (JSON.parse(init.body.toString()) as Partial<Pick<DemoSupplier, "legalName" | "taxId" | "supplyCategory">>) : undefined;
      const updated: DemoSupplier = { ...existing, ...body, updatedAt: new Date().toISOString() };
      suppliers.set(supplierId, updated);
      return jsonResponse(updated);
    }
    if (method === "POST" && /^\/suppliers\/[^/]+\/disable$/.test(path)) {
      const supplierId = path.split("/")[2];
      const existing = suppliers.get(supplierId);
      if (!existing) {
        return jsonResponse({ error: { code: "NOT_FOUND", message: "Supplier não encontrado.", correlationId: "demo-corr-1" } }, 404);
      }
      if (existing.status === "Disabled") {
        return jsonResponse({ error: { code: "CONFLICT", message: "Transição de status inválida: Disabled → Disabled.", correlationId: "demo-corr-1" } }, 409);
      }
      const updated: DemoSupplier = { ...existing, status: "Disabled", updatedAt: new Date().toISOString() };
      suppliers.set(supplierId, updated);
      return jsonResponse(updated);
    }
    if (method === "POST" && /^\/suppliers\/[^/]+\/reactivate$/.test(path)) {
      const supplierId = path.split("/")[2];
      const existing = suppliers.get(supplierId);
      if (!existing) {
        return jsonResponse({ error: { code: "NOT_FOUND", message: "Supplier não encontrado.", correlationId: "demo-corr-1" } }, 404);
      }
      const updated: DemoSupplier = { ...existing, status: "Active", updatedAt: new Date().toISOString() };
      suppliers.set(supplierId, updated);
      return jsonResponse(updated);
    }
    if (method === "POST" && /^\/suppliers\/[^/]+\/contacts$/.test(path)) {
      const supplierId = path.split("/")[2];
      const existing = suppliers.get(supplierId);
      if (!existing) {
        return jsonResponse({ error: { code: "NOT_FOUND", message: "Supplier não encontrado.", correlationId: "demo-corr-1" } }, 404);
      }
      const body = init?.body ? (JSON.parse(init.body.toString()) as { readonly name: string; readonly channelId?: string; readonly role: string }) : undefined;
      supplierContactSequence += 1;
      const contact: DemoSupplierContact = { contactId: `supplier-contact-demo-${supplierContactSequence}`, supplierId, name: body?.name ?? "Contato", channelId: body?.channelId, role: body?.role ?? "Commercial" };
      const updated: DemoSupplier = { ...existing, contacts: [...existing.contacts, contact], updatedAt: new Date().toISOString() };
      suppliers.set(supplierId, updated);
      return jsonResponse(updated, 201);
    }
    if (method === "POST" && path === "/supplier-catalog-items") {
      catalogItemSequence += 1;
      const body = init?.body
        ? (JSON.parse(init.body.toString()) as { readonly supplierId: string; readonly tenantId: string; readonly productId: string; readonly listPrice: { amount: number; currencyCode: string }; readonly leadTimeInDays: number; readonly minimumOrderQuantity: number })
        : undefined;
      return jsonResponse(
        { catalogItemId: `catalog-item-demo-${catalogItemSequence}`, supplierId: body?.supplierId, tenantId: body?.tenantId ?? tenantId, productId: body?.productId ?? "product-demo-1", listPrice: body?.listPrice ?? { amount: 0, currencyCode: "BRL" }, leadTimeInDays: body?.leadTimeInDays ?? 0, minimumOrderQuantity: body?.minimumOrderQuantity ?? 0, createdAt: new Date().toISOString() },
        201,
      );
    }
    if (method === "POST" && path === "/supplier-contracts") {
      contractSequence += 1;
      const body = init?.body
        ? (JSON.parse(init.body.toString()) as { readonly supplierId: string; readonly tenantId: string; readonly startsAt: string; readonly endsAt?: string; readonly paymentTermsDueInDays: number; readonly minimumVolume?: number })
        : undefined;
      return jsonResponse(
        { contractId: `contract-demo-${contractSequence}`, supplierId: body?.supplierId, tenantId: body?.tenantId ?? tenantId, startsAt: body?.startsAt ?? new Date().toISOString(), endsAt: body?.endsAt, paymentTermsDueInDays: body?.paymentTermsDueInDays ?? 30, minimumVolume: body?.minimumVolume, createdAt: new Date().toISOString() },
        201,
      );
    }

    if (method === "POST" && path === "/purchase-orders") {
      const body = init?.body ? (JSON.parse(init.body.toString()) as { readonly tenantId: string; readonly supplierId: string }) : undefined;
      purchaseOrderSequence += 1;
      const now = new Date().toISOString();
      const purchaseOrder: DemoPurchaseOrder = { purchaseOrderId: `po-demo-${purchaseOrderSequence}`, tenantId: body?.tenantId ?? tenantId, supplierId: body?.supplierId ?? "supplier-demo-1", status: "Draft", items: [], createdAt: now, updatedAt: now };
      purchaseOrders.set(purchaseOrder.purchaseOrderId, purchaseOrder);
      return jsonResponse(purchaseOrder, 201);
    }
    if (method === "GET" && path === `/purchase-orders/by-tenant/${tenantId}/open`) {
      return jsonResponse([...purchaseOrders.values()].filter((po) => po.tenantId === tenantId && OPEN_PURCHASE_ORDER_STATUSES.has(po.status)));
    }
    if (method === "GET" && /^\/purchase-orders\/by-supplier\/[^/]+$/.test(path)) {
      const supplierId = path.split("/").pop()!;
      return jsonResponse([...purchaseOrders.values()].filter((po) => po.supplierId === supplierId));
    }
    if (method === "GET" && /^\/purchase-orders\/[^/]+\/receivings$/.test(path)) {
      const purchaseOrderId = path.split("/")[2];
      return jsonResponse(receivingsByPurchaseOrder.get(purchaseOrderId) ?? []);
    }
    if (method === "POST" && /^\/purchase-orders\/[^/]+\/items$/.test(path)) {
      const purchaseOrderId = path.split("/")[2];
      const existing = purchaseOrders.get(purchaseOrderId);
      if (!existing) {
        return jsonResponse({ error: { code: "NOT_FOUND", message: "Purchase Order não encontrado.", correlationId: "demo-corr-1" } }, 404);
      }
      if (existing.status !== "Draft" && existing.status !== "PendingApproval") {
        return jsonResponse({ error: { code: "PURCHASE_ORDER_ITEM_ADDITION_NOT_ALLOWED", message: `Purchase Order ${purchaseOrderId} não aceita novos itens.`, correlationId: "demo-corr-1" } }, 409);
      }
      const body = init?.body ? (JSON.parse(init.body.toString()) as { readonly productId: string; readonly quantityOrdered: number; readonly acquisitionCost: DemoMoney }) : undefined;
      purchaseOrderItemSequence += 1;
      const item: DemoPurchaseOrderItem = { purchaseOrderItemId: `poi-demo-${purchaseOrderItemSequence}`, purchaseOrderId, productId: body?.productId ?? "product-demo-1", quantityOrdered: body?.quantityOrdered ?? 1, quantityReceived: 0, acquisitionCost: body?.acquisitionCost ?? { amount: 0, currencyCode: "BRL" }, status: "Pending" };
      existing.items.push(item);
      existing.status = "PendingApproval";
      existing.updatedAt = new Date().toISOString();
      return jsonResponse(existing, 201);
    }
    if (method === "POST" && /^\/purchase-orders\/[^/]+\/approve$/.test(path)) {
      const purchaseOrderId = path.split("/")[2];
      const existing = purchaseOrders.get(purchaseOrderId);
      if (!existing) {
        return jsonResponse({ error: { code: "NOT_FOUND", message: "Purchase Order não encontrado.", correlationId: "demo-corr-1" } }, 404);
      }
      const body = init?.body ? (JSON.parse(init.body.toString()) as { readonly threshold: DemoMoney; readonly approvedByIdentityId?: string }) : undefined;
      const total = existing.items.reduce((sum, item) => sum + item.acquisitionCost.amount * item.quantityOrdered, 0);
      if (body && total > body.threshold.amount && !body.approvedByIdentityId) {
        return jsonResponse({ error: { code: "PURCHASE_ORDER_APPROVAL_REQUIRES_IDENTITY", message: `Purchase Order ${purchaseOrderId} excede o teto de aprovação automática e requer uma identidade de aprovação explícita.`, correlationId: "demo-corr-1" } }, 422);
      }
      existing.status = "Approved";
      existing.approvedByIdentityId = body?.approvedByIdentityId;
      existing.updatedAt = new Date().toISOString();
      return jsonResponse(existing);
    }
    if (method === "POST" && /^\/purchase-orders\/[^/]+\/send$/.test(path)) {
      const purchaseOrderId = path.split("/")[2];
      const existing = purchaseOrders.get(purchaseOrderId);
      if (!existing) {
        return jsonResponse({ error: { code: "NOT_FOUND", message: "Purchase Order não encontrado.", correlationId: "demo-corr-1" } }, 404);
      }
      existing.status = "Sent";
      existing.updatedAt = new Date().toISOString();
      return jsonResponse(existing);
    }
    if (method === "POST" && /^\/purchase-orders\/[^/]+\/cancel$/.test(path)) {
      const purchaseOrderId = path.split("/")[2];
      const existing = purchaseOrders.get(purchaseOrderId);
      if (!existing) {
        return jsonResponse({ error: { code: "NOT_FOUND", message: "Purchase Order não encontrado.", correlationId: "demo-corr-1" } }, 404);
      }
      if (existing.status === "PartiallyReceived" || existing.status === "Received") {
        return jsonResponse({ error: { code: "PURCHASE_ORDER_HAS_RECEIVING_CANNOT_CANCEL", message: `Purchase Order ${purchaseOrderId} já possui Receiving registrado.`, correlationId: "demo-corr-1" } }, 409);
      }
      existing.status = "Cancelled";
      existing.updatedAt = new Date().toISOString();
      return jsonResponse(existing);
    }
    if (method === "POST" && path === "/receivings") {
      const body = init?.body
        ? (JSON.parse(init.body.toString()) as { readonly purchaseOrderId: string; readonly tenantId: string; readonly lines: readonly { readonly purchaseOrderItemId: string; readonly quantityReceived: number }[]; readonly receivedAt: string })
        : undefined;
      const purchaseOrderId = body?.purchaseOrderId ?? "";
      const existing = purchaseOrders.get(purchaseOrderId);
      if (!existing || !body) {
        return jsonResponse({ error: { code: "NOT_FOUND", message: "Purchase Order não encontrado.", correlationId: "demo-corr-1" } }, 404);
      }
      for (const line of body.lines) {
        const item = existing.items.find((candidate) => candidate.purchaseOrderItemId === line.purchaseOrderItemId);
        if (item) {
          item.quantityReceived += line.quantityReceived;
          item.status = item.quantityReceived >= item.quantityOrdered ? "Received" : "PartiallyReceived";
        }
      }
      const fullyReceived = existing.items.every((item) => item.status === "Received");
      existing.status = fullyReceived ? "Received" : "PartiallyReceived";
      existing.updatedAt = new Date().toISOString();

      receivingSequence += 1;
      const receiving: DemoReceiving = { receivingId: `receiving-demo-${receivingSequence}`, purchaseOrderId, tenantId: body.tenantId, lines: body.lines, receivedAt: body.receivedAt };
      const existingReceivings = receivingsByPurchaseOrder.get(purchaseOrderId) ?? [];
      receivingsByPurchaseOrder.set(purchaseOrderId, [...existingReceivings, receiving]);

      return jsonResponse({ receiving, purchaseOrder: existing, fullyReceived }, 201);
    }

    if (method === "POST" && path === "/purchase-requisitions") {
      const body = init?.body ? (JSON.parse(init.body.toString()) as { readonly tenantId: string; readonly origin: string; readonly lines: readonly { readonly productId: string; readonly suggestedQuantity: number }[] }) : undefined;
      requisitionSequence += 1;
      const now = new Date().toISOString();
      const requisition: DemoRequisition = { requisitionId: `req-demo-${requisitionSequence}`, tenantId: body?.tenantId ?? tenantId, origin: body?.origin ?? "Manual", lines: body?.lines ?? [], status: "Open", createdAt: now, updatedAt: now };
      requisitions.set(requisition.requisitionId, requisition);
      return jsonResponse(requisition, 201);
    }
    if (method === "GET" && new RegExp(`^/purchase-requisitions/by-tenant/${tenantId}/status/[^/]+$`).test(path)) {
      const status = path.split("/").pop()!;
      return jsonResponse([...requisitions.values()].filter((requisition) => requisition.tenantId === tenantId && requisition.status === status));
    }
    if (method === "POST" && /^\/purchase-requisitions\/[^/]+\/approve$/.test(path)) {
      const requisitionId = path.split("/")[2];
      const existing = requisitions.get(requisitionId);
      if (!existing) {
        return jsonResponse({ error: { code: "NOT_FOUND", message: "Purchase Requisition não encontrada.", correlationId: "demo-corr-1" } }, 404);
      }
      existing.status = "Approved";
      existing.updatedAt = new Date().toISOString();
      return jsonResponse(existing);
    }
    if (method === "POST" && /^\/purchase-requisitions\/[^/]+\/reject$/.test(path)) {
      const requisitionId = path.split("/")[2];
      const existing = requisitions.get(requisitionId);
      if (!existing) {
        return jsonResponse({ error: { code: "NOT_FOUND", message: "Purchase Requisition não encontrada.", correlationId: "demo-corr-1" } }, 404);
      }
      existing.status = "Rejected";
      existing.updatedAt = new Date().toISOString();
      return jsonResponse(existing);
    }
    if (method === "POST" && /^\/purchase-requisitions\/[^/]+\/convert$/.test(path)) {
      const requisitionId = path.split("/")[2];
      const existing = requisitions.get(requisitionId);
      if (!existing) {
        return jsonResponse({ error: { code: "NOT_FOUND", message: "Purchase Requisition não encontrada.", correlationId: "demo-corr-1" } }, 404);
      }
      if (existing.status !== "Approved") {
        return jsonResponse({ error: { code: "PURCHASE_REQUISITION_NOT_APPROVED", message: `Purchase Requisition ${requisitionId} não está aprovada.`, correlationId: "demo-corr-1" } }, 409);
      }
      const body = init?.body ? (JSON.parse(init.body.toString()) as { readonly supplierId: string; readonly acquisitionCosts: readonly { readonly productId: string; readonly cost: DemoMoney }[] }) : undefined;
      const costs = new Map((body?.acquisitionCosts ?? []).map((entry) => [entry.productId, entry.cost]));
      const missing = existing.lines.find((line) => !costs.has(line.productId));
      if (missing) {
        return jsonResponse({ error: { code: "PURCHASE_MISSING_ACQUISITION_COST", message: `Nenhum custo de aquisição foi informado para o produto ${missing.productId}.`, correlationId: "demo-corr-1" } }, 422);
      }

      purchaseOrderSequence += 1;
      const now = new Date().toISOString();
      const items: DemoPurchaseOrderItem[] = existing.lines.map((line) => {
        purchaseOrderItemSequence += 1;
        return { purchaseOrderItemId: `poi-demo-${purchaseOrderItemSequence}`, purchaseOrderId: `po-demo-${purchaseOrderSequence}`, productId: line.productId, quantityOrdered: line.suggestedQuantity, quantityReceived: 0, acquisitionCost: costs.get(line.productId)!, status: "Pending" };
      });
      const purchaseOrder: DemoPurchaseOrder = { purchaseOrderId: `po-demo-${purchaseOrderSequence}`, tenantId: existing.tenantId, supplierId: body?.supplierId ?? "supplier-demo-1", requisitionId, status: "PendingApproval", items, createdAt: now, updatedAt: now };
      purchaseOrders.set(purchaseOrder.purchaseOrderId, purchaseOrder);

      existing.status = "ConvertedToPurchaseOrder";
      existing.purchaseOrderId = purchaseOrder.purchaseOrderId;
      existing.updatedAt = now;

      return jsonResponse({ requisition: existing, purchaseOrder }, 201);
    }

    if (method === "POST" && path === "/reorder-rules") {
      const body = init?.body ? (JSON.parse(init.body.toString()) as { readonly tenantId: string; readonly productId: string; readonly thresholdQuantity: number; readonly reorderQuantity: number; readonly preferredSupplierId?: string }) : undefined;
      reorderRuleSequence += 1;
      const now = new Date().toISOString();
      const rule: DemoReorderRule = { ruleId: `rule-demo-${reorderRuleSequence}`, tenantId: body?.tenantId ?? tenantId, productId: body?.productId ?? "product-demo-1", thresholdQuantity: body?.thresholdQuantity ?? 10, reorderQuantity: body?.reorderQuantity ?? 50, preferredSupplierId: body?.preferredSupplierId, active: true, createdAt: now, updatedAt: now };
      reorderRules.set(rule.ruleId, rule);
      return jsonResponse(rule, 201);
    }
    if (method === "POST" && /^\/reorder-rules\/[^/]+\/deactivate$/.test(path)) {
      const ruleId = path.split("/")[2];
      const existing = reorderRules.get(ruleId);
      if (!existing) {
        return jsonResponse({ error: { code: "NOT_FOUND", message: "Reorder Rule não encontrada.", correlationId: "demo-corr-1" } }, 404);
      }
      existing.active = false;
      existing.updatedAt = new Date().toISOString();
      return jsonResponse(existing);
    }
    if (method === "POST" && /^\/reorder-rules\/[^/]+\/evaluate$/.test(path)) {
      const ruleId = path.split("/")[2];
      const existing = reorderRules.get(ruleId);
      if (!existing) {
        return jsonResponse({ error: { code: "NOT_FOUND", message: "Reorder Rule não encontrada.", correlationId: "demo-corr-1" } }, 404);
      }
      const body = init?.body ? (JSON.parse(init.body.toString()) as { readonly currentQuantity: number }) : undefined;
      const triggered = existing.active && (body?.currentQuantity ?? 0) <= existing.thresholdQuantity;
      if (!triggered) {
        return jsonResponse({ rule: existing, triggered: false });
      }
      requisitionSequence += 1;
      const now = new Date().toISOString();
      const requisition: DemoRequisition = { requisitionId: `req-demo-${requisitionSequence}`, tenantId: existing.tenantId, origin: "ReorderRule", lines: [{ productId: existing.productId, suggestedQuantity: existing.reorderQuantity }], status: "Open", createdAt: now, updatedAt: now };
      requisitions.set(requisition.requisitionId, requisition);
      return jsonResponse({ rule: existing, triggered: true, requisition });
    }

    if (method === "POST" && path === "/stock-movements") {
      const body = init?.body
        ? (JSON.parse(init.body.toString()) as { readonly tenantId: string; readonly productId: string; readonly variantId?: string; readonly locationId?: string; readonly quantityDelta: number; readonly origin: string; readonly originReferenceId?: string; readonly occurredAt?: string })
        : undefined;
      if (!body || body.quantityDelta === 0) {
        return jsonResponse({ error: { code: "INVENTORY_INVALID_QUANTITY_DELTA", message: "Quantidade de movimentação inválida — deve ser um inteiro diferente de zero.", correlationId: "demo-corr-1" } }, 422);
      }
      if ((body.origin === "ProductionConsumption" || body.origin === "ProductionOutput") && !body.originReferenceId) {
        return jsonResponse({ error: { code: "INVENTORY_MOVEMENT_ORIGIN_REFERENCE_REQUIRED", message: `Movimentação de origem ${body.origin} exige originReferenceId.`, correlationId: "demo-corr-1" } }, 422);
      }
      movementSequence += 1;
      const movement: DemoStockMovement = { movementId: `movement-demo-${movementSequence}`, tenantId: body.tenantId, productId: body.productId, variantId: body.variantId, locationId: body.locationId, quantityDelta: body.quantityDelta, origin: body.origin, originReferenceId: body.originReferenceId, occurredAt: body.occurredAt ?? new Date().toISOString() };
      stockMovements.push(movement);
      const position = recalculateStockPosition(body.productId, body.locationId);
      return jsonResponse({ movement, position }, 201);
    }
    if (method === "GET" && /^\/stock-movements\/by-product\/[^/]+$/.test(path)) {
      const productId = path.split("/").pop()!;
      const filtered = stockMovements.filter((m) => m.productId === productId && (locationIdParam === undefined || m.locationId === locationIdParam));
      return jsonResponse(filtered);
    }
    if (method === "GET" && /^\/stock-movements\/by-origin-reference\/[^/]+$/.test(path)) {
      const originReferenceId = path.split("/").pop()!;
      return jsonResponse(stockMovements.filter((m) => m.originReferenceId === originReferenceId));
    }
    if (method === "GET" && /^\/stock-positions\/[^/]+$/.test(path)) {
      const productId = path.split("/").pop()!;
      const position = stockPositions.get(positionKey(productId, locationIdParam));
      return position ? jsonResponse(position) : jsonResponse({ error: { code: "NOT_FOUND", message: `Stock Position para o produto ${productId} ainda não foi recalculada.`, correlationId: "demo-corr-1" } }, 404);
    }

    if (method === "POST" && path === "/stock-reservations") {
      const body = init?.body
        ? (JSON.parse(init.body.toString()) as { readonly tenantId: string; readonly productId: string; readonly variantId?: string; readonly locationId?: string; readonly quantity: number; readonly orderId: string; readonly expiresAt?: string })
        : undefined;
      if (!body) {
        return jsonResponse({ error: { code: "BAD_REQUEST", message: "Corpo ausente.", correlationId: "demo-corr-1" } }, 400);
      }
      const position = stockPositions.get(positionKey(body.productId, body.locationId));
      const available = position?.quantityAvailable ?? 0;
      if (body.quantity > available) {
        return jsonResponse({ error: { code: "STOCK_RESERVATION_EXCEEDS_AVAILABLE", message: `Quantidade reservada para o produto ${body.productId} excede a quantidade disponível em estoque.`, correlationId: "demo-corr-1" } }, 422);
      }
      reservationSequence += 1;
      const now = new Date().toISOString();
      const reservation: DemoStockReservation = { reservationId: `reservation-demo-${reservationSequence}`, tenantId: body.tenantId, productId: body.productId, variantId: body.variantId, locationId: body.locationId, quantity: body.quantity, orderId: body.orderId, status: "Active", expiresAt: body.expiresAt, createdAt: now, updatedAt: now };
      stockReservations.set(reservation.reservationId, reservation);
      return jsonResponse(reservation, 201);
    }
    if (method === "GET" && /^\/stock-reservations\/by-order\/[^/]+$/.test(path)) {
      const orderId = path.split("/").pop()!;
      return jsonResponse([...stockReservations.values()].filter((r) => r.orderId === orderId));
    }
    if (method === "GET" && /^\/stock-reservations\/[^/]+$/.test(path)) {
      const reservationId = path.split("/").pop()!;
      const reservation = stockReservations.get(reservationId);
      return reservation ? jsonResponse(reservation) : jsonResponse({ error: { code: "NOT_FOUND", message: `Stock Reservation ${reservationId} não encontrada.`, correlationId: "demo-corr-1" } }, 404);
    }
    if (method === "POST" && /^\/stock-reservations\/[^/]+\/release$/.test(path)) {
      const reservationId = path.split("/")[2];
      const existing = stockReservations.get(reservationId);
      if (!existing) {
        return jsonResponse({ error: { code: "NOT_FOUND", message: `Stock Reservation ${reservationId} não encontrada.`, correlationId: "demo-corr-1" } }, 404);
      }
      if (existing.status !== "Active") {
        return jsonResponse({ error: { code: "STOCK_RESERVATION_INVALID_STATUS_TRANSITION", message: `Transição de status de Stock Reservation inválida: ${existing.status} → Released.`, correlationId: "demo-corr-1" } }, 409);
      }
      existing.status = "Released";
      existing.updatedAt = new Date().toISOString();
      return jsonResponse(existing);
    }
    if (method === "POST" && /^\/stock-reservations\/[^/]+\/convert$/.test(path)) {
      const reservationId = path.split("/")[2];
      const existing = stockReservations.get(reservationId);
      if (!existing) {
        return jsonResponse({ error: { code: "NOT_FOUND", message: `Stock Reservation ${reservationId} não encontrada.`, correlationId: "demo-corr-1" } }, 404);
      }
      if (existing.status !== "Active") {
        return jsonResponse({ error: { code: "STOCK_RESERVATION_INVALID_STATUS_TRANSITION", message: `Transição de status de Stock Reservation inválida: ${existing.status} → ConvertedToMovement.`, correlationId: "demo-corr-1" } }, 409);
      }
      existing.status = "ConvertedToMovement";
      existing.updatedAt = new Date().toISOString();

      movementSequence += 1;
      const movement: DemoStockMovement = { movementId: `movement-demo-${movementSequence}`, tenantId: existing.tenantId, productId: existing.productId, variantId: existing.variantId, locationId: existing.locationId, quantityDelta: -existing.quantity, origin: "SaleFulfillment", originReferenceId: existing.orderId, occurredAt: new Date().toISOString() };
      stockMovements.push(movement);
      const position = recalculateStockPosition(existing.productId, existing.locationId);

      return jsonResponse({ reservation: existing, movement, position });
    }

    if (method === "POST" && path === "/stock-locations") {
      const body = init?.body ? (JSON.parse(init.body.toString()) as { readonly tenantId: string; readonly name: string; readonly address?: { readonly line: string } }) : undefined;
      if (!body?.name.trim()) {
        return jsonResponse({ error: { code: "INVENTORY_INVALID_STOCK_LOCATION", message: "Stock Location inválida — o nome é obrigatório e não pode ser vazio.", correlationId: "demo-corr-1" } }, 422);
      }
      stockLocationSequence += 1;
      const location: DemoStockLocation = { locationId: `location-demo-${stockLocationSequence}`, tenantId: body.tenantId, name: body.name, address: body.address, active: true, createdAt: new Date().toISOString() };
      stockLocations.set(location.locationId, location);
      return jsonResponse(location, 201);
    }
    if (method === "GET" && new RegExp(`^/stock-locations/by-tenant/${tenantId}/active$`).test(path)) {
      return jsonResponse([...stockLocations.values()].filter((l) => l.tenantId === tenantId && l.active));
    }

    if (method === "POST" && path === "/stock-alert-rules") {
      const body = init?.body ? (JSON.parse(init.body.toString()) as { readonly tenantId: string; readonly productId: string; readonly variantId?: string; readonly locationId?: string; readonly thresholdQuantity: number }) : undefined;
      stockAlertRuleSequence += 1;
      const now = new Date().toISOString();
      const rule: DemoStockAlertRule = { ruleId: `stock-alert-rule-demo-${stockAlertRuleSequence}`, tenantId: body?.tenantId ?? tenantId, productId: body?.productId ?? "product-demo-1", variantId: body?.variantId, locationId: body?.locationId, thresholdQuantity: body?.thresholdQuantity ?? 0, active: true, createdAt: now, updatedAt: now };
      stockAlertRules.set(rule.ruleId, rule);
      return jsonResponse(rule, 201);
    }
    if (method === "POST" && /^\/stock-alert-rules\/[^/]+\/deactivate$/.test(path)) {
      const ruleId = path.split("/")[2];
      const existing = stockAlertRules.get(ruleId);
      if (!existing) {
        return jsonResponse({ error: { code: "NOT_FOUND", message: `Stock Alert Rule ${ruleId} não encontrada.`, correlationId: "demo-corr-1" } }, 404);
      }
      existing.active = false;
      existing.updatedAt = new Date().toISOString();
      return jsonResponse(existing);
    }

    if (method === "POST" && path === "/bills-of-materials") {
      const body = init?.body
        ? (JSON.parse(init.body.toString()) as { readonly tenantId: string; readonly outputProductId: string; readonly lines: DemoBOMLine[] })
        : undefined;
      if (!body) {
        return jsonResponse({ error: { code: "BAD_REQUEST", message: "Corpo ausente.", correlationId: "demo-corr-1" } }, 400);
      }
      billOfMaterialsSequence += 1;
      const bom: DemoBillOfMaterials = { billOfMaterialsId: `bom-demo-${billOfMaterialsSequence}`, tenantId: body.tenantId, outputProductId: body.outputProductId, version: 1, lines: body.lines, status: "Active", createdAt: new Date().toISOString() };
      billsOfMaterials.set(bom.billOfMaterialsId, bom);
      return jsonResponse(bom, 201);
    }
    if (method === "POST" && /^\/bills-of-materials\/[^/]+\/supersede$/.test(path)) {
      const billOfMaterialsId = path.split("/")[2];
      const existing = billsOfMaterials.get(billOfMaterialsId);
      if (!existing) {
        return jsonResponse({ error: { code: "PRODUCTION_BILL_OF_MATERIALS_NOT_FOUND", message: `BillOfMaterials ${billOfMaterialsId} não encontrada.`, correlationId: "demo-corr-1" } }, 404);
      }
      if (existing.status !== "Active") {
        return jsonResponse({ error: { code: "PRODUCTION_BILL_OF_MATERIALS_NOT_ACTIVE", message: `BillOfMaterials ${billOfMaterialsId} não está ativa.`, correlationId: "demo-corr-1" } }, 409);
      }
      const body = init?.body ? (JSON.parse(init.body.toString()) as { readonly lines: DemoBOMLine[] }) : undefined;
      existing.status = "Superseded";
      existing.supersededAt = new Date().toISOString();
      billOfMaterialsSequence += 1;
      const next: DemoBillOfMaterials = { billOfMaterialsId: `bom-demo-${billOfMaterialsSequence}`, tenantId: existing.tenantId, outputProductId: existing.outputProductId, version: existing.version + 1, lines: body?.lines ?? [], status: "Active", createdAt: new Date().toISOString() };
      billsOfMaterials.set(next.billOfMaterialsId, next);
      return jsonResponse({ previous: existing, next }, 201);
    }
    if (method === "GET" && /^\/bills-of-materials\/by-product\/[^/]+\/active$/.test(path)) {
      const outputProductId = path.split("/")[3];
      const found = [...billsOfMaterials.values()].find((bom) => bom.outputProductId === outputProductId && bom.status === "Active");
      return found ? jsonResponse(found) : jsonResponse({ error: { code: "NOT_FOUND", message: `Nenhuma BillOfMaterials ativa encontrada para o produto ${outputProductId}.`, correlationId: "demo-corr-1" } }, 404);
    }
    if (method === "GET" && /^\/bills-of-materials\/[^/]+$/.test(path)) {
      const billOfMaterialsId = path.split("/").pop()!;
      const found = billsOfMaterials.get(billOfMaterialsId);
      return found ? jsonResponse(found) : jsonResponse({ error: { code: "NOT_FOUND", message: `BillOfMaterials ${billOfMaterialsId} não encontrada.`, correlationId: "demo-corr-1" } }, 404);
    }

    if (method === "POST" && path === "/production-orders") {
      const body = init?.body
        ? (JSON.parse(init.body.toString()) as { readonly tenantId: string; readonly billOfMaterialsId: string; readonly plannedOutputQuantity: number; readonly workCenterId?: string; readonly orderId?: string })
        : undefined;
      if (!body) {
        return jsonResponse({ error: { code: "BAD_REQUEST", message: "Corpo ausente.", correlationId: "demo-corr-1" } }, 400);
      }
      const bom = billsOfMaterials.get(body.billOfMaterialsId);
      if (!bom) {
        return jsonResponse({ error: { code: "PRODUCTION_BILL_OF_MATERIALS_NOT_FOUND", message: `BillOfMaterials ${body.billOfMaterialsId} não encontrada.`, correlationId: "demo-corr-1" } }, 404);
      }
      if (bom.status !== "Active") {
        return jsonResponse({ error: { code: "PRODUCTION_BILL_OF_MATERIALS_NOT_ACTIVE", message: `BillOfMaterials ${body.billOfMaterialsId} não está ativa.`, correlationId: "demo-corr-1" } }, 409);
      }
      productionOrderSequence += 1;
      const now = new Date().toISOString();
      const order: DemoProductionOrder = {
        productionOrderId: `po-demo-${productionOrderSequence}`,
        tenantId: body.tenantId,
        billOfMaterialsId: body.billOfMaterialsId,
        plannedOutputQuantity: body.plannedOutputQuantity,
        status: "Planned",
        workCenterId: body.workCenterId,
        orderId: body.orderId,
        consumptions: [],
        outputs: [],
        createdAt: now,
        updatedAt: now,
      };
      productionOrders.set(order.productionOrderId, order);
      return jsonResponse(order, 201);
    }
    if (method === "GET" && /^\/production-orders\/by-status\/[^/]+$/.test(path)) {
      const status = path.split("/").pop()!;
      return jsonResponse([...productionOrders.values()].filter((o) => o.status === status));
    }
    if (method === "GET" && /^\/production-orders\/by-origin\/[^/]+$/.test(path)) {
      const orderId = path.split("/").pop()!;
      return jsonResponse([...productionOrders.values()].filter((o) => o.orderId === orderId));
    }
    if (method === "GET" && /^\/production-orders\/[^/]+\/total-consumed-cost$/.test(path)) {
      const productionOrderId = path.split("/")[2];
      const existing = productionOrders.get(productionOrderId);
      if (!existing) {
        return jsonResponse({ error: { code: "PRODUCTION_ORDER_NOT_FOUND", message: `ProductionOrder ${productionOrderId} não encontrada.`, correlationId: "demo-corr-1" } }, 404);
      }
      return jsonResponse({ totalConsumedCost: existing.consumptions.reduce((sum, c) => sum + c.acquisitionCost, 0) });
    }
    if (method === "GET" && /^\/production-orders\/[^/]+\/total-generated-quantity$/.test(path)) {
      const productionOrderId = path.split("/")[2];
      const existing = productionOrders.get(productionOrderId);
      if (!existing) {
        return jsonResponse({ error: { code: "PRODUCTION_ORDER_NOT_FOUND", message: `ProductionOrder ${productionOrderId} não encontrada.`, correlationId: "demo-corr-1" } }, 404);
      }
      return jsonResponse({ totalGeneratedQuantity: existing.outputs.reduce((sum, o) => sum + o.quantityGenerated, 0) });
    }
    if (method === "GET" && /^\/production-orders\/[^/]+$/.test(path)) {
      const productionOrderId = path.split("/").pop()!;
      const found = productionOrders.get(productionOrderId);
      return found ? jsonResponse(found) : jsonResponse({ error: { code: "NOT_FOUND", message: `ProductionOrder ${productionOrderId} não encontrada.`, correlationId: "demo-corr-1" } }, 404);
    }
    if (method === "POST" && /^\/production-orders\/[^/]+\/start$/.test(path)) {
      const productionOrderId = path.split("/")[2];
      const existing = productionOrders.get(productionOrderId);
      if (!existing) {
        return jsonResponse({ error: { code: "PRODUCTION_ORDER_NOT_FOUND", message: `ProductionOrder ${productionOrderId} não encontrada.`, correlationId: "demo-corr-1" } }, 404);
      }
      if (existing.status !== "Planned") {
        return jsonResponse({ error: { code: "PRODUCTION_ORDER_INVALID_STATUS_TRANSITION", message: `Transição de status de ProductionOrder inválida: ${existing.status} → InProgress.`, correlationId: "demo-corr-1" } }, 409);
      }
      const body = init?.body ? (JSON.parse(init.body.toString()) as { readonly availableQuantities: Record<string, number> }) : undefined;
      const bom = billsOfMaterials.get(existing.billOfMaterialsId);
      const sufficient = (bom?.lines ?? []).every((line) => (body?.availableQuantities[line.inputProductId] ?? 0) >= line.quantityPerOutputUnit * existing.plannedOutputQuantity);
      if (!sufficient) {
        return jsonResponse({ productionOrder: existing, started: false });
      }
      existing.status = "InProgress";
      existing.startedAt = new Date().toISOString();
      existing.updatedAt = new Date().toISOString();
      return jsonResponse({ productionOrder: existing, started: true });
    }
    if (method === "POST" && /^\/production-orders\/[^/]+\/consumptions$/.test(path)) {
      const productionOrderId = path.split("/")[2];
      const existing = productionOrders.get(productionOrderId);
      if (!existing) {
        return jsonResponse({ error: { code: "PRODUCTION_ORDER_NOT_FOUND", message: `ProductionOrder ${productionOrderId} não encontrada.`, correlationId: "demo-corr-1" } }, 404);
      }
      if (existing.status !== "InProgress") {
        return jsonResponse({ error: { code: "PRODUCTION_CONSUMPTION_NOT_ALLOWED", message: `ProductionOrder ${productionOrderId} está em status ${existing.status} e não aceita registro de consumo.`, correlationId: "demo-corr-1" } }, 409);
      }
      const body = init?.body ? (JSON.parse(init.body.toString()) as { readonly inputProductId: string; readonly quantityConsumed: number; readonly acquisitionCost: number }) : undefined;
      if (!body || body.quantityConsumed <= 0) {
        return jsonResponse({ error: { code: "PRODUCTION_INVALID_CONSUMPTION", message: "Registro de consumo inválido — a quantidade consumida deve ser positiva e o custo de aquisição não negativo.", correlationId: "demo-corr-1" } }, 422);
      }
      consumptionSequence += 1;
      const consumption: DemoProductionConsumption = { consumptionId: `consumption-demo-${consumptionSequence}`, productionOrderId, inputProductId: body.inputProductId, quantityConsumed: body.quantityConsumed, acquisitionCost: body.acquisitionCost, consumedAt: new Date().toISOString() };
      existing.consumptions.push(consumption);
      existing.updatedAt = new Date().toISOString();
      return jsonResponse({ productionOrder: existing, consumption }, 201);
    }
    if (method === "POST" && /^\/production-orders\/[^/]+\/outputs$/.test(path)) {
      const productionOrderId = path.split("/")[2];
      const existing = productionOrders.get(productionOrderId);
      if (!existing) {
        return jsonResponse({ error: { code: "PRODUCTION_ORDER_NOT_FOUND", message: `ProductionOrder ${productionOrderId} não encontrada.`, correlationId: "demo-corr-1" } }, 404);
      }
      if (existing.status !== "InProgress") {
        return jsonResponse({ error: { code: "PRODUCTION_OUTPUT_NOT_ALLOWED", message: `ProductionOrder ${productionOrderId} está em status ${existing.status} e não aceita registro de geração.`, correlationId: "demo-corr-1" } }, 409);
      }
      const body = init?.body ? (JSON.parse(init.body.toString()) as { readonly outputProductId: string; readonly quantityGenerated: number }) : undefined;
      if (!body || body.quantityGenerated <= 0) {
        return jsonResponse({ error: { code: "PRODUCTION_INVALID_OUTPUT", message: "Registro de geração inválido — a quantidade gerada deve ser positiva.", correlationId: "demo-corr-1" } }, 422);
      }
      outputSequence += 1;
      const output: DemoProductionOutput = { outputId: `output-demo-${outputSequence}`, productionOrderId, outputProductId: body.outputProductId, quantityGenerated: body.quantityGenerated, generatedAt: new Date().toISOString() };
      existing.outputs.push(output);
      existing.updatedAt = new Date().toISOString();
      return jsonResponse({ productionOrder: existing, output }, 201);
    }
    if (method === "POST" && /^\/production-orders\/[^/]+\/complete$/.test(path)) {
      const productionOrderId = path.split("/")[2];
      const existing = productionOrders.get(productionOrderId);
      if (!existing) {
        return jsonResponse({ error: { code: "PRODUCTION_ORDER_NOT_FOUND", message: `ProductionOrder ${productionOrderId} não encontrada.`, correlationId: "demo-corr-1" } }, 404);
      }
      if (existing.outputs.length === 0) {
        return jsonResponse({ error: { code: "PRODUCTION_ORDER_HAS_NO_OUTPUT_CANNOT_COMPLETE", message: `ProductionOrder ${productionOrderId} ainda não possui nenhuma geração registrada e não pode ser concluída.`, correlationId: "demo-corr-1" } }, 409);
      }
      if (existing.status !== "InProgress") {
        return jsonResponse({ error: { code: "PRODUCTION_ORDER_INVALID_STATUS_TRANSITION", message: `Transição de status de ProductionOrder inválida: ${existing.status} → Completed.`, correlationId: "demo-corr-1" } }, 409);
      }
      existing.status = "Completed";
      existing.completedAt = new Date().toISOString();
      existing.updatedAt = new Date().toISOString();
      return jsonResponse(existing);
    }
    if (method === "POST" && /^\/production-orders\/[^/]+\/cancel$/.test(path)) {
      const productionOrderId = path.split("/")[2];
      const existing = productionOrders.get(productionOrderId);
      if (!existing) {
        return jsonResponse({ error: { code: "PRODUCTION_ORDER_NOT_FOUND", message: `ProductionOrder ${productionOrderId} não encontrada.`, correlationId: "demo-corr-1" } }, 404);
      }
      if (existing.consumptions.length > 0) {
        return jsonResponse({ error: { code: "PRODUCTION_ORDER_HAS_CONSUMPTION_CANNOT_CANCEL", message: `ProductionOrder ${productionOrderId} já possui consumo de insumo registrado e não pode mais ser cancelada.`, correlationId: "demo-corr-1" } }, 409);
      }
      if (existing.status !== "Planned" && existing.status !== "InProgress") {
        return jsonResponse({ error: { code: "PRODUCTION_ORDER_INVALID_STATUS_TRANSITION", message: `Transição de status de ProductionOrder inválida: ${existing.status} → Cancelled.`, correlationId: "demo-corr-1" } }, 409);
      }
      const body = init?.body ? (JSON.parse(init.body.toString()) as { readonly reason: string }) : undefined;
      existing.status = "Cancelled";
      existing.cancelReason = body?.reason;
      existing.updatedAt = new Date().toISOString();
      return jsonResponse(existing);
    }

    if (method === "POST" && path === "/work-centers") {
      const body = init?.body ? (JSON.parse(init.body.toString()) as { readonly tenantId: string; readonly name: string; readonly nominalCapacity?: number }) : undefined;
      if (!body?.name.trim()) {
        return jsonResponse({ error: { code: "PRODUCTION_INVALID_WORK_CENTER_NAME", message: "Work Center inválido — o nome é obrigatório e não pode ser vazio.", correlationId: "demo-corr-1" } }, 422);
      }
      workCenterSequence += 1;
      const workCenter: DemoWorkCenter = { workCenterId: `wc-demo-${workCenterSequence}`, tenantId: body.tenantId, name: body.name, nominalCapacity: body.nominalCapacity, active: true, createdAt: new Date().toISOString() };
      workCenters.set(workCenter.workCenterId, workCenter);
      return jsonResponse(workCenter, 201);
    }
    if (method === "GET" && path === "/work-centers/active") {
      return jsonResponse([...workCenters.values()].filter((w) => w.active));
    }

    throw new Error(`Rota HTTP não mockada em demoApiFetchMock: ${method} ${path}`);
  };
}
