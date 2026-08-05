# Inventory Movement Hub — Blueprint de Domínio

**Adaptive Business Platform · Documento Técnico (Draft)**

---

## Nota de Posicionamento Documental

Este documento nasce em status **Draft** (`DOCUMENTATION_CONSTITUTION.md`, §8.1), como parte da Sprint ERP-001 — ver `ERP_ARCHITECTURE.md` para a Nota de Posicionamento consolidada.

Este é o documento de reconciliação mais delicado de toda a série, porque `COMMERCE_HUB_ARCHITECTURE.md`, Capítulo 25, já reivindica formalmente `Inventory`/`Stock Movement` como propriedade do Commerce Hub — nenhum dos dois ainda implementado em código (confirmado, para `Inventory` como Read Model simplificado, apenas em `packages/commerce-hub` via `InventoryService.findByProduct`/`adjustInventory`, sem `Stock Movement` como Entidade). Este documento propõe, como Change Request formal (`ERP_ARCHITECTURE.md`, Capítulo 9, item 1 — nunca executado unilateralmente), a seguinte reconciliação: **o ledger físico append-only (`Stock Movement`) passa a ser propriedade do Inventory Movement Hub; a leitura consolidada (`Inventory`) permanece o nome já usado pelo Commerce Hub, mas se torna uma projeção derivada, nunca uma segunda fonte de verdade.**

A justificativa é estrutural, não estética: `Stock Movement` é hoje o único conceito da plataforma cuja escrita legítima se origina em **quatro** módulos distintos e futuros — Purchase Hub (recebimento), Production Hub (consumo de insumo e geração de produto acabado), Commerce Hub (reserva e decremento por venda) e ajuste manual (Commerce Hub, hoje). Se o Commerce Hub permanecesse o único Owner, ele precisaria aceitar escrita indireta de dois Hubs que não deveriam ter autoridade sobre sua estrutura interna — uma violação direta de **Single Owner** e de **Consumer Never Owns** (`DOMAIN_OWNERSHIP_MATRIX.md`, Capítulo 3). A mesma dificuldade já foi resolvida, dentro do próprio Finance Hub, pela separação entre `Ledger Entry` (fonte, imutável) e `Balance` (projeção, derivada) — este documento estende exatamente esse padrão ao domínio físico de estoque, elevando-o a um Bounded Context próprio porque, ao contrário de `Balance`, sua fonte não nasce dentro do mesmo Hub que a consome.

Nenhuma linha de `COMMERCE_HUB_ARCHITECTURE.md` é alterada por este documento.

---

## 1. Introdução

O **Inventory Movement Hub** é o domínio responsável pelo registro imutável de toda entrada e saída física de mercadoria, e pela projeção derivada de posição de estoque consumida por todo módulo que precisa saber "quanto existe agora" — Commerce Hub para exibir disponibilidade, Purchase Hub para avaliar necessidade de reposição, Production Hub para verificar disponibilidade de insumo.

---

## 2. Responsabilidade

O Inventory Movement Hub é responsável por manter o ciclo de vida de `Stock Movement` (o ledger, nunca editado após criação), `Stock Position` (a projeção derivada, recalculada a cada novo Movement), `Stock Reservation` (comprometimento temporário sem decremento definitivo), `Stock Location` (quando a Empresa opera mais de um ponto físico de estoque) e `Stock Alert Rule` (limiar que, quando cruzado, publica um Evento de alerta consumido por Purchase Hub/Automation Engine).

---

## 3. Limites do Domínio

O Inventory Movement Hub nunca cria ou altera `Product`/`Variant` — apenas referencia por identificador.

O Inventory Movement Hub nunca decide comprar, produzir ou vender — ele apenas registra o efeito físico já decidido por outro Hub (`PurchaseReceived`, `ProductionOutput`, `OrderPaid`); nenhuma decisão de negócio se origina aqui.

O Inventory Movement Hub nunca calcula custo médio, giro de estoque ou qualquer indicador consolidado além da posição bruta atual — projeção de tendência é exclusiva do Analytics Hub.

O Inventory Movement Hub nunca é consultado por escrita direta de nenhum outro Hub — toda alteração de `Stock Movement` passa exclusivamente por seu próprio Command, acionado internamente ao consumir um Evento já publicado por outro Owner.

---

## 4. Aggregates

**Stock Movement** é o Aggregate Root — cada instância é um fato físico único e imutável (uma entrada, uma saída, um ajuste manual); nunca é editado ou removido após criação, apenas compensado por um novo `Stock Movement` de sinal oposto quando uma correção é necessária.

**Stock Position** é um Aggregate derivado — recalculado, nunca escrito diretamente por nenhum Command externo; sua única fonte de verdade é a soma de todo `Stock Movement` já registrado para o mesmo `productId`/`locationId`.

**Stock Reservation** é um Aggregate independente — representa um comprometimento temporário de quantidade (por exemplo, um `Order` em `Checkout`) que ainda não gerou `Stock Movement` de saída definitiva; expira ou se converte em `Stock Movement` de saída, nunca as duas coisas.

