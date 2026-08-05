# ERP Context Map

**Adaptive Business Platform · Documento Técnico (Draft)**

---

## Nota de Posicionamento Documental

Este documento nasce em status **Draft** (`DOCUMENTATION_CONSTITUTION.md`, §8.1), como parte da Sprint ERP-001 — ver `ERP_ARCHITECTURE.md` para a Nota de Posicionamento consolidada. Consolida, em um único lugar, os cinco diagramas exigidos por esta Sprint — Context Map, Event Flow, Aggregate Relations, Dependency Graph e Module Map — cobrindo os cinco novos Hubs e sua relação com todo Hub já existente. Nenhum diagrama aqui redesenha relação já existente entre os doze proprietários originais de `DOMAIN_OWNERSHIP_MATRIX.md` — apenas acrescenta os cinco novos nós e suas arestas.

---

## 1. Context Map

```
                              ERP CONTEXT MAP — 17 PROPRIETÁRIOS
   ┌───────────────────────────────────────────────────────────────────────────┐
   │                                                                                   │
   │   DEMAND SIDE (já existente)              SUPPLY SIDE (novo — ERP-001)              │
   │   ┌───────────────┐                      ┌───────────────┐                          │
   │   │  CRM Hub          │                      │  Supplier Hub       │                          │
   │   └───────┬───────┘                      └───────┬───────┘                          │
   │           │ OpportunityWon                        │ SupplierRegistered                     │
   │           ▼                                        ▼                                    │
   │   ┌───────────────┐                      ┌───────────────┐                          │
   │   │  Commerce Hub      │◄────Inventory────────│  Purchase Hub       │                          │
   │   │  (Order/Cart/          │     Adjusted           │                    │                          │
   │   │   Price/Checkout)      │                      └───────┬───────┘                          │
   │   └───────┬───────┘                              │ PurchaseReceived                       │
   │           │ CheckoutStarted/OrderPaid                    ▼                                    │
   │           ▼                              ┌───────────────────────┐                    │
   │   ┌───────────────────────┐      │  Inventory Movement Hub    │                    │
   │   │  Inventory Movement Hub    │◄─────┤  (Stock Movement/Position) │                    │
   │   │  (consultado/consumido)    │      └───────────┬───────────┘                    │
   │   └───────────────────────┘                  │ InventoryConsumed/Produced          │
   │                                                    ▼                                    │
   │                                          ┌───────────────┐                          │
   │                                          │  Production Hub     │                          │
   │                                          └───────┬───────┘                          │
   │                                                  │ ProductionCompleted                    │
   │                                                  ▼                                    │
   │   ┌───────────────┐                      ┌───────────────┐                          │
   │   │  Finance Hub       │◄─────InvoiceCreated──│  (Commerce: OrderPaid)  │                          │
   │   │  (Official)            │◄─────PurchaseReceived│  Purchase Hub               │                          │
   │   │                        │◄─────ProductionCompleted  Production Hub              │                          │
   │   └───────┬───────┘                      └───────────────┘                          │
   │           │ InvoiceCreated                                                            │
   │           ▼                                                                          │
   │   ┌───────────────┐                                                                  │
   │   │  Fiscal Hub         │                                                                  │
   │   └───────────────┘                                                                  │
   │                                                                                   │
   │   TRANSVERSAL (consumidores universais, sem escrita):                                  │
   │   Analytics Hub · Automation Engine · Business Profile Engine · Branding Hub ·           │
   │   Identity Hub · Knowledge Hub · Integration Hub · AI Hub                                  │
   └───────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Event Flow (consolidado dos quatro fluxos de `ERP_ARCHITECTURE.md`, Capítulo 7)

```
   Supplier ──SupplierRegistered──► Purchase
   Purchase ──PurchaseCreated──► (interno)
   Purchase ──PurchaseApproved──► (interno)
   Purchase ──PurchaseReceived──► Inventory Movement, Supplier, Financial(ext)
   Inventory Movement ──InventoryReceived──► Commerce
   Inventory Movement ──InventoryAdjusted──► Commerce, Purchase (Reorder)
   Commerce ──CheckoutStarted──► Inventory Movement (Reservation)
   Inventory Movement ──InventoryReserved──► Commerce
   (insumo insuficiente) ──► Automation ──► Production: CreateProductionOrder
   Production ──ProductionStarted──► Inventory Movement
   Production ──ProductionConsumption──► Inventory Movement, Financial(ext)
   Production ──ProductionOutput──► Inventory Movement, Commerce
   Production ──ProductionCompleted──► Financial(ext)
   Commerce ──OrderPaid──► Finance (Official): InvoiceCreated
   Finance ──InvoiceCreated──► Fiscal Hub
   Fiscal ──FiscalDocumentIssued──► Finance (referência), Branding
   Todos ──►Analytics (consumidor universal, somente leitura)
