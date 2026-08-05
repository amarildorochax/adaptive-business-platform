import type { Cart } from './Cart';
import { CartService } from './CartService';
import type { CartItem } from './CartItem';
import { CartItemService } from './CartItemService';
import type { Catalog } from './Catalog';
import { CatalogService } from './CatalogService';
import type { Category } from './Category';
import { CategoryService } from './CategoryService';
import type { CommerceEvent, CommerceEventType } from './CommerceEvent';
import type { Coupon } from './Coupon';
import { CouponService } from './CouponService';
import type { Discount } from './Discount';
import { DiscountService, type CreateDiscountInput } from './DiscountService';
import type { Inventory } from './Inventory';
import { InventoryService } from './InventoryService';
import type { Order } from './Order';
import { OrderService } from './OrderService';
import type { OrderItem } from './OrderItem';
import { OrderItemService } from './OrderItemService';
import type { Price } from './Price';
import { PriceService, type SetPriceInput } from './PriceService';
import type { Product } from './Product';
import { ProductService, type CreateProductInput } from './ProductService';
import type { Variant } from './Variant';
import { VariantService } from './VariantService';

export interface CommerceManagerDependencies {
  readonly products: ProductService;
  readonly variants: VariantService;
  readonly catalogs: CatalogService;
  readonly categories: CategoryService;
  readonly prices: PriceService;
  readonly discounts: DiscountService;
  readonly coupons: CouponService;
  readonly carts: CartService;
  readonly cartItems: CartItemService;
  readonly orders: OrderService;
  readonly orderItems: OrderItemService;
  readonly inventory: InventoryService;
}

/**
 * Resultado de uma operação de CommerceManager — a Entidade produzida e todo Event já aprovado
 * consequente. **Nunca tem um campo `command`, nem mesmo opcional** — `COMMERCE_HUB_ARCHITECTURE.md`
 * nunca catalogou Commands para este Hub, mesma lacuna sistêmica já encontrada em Content Hub
 * (IMP-004); `ContentOperationResult` é o precedente estrutural direto desta forma, não
 * `CRMOperationResult`/`GrowthOperationResult`.
 */
export interface CommerceOperationResult<TEntity> {
  readonly result: TEntity;
  readonly events: readonly CommerceEvent[];
}

/**
 * CommerceManager — o primeiro orquestrador oficial do Commerce Hub, implementado pela primeira vez
 * nesta Sprint (IMP-006, Commerce Core). Diferente de `CommunicationManager`/`GrowthManager`, nenhuma
 * reconciliação de nome foi necessária: nenhum arquivo `CommerceHubComponent.ts` chegou a esta Sprint
 * já cataloging um nome de componente alternativo (o pacote inteiro nasce nesta Sprint, mesma
 * situação de `content-hub` em IMP-004) — "Commerce Manager", nome já usado pela própria Sprint
 * (Etapa 6) e nunca contradito pelo Blueprint, é adotado diretamente.
 *
 * Escopo desta Sprint (Commerce Core): Catálogo (Product/Variant/Catalog/Category/Price),
 * Desconto/Cupom (criação, nunca a avaliação em Checkout), Carrinho (Cart/CartItem), Pedido
 * (Order/OrderItem) e Estoque em nível de domínio (Inventory) — nunca Checkout, Quote, Subscription
 * Plan, Shipment, Return ou Marketplace, todos explicitamente fora de escopo (ver relatório desta
 * Sprint).
 *
 * Nunca contém, ele mesmo, regra de negócio de uma Entidade específica. Não publica em nenhum Event
 * Bus — `CommerceEvent` é retornado ao chamador, mesmo padrão já em uso por
 * `CRMManager`/`CommunicationManager`/`ContentManager`/`GrowthManager`.
 */
export class CommerceManager {
  constructor(private readonly deps: CommerceManagerDependencies) {}

  async createProduct(input: CreateProductInput): Promise<CommerceOperationResult<Product>> {
    const product = await this.deps.products.create(input);
    return { result: product, events: [this.event('ProductCreated')] };
  }

  async updateProduct(productId: string, input: Partial<CreateProductInput>): Promise<CommerceOperationResult<Product>> {
    const product = await this.deps.products.update(productId, input);
    return { result: product, events: [this.event('ProductUpdated')] };
  }

  /** Nenhum Evento aprovado cobre Variant isoladamente — ver relatório desta Sprint. */
  async createVariant(productId: string, label: string): Promise<CommerceOperationResult<Variant>> {
    const variant = await this.deps.variants.create(productId, label);
    return { result: variant, events: [] };
  }

  /** Nenhum Evento aprovado cobre Catalog em si — ver relatório desta Sprint. */
  async createCatalog(tenantId: string, name: string): Promise<CommerceOperationResult<Catalog>> {
    const catalog = await this.deps.catalogs.create(tenantId, name);
    return { result: catalog, events: [] };
  }

  /** Nenhum Evento aprovado cobre Category — ver relatório desta Sprint. */
  async createCategory(tenantId: string, name: string, parentCategoryId?: string): Promise<CommerceOperationResult<Category>> {
    const category = await this.deps.categories.create(tenantId, name, parentCategoryId);
    return { result: category, events: [] };
  }

