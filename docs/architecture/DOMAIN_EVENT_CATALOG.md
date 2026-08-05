# Domain Event Catalog — Extensão ERP

**Adaptive Business Platform · Documento Técnico (Draft)**

---

## Nota de Posicionamento Documental

Este documento nasce em status **Draft** (`DOCUMENTATION_CONSTITUTION.md`, §8.1), como parte da Sprint ERP-001. Ele não altera nenhuma linha de `EVENT_CATALOG.md` (Official) — é uma extensão consultável, no mesmo formato de oito atributos já estabelecido por aquele documento (Objetivo, Produtor, Consumidores, Momento de publicação, Payload conceitual, Idempotência, Replay, Versionamento), cobrindo exclusivamente os Eventos novos introduzidos pelos cinco novos Hubs desta Sprint (Purchase Hub, Supplier Hub, Inventory Movement Hub, Production Hub, Fiscal Hub) e pela extensão de integração do Financial Hub. Verificação cruzada contra `EVENT_CATALOG.md` confirma zero colisão de nome — nenhum Evento aqui catalogado republica, sob nome diferente, um Evento já Official ou Frozen.

Todo princípio do Capítulo 3 de `EVENT_CATALOG.md` — Business Events Only, Single Producer, Multiple Consumers, Immutable Events, Append Only, Idempotent Processing, Replay Safe, Versioned Events — aplica-se integralmente a cada Evento deste catálogo, sem exceção e sem reinterpretação.

---

## 1. Catálogo Oficial (extensão)

### Purchase Hub

**`PurchaseRequisitionCreated`** — Objetivo: registrar nova necessidade de compra, manual ou originada por Reorder Rule. Produtor: Purchase Hub. Consumidores: Analytics. Momento: após persistência da Requisição. Payload conceitual: identificador, origem (`Manual`/`ReorderRule`/`AIRecommendation`), lista de item sugerido. Idempotência: por identificador. Replay: seguro. Versionamento: v1.

**`PurchaseRequisitionApproved`** — Objetivo: comunicar aprovação de uma Requisição, habilitando sua conversão em Purchase Order. Produtor: Purchase Hub. Consumidores: Analytics. Momento: após confirmação humana ou de alçada. Payload conceitual: identificador da Requisição. Idempotência: por identificador. Replay: seguro. Versionamento: v1.

**`PurchaseCreated`** — Objetivo: registrar novo Pedido de Compra. Produtor: Purchase Hub. Consumidores: Supplier, Analytics. Momento: após persistência do Purchase Order. Payload conceitual: identificador, supplierId, lista de item, valor total estimado. Idempotência: por identificador. Replay: seguro. Versionamento: v1.

**`PurchaseApproved`** — Objetivo: comunicar aprovação formal de um Purchase Order acima do teto de alçada. Produtor: Purchase Hub. Consumidores: Analytics. Momento: após confirmação humana ou automática dentro de alçada. Payload conceitual: identificador, valor aprovado. Idempotência: por identificador. Replay: seguro. Versionamento: v1.

**`PurchaseSentToSupplier`** — Objetivo: comunicar envio formal do Pedido ao Fornecedor. Produtor: Purchase Hub. Consumidores: Supplier, Analytics. Momento: após confirmação de envio. Payload conceitual: identificador, supplierId. Idempotência: por identificador. Replay: seguro. Versionamento: v1.

**`PurchaseReceived`** — Objetivo: comunicar recebimento total de um Pedido de Compra. Produtor: Purchase Hub. Consumidores: Inventory Movement, Supplier, Financial (extensão), Analytics. Momento: após confirmação de Receiving cobrindo a totalidade dos itens. Payload conceitual: identificador do Purchase Order, supplierId, lista de item recebido com acquisitionCost. Idempotência: por identificador do Receiving. Replay: seguro, base de reconstrução de Stock Movement e de Account Payable. Versionamento: v1.

**`PurchasePartiallyReceived`** — Objetivo: comunicar recebimento parcial. Produtor: Purchase Hub. Consumidores: Inventory Movement, Supplier, Analytics. Momento: após confirmação de Receiving cobrindo parte dos itens. Payload conceitual: identificador, itens recebidos nesta parcela. Idempotência: por identificador do Receiving. Replay: seguro. Versionamento: v1.