```

---

## 3. Aggregate Relations

```
                          RELAÇÕES ENTRE AGGREGATE ROOTS
   ┌───────────────────────────────────────────────────────────────┐
   │  Supplier (Supplier Hub)                                             │
   │      ▲ referenciado por identificador                                   │
   │      │                                                                │
   │  Purchase Order (Purchase Hub) ──contém──► Purchase Order Item           │
   │      │ referencia Product/Variant (Commerce Hub, por id)                     │
   │      │ publica PurchaseReceived                                             │
   │      ▼                                                                │
   │  Stock Movement (Inventory Movement Hub) ◄──origem: ProductionConsumption/  │
   │      │                                        Output, OrderPaid              │
   │      │ derivado                                                        │
   │      ▼                                                                │
   │  Stock Position (projeção, nunca Aggregate de escrita direta)                │
   │                                                                        │
   │  Bill of Materials (Production Hub) ──contém──► BOM Line                     │
   │      │ referencia Product/Variant (Commerce Hub, por id)                     │
   │      ▼                                                                │
   │  Production Order ──contém──► Production Consumption, Production Output     │
   │      │ publica ProductionCompleted                                          │
   │      ▼                                                                │
   │  (Finance Hub: Ledger Entry, criado internamente, nunca por escrita externa) │
   │                                                                        │
   │  Fiscal Document (Fiscal Hub) ──contém──► Fiscal Document Line               │
   │      │ referencia Order/Invoice (Commerce Hub/Finance Hub, por id)            │
   │      ▼                                                                │
   │  Tax Calculation (resultado de Tax Rule aplicada)                          │
   └───────────────────────────────────────────────────────────────┘
```

Nenhuma seta neste diagrama representa referência estrutural direta (chave estrangeira compartilhada) — toda relação entre Aggregate Root de Hubs distintos é por identificador opaco, nunca por composição de objeto, preservando Anti-Corruption Layer em cada fronteira.

---

## 4. Dependency Graph

```
                        GRAFO DE DEPENDÊNCIA (consumo de Evento)
   ┌───────────────────────────────────────────────────────────────┐
   │  Supplier Hub          ──consumido por──►  Purchase Hub               │
   │  Purchase Hub          ──consumido por──►  Inventory Movement,             │
   │                                              Supplier, Financial(ext)          │
   │  Inventory Movement    ──consumido por──►  Commerce, Purchase (Reorder)       │
   │  Production Hub        ──consumido por──►  Inventory Movement,             │
   │                                              Financial(ext)                     │
   │  Fiscal Hub            ──consumido por──►  Finance (referência), Branding      │
   │  Commerce Hub          ──consumido por──►  Inventory Movement, Finance         │
   │  Finance Hub           ──consumido por──►  Fiscal Hub                          │
   │                                                                        │
   │  Todos os sete acima   ──consumido por──►  Analytics, Automation              │
   └───────────────────────────────────────────────────────────────┘
```

Verificação de ciclo: seguindo cada seta a partir de qualquer nó, nenhum caminho retorna ao nó de origem — o grafo é um DAG (Directed Acyclic Graph) completo. Detalhamento da verificação em `ERP_FOUNDATION_REPORT.md`, Capítulo 3.

---

## 5. Module Map

```
                                MODULE MAP
   ┌───────────────────────────────────────────────────────────────┐
   │  SUPPLY SIDE MODULES (novo)                                          │
   │  ├── Supplier Hub                                                       │
   │  ├── Purchase Hub (inclui camada Procurement)                                │
   │  ├── Inventory Movement Hub (ledger físico, eixo central)                       │
   │  └── Production Hub (inclui "Manufacturing")                                 │
   │                                                                        │
   │  COMPLIANCE MODULE (novo)                                             │
   │  └── Fiscal Hub                                                            │
   │                                                                        │
   │  RECONCILIATION-ONLY DOCUMENTS (sem novo Owner)                            │
   │  ├── Order Hub (extensão de Commerce Hub)                                   │
   │  └── Financial Hub (extensão de Finance Hub)                                 │
   │                                                                        │
   │  DEMAND SIDE MODULES (já existente, sem alteração)                        │
   │  ├── CRM Hub                                                                │
   │  ├── Commerce Hub                                                            │
   │  └── Finance Hub                                                             │
   │                                                                        │
   │  TRANSVERSAL MODULES (já existente, consumidores/serviços universais)     │
   │  ├── Analytics Hub · Automation Engine · AI Hub                              │
   │  ├── Identity Hub · Knowledge Hub · Integration Hub                             │
   │  └── Business Profile Engine · Branding Hub                                  │
   └───────────────────────────────────────────────────────────────┘
```

---

## 6. Resumo Numérico

Dezessete proprietários totais na plataforma após esta Sprint (doze já Frozen/Official de `DOMAIN_OWNERSHIP_MATRIX.md`, mais Content Hub e Commerce Hub já propostos pela série BP-001–008, mais cinco novos desta Sprint: Purchase, Supplier, Inventory Movement, Production, Fiscal) — nenhum deles com ownership sobreposto a outro, verificado capítulo a capítulo em cada documento desta série.

Trinta e um novos Eventos catalogados em `DOMAIN_EVENT_CATALOG.md`, zero colisão de nome com os já catalogados em `EVENT_CATALOG.md`.

Zero nova Entidade duplicada — verificação cruzada de cada Entidade nova desta Sprint contra `DOMAIN_OWNERSHIP_MATRIX.md`, Capítulo 4, documentada individualmente em cada Nota de Posicionamento Documental dos sete documentos desta série.