  async setPrice(input: SetPriceInput): Promise<CommerceOperationResult<Price>> {
    const price = await this.deps.prices.set(input);
    return { result: price, events: [this.event('PriceChanged')] };
  }

  /** Nenhum Evento aprovado cobre a criação de Discount — `DiscountRuleApplied` exige avaliação em Checkout, fora de escopo. */
  async createDiscount(input: CreateDiscountInput): Promise<CommerceOperationResult<Discount>> {
    const discount = await this.deps.discounts.create(input);
    return { result: discount, events: [] };
  }

  /** Mesmo tratamento de `createDiscount` — Coupon é uma especialização de Discount. */
  async createCoupon(
    discountId: string,
    code: string,
    maxRedemptions?: number,
    campaignReferenceId?: string,
  ): Promise<CommerceOperationResult<Coupon>> {
    const coupon = await this.deps.coupons.create(discountId, code, maxRedemptions, campaignReferenceId);
    return { result: coupon, events: [] };
  }

  async createCart(tenantId: string, customerReferenceId?: string): Promise<CommerceOperationResult<Cart>> {
    const cart = await this.deps.carts.create(tenantId, customerReferenceId);
    return { result: cart, events: [this.event('CartCreated')] };
  }

  async abandonCart(cartId: string): Promise<CommerceOperationResult<Cart>> {
    const cart = await this.deps.carts.abandon(cartId);
    return { result: cart, events: [this.event('CartAbandoned')] };
  }

  /** Nenhum Evento aprovado cobre CartItem isoladamente — ver relatório desta Sprint. */
  async addCartItem(
    cartId: string,
    productId: string,
    quantity: number,
    unitPrice: number,
    variantId?: string,
  ): Promise<CommerceOperationResult<CartItem>> {
    const cart = await this.deps.carts.get(cartId);

    if (!cart) {
      throw new Error(`Cart ${cartId} não encontrado.`);
    }

    const cartItem = await this.deps.cartItems.add(cartId, productId, quantity, unitPrice, variantId);
    return { result: cartItem, events: [] };
  }

  /**
   * Cria um Order — a partir de um Cart confirmado (Checkout, fora de escopo desta Sprint, portanto
   * `cartId` é apenas referenciado, nunca transicionado por um fluxo de Checkout completo) ou
   * diretamente, mesmo caminho já descrito no Blueprint para venda B2B consultiva fechada via
   * `OpportunityWon` (CRM Hub, referenciado por identificador, nunca importado).
   */
  async createOrder(tenantId: string, cartId?: string, customerReferenceId?: string): Promise<CommerceOperationResult<Order>> {
    const order = await this.deps.orders.create(tenantId, cartId, customerReferenceId);
    return { result: order, events: [this.event('OrderCreated')] };
  }

  /** Nenhum Evento aprovado cobre OrderItem isoladamente — ver relatório desta Sprint. */
  async addOrderItem(
    orderId: string,
    productId: string,
    quantity: number,
    unitPrice: number,
    variantId?: string,
  ): Promise<CommerceOperationResult<OrderItem>> {
    const orderItem = await this.deps.orderItems.add(orderId, productId, quantity, unitPrice, variantId);
    return { result: orderItem, events: [] };
  }

  /**
   * Transiciona um Order para Pago. Em produção, esta operação reage a `InvoicePaid`/`PaymentCaptured`
   * (Finance Hub, já Official) consumido por Evento — nenhuma integração real com Finance Hub existe
   * nesta plataforma ainda (nenhum Event Bus implementado, mesmo estado de toda a série); o método
   * expõe apenas a transição de domínio em si, nunca processa pagamento (ADR-CM-001/ADR-CM-006).
   */
  async markOrderPaid(orderId: string): Promise<CommerceOperationResult<Order>> {
    const order = await this.deps.orders.markPaid(orderId);
    return { result: order, events: [this.event('OrderPaid')] };
  }

  async cancelOrder(orderId: string): Promise<CommerceOperationResult<Order>> {
    const order = await this.deps.orders.cancel(orderId);
    return { result: order, events: [this.event('OrderCancelled')] };
  }

  async fulfillOrder(orderId: string): Promise<CommerceOperationResult<Order>> {
    const order = await this.deps.orders.fulfill(orderId);
    return { result: order, events: [this.event('OrderFulfilled')] };
  }

  /**
   * Ajusta o Inventory de um Product/Variant em nível de domínio — nunca sincronização em tempo real
   * com um sistema externo (fora de escopo, mediado pelo Integration Hub em uma Sprint futura).
   */
  async adjustInventory(productId: string, delta: number, variantId?: string): Promise<CommerceOperationResult<Inventory>> {
    const inventory = await this.deps.inventory.adjust(productId, delta, variantId);
    return { result: inventory, events: [this.event('StockUpdated')] };
  }

  private event(type: CommerceEventType): CommerceEvent {
    return { eventId: crypto.randomUUID(), type, occurredAt: new Date() };
  }
}
