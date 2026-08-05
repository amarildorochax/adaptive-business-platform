/**
 * ProductionEvent — os sete Eventos de domínio publicados pelo Production Hub, cada um um Fato já
 * consumado, nunca uma instrução. Conjunto exato de `DOMAIN_EVENT_CATALOG.md`, seção "Production Hub"
 * (idêntico a `PRODUCTION_HUB.md`, Capítulo 8) — nenhum Evento adicional foi criado por esta Sprint,
 * per instrução explícita desta Sprint ("Nunca inventar eventos").
 *
 * NOTA: os tipos `'ProductionConsumption'`/`'ProductionOutput'` de `ProductionEventType` colidem, por
 * nome, com as Entidades `ProductionConsumption`/`ProductionOutput` (`ProductionConsumption.ts`/
 * `ProductionOutput.ts`) — mesmo nome usado pela arquitetura tanto para o registro quanto para o
 * Evento que o comunica (`PRODUCTION_HUB.md`, Capítulos 5 e 8 usam o termo idêntico). Isso nunca gera
 * colisão real em TypeScript (um é um tipo, o outro um literal de string dentro de uma união), mas é
 * documentado aqui para evitar confusão de leitura — nenhum dos dois nomes foi alterado, por serem
 * exatamente os nomes já aprovados pela arquitetura.
 *
 * Cada Evento carrega apenas identificadores de correlação, nunca dado de negócio duplicado (nome
 * completo do payload conceitual disponível apenas consultando o Aggregate via `ProductionManager`) —
 * mesma disciplina de minimalismo referencial já aplicada por `InventoryEvent`
 * (`packages/inventory-movement-hub/src/InventoryEvent.ts`, que também omite campos como quantidade
 * apesar de listados no "Payload conceitual" do catálogo).
 */
export type ProductionEventType =
  | 'BillOfMaterialsCreated'
  | 'BillOfMaterialsSuperseded'
  | 'ProductionStarted'
  | 'ProductionConsumption'
  | 'ProductionOutput'
  | 'ProductionCompleted'
  | 'ProductionCancelled';

export interface ProductionEvent {
  /** Identificador do Evento. */
  readonly eventId: string;

  /** Tipo do Evento. */
  readonly type: ProductionEventType;

  /** BillOfMaterials à qual este Evento se refere, quando aplicável. Para `BillOfMaterialsSuperseded`,
   * identifica a nova versão já ativa. */
  readonly billOfMaterialsId?: string;

  /** Versão anterior da BillOfMaterials, apenas em `BillOfMaterialsSuperseded`. */
  readonly previousBillOfMaterialsId?: string;

  /** ProductionOrder à qual este Evento se refere, quando aplicável. */
  readonly productionOrderId?: string;

  /** WorkCenter ao qual este Evento se refere, quando aplicável — nenhum Evento catalogado hoje
   * referencia WorkCenter diretamente; campo reservado por simetria com `ProductionOrder.workCenterId`. */
  readonly workCenterId?: string;

  /** Insumo referenciado por identificador opaco (Commerce Hub), apenas em `ProductionConsumption`. */
  readonly inputProductId?: string;

  /** Produto acabado referenciado por identificador opaco (Commerce Hub), apenas em
   * `ProductionOutput`. */
  readonly outputProductId?: string;

  /** Momento em que o Fato ocorreu. */
  readonly occurredAt: Date;
}
