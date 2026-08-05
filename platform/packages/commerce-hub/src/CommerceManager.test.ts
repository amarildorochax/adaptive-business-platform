import { describe, expect, it } from 'vitest';
import { CartItemService } from './CartItemService';
import { CartService } from './CartService';
import { CatalogService } from './CatalogService';
import { CategoryService } from './CategoryService';
import { CommerceManager } from './CommerceManager';
import { CouponService } from './CouponService';
import { DiscountService } from './DiscountService';
import { InventoryService } from './InventoryService';
import { OrderItemService } from './OrderItemService';
import { OrderService } from './OrderService';
import { PriceService } from './PriceService';
import { ProductService } from './ProductService';
import { VariantService } from './VariantService';
import {
  FakeCartItemRepository,
  FakeCartRepository,
  FakeCatalogRepository,
  FakeCategoryRepository,
  FakeCouponRepository,
  FakeDiscountRepository,
  FakeInventoryRepository,
  FakeOrderItemRepository,
  FakeOrderRepository,
  FakePriceRepository,
  FakeProductRepository,
  FakeVariantRepository,
} from './testing/InMemoryFakes';

function buildManager() {
  return new CommerceManager({
    products: new ProductService(new FakeProductRepository()),
    variants: new VariantService(new FakeVariantRepository()),
    catalogs: new CatalogService(new FakeCatalogRepository()),
    categories: new CategoryService(new FakeCategoryRepository()),
    prices: new PriceService(new FakePriceRepository()),
    discounts: new DiscountService(new FakeDiscountRepository()),
    coupons: new CouponService(new FakeCouponRepository()),
    carts: new CartService(new FakeCartRepository()),
    cartItems: new CartItemService(new FakeCartItemRepository()),
    orders: new OrderService(new FakeOrderRepository()),
    orderItems: new OrderItemService(new FakeOrderItemRepository()),
    inventory: new InventoryService(new FakeInventoryRepository()),
  });
}

describe('CommerceManager — Commerce Core', () => {
  it('createProduct produz o Event ProductCreated e o resultado nunca carrega Command — nenhum está catalogado para este Hub', async () => {
    const manager = buildManager();
    const { result: catalog } = await manager.createCatalog('tenant-1', 'Catálogo Principal');

    const operation = await manager.createProduct({
      tenantId: 'tenant-1',
      catalogId: catalog.catalogId,
      categoryId: undefined,
      name: 'Buquê de Rosas',
      description: undefined,
    });

    expect(operation.result.status).toBe('Draft');
    expect(operation.events.map((e) => e.type)).toEqual(['ProductCreated']);
    expect('command' in operation).toBe(false);
  });

  it('updateProduct produz o Event ProductUpdated', async () => {
    const manager = buildManager();
    const { result: catalog } = await manager.createCatalog('tenant-1', 'Catálogo');
    const { result: product } = await manager.createProduct({
      tenantId: 'tenant-1',
      catalogId: catalog.catalogId,
      categoryId: undefined,
      name: 'Produto',
      description: undefined,
    });

    const operation = await manager.updateProduct(product.productId, { name: 'Produto Atualizado' });

    expect(operation.result.name).toBe('Produto Atualizado');
    expect(operation.events.map((e) => e.type)).toEqual(['ProductUpdated']);
  });

  it('createVariant, createCatalog e createCategory nunca emitem Event — nenhum está catalogado para essas Entidades', async () => {
    const manager = buildManager();
    const catalog = await manager.createCatalog('tenant-1', 'Catálogo');
    const category = await manager.createCategory('tenant-1', 'Flores');
    const { result: product } = await manager.createProduct({
      tenantId: 'tenant-1',
      catalogId: catalog.result.catalogId,
      categoryId: category.result.categoryId,
      name: 'Produto',
      description: undefined,
    });
    const variant = await manager.createVariant(product.productId, 'Tamanho M');

    expect(catalog.events).toEqual([]);
    expect(category.events).toEqual([]);
    expect(variant.events).toEqual([]);
  });

  it('setPrice produz o Event PriceChanged', async () => {
    const manager = buildManager();

    const operation = await manager.setPrice({ productId: 'product-1', variantId: undefined, amount: 149.9, currency: 'BRL' });

    expect(operation.result.amount).toBe(149.9);
    expect(operation.events.map((e) => e.type)).toEqual(['PriceChanged']);
  });

  it('createDiscount e createCoupon nunca emitem Event — DiscountRuleApplied exige avaliação em Checkout, fora de escopo', async () => {
    const manager = buildManager();

    const discount = await manager.createDiscount({
      tenantId: 'tenant-1',
      name: 'Black Friday',
      kind: 'Percentage',
      value: 20,
      appliesToProductId: undefined,
      appliesToCategoryId: undefined,
      validFrom: undefined,
      validTo: undefined,
    });
    const coupon = await manager.createCoupon(discount.result.discountId, 'BF20', 100);

    expect(discount.events).toEqual([]);
    expect(coupon.events).toEqual([]);
  });

  it('createCart produz CartCreated, addCartItem exige um Cart existente e não emite Event', async () => {
    const manager = buildManager();
    const { result: cart } = await manager.createCart('tenant-1');

    const operation = await manager.addCartItem(cart.cartId, 'product-1', 2, 49.9);

    expect(operation.result.quantity).toBe(2);
    expect(operation.events).toEqual([]);

    await expect(manager.addCartItem('cart-inexistente', 'product-1', 1, 10)).rejects.toThrow();
  });

  it('abandonCart produz o Event CartAbandoned', async () => {
    const manager = buildManager();
    const { result: cart } = await manager.createCart('tenant-1');

    const operation = await manager.abandonCart(cart.cartId);

    expect(operation.result.status).toBe('Abandoned');
    expect(operation.events.map((e) => e.type)).toEqual(['CartAbandoned']);
  });

  it('ciclo completo de Order: createOrder → markOrderPaid → fulfillOrder, cada um com seu Event já aprovado', async () => {
    const manager = buildManager();
    const { result: cart } = await manager.createCart('tenant-1');
    const { result: order } = await manager.createOrder('tenant-1', cart.cartId);
    await manager.addOrderItem(order.orderId, 'product-1', 1, 199.9);

    expect(order.status).toBe('Pending');

    const paid = await manager.markOrderPaid(order.orderId);
    expect(paid.result.status).toBe('Paid');
    expect(paid.events.map((e) => e.type)).toEqual(['OrderPaid']);

    const fulfilled = await manager.fulfillOrder(order.orderId);
    expect(fulfilled.result.status).toBe('Fulfilling');
    expect(fulfilled.events.map((e) => e.type)).toEqual(['OrderFulfilled']);
  });

  it('cancelOrder produz o Event OrderCancelled', async () => {
    const manager = buildManager();
    const { result: order } = await manager.createOrder('tenant-1');

    const operation = await manager.cancelOrder(order.orderId);

    expect(operation.result.status).toBe('Cancelled');
    expect(operation.events.map((e) => e.type)).toEqual(['OrderCancelled']);
  });

  it('adjustInventory produz o Event StockUpdated e acumula ajustes sucessivos', async () => {
    const manager = buildManager();

    const first = await manager.adjustInventory('product-1', 10);
    const second = await manager.adjustInventory('product-1', -3);

    expect(first.result.quantity).toBe(10);
    expect(second.result.quantity).toBe(7);
    expect(second.events.map((e) => e.type)).toEqual(['StockUpdated']);
  });
});
