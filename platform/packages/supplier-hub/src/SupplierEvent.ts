/**
 * SupplierEvent — os sete Eventos de domínio publicados pelo Supplier Hub, cada um um Fato
 * consumado, nunca uma instrução. Conjunto exato de `DOMAIN_EVENT_CATALOG.md`, Capítulo 1
 * ("Supplier Hub") — nenhum Evento adicional foi criado por esta Sprint, per instrução explícita de
 * IMP-201 ("Não criar eventos adicionais").
 *
 * DIVERGÊNCIA DOCUMENTADA: `packages/crm-hub/src/CRMEvent.ts` já declara `"SupplierRegistered"`
 * como um dos dezoito `CRMEventType` Frozen — um nome idêntico ao primeiro membro deste enum, nunca
 * publicado por nenhum método real de `CRMManager` (verificado por grep). Não existe, nesta
 * plataforma, nenhum tipo unificado de Evento entre pacotes (`CRMEvent`/`SupplierEvent` são uniões
 * TypeScript completamente independentes, sem colisão de compilação possível) — mas a colisão de
 * *nome de domínio* entre um Evento Frozen nunca implementado (CRM Hub) e este Evento agora
 * implementado (Supplier Hub) é uma divergência de governança real, detalhada em
 * `docs/implementation/IMP_201_SUPPLIER_HUB_CORE_REPORT.md`, Capítulo 2, com uma Amendment proposta
 * (nunca executada por esta Sprint) contra `CRM_DOMAIN_BLUEPRINT.md`.
 *
 * Cada Evento carrega apenas informação pertencente ao Supplier Hub, per instrução explícita de
 * IMP-201 — nenhum campo de outro domínio (Purchase Hub, Commerce Hub) é embutido no payload além de
 * identificador opaco de referência, quando aplicável.
 */
export type SupplierEventType =
  | 'SupplierRegistered'
  | 'SupplierUpdated'
  | 'SupplierDisabled'
  | 'SupplierReactivated'
  | 'SupplierCatalogItemRegistered'
  | 'SupplierContractCreated'
  | 'SupplierPerformanceRecorded';

export interface SupplierEvent {
  /** Identificador do Evento. */
  readonly eventId: string;

  /** Tipo do Evento. */
  readonly type: SupplierEventType;

  /** Supplier ao qual este Evento se refere. */
  readonly supplierId: string;

  /** Momento em que o Fato ocorreu. */
  readonly occurredAt: Date;
}
