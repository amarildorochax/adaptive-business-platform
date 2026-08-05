import type { SupplierContact } from './SupplierContact';
import type { TaxId } from './TaxId';

/**
 * Supplier — Aggregate Root do Supplier Hub. Pessoa jurídica ou física que fornece mercadoria ou
 * insumo à Empresa; agrupa `SupplierContact` como parte interna (`SUPPLIER_HUB.md`, Capítulo 4).
 *
 * DIVERGÊNCIA DOCUMENTADA (não corrigida silenciosamente, per instrução explícita de IMP-201):
 * `packages/crm-hub/src/Supplier.ts` já declara um tipo `Supplier` distinto — um stub de quatro
 * campos (`supplierId`, `tenantId`, `relationshipId`, `createdAt`), um dos quatro
 * `RelationshipPartyType` do CRM Hub (`CRM_DOMAIN_BLUEPRINT.md`, Capítulo 7, Frozen), nunca
 * instanciado por nenhum Command real de `CRMManager` (verificado: zero ocorrência de "Supplier" em
 * `CRMManager.ts`). `CRMEvent.ts` também já declara `"SupplierRegistered"` como um dos dezoito
 * Eventos Frozen do CRM Hub, também nunca publicado por nenhum método real. Esta divergência é
 * detalhada por completo em `docs/implementation/IMP_201_SUPPLIER_HUB_CORE_REPORT.md`, Capítulo 2.
 * Nenhuma linha de `packages/crm-hub` foi alterada por esta Sprint — proibido por escopo
 * (`Não alterar... CRM`). O `Supplier` deste arquivo é uma Entidade inteiramente distinta, de um
 * pacote distinto (`@abp/supplier-hub`), sem nenhuma relação de herança, extensão ou substituição
 * com o stub do CRM Hub.
 *
 * Estrutura definida em `SUPPLIER_HUB.md`, Capítulo 5.
 */

/** Estado operacional de um Supplier — enum fechado, `SUPPLIER_HUB.md`, Capítulo 6. */
export type SupplierStatus = 'Active' | 'Disabled';

export interface Supplier {
  /** Identificador do Supplier. */
  readonly supplierId: string;

  /** Tenant ao qual o Supplier pertence — isolamento absoluto entre Empresas. */
  readonly tenantId: string;

  /** Razão social do Fornecedor. */
  readonly legalName: string;

  /** Identificador fiscal externo — único por Tenant (`SupplierValidator.ensureNoDuplicateTaxId`). */
  readonly taxId: TaxId;

  /** Estado operacional atual. */
  readonly status: SupplierStatus;

  /** Categoria de fornecimento — classificação livre de negócio, sem enum fechado nesta Sprint. */
  readonly supplyCategory?: string;

  /** Contatos associados a este Supplier — parte interna do Aggregate, nunca um Repository próprio. */
  readonly contacts: readonly SupplierContact[];

  /** Momento de cadastro. */
  readonly createdAt: Date;

  /** Momento da última alteração. */
  readonly updatedAt: Date;
}