**Stock Alert Rule** é um Aggregate independente, associado a `productId`/`locationId` e um `thresholdQuantity`.

---

## 5. Entidades

**Stock Movement.** Identificador; `productId`/`variantId` (Commerce Hub, por identificador); `locationId` (opcional — ausência implica localização única padrão); `quantityDelta` (positivo para entrada, negativo para saída); `origin` (Value Object `MovementOrigin`: `Purchase`, `ProductionConsumption`, `ProductionOutput`, `SaleFulfillment`, `SaleReturn`, `ManualAdjustment`); `originReferenceId` (identificador do `Purchase Order`/`Production Order`/`Order` de origem, quando aplicável); timestamp de ocorrência.

**Stock Position.** `productId`/`variantId`; `locationId`; `quantityOnHand` (soma de todo `Stock Movement`); `quantityReserved` (soma de `Stock Reservation` ativa); `quantityAvailable` (`quantityOnHand - quantityReserved`, nunca armazenado como campo próprio editável — sempre recalculado).

**Stock Reservation.** Identificador; `productId`/`variantId`; `locationId`; quantidade reservada; origem (`orderId`, referenciando Commerce Hub por identificador); status (`Active`, `Released`, `ConvertedToMovement`); expiração.

**Stock Location.** Identificador; nome; endereço (Value Object opcional); ativa/inativa. Ausente na fase inicial de uma Empresa pequena com um único ponto físico — Capability opcional via Business Profile Engine.

**Stock Alert Rule.** Identificador; `productId`/`variantId`; `locationId` (opcional); `thresholdQuantity`; ativa/inativa.

---

## 6. Value Objects

**MovementOrigin** — enum fechado descrevendo a origem de um `Stock Movement`, nunca livre-texto, garantindo rastreabilidade total.

**QuantityDelta** — inteiro assinado (positivo/negativo), nunca armazenado como dois campos separados de entrada/saída — um único eixo, replicando a disciplina de `Ledger Entry` (débito/crédito como sinal, não como dois campos).

---

## 7. Commands

`RegisterStockMovement` (interno, acionado exclusivamente ao consumir Evento de outro Hub — nunca exposto a um usuário final diretamente), `CreateStockReservation`, `ReleaseStockReservation`, `ConvertReservationToMovement`, `CreateStockLocation`, `CreateStockAlertRule`, `DeactivateStockAlertRule`.

Nenhum Command permite escrita direta de `Stock Position` — ela é sempre resultado de projeção, nunca de Command.

---

## 8. Eventos

Ver `DOMAIN_EVENT_CATALOG.md` para o contrato completo: `InventoryReceived`, `InventoryReserved`, `InventoryReleased`, `InventoryAdjusted`, `InventoryConsumed` (Production), `InventoryProduced` (Production), `StockAlertTriggered`.

---

## 9. Repository Interfaces (especificação)

```
interface StockMovementRepository {
  findByProduct(productId, locationId?): StockMovement[]
  findByOriginReference(originReferenceId): StockMovement[]
  append(movement): void
}

interface StockPositionRepository {
  findByProduct(productId, locationId?): StockPosition
  recalculate(productId, locationId?): StockPosition
}

interface StockReservationRepository {
  findActiveByProduct(productId): StockReservation[]
  findByOrder(orderId): StockReservation[]
  save(reservation): void
}

interface StockAlertRuleRepository {
  findActiveByProduct(productId): StockAlertRule | null
  save(rule): void
}
```

`StockMovementRepository.append` é deliberadamente nomeado de forma distinta de `save` — reforça, já no contrato de interface, que este Aggregate é append-only, nunca sujeito a update.

---

## 10. Managers e Services (especificação)

**InventoryMovementManager** é a única fachada pública — todo Command do Capítulo 7 passa exclusivamente por ele; nenhum consumidor externo cria `Stock Movement` diretamente, mesmo o próprio Commerce Hub.

**StockMovementRecordingService** é o único ponto de escrita de `Stock Movement`, acionado internamente ao consumir `PurchaseReceived`, `ProductionConsumption`, `ProductionOutput`, `OrderPaid`, `ReturnApproved`, ou por `RegisterStockMovement` manual explícito.

**StockPositionProjectionService** recalcula `Stock Position` a cada novo `Stock Movement` registrado, e é o único ponto que publica `InventoryAdjusted` para consumo do Commerce Hub.

**StockReservationService** encapsula a lógica de reserva temporária, conversão e expiração, publicando `InventoryReserved`/`InventoryReleased`.

**StockAlertEvaluationService** avalia `Stock Alert Rule` a cada recálculo de `Stock Position`, publicando `StockAlertTriggered` quando o limiar é cruzado.

---

## 11. Regras de Negócio

Todo `Stock Movement` é imutável — nenhuma correção edita um registro existente; toda correção é um novo `Stock Movement` com `origin: ManualAdjustment` e `quantityDelta` de sinal oposto ao erro.

