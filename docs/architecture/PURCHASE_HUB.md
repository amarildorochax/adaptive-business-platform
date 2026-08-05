# Purchase Hub — Blueprint de Domínio

**Adaptive Business Platform · Documento Técnico (Draft)**

---

## Nota de Posicionamento Documental

Este documento nasce em status **Draft** (`DOCUMENTATION_CONSTITUTION.md`, §8.1), como parte da Sprint ERP-001 — ver `ERP_ARCHITECTURE.md` para a Nota de Posicionamento consolidada de toda a série. É pura arquitetura de domínio: nenhum código, Manager, Service, Repository, endpoint ou tabela foi criado para produzi-lo.

Purchase Hub ocupa território genuinamente livre — a auditoria da FUN-106 (`docs/implementation/FUN_106_PURCHASE_WORKSPACE_REPORT.md`) confirmou, via grep completo de `packages/commerce-hub/src/` e de `COMMERCE_HUB_ARCHITECTURE.md`, zero ocorrência de "Purchase" como conceito de domínio em qualquer camada da plataforma. Este documento absorve, como sua camada estratégica (Capítulo 9), o que a Sprint ERP-001 nomeou separadamente como "Procurement Hub" — Requisição, Ponto de Reposição e Seleção de Fornecedor não justificam um Owner próprio, porque operam sobre o mesmo Aggregate Root (`Purchase Order`, antes de sua confirmação) e a mesma cadeia de eventos do ciclo de vida transacional já descrito neste documento — ver ADR-PU-001.

`Product`/`Variant` permanecem, sem exceção, do Commerce Hub — `Purchase Order Item` referencia por identificador, nunca reimplementa `Product`. `Supplier` permanece do Supplier Hub — `Purchase Order` referencia por identificador, nunca duplica dado cadastral de Fornecedor. `Account Payable` permanece do Finance Hub — Purchase Hub nunca a cria diretamente, apenas publica `PurchaseReceived`, consumido pelo Finance Hub via a extensão documentada em `FINANCIAL_HUB.md`.

---

## 1. Introdução

O **Purchase Hub** é o domínio responsável pelo ciclo de vida completo da aquisição de mercadoria ou insumo junto a um Fornecedor — da decisão estratégica de comprar (Requisição) até a confirmação física de recebimento. É o Hub que fecha, do lado do suprimento, a mesma função que o Commerce Hub já fecha do lado da venda: ele é, estruturalmente, o "espelho de compra" do "Order" de venda, seguindo o mesmo Aggregate central (um pedido, sua lista de itens, seu ciclo de status) já validado pelo Commerce Hub.

---

## 2. Responsabilidade

O Purchase Hub é responsável por manter o ciclo de vida de `Purchase Requisition`, `Purchase Order`/`Purchase Order Item`, `Receiving` e `Reorder Rule`; por decidir quando uma Requisição é elegível a virar Pedido de Compra; por rastrear o status de um Pedido de Compra da criação à aprovação, envio, recebimento parcial ou total, e cancelamento; e por publicar, a cada transição de estado relevante, o Evento correspondente para que Inventory Movement Hub e Financial Hub reajam de forma independente.

---

## 3. Limites do Domínio

O Purchase Hub nunca cria ou altera `Product`/`Variant` — apenas referencia por identificador o Catalog já existente do Commerce Hub; um Pedido de Compra para um Produto ainda não cadastrado é bloqueado até que o Produto exista.

O Purchase Hub nunca cria ou altera `Supplier` — apenas referencia por identificador o Supplier Hub; a existência de um Fornecedor ativo é pré-condição de todo `Purchase Order`.

O Purchase Hub nunca decrementa ou incrementa estoque diretamente — apenas publica `PurchaseReceived`; a atualização do ledger físico é responsabilidade exclusiva do Inventory Movement Hub, que consome esse Evento.

O Purchase Hub nunca cria `Account Payable`, `Invoice` ou qualquer Entidade financeira — apenas publica `PurchaseReceived`/`PurchaseApproved`; a criação de obrigação financeira é responsabilidade exclusiva do Finance Hub, via extensão documentada em `FINANCIAL_HUB.md`.