**`PurchaseCancelled`** — Objetivo: comunicar cancelamento de um Pedido de Compra ainda sem Receiving registrado. Produtor: Purchase Hub. Consumidores: Supplier, Analytics. Momento: após confirmação do cancelamento. Payload conceitual: identificador, motivo. Idempotência: por identificador. Replay: seguro. Versionamento: v1.

**`ReorderRuleTriggered`** — Objetivo: comunicar que um limiar de reposição foi cruzado. Produtor: Purchase Hub. Consumidores: Automation, Analytics. Momento: após avaliação da Reorder Rule contra Stock Position consumida. Payload conceitual: identificador da regra, productId, quantidade atual. Idempotência: por identificador e janela de avaliação. Replay: seguro. Versionamento: v1.

### Supplier Hub

**`SupplierRegistered`** — Objetivo: registrar novo Fornecedor. Produtor: Supplier Hub. Consumidores: Purchase, Financial (extensão), Analytics. Momento: após persistência do Supplier. Payload conceitual: identificador, razão social, taxId. Idempotência: por identificador e taxId. Replay: seguro. Versionamento: v1.

**`SupplierUpdated`** — Objetivo: comunicar alteração de atributo relevante de um Supplier. Produtor: Supplier Hub. Consumidores: Analytics. Momento: após confirmação da alteração. Payload conceitual: identificador, campos alterados. Idempotência: por identificador e timestamp. Replay: seguro. Versionamento: v1.

**`SupplierDisabled`** — Objetivo: comunicar desabilitação de um Fornecedor. Produtor: Supplier Hub. Consumidores: Purchase, Analytics. Momento: após confirmação. Payload conceitual: identificador, motivo. Idempotência: por identificador. Replay: seguro. Versionamento: v1.

**`SupplierReactivated`** — Objetivo: comunicar reativação de um Fornecedor previamente desabilitado. Produtor: Supplier Hub. Consumidores: Purchase, Analytics. Momento: após confirmação. Payload conceitual: identificador. Idempotência: por identificador. Replay: seguro. Versionamento: v1.

**`SupplierCatalogItemRegistered`** — Objetivo: registrar associação entre Fornecedor e item de Catalog. Produtor: Supplier Hub. Consumidores: Purchase, Analytics. Momento: após persistência. Payload conceitual: identificador, supplierId, productId, listPrice. Idempotência: por identificador. Replay: seguro. Versionamento: v1.

**`SupplierContractCreated`** — Objetivo: registrar novo contrato formal com Fornecedor. Produtor: Supplier Hub. Consumidores: Financial (extensão), Analytics. Momento: após persistência. Payload conceitual: identificador, supplierId, condição de pagamento. Idempotência: por identificador. Replay: seguro. Versionamento: v1.

**`SupplierPerformanceRecorded`** — Objetivo: registrar fato observável de desempenho de entrega. Produtor: Supplier Hub. Consumidores: Analytics. Momento: após consumo de PurchaseReceived/PurchasePartiallyReceived. Payload conceitual: identificador, supplierId, purchaseOrderId, tipo de observação. Idempotência: por identificador do fato de origem. Replay: seguro. Versionamento: v1.

### Inventory Movement Hub

**`InventoryReceived`** — Objetivo: comunicar entrada de estoque por recebimento de compra. Produtor: Inventory Movement Hub. Consumidores: Commerce, Purchase (indireto via Stock Position), Analytics. Momento: após registro do Stock Movement correspondente a PurchaseReceived. Payload conceitual: productId, locationId, quantityDelta, origem (Purchase), originReferenceId. Idempotência: por originReferenceId e linha de item. Replay: seguro, base de reconstrução de Stock Position. Versionamento: v1.

**`InventoryReserved`** — Objetivo: comunicar reserva temporária de quantidade. Produtor: Inventory Movement Hub. Consumidores: Commerce, Analytics. Momento: após confirmação de Stock Reservation, tipicamente em CheckoutStarted. Payload conceitual: productId, orderId, quantidade reservada. Idempotência: por orderId e productId. Replay: seguro. Versionamento: v1.

**`InventoryReleased`** — Objetivo: comunicar liberação de reserva sem conversão em saída definitiva. Produtor: Inventory Movement Hub. Consumidores: Commerce, Analytics. Momento: após expiração ou cancelamento da reserva. Payload conceitual: identificador da reserva, productId, quantidade liberada. Idempotência: por identificador da reserva. Replay: seguro. Versionamento: v1.

