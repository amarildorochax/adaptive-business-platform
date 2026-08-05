import type { PaymentTerms } from './PaymentTerms';

/**
 * SupplierContract — acordo comercial formal com um Fornecedor (vigência, condição de pagamento,
 * volume mínimo), distinto do cadastro básico de `Supplier`.
 * Estrutura definida em `SUPPLIER_HUB.md`, Capítulo 5.
 */
export interface SupplierContract {
  /** Identificador do Contract. */
  readonly contractId: string;

  /** Supplier ao qual este Contract pertence. */
  readonly supplierId: string;

  /** Tenant ao qual este Contract pertence. */
  readonly tenantId: string;

  /** Início de vigência. */
  readonly startsAt: Date;

  /** Fim de vigência — `undefined` para contrato por prazo indeterminado. */
  readonly endsAt?: Date;

  /** Condição de pagamento acordada. */
  readonly paymentTerms: PaymentTerms;

  /** Volume mínimo acordado, quando aplicável. */
  readonly minimumVolume?: number;

  /** Momento de criação. */
  readonly createdAt: Date;
}