O Purchase Hub nunca calcula seu próprio indicador de giro de compra ou de lead time consolidado — esses são Metric/KPI do Analytics Hub, consumidos, nunca recalculados localmente.

---

## 4. Aggregates

**Purchase Order** é o Aggregate Root deste domínio — agrupa `Purchase Order Item` como parte interna, garante que nenhum item seja adicionado após confirmação de recebimento total, e é a única Entidade deste domínio que outro Hub referencia por identificador.

**Purchase Requisition** é um Aggregate independente e anterior ao `Purchase Order` — representa a necessidade de compra antes de sua formalização; uma Requisição aprovada origina exatamente um `Purchase Order`, nunca o inverso.

**Reorder Rule** é um Aggregate independente, associado a um `Product`/Variant (Commerce Hub, por identificador) e a um limiar de estoque; sua avaliação, quando o limiar é cruzado, produz uma `Purchase Requisition` automaticamente.

---

## 5. Entidades

**Purchase Order.** Identificador; `supplierId` (Supplier Hub); status (`Draft`, `PendingApproval`, `Approved`, `Sent`, `PartiallyReceived`, `Received`, `Cancelled`); lista de `Purchase Order Item`; datas de criação, aprovação, previsão de entrega; `requisitionId` de origem, quando aplicável.

**Purchase Order Item.** Identificador; `purchaseOrderId`; `productId`/`variantId` (Commerce Hub); quantidade solicitada; quantidade recebida (acumulada por `Receiving`); `acquisitionCost` (Value Object `Money`); status próprio (`Pending`, `PartiallyReceived`, `Received`, `Cancelled`).

**Receiving.** Identificador; `purchaseOrderId`; lista de `(purchaseOrderItemId, quantidade recebida)`; data de recebimento; identificação de quem confirmou (referência a `Identity Hub`, por identificador).

**Purchase Requisition.** Identificador; origem (`Manual`, `ReorderRule`, `AIRecommendation` — nunca criada automaticamente por IA sem confirmação, per `ERP_ARCHITECTURE.md`, Capítulo 8); lista de item sugerido (`productId`, quantidade sugerida); status (`Open`, `Approved`, `Rejected`, `ConvertedToPurchaseOrder`).

**Reorder Rule.** Identificador; `productId`/`variantId`; `thresholdQuantity`; `reorderQuantity`; `preferredSupplierId` (opcional); ativa/inativa.

---

## 6. Value Objects

**Money** — valor monetário e `Currency` (referenciando o mesmo conceito já Official de Finance Hub, nunca reimplementado).

**PurchaseStatus** — enum fechado do ciclo de vida de `Purchase Order`.

**ReceivingLine** — par imutável `(purchaseOrderItemId, quantidade)`, parte de `Receiving`, nunca editado após criação — todo Receiving é imutável assim que confirmado, mesma disciplina de `Ledger Entry`.

**ApprovalThreshold** — valor monetário acima do qual um `Purchase Order` exige aprovação humana explícita, abaixo do qual o Automation Engine pode aprovautomaticamente, conforme Regra já configurada — nunca decidido internamente pelo Purchase Hub.

---

## 7. Commands

`CreatePurchaseRequisition`, `ApprovePurchaseRequisition`, `RejectPurchaseRequisition`, `ConvertRequisitionToPurchaseOrder`, `CreatePurchaseOrder`, `AddPurchaseOrderItem`, `ApprovePurchaseOrder`, `SendPurchaseOrderToSupplier`, `RegisterReceiving`, `CancelPurchaseOrder`, `CreateReorderRule`, `DeactivateReorderRule`.

Todo Command é processado exclusivamente pelo `PurchaseManager` (Capítulo 10) — nenhum outro módulo cria ou altera `Purchase Order` por qualquer outro caminho.

---

## 8. Eventos

Ver `DOMAIN_EVENT_CATALOG.md` para o contrato completo (produtor, consumidores, payload, idempotência, replay, versionamento) de cada Evento a seguir: `PurchaseRequisitionCreated`, `PurchaseRequisitionApproved`, `PurchaseCreated`, `PurchaseApproved`, `PurchaseSentToSupplier`, `PurchaseReceived`, `PurchasePartiallyReceived`, `PurchaseCancelled`, `ReorderRuleTriggered`.

