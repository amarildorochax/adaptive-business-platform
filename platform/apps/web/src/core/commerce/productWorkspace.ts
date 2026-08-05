import type { Catalog, Category, CommerceEvent, CommerceEventType, Inventory, Price, Product, Variant } from "@abp/commerce-hub";
import type { DemoSnapshot } from "@core/managers/seedDemoData";

/** Tradução legível dos tipos de `CommerceEvent` — apenas os quatro que este Workspace de fato produz (nenhum Cart/Order/Discount é criado por nenhuma seção do Product Hub, fora de escopo desta Sprint). */
const EVENT_LABELS: Partial<Record<CommerceEventType, string>> = {
  ProductCreated: "Produto criado",
  ProductUpdated: "Produto atualizado",
  PriceChanged: "Preço alterado",
  StockUpdated: "Estoque ajustado",
};

export interface ProductEventLogEntry {
  readonly id: string;
  readonly type: CommerceEventType;
  readonly label: string;
  readonly occurredAt: string;
  /**
   * Ajuste de quantidade que originou este evento — presente apenas para `StockUpdated` produzido
   * por uma mutação real desta sessão (`useAdjustInventory`), nunca reconstruído retroativamente: o
   * `CommerceEvent` em si (`eventId`/`type`/`occurredAt`) nunca carrega o `delta` usado — o valor vem
   * exclusivamente da própria chamada que o Frontend já fez, nunca sintetizado (ver Inventory
   * Workspace, FUN-105, seção "Movimentações").
   */
  readonly delta?: number;
  /**
   * Product ao qual este evento se refere, quando conhecido — `CommerceEvent` (`eventId`/`type`/
   * `occurredAt`) nunca carrega nenhum identificador de correlação (confirmado em `CommerceEvent.ts`),
   * então esta associação vem exclusivamente do resultado real já disponível no momento da própria
   * mutação (`result.productId`), nunca reconstruída depois. Ausente apenas para o evento semeado no
   * bootstrap (`buildInitialProductWorkspace` não teria como diferenciá-lo de outros sem duplicar o
   * `productId` já presente em `DemoSnapshot.product`, então é preenchido ali também).
   */
  readonly productId?: string;
}

/**
 * Fotografia local, acumulada durante a sessão, do Product Hub Workspace — `CommerceManager`
 * (auditado no relatório desta Sprint, `docs/implementation/FUN_104_PRODUCT_HUB_WORKSPACE_REPORT.md`)
 * expõe dezoito métodos, todos de escrita, nenhuma Query de listagem (mesma limitação central já
 * documentada para `CRMManager`, FUN-103) — mesmo os métodos `list`/`get` que already existem a nível
 * de `ProductService`/`CategoryService`/`CatalogService`/`VariantService` nunca são expostos por
 * `CommerceManager`. Toda lista, todo indicador desta experiência é reconstruída a partir do que os
 * próprios métodos já chamados nesta sessão devolveram — nunca uma Query real, nunca dado inventado.
 */
export interface ProductWorkspaceSnapshot {
  readonly catalogs: readonly Catalog[];
  readonly categories: readonly Category[];
  readonly products: readonly Product[];
  readonly variants: readonly Variant[];
  readonly prices: readonly Price[];
  readonly inventory: readonly Inventory[];
  readonly eventLog: readonly ProductEventLogEntry[];
}

export function toLogEntry(event: CommerceEvent, options?: { readonly delta?: number; readonly productId?: string }): ProductEventLogEntry {
  const baseLabel = EVENT_LABELS[event.type] ?? event.type;
  const delta = options?.delta;
  const label = event.type === "StockUpdated" && delta !== undefined ? `${baseLabel} (${delta >= 0 ? "+" : ""}${delta} unidade${Math.abs(delta) === 1 ? "" : "s"})` : baseLabel;
  return { id: event.eventId, type: event.type, label, occurredAt: event.occurredAt.toISOString(), delta: event.type === "StockUpdated" ? delta : undefined, productId: options?.productId };
}

/** Semente inicial do Workspace — o Catalog/Category/Product/Price/Inventory já criados por `seedDemoData` no bootstrap da sessão. */
export function buildInitialProductWorkspace(snapshot: DemoSnapshot): ProductWorkspaceSnapshot {
  return {
    catalogs: [snapshot.catalog],
    categories: [snapshot.category],
    products: [snapshot.product],
    variants: [],
    prices: [snapshot.price],
    inventory: [snapshot.inventory],
    eventLog: snapshot.commerceEvents.map((event) => toLogEntry(event, { productId: snapshot.product.productId })),
  };
}

/** Categoria de um Product, quando conhecida nesta sessão. */
export function resolveCategoryName(workspace: ProductWorkspaceSnapshot, categoryId: string | undefined): string | undefined {
  return categoryId ? workspace.categories.find((category) => category.categoryId === categoryId)?.name : undefined;
}

/** Preço vigente de um Product/Variant, quando conhecido nesta sessão — o mais recente já visto (`setPrice` substitui o Price anterior no domínio; aqui apenas acumulamos o que já vimos). */
export function resolveCurrentPrice(workspace: ProductWorkspaceSnapshot, productId: string, variantId?: string): Price | undefined {
  const matches = workspace.prices.filter((price) => price.productId === productId && price.variantId === variantId);
  return matches.at(-1);
}

/** Inventory vigente de um Product/Variant, quando conhecido nesta sessão. */
export function resolveInventory(workspace: ProductWorkspaceSnapshot, productId: string, variantId?: string): Inventory | undefined {
  return workspace.inventory.find((entry) => entry.productId === productId && entry.variantId === variantId);
}
