# Order Hub (Extensão ERP) — Documento de Reconciliação

**Adaptive Business Platform · Documento Técnico (Draft)**

---

## Nota de Posicionamento Documental

Este documento **não introduz um novo proprietário de conceito.** A Sprint ERP-001 pediu nominalmente um "Order Hub" entre os dez domínios a desenhar; este documento formaliza a conclusão de que `Order`, `Order Item`, `Cart`, `Checkout`, `Quote` e `Shipment` já pertencem, desde a série BP-001–008, ao **Commerce Hub** (`COMMERCE_HUB_ARCHITECTURE.md`, Draft, Capítulos 16–26 — `OrderCreated`, `OrderPaid`, `OrderCancelled`, `OrderFulfilled` já catalogados como Eventos Official desse Hub). Não existe território livre a ocupar sob esse nome, mesmo com nenhum dos dois documentos ainda implementado em código.

O que existe, e que este documento formaliza como sua única contribuição real, é a **orquestração de um `Order` de venda através dos cinco novos Hubs desta Sprint** — antes da ERP-001, `Order` transicionava de `Pending` a `Fulfilled` sem nenhuma dependência de estoque real, produção real ou documento fiscal real, porque nenhum desses três conceitos existia. Este documento é o contrato de como esses cinco novos Hubs se encaixam no ciclo de vida de `Order` já definido, sem que `Order` deixe de ser, em nenhum momento, propriedade exclusiva do Commerce Hub.

Esta é também a razão pela qual **Pricing** não recebe documento próprio nesta Sprint: `Price` já é Evento e Entidade Official do Commerce Hub (`PriceChanged`), com implementação real confirmada (`packages/commerce-hub`, `PriceService.setPrice`, auditorias FUN-104/105/106). O único ponto de integração genuinamente novo — precificação orientada a custo de aquisição real — é documentado no Capítulo 3 abaixo, como contrato de integração, nunca como nova Entidade de precificação.

Nenhuma linha de `COMMERCE_HUB_ARCHITECTURE.md` é alterada por este documento.

---

## 1. O que este documento não é

Não é um novo Bounded Context. Não introduz `Order`, `Cart`, `Checkout`, `Quote`, `Shipment` — todos já Draft, exclusivos do Commerce Hub. Não redefine nenhum Evento já catalogado em `COMMERCE_HUB_ARCHITECTURE.md`, Capítulo 29. Não propõe nenhuma nova Entidade de precificação.

---

## 2. O que este documento é

É o contrato de como `CheckoutStarted`→`OrderCreated`→`OrderPaid`→`OrderFulfilled` (Commerce Hub, já definido) se relaciona com os cinco novos Hubs desta Sprint, formalizando três pontos de integração antes inexistentes porque os Hubs do outro lado não existiam.

### 2.1 Reserva de estoque real

`CheckoutStarted` (Commerce Hub) aciona `CreateStockReservation` (Inventory Movement Hub, Capítulo 7 de `INVENTORY_MOVEMENT_HUB.md`) — antes desta Sprint, essa reserva não tinha lastro em nenhum ledger real; agora, `Stock Reservation` é validada contra `Stock Position` derivada de `Stock Movement` real.

### 2.2 Acionamento condicional de Produção

Quando `CreateStockReservation` encontra `quantityAvailable` insuficiente para um Produto com `Bill of Materials` ativa (Production Hub), o Automation Engine — nunca o Commerce Hub diretamente, preservando ADR-006 de `ADR_INDEX.md` — aciona `CreateProductionOrder`. `OrderFulfilled` (Commerce Hub) só é publicado após `ProductionOutput` correspondente já ter sido registrado, quando aplicável.

### 2.3 Documento Fiscal real na entrega

`OrderPaid`, já hoje consumido pelo Finance Hub para `InvoiceCreated` (Capítulo 22 de `COMMERCE_HUB_ARCHITECTURE.md`), passa a ser seguido, através de `InvoiceCreated`, por `FiscalDocumentIssued` (Fiscal Hub) — antes desta Sprint, nenhum documento fiscal real acompanhava um `Order` concluído.

### 2.4 Precificação orientada a custo (não uma nova Entidade)

`PurchaseReceived` (Purchase Hub) publica `acquisitionCost` observado; o Commerce Hub, por sua própria decisão de Command interno (`SetPrice`, já existente), pode consumir esse valor como insumo de uma futura regra de margem — nunca uma escrita externa sobre `Price`, e nunca uma Entidade de precificação nova. Esta Sprint formaliza apenas o contrato de leitura; a regra de margem em si permanece Oportunidade Futura, fora do escopo de arquitetura pura desta Sprint.

---

## 3. Diagrama de Integração

```
   Commerce Hub (Order, já Draft)
        │
   CheckoutStarted ──────────────► Inventory Movement Hub: CreateStockReservation
        │                                    │
        │                          insuficiente? ──► Automation Engine ──►
        │                                              Production Hub: CreateProductionOrder
        │                                    │
        ▼                                    ▼
   OrderPaid ◄──────────────────── (reserva convertida em Stock Movement)
        │
        ▼
   InvoiceCreated (Finance Hub, já existente) ──► FiscalDocumentIssued (Fiscal Hub)
        │
        ▼
   OrderFulfilled (após ProductionOutput, quando aplicável) ──► Shipment (já Draft,
                                                                  Commerce Hub)
```

---

## 4. Regras de Negócio (desta extensão apenas)

`OrderFulfilled` nunca é publicado antes de `Stock Reservation` associada estar `ConvertedToMovement` — preserva a garantia de que todo Pedido concluído corresponde a saída física real já registrada no ledger do Inventory Movement Hub.

Um `Order` para Produto sem `Bill of Materials` ativa e sem `Stock Position` suficiente permanece `Pending`/aguardando — nunca transiciona a `Fulfilled` por inferência otimista; a mesma disciplina "Physical Before Financial" de `ERP_ARCHITECTURE.md`, Capítulo 3, aplica-se aqui como "Physical Before Fulfillment".

---

## 5. ADRs

**ADR-OR-001 — Nenhum novo Owner de pedido é criado por esta Sprint.** Contexto: aplicação direta de `DOMAIN_OWNERSHIP_MATRIX.md`, Capítulo 11; `Order`/`Cart`/`Checkout`/`Quote`/`Shipment` já pertencem ao Commerce Hub desde a série BP-001–008.

**ADR-OR-002 — Fulfillment de Order depende de Stock Reservation real, nunca de inferência otimista.** Contexto: antes desta Sprint, nenhum estoque real lastreava um `Order`; esta reconciliação fecha essa lacuna sem alterar a Entidade `Order` em si.

**ADR-OR-003 — Pricing não recebe novo Owner; precificação orientada a custo é um contrato de leitura, nunca uma Entidade nova.** Contexto: `Price` já é Official do Commerce Hub, com implementação real confirmada; introduzir uma segunda Entidade de preço duplicaria Single Source of Truth.

---

## 6. Glossário

**Order Fulfillment Orchestration** — a cadeia de Evento que conecta `Order` (Commerce Hub) aos cinco novos Hubs desta Sprint, sem que nenhum deles se torne proprietário de `Order`.