---

## 9. Procurement — a camada estratégica (absorvida, não separada)

A Sprint ERP-001 nomeou "Procurement Hub" como um domínio próprio; este documento formaliza, per ADR-PU-001, sua absorção como a camada estratégica do Purchase Hub — o conjunto de decisões que precedem a criação formal de um `Purchase Order`:

**Requisição** — `Purchase Requisition` (Capítulo 5), o registro formal de necessidade de compra, seja manual, seja originada por `Reorder Rule`, seja sugerida (nunca criada) por um Agente de IA (`ERP_ARCHITECTURE.md`, Capítulo 8).

**Ponto de Reposição** — `Reorder Rule` (Capítulo 5), avaliada continuamente contra `Stock Position` (Inventory Movement Hub, consumido por Evento `InventoryAdjusted`/`InventoryReleased`, nunca por leitura direta de estrutura interna).

**Seleção de Fornecedor** — decisão humana ou assistida (Capítulo 8 de `ERP_ARCHITECTURE.md`) que consome `Supplier Catalog Item`/`Supplier Performance Record` (Supplier Hub, por Query já exposta) para escolher o `supplierId` de um novo `Purchase Order` — nunca modelada como Entidade própria, apenas como critério de decisão sobre um campo já existente de `Purchase Order`.

---

## 10. Repository Interfaces (especificação, sem implementação)

```
interface PurchaseOrderRepository {
  findById(id): PurchaseOrder | null
  findBySupplier(supplierId): PurchaseOrder[]
  findByStatus(status): PurchaseOrder[]
  save(order): void
}

interface PurchaseRequisitionRepository {
  findById(id): PurchaseRequisition | null
  findOpen(): PurchaseRequisition[]
  save(requisition): void
}

interface ReceivingRepository {
  findByPurchaseOrder(purchaseOrderId): Receiving[]
  save(receiving): void
}

interface ReorderRuleRepository {
  findActiveByProduct(productId): ReorderRule | null
  findAllActive(): ReorderRule[]
  save(rule): void
}
```

Nenhuma implementação (SQLite, in-memory, HTTP) é definida por esta Sprint — a interface é o único contrato normativo, mesmo padrão já adotado por todo Repository Interface de `CRM_DOMAIN_BLUEPRINT.md`/`COMMERCE_HUB_ARCHITECTURE.md`.

---

## 11. Managers e Services (especificação)

**PurchaseManager** é a única fachada pública deste domínio — todo Command listado no Capítulo 7 é processado exclusivamente por ele; ele nunca expõe acesso direto a `PurchaseOrderRepository` a nenhum consumidor externo.

**PurchaseOrderService** encapsula a lógica de transição de status e a validação de que todo item referencia um `Product` já existente (verificado por Query ao Commerce Hub, nunca por leitura de sua estrutura interna).

**ReceivingService** encapsula a lógica de reconciliação entre quantidade solicitada e quantidade recebida, decidindo `PartiallyReceived` vs. `Received`, e é o único ponto que publica `PurchaseReceived`.

**ReorderEvaluationService** avalia continuamente `Reorder Rule` contra `Stock Position` consumida, e é o único ponto que produz `PurchaseRequisitionCreated` a partir de `ReorderRuleTriggered`.

---

## 12. Regras de Negócio

Todo `Purchase Order` referencia exatamente um `Supplier` ativo — um Fornecedor desabilitado (`SupplierDisabled`, Supplier Hub) bloqueia a criação de novo Pedido, mas nunca cancela pedidos já em andamento.

Todo `Purchase Order Item` referencia um `Product`/`Variant` já existente no Catalog do Commerce Hub — nenhum Produto é criado implicitamente a partir de uma compra.

Um `Purchase Order` acima do `ApprovalThreshold` configurado exige `PurchaseApproved` explícito antes de `PurchaseSentToSupplier` — abaixo do teto, o Automation Engine pode aprovautomaticamente, conforme Regra já configurada, nunca por decisão interna do Purchase Hub.

Um `Receiving` nunca registra quantidade recebida maior que a quantidade pendente de um `Purchase Order Item` — tentativa de excesso é rejeitada, não truncada silenciosamente.

