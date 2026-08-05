/**
 * SupplierContact — pessoa de contato associada a um Supplier; parte interna do Aggregate
 * `Supplier`, nunca uma Entidade referenciada por identificador fora dele.
 * Estrutura definida em `SUPPLIER_HUB.md`, Capítulo 5.
 */

/** Papel do contato dentro do relacionamento com o Fornecedor. */
export type SupplierContactRole = 'Commercial' | 'Financial' | 'Logistics';

export interface SupplierContact {
  /** Identificador do Contact, único dentro do Supplier que o contém. */
  readonly contactId: string;

  /** Supplier ao qual este Contact pertence. */
  readonly supplierId: string;

  /** Nome do contato. */
  readonly name: string;

  /**
   * Canal de contato — identificador opaco referenciando `Channel` (Communication Hub, já
   * Official), nunca reimplementado localmente. `undefined` quando o canal ainda não foi
   * associado a nenhum `Channel` real.
   */
  readonly channelId?: string;

  /** Papel deste contato no relacionamento comercial. */
  readonly role: SupplierContactRole;
}