**`InventoryAdjusted`** — Objetivo: comunicar recálculo de Stock Position após novo Stock Movement, incluindo ajuste manual. Produtor: Inventory Movement Hub. Consumidores: Commerce, Purchase (Reorder Rule), Analytics. Momento: após cada novo Stock Movement registrado. Payload conceitual: productId, locationId, quantityOnHand, quantityAvailable. Idempotência: por productId, locationId e Stock Movement de origem. Replay: seguro. Versionamento: v1.

**`InventoryConsumed`** — Objetivo: comunicar saída de estoque por consumo de insumo em Produção — publicado como reflexo de ProductionConsumption (Production Hub) já registrado como Stock Movement. Produtor: Inventory Movement Hub. Consumidores: Commerce, Analytics. Momento: após registro do Stock Movement de origem ProductionConsumption. Payload conceitual: productId, productionOrderId, quantidade consumida. Idempotência: por productionOrderId e productId. Replay: seguro. Versionamento: v1.

**`InventoryProduced`** — Objetivo: comunicar entrada de estoque por Produto acabado gerado em Produção. Produtor: Inventory Movement Hub. Consumidores: Commerce, Analytics. Momento: após registro do Stock Movement de origem ProductionOutput. Payload conceitual: productId, productionOrderId, quantidade gerada. Idempotência: por productionOrderId e productId. Replay: seguro. Versionamento: v1.

**`StockAlertTriggered`** — Objetivo: comunicar cruzamento de limiar de Stock Alert Rule. Produtor: Inventory Movement Hub. Consumidores: Purchase, Automation, Analytics. Momento: após recálculo de Stock Position que cruza o limiar configurado. Payload conceitual: productId, locationId, thresholdQuantity, quantidade atual. Idempotência: por productId e janela de avaliação. Replay: seguro. Versionamento: v1.

### Production Hub

**`BillOfMaterialsCreated`** — Objetivo: registrar nova composição de Produto. Produtor: Production Hub. Consumidores: Analytics. Momento: após persistência. Payload conceitual: identificador, outputProductId, lista de BOM Line. Idempotência: por identificador. Replay: seguro. Versionamento: v1.

**`BillOfMaterialsSuperseded`** — Objetivo: comunicar substituição de uma versão de composição por outra. Produtor: Production Hub. Consumidores: Analytics. Momento: após confirmação de nova versão ativa. Payload conceitual: identificador anterior, identificador novo. Idempotência: por par de identificadores. Replay: seguro. Versionamento: v1.

**`ProductionStarted`** — Objetivo: comunicar início de execução de uma Ordem de Produção, após verificação de insumo suficiente. Produtor: Production Hub. Consumidores: Inventory Movement, Analytics. Momento: após transição a InProgress. Payload conceitual: identificador, billOfMaterialsId, quantidade planejada. Idempotência: por identificador. Replay: seguro. Versionamento: v1.

**`ProductionConsumption`** — Objetivo: registrar insumo efetivamente consumido. Produtor: Production Hub. Consumidores: Inventory Movement, Financial (extensão), Analytics. Momento: após confirmação do consumo. Payload conceitual: productionOrderId, inputProductId, quantidade consumida, acquisitionCost de origem. Idempotência: por productionOrderId e inputProductId. Replay: seguro. Versionamento: v1.

**`ProductionOutput`** — Objetivo: registrar Produto acabado efetivamente gerado. Produtor: Production Hub. Consumidores: Inventory Movement, Commerce, Analytics. Momento: após confirmação da geração. Payload conceitual: productionOrderId, outputProductId, quantidade gerada. Idempotência: por productionOrderId. Replay: seguro. Versionamento: v1.

**`ProductionCompleted`** — Objetivo: comunicar conclusão de uma Ordem de Produção. Produtor: Production Hub. Consumidores: Financial (extensão), Analytics. Momento: após ProductionOutput correspondente já registrado. Payload conceitual: identificador, custo total consumido, quantidade gerada. Idempotência: por identificador. Replay: seguro. Versionamento: v1.

**`ProductionCancelled`** — Objetivo: comunicar cancelamento de Ordem de Produção antes de qualquer consumo registrado. Produtor: Production Hub. Consumidores: Analytics. Momento: após confirmação. Payload conceitual: identificador, motivo. Idempotência: por identificador. Replay: seguro. Versionamento: v1.

### Fiscal Hub

