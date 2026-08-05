import type { Cart } from '../Cart';
import type { CartItem } from '../CartItem';
import type { CartItemRepository } from '../CartItemRepository';
import type { CartRepository } from '../CartRepository';
import type { Catalog } from '../Catalog';
import type { CatalogRepository } from '../CatalogRepository';
import type { Category } from '../Category';
import type { CategoryRepository } from '../CategoryRepository';
import type { Coupon } from '../Coupon';
import type { CouponRepository } from '../CouponRepository';
import type { Discount } from '../Discount';
import type { DiscountRepository } from '../DiscountRepository';
import type { Inventory } from '../Inventory';
import type { InventoryRepository } from '../InventoryRepository';
import type { Order } from '../Order';
import type { OrderItem } from '../OrderItem';
import type { OrderItemRepository } from '../OrderItemRepository';
import type { OrderRepository } from '../OrderRepository';
import type { Price } from '../Price';
import type { PriceRepository } from '../PriceRepository';
import type { Product } from '../Product';
import type { ProductRepository } from '../ProductRepository';
import type { Variant } from '../Variant';
import type { VariantRepository } from '../VariantRepository';

/**
 * Fakes em memória usados exclusivamente por teste (IMP-006, Etapa 9). Mesmo padrão já usado por
 * `@abp/crm-hub` (IMP-002), `@abp/communication-hub` (IMP-003), `@abp/content-hub` (IMP-004) e
 * `@abp/growth-hub` (IMP-005) — nunca exportados pelo barrel do pacote, nunca referenciados por
 * nenhum Service em produção.
 */

export class FakeProductRepository implements ProductRepository {
  private readonly rows = new Map<string, Product>();
  async create(product: Product) {
    this.rows.set(product.productId, product);
    return product;
  }
  async update(product: Product) {
    this.rows.set(product.productId, product);
    return product;
  }
  async get(productId: string) {
    return this.rows.get(productId);
  }
  async list(catalogId: string) {
    return [...this.rows.values()].filter((p) => p.catalogId === catalogId);
  }
}

export class FakeVariantRepository implements VariantRepository {
  private readonly rows = new Map<string, Variant>();
  async create(variant: Variant) {
    this.rows.set(variant.variantId, variant);
    return variant;
  }
  async get(variantId: string) {
    return this.rows.get(variantId);
  }
  async list(productId: string) {
    return [...this.rows.values()].filter((v) => v.productId === productId);
  }
}

export class FakeCatalogRepository implements CatalogRepository {
  private readonly rows = new Map<string, Catalog>();
  async create(catalog: Catalog) {
    this.rows.set(catalog.catalogId, catalog);
    return catalog;
  }
  async get(catalogId: string) {
    return this.rows.get(catalogId);
  }
  async list(tenantId: string) {
    return [...this.rows.values()].filter((c) => c.tenantId === tenantId);
  }
}

export class FakeCategoryRepository implements CategoryRepository {
  private readonly rows = new Map<string, Category>();
  async create(category: Category) {
    this.rows.set(category.categoryId, category);
    return category;
  }
  async get(categoryId: string) {
    return this.rows.get(categoryId);
  }
  async list(tenantId: string) {
    return [...this.rows.values()].filter((c) => c.tenantId === tenantId);
  }
}

export class FakePriceRepository implements PriceRepository {
  private readonly rows = new Map<string, Price>();
  async create(price: Price) {
    this.rows.set(price.priceId, price);
    return price;
  }
  async update(price: Price) {
    this.rows.set(price.priceId, price);
    return price;
  }
  async get(priceId: string) {
    return this.rows.get(priceId);
  }
  async findCurrent(productId: string, variantId?: string) {
    return [...this.rows.values()].find((p) => p.productId === productId && p.variantId === variantId);
  }
}

export class FakeDiscountRepository implements DiscountRepository {
  private readonly rows = new Map<string, Discount>();
  async create(discount: Discount) {
    this.rows.set(discount.discountId, discount);
    return discount;
  }
  async get(discountId: string) {
    return this.rows.get(discountId);
  }
  async list(tenantId: string) {
    return [...this.rows.values()].filter((d) => d.tenantId === tenantId);
  }
}

export class FakeCouponRepository implements CouponRepository {
  private readonly rows = new Map<string, Coupon>();
  async create(coupon: Coupon) {
    this.rows.set(coupon.couponId, coupon);
    return coupon;
  }
  async update(coupon: Coupon) {
    this.rows.set(coupon.couponId, coupon);
    return coupon;
  }
  async get(couponId: string) {
    return this.rows.get(couponId);
  }
  async findByCode(code: string) {
    return [...this.rows.values()].find((c) => c.code === code);
  }
}

export class FakeCartRepository implements CartRepository {
  private readonly rows = new Map<string, Cart>();
  async create(cart: Cart) {
    this.rows.set(cart.cartId, cart);
    return cart;
  }
  async update(cart: Cart) {
    this.rows.set(cart.cartId, cart);
    return cart;
  }
  async get(cartId: string) {
    return this.rows.get(cartId);
  }
  async list(tenantId: string) {
    return [...this.rows.values()].filter((c) => c.tenantId === tenantId);
  }
}

export class FakeCartItemRepository implements CartItemRepository {
  private readonly rows = new Map<string, CartItem>();
  async create(cartItem: CartItem) {
    this.rows.set(cartItem.cartItemId, cartItem);
    return cartItem;
  }
  async remove(cartItemId: string) {
    this.rows.delete(cartItemId);
  }
  async list(cartId: string) {
    return [...this.rows.values()].filter((i) => i.cartId === cartId);
  }
}

export class FakeOrderRepository implements OrderRepository {
  private readonly rows = new Map<string, Order>();
  async create(order: Order) {
    this.rows.set(order.orderId, order);
    return order;
  }
  async update(order: Order) {
    this.rows.set(order.orderId, order);
    return order;
  }
  async get(orderId: string) {
    return this.rows.get(orderId);
  }
  async list(tenantId: string) {
    return [...this.rows.values()].filter((o) => o.tenantId === tenantId);
  }
}

export class FakeOrderItemRepository implements OrderItemRepository {
  private readonly rows: OrderItem[] = [];
  async create(orderItem: OrderItem) {
    this.rows.push(orderItem);
    return orderItem;
  }
  async list(orderId: string) {
    return this.rows.filter((i) => i.orderId === orderId);
  }
}

export class FakeInventoryRepository implements InventoryRepository {
  private readonly rows = new Map<string, Inventory>();
  async create(inventory: Inventory) {
    this.rows.set(inventory.inventoryId, inventory);
    return inventory;
  }
  async update(inventory: Inventory) {
    this.rows.set(inventory.inventoryId, inventory);
    return inventory;
  }
  async get(inventoryId: string) {
    return this.rows.get(inventoryId);
  }
  async findByProduct(productId: string, variantId?: string) {
    return [...this.rows.values()].find((i) => i.productId === productId && i.variantId === variantId);
  }
}