Todo `Receiving` confirmado é imutável — uma correção de recebimento incorreto é sempre um novo `Receiving` de ajuste, nunca uma edição do original, mesma disciplina de `Ledger Entry` (Finance Hub).

Um `Purchase Order` só transiciona a `Cancelled` se nenhum `Receiving` já tiver sido registrado contra ele — cancelamento parcial após recebimento parcial é modelado como devolução ao Fornecedor, capacidade explicitamente fora do escopo desta Sprint (Oportunidade Futura, ver `ERP_FOUNDATION_REPORT.md`).

---

## 13. Fluxo Completo

```
   Reorder Rule cruza threshold ──► PurchaseRequisitionCreated
        │
        ▼
   Requisição aprovada (humana ou alçada) ──► PurchaseRequisitionApproved
        │
        ▼
   ConvertRequisitionToPurchaseOrder ──► PurchaseCreated (Draft)
        │
        ▼
   Itens adicionados/confirmados ──► PurchaseApproved (se dentro de alçada
        │                             ou aprovação humana explícita)
        ▼
   PurchaseSentToSupplier
        │
        ▼
   RegisterReceiving (parcial ou total)
        │
        ├──► PurchasePartiallyReceived (se quantidade < solicitada)
        │
        └──► PurchaseReceived (se quantidade == solicitada)
                  │
                  ├──► Inventory Movement Hub: InventoryReceived
                  │
                  └──► Financial Hub (extensão): AccountPayable criada
```

---

## 14. Integrações

**Supplier Hub** — toda referência de `supplierId` é validada contra `SupplierRegistered`/`SupplierDisabled` já consumido; nenhuma leitura direta de estrutura interna.

**Commerce Hub** — toda referência de `productId`/`variantId` é validada contra o Catalog já existente, via Query já exposta pelo Commerce Hub (nunca implementada nesta Sprint, apenas especificada como contrato).

**Inventory Movement Hub** — consumidor de `PurchaseReceived`/`PurchasePartiallyReceived`; nenhuma escrita do Purchase Hub sobre `Stock Movement`.

**Financial Hub (extensão)** — consumidor de `PurchaseReceived`; nenhuma escrita do Purchase Hub sobre `Account Payable`.

**Automation Engine** — consumidor de `ReorderRuleTriggered` (pode iniciar Workflow de aprovação automática) e produtor de `PurchaseApproved` quando dentro de alçada configurada.

**Analytics Hub** — consumidor de todo Evento deste Hub, sem exceção.

---

## 15. ADRs

**ADR-PU-001 — Procurement é a camada estratégica do Purchase Hub, não um Owner separado.** Contexto: Requisição, Ponto de Reposição e Seleção de Fornecedor operam sobre o mesmo Aggregate Root (`Purchase Order`, antes de sua confirmação); separá-las fragmentaria um processo de negócio coeso, violando o princípio High Cohesion de `DOMAIN_OWNERSHIP_MATRIX.md`, Capítulo 3.

**ADR-PU-002 — Purchase Order nunca cria Product implicitamente.** Contexto: preservar Single Owner do Catalog, exclusivo do Commerce Hub; um Pedido de Compra para item inexistente é sempre um erro de validação, nunca uma criação implícita.

**ADR-PU-003 — Receiving é imutável; correção é sempre um novo registro.** Contexto: replica a disciplina Append Only já Frozen em `EVENT_CATALOG.md`, Capítulo 3, aplicada a um Aggregate, não apenas a Evento.

**ADR-PU-004 — Aprovação de Purchase Order é governada por alçada configurável, nunca por regra fixa interna.** Contexto: permitir que cada Empresa (via Business Profile Engine) configure seu próprio teto, sem exigir mudança de código a cada Tenant.

---

## 16. Glossário

**Purchase Order** — pedido formal de compra a um Fornecedor.

**Purchase Requisition** — necessidade de compra ainda não formalizada em Pedido.

**Receiving** — confirmação física de recebimento de mercadoria contra um Pedido.

**Reorder Rule** — regra de ponto de reposição associada a um Produto.

**Procurement** — camada estratégica do Purchase Hub (Requisição, Ponto de Reposição, Seleção de Fornecedor); não é um Owner separado.
