/**
 * ReorderRule — regra de reposição automática de um Produto, avaliada por `ReorderEvaluationService`
 * contra a quantidade em estoque corrente (`PURCHASE_HUB.md`, Capítulo 4/11).
 *
 * LIMITE DE DOMÍNIO DOCUMENTADO (per instrução de IMP-301 — "Nunca corrigir silenciosamente"):
 * `PURCHASE_HUB.md`, Capítulo 11, descreve `ReorderEvaluationService` como avaliando "continuamente"
 * `Reorder Rule` contra "Stock Position" do Inventory Movement Hub — mas `packages/inventory-movement-hub`
 * não existe como código real nesta Fase (apenas a arquitetura em `docs/architecture/INVENTORY_MOVEMENT_HUB.md`,
 * produzida pela ERP-001; confirmado por grep completo do monorepo nesta Sprint). Não existe,
 * portanto, nenhuma fonte real de evento de estoque à qual este Hub possa se inscrever. Esta Sprint
 * implementa `ReorderEvaluationService.evaluate(rule, currentQuantity)` recebendo a quantidade
 * corrente como parâmetro explícito do chamador, em vez de qualquer inscrição real — mesma disciplina
 * já usada por `SupplierPerformanceService.recordFromReceiving`
 * (`packages/supplier-hub/src/SupplierPerformanceService.ts`) diante de um Hub produtor que ainda não
 * existe como pacote. A avaliação "contínua" real é trabalho de uma Sprint futura de integração
 * (quando `packages/inventory-movement-hub` existir), detalhado em
 * `IMP_301_PURCHASE_HUB_CORE_REPORT.md`, Seção "Preparação para IMP-302".
 *
 * Estrutura definida em `PURCHASE_HUB.md`, Capítulo 5.
 */
export interface ReorderRule {
  /** Identificador da Regra. */
  readonly ruleId: string;

  /** Tenant ao qual a Regra pertence. */
  readonly tenantId: string;

  /** Produto referenciado por identificador opaco (Commerce Hub). */
  readonly productId: string;

  /** Quantidade em estoque abaixo (ou igual a) da qual a Regra é disparada. */
  readonly thresholdQuantity: number;

  /** Quantidade sugerida a repor quando a Regra dispara. */
  readonly reorderQuantity: number;

  /** Fornecedor preferencial, quando definido — apenas identificador opaco, nunca obrigatório. */
  readonly preferredSupplierId?: string;

  /** Regras inativas nunca são avaliadas por `ReorderEvaluationService`. */
  readonly active: boolean;

  /** Momento de criação. */
  readonly createdAt: Date;

  /** Momento da última alteração. */
  readonly updatedAt: Date;
}