`Stock Position.quantityAvailable` nunca é negativo por desenho — uma tentativa de `Stock Reservation` acima da quantidade disponível é rejeitada, nunca aceita com saldo negativo.

Uma `Stock Reservation` expirada é automaticamente liberada (`InventoryReleased`) pelo Automation Engine, consumindo um Trigger temporizado — o Inventory Movement Hub nunca implementa seu próprio agendador interno, aplicação direta de ADR-006 de `ADR_INDEX.md`.

Todo `Stock Movement` de origem `ProductionConsumption`/`ProductionOutput` referencia um `Production Order` existente — nunca criado sem correlação rastreável.

`Stock Location` é uma Capability opcional — uma Empresa de porte pequeno, com um único ponto físico, opera sem nenhuma instância de `Stock Location`, e todo `Stock Movement`/`Stock Position` omite `locationId` sem quebra de contrato (campo opcional, não obrigatório).

---

## 12. Fluxo Completo

```
   Purchase Hub: PurchaseReceived ──────────────► RegisterStockMovement
                                                    (origin: Purchase)
   Production Hub: ProductionConsumption ────────► RegisterStockMovement
                                                    (origin: ProductionConsumption)
   Production Hub: ProductionOutput ─────────────► RegisterStockMovement
                                                    (origin: ProductionOutput)
   Commerce Hub: CheckoutStarted ────────────────► CreateStockReservation
   Commerce Hub: OrderPaid ──────────────────────► ConvertReservationToMovement
                                                    (origin: SaleFulfillment)
   Commerce Hub: ReturnApproved ─────────────────► RegisterStockMovement
                                                    (origin: SaleReturn)
        │
        ▼
   StockPositionProjectionService recalcula ──► InventoryAdjusted
        │
        ▼
   Commerce Hub consome InventoryAdjusted, atualiza sua própria
   projeção de Inventory exibida ao Cliente
        │
        ▼
   StockAlertEvaluationService avalia Stock Alert Rule ──► StockAlertTriggered
        │
        ▼
   Purchase Hub consome (ReorderRuleTriggered, se aplicável)
```

---

## 13. Integrações

**Commerce Hub** — consumidor exclusivo de `InventoryReceived`/`InventoryReserved`/`InventoryReleased`/`InventoryAdjusted`; nunca escreve diretamente sobre `Stock Movement`; sua própria noção de `Inventory` (Capítulo 25 de `COMMERCE_HUB_ARCHITECTURE.md`) torna-se, por esta reconciliação, uma projeção local recalculada a partir desses Eventos.

**Purchase Hub** — produtor de `PurchaseReceived`, consumido para gerar `Stock Movement` de entrada; consumidor de `StockAlertTriggered`.

**Production Hub** — produtor de `ProductionConsumption`/`ProductionOutput`, consumido para gerar `Stock Movement` de saída e entrada, respectivamente.

**Automation Engine** — consumidor de `StockAlertTriggered`; produtor do Trigger temporizado que expira `Stock Reservation`.

**Analytics Hub** — consumidor de todo Evento deste Hub; único ponto autorizado a calcular giro de estoque, cobertura em dias e tendência de ruptura.

---

## 14. ADRs

**ADR-IM-001 — Stock Movement é elevado a Bounded Context próprio, separado de Commerce Hub.** Contexto: quatro origens de escrita legítima (Purchase, Production, Commerce, ajuste manual) tornam Commerce Hub um Owner estruturalmente inadequado, per Nota de Posicionamento acima; Change Request formal proposta contra `COMMERCE_HUB_ARCHITECTURE.md`, Capítulo 25, nunca executada unilateralmente.

**ADR-IM-002 — Stock Position é sempre projeção recalculada, nunca campo diretamente editável.** Contexto: replica o par `Ledger Entry`/`Balance` já maduro em `FINANCE_DOMAIN_BLUEPRINT.md`; elimina divergência entre saldo armazenado e soma real do ledger.

**ADR-IM-003 — Stock Location é Capability opcional, nunca obrigatória.** Contexto: preservar suporte a pequena Empresa de ponto único, já exigido pela Sprint ERP-001 e por `BUSINESS_PROFILE_ENGINE.md`.

**ADR-IM-004 — Expiração de Stock Reservation é responsabilidade do Automation Engine, nunca de um agendador interno.** Contexto: aplicação direta de ADR-006 de `ADR_INDEX.md`.

---

## 15. Glossário

**Stock Movement** — registro imutável de uma entrada, saída ou ajuste físico de estoque.

**Stock Position** — projeção derivada da posição atual de estoque, recalculada a partir do ledger de Stock Movement.

**Stock Reservation** — comprometimento temporário de quantidade, anterior ao decremento definitivo.

**Stock Alert Rule** — limiar de estoque que, quando cruzado, dispara um Evento de alerta.

**MovementOrigin** — classificação fechada da origem de um Stock Movement.