**`TaxRuleCreated`** — Objetivo: registrar nova regra de cálculo tributário. Produtor: Fiscal Hub. Consumidores: Analytics. Momento: após persistência. Payload conceitual: identificador, taxRegimeId, classificação, alíquota. Idempotência: por identificador. Replay: seguro. Versionamento: v1.

**`TaxCalculated`** — Objetivo: registrar resultado determinístico de cálculo tributário sobre uma linha de documento fiscal. Produtor: Fiscal Hub. Consumidores: Financial (extensão, referência), Analytics. Momento: após aplicação da Tax Rule vigente. Payload conceitual: fiscalDocumentLineId, taxRuleId, valor calculado. Idempotência: por fiscalDocumentLineId. Replay: seguro. Versionamento: v1.

**`FiscalDocumentIssued`** — Objetivo: comunicar emissão de Documento Fiscal. Produtor: Fiscal Hub. Consumidores: Finance (referência), Branding, Analytics. Momento: após emissão confirmada. Payload conceitual: identificador, orderId/invoiceId de origem, valor total de imposto. Idempotência: por identificador. Replay: seguro. Versionamento: v1.

**`FiscalDocumentCancelled`** — Objetivo: comunicar cancelamento formal de Documento Fiscal já emitido. Produtor: Fiscal Hub. Consumidores: Finance (referência), Analytics. Momento: após confirmação do cancelamento. Payload conceitual: identificador, motivo. Idempotência: por identificador. Replay: seguro. Versionamento: v1.

**`FiscalObligationRegistered`** — Objetivo: registrar nova obrigação acessória periódica. Produtor: Fiscal Hub. Consumidores: Automation, Analytics. Momento: após persistência. Payload conceitual: identificador, tipo, data de vencimento. Idempotência: por identificador. Replay: seguro. Versionamento: v1.

**`FiscalObligationOverdue`** — Objetivo: comunicar vencimento ultrapassado de uma obrigação fiscal. Produtor: Fiscal Hub. Consumidores: Automation, Analytics. Momento: após avaliação periódica que confirma o atraso. Payload conceitual: identificador, dias de atraso. Idempotência: por identificador e janela de avaliação. Replay: seguro. Versionamento: v1.

---

## 2. Eventos de Referência (produzidos fora do ERP Foundation, citados por integração)

Estes Eventos já são Official ou Draft em seus documentos proprietários e são apenas referenciados aqui pelo papel que assumem nos quatro fluxos de `ERP_ARCHITECTURE.md`, Capítulo 7 — nenhum é redefinido: `OpportunityWon` (CRM Hub, Official), `OrderCreated`/`OrderPaid`/`OrderFulfilled`/`CheckoutStarted`/`CheckoutCompleted`/`PriceChanged` (Commerce Hub, Draft), `InvoiceCreated`/`InvoicePaid` (Finance Hub, Official).

---

## 3. Classificação (extensão)

```
              CLASSIFICAÇÃO DOS EVENTOS — EXTENSÃO ERP
   ┌───────────────────────────────────────────────────────────┐
   │  Supply Events:      Purchase Hub · Supplier Hub                  │
   │  Ledger Events:      Inventory Movement Hub (Stock Movement)          │
   │  Transformation:     Production Hub                                      │
   │  Compliance Events:  Fiscal Hub                                              │
   └───────────────────────────────────────────────────────────┘
```

Todos os Eventos desta extensão são **Business Events**, na mesma classificação de `EVENT_CATALOG.md`, Capítulo 5 — cada um representa um fato de negócio que um especialista de compras, estoque, produção ou conformidade fiscal reconheceria e nomearia da mesma forma.

---

## 4. Regras de Publicação (herdadas, sem exceção)

Todo princípio dos Capítulos 7 e 8 de `EVENT_CATALOG.md` — Somente o Owner publica, Eventos são imutáveis, Nunca editar Evento, Replay é sempre permitido, Versionamento é obrigatório, todo Evento carrega identificador único e timestamp, todo Evento referencia seu Aggregate de origem — aplica-se integralmente a cada Evento deste catálogo, sem exceção.

---

## 5. Change Request Proposta

`EVENT_CATALOG.md` — incorporar este catálogo como novas seções por Hub (Purchase Hub, Supplier Hub, Inventory Movement Hub, Production Hub, Fiscal Hub), quando os cinco documentos-fonte avançarem de Draft para Official, mesmo processo já aplicado à série BP-001–008.
