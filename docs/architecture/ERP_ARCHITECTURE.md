# ERP Architecture — Fundação de Enterprise Resource Planning

**Adaptive Business Platform · Documento Técnico (Draft)**

---

## Nota de Posicionamento Documental

Este documento é o resultado da Sprint **ERP-001 — Enterprise Resource Planning Foundation**, uma Sprint de arquitetura pura: nenhum código, Manager, Service, Repository, endpoint, tabela, esquema SQLite, DTO ou tela foi criado, alterado ou sequer esboçado para produzi-la. Todo artefato desta Sprint é documentação de domínio — Aggregate, Entidade, Value Object, Command, Evento, contrato de Repository Interface como especificação, e regra de negócio — no mesmo nível de abstração já estabelecido por `CRM_DOMAIN_BLUEPRINT.md`, `FINANCE_DOMAIN_BLUEPRINT.md` e `COMMERCE_HUB_ARCHITECTURE.md`.

A motivação desta Sprint é o achado mais repetido dos últimos seis Sprints funcionais desta plataforma (FUN-101 a FUN-106): a cada novo Workspace auditado — CRM, Product Hub, Estoque, Compras —, a auditoria de Backend real encontrou zero ocorrência de Purchase, Supplier, Production, StockMovement como Entidade de primeira classe, ou Financial Ledger operacional, em qualquer pacote implementado (`packages/commerce-hub`) ou em qualquer documento de arquitetura já existente (`COMMERCE_HUB_ARCHITECTURE.md` grepado por completo, zero ocorrência de "Purchase"/"Supplier"/"cost"). O Purchase Workspace da FUN-106 chegou a ser construído inteiramente como uma "lente" honesta sobre dados de Produto/Preço/Estoque já existentes, com dois módulos (Ordens de Compra, Fornecedores) permanecendo `NotConnectedNotice` — placeholder deliberado, porque a capacidade real não existe. Esta Sprint é a resposta direta a essa lacuna: o desenho, em nível de domínio, dos Bounded Contexts que um dia tornarão esses placeholders reais.

Esta Sprint nasce, no entanto, em um repositório que já acumulou duas camadas de arquitetura de negócio antes dela — o Volume I "Architecture Handbook" (Frozen/Official: `CRM_DOMAIN_BLUEPRINT.md`, `FINANCE_DOMAIN_BLUEPRINT.md`, `GROWTH_DOMAIN_BLUEPRINT.md`, `ANALYTICS_DOMAIN_BLUEPRINT.md`, `COMMUNICATION_DOMAIN_BLUEPRINT.md`, `DOMAIN_OWNERSHIP_MATRIX.md`, `EVENT_CATALOG.md`) e a série BP-001–008 (Draft: `COMMERCE_HUB_ARCHITECTURE.md`, `CONTENT_HUB_ARCHITECTURE.md`, `CONVERSATION_HUB_ARCHITECTURE.md`, `CRM_HUB_ARCHITECTURE.md`, `MARKETING_HUB_ARCHITECTURE.md`, `BUSINESS_STRUCTURE_HUB_ARCHITECTURE.md`, `AI_HUB_ARCHITECTURE.md`), reconciliadas em `ARCHITECTURE_RECONCILIATION_AND_GOVERNANCE.md`. A leitura obrigatória desta Sprint (`COMMERCE_HUB_ARCHITECTURE.md`, `COMMERCE_CORE_MIGRATION_REPORT.md`) revelou que **três dos dez domínios pedidos por esta Sprint já têm proprietário registrado**:

- **`Order`, `Cart`, `Checkout`, `Quote`, `Shipment`, `Inventory`/`StockMovement` já pertencem ao Commerce Hub** (`COMMERCE_HUB_ARCHITECTURE.md`, Draft, Capítulos 16–26) — nenhum ainda implementado em código, mas já formalmente reivindicados como território de domínio.
- **`Invoice`, `Payment`, `Ledger Entry`, `Account Payable`, `Account Receivable`, `Tax Record`, `Financial Document` já pertencem ao Finance Hub** (`FINANCE_DOMAIN_BLUEPRINT.md`, `FINANCE_HUB.md`, ambos Official) — dezenove Eventos já catalogados, doze ADRs já fixados.
- **`Price`, `Discount` de catálogo já pertencem ao Commerce Hub** — `PriceChanged` já é Evento Official do Commerce Hub, e a implementação real (`packages/commerce-hub`, `PriceService.setPrice`) já o produz, confirmado nas auditorias FUN-104/105/106.

O princípio `Domain Ownership`, Capítulo 3 de `DOMAIN_OWNERSHIP_MATRIX.md` — **Single Owner**, **No Duplicate Models**, **Domain First** — e o Sétimo Passo do Processo de Evolução (Capítulo 11 daquele documento) exigem, antes da criação de qualquer novo Hub, a verificação explícita de que seu conceito central não é uma reformulação de um conceito já pertencente a um Hub existente. Esta Sprint aplica essa verificação com o mesmo rigor já demonstrado por `COMMERCE_HUB_ARCHITECTURE.md` ao se reconciliar com `FINANCE_DOMAIN_BLUEPRINT.md` (três reconciliações formais, Nota de Posicionamento daquele documento) — e chega a uma conclusão análoga: **"Order Hub", "Financial Hub" e "Pricing Hub", pedidos nominalmente por esta Sprint, não se tornam novos proprietários.** Em vez disso:

- **`ORDER_HUB.md`** é um documento de reconciliação — reafirma `Order`/`Cart`/`Checkout`/`Quote`/`Shipment` como Commerce Hub, e formaliza a única lacuna genuína encontrada: a orquestração de um `Order` de venda através de todos os novos domínios desta Sprint (Inventory Movement, Production, Financial, Fiscal), documentada como o Fluxo de Venda no Capítulo 7 deste documento e formalizada como ADR-OR-001.
- **`FINANCIAL_HUB.md`** é um documento de reconciliação e extensão — reafirma `Invoice`/`Payment`/`Ledger Entry`/`Account Payable` como Finance Hub (Official), e formaliza apenas a fatia genuinamente nova: os Eventos que os cinco novos Hubs desta Sprint publicam para que o Finance Hub, sem nunca ser alterado por eles, crie sua própria `Account Payable` a partir de uma compra recebida, ou seu próprio `Ledger Entry` de custo a partir de uma produção concluída.
- **Pricing** não recebe documento próprio — `Price` continua do Commerce Hub; a lacuna real, precificação orientada a custo de aquisição, é descrita como contrato de integração no Capítulo 6.6 deste documento e no Capítulo 9 de `PURCHASE_HUB.md`, nunca como nova Entidade.
- **"Procurement Hub"**, pedido como um dos dez domínios, é absorvido por `PURCHASE_HUB.md` como sua camada estratégica (Requisição, Ponto de Reposição, Seleção de Fornecedor) — mesmo Bounded Context do ciclo de vida transacional de compra, não um proprietário separado, decisão registrada como ADR-PU-001.
- **"Manufacturing Hub"**, pedido como um dos dez domínios, é o mesmo Bounded Context de `PRODUCTION_HUB.md` sob outro nome — mesmo padrão de reconciliação de nome já aplicado a Conversation/Communication e Marketing/Growth em `ARCHITECTURE_RECONCILIATION_AND_GOVERNANCE.md`, Capítulo 11 — registrado como ADR-PD-001.

O resultado é **cinco novos proprietários de conceito** — Purchase Hub, Supplier Hub, Inventory Movement Hub, Production Hub, Fiscal Hub — cobrindo os dez nomes originalmente pedidos, mais dois documentos de reconciliação (`ORDER_HUB.md`, `FINANCIAL_HUB.md`) que não introduzem ownership novo. Nenhuma linha de `COMMERCE_HUB_ARCHITECTURE.md`, `FINANCE_DOMAIN_BLUEPRINT.md`, `FINANCE_HUB.md` ou `DOMAIN_OWNERSHIP_MATRIX.md` é alterada por esta Sprint — cada reconciliação é proposta como Change Request formal (Capítulo 10), nunca executada unilateralmente, exatamente como `ARCHITECTURE_RECONCILIATION_AND_GOVERNANCE.md` já exige de toda série de documentos Draft.

Este documento, e os dez documentos que ele reúne, nascem em status **Draft** (`DOCUMENTATION_CONSTITUTION.md`, §8.1) — arquitetura pronta para implementação futura, não capacidade já entregue.

---

## 1. Introdução

O **ERP Foundation** é o conjunto de cinco novos Bounded Contexts — Purchase Hub, Supplier Hub, Inventory Movement Hub, Production Hub, Fiscal Hub — que, junto aos Hubs já existentes (CRM, Commerce, Finance, Analytics, Automation, Knowledge, AI, Business Profile, Branding), fecha o ciclo operacional completo de uma pequena ou média empresa: **comprar, produzir, estocar, vender, faturar e declarar**. Antes desta Sprint, a plataforma cobria apenas a metade final desse ciclo — Commerce Hub (venda) e Finance Hub (cobrança) — sem nenhuma capacidade documentada de como um Produto chega a existir em estoque antes de ser vendido.

O nome "ERP" é usado aqui no sentido estrito de integração de processo, não no sentido de um módulo monolítico — cada um dos cinco novos Hubs é tão independente quanto CRM o é de Growth, comunicando-se exclusivamente por Evento, nunca por chamada direta, exatamente como todo par de Business Hub já estabelecido nesta plataforma.

---

## 2. Objetivos

Esta Sprint fecha a lacuna de proveniência de Produto — de onde o estoque vendido pelo Commerce Hub realmente vem, hoje respondida apenas por ajuste manual (`adjustInventory`) sem nenhuma origem rastreável.

Esta Sprint introduz o vocabulário de fornecedor — nenhum conceito de "quem vende para a Empresa" existe hoje; `Organization`/`Contact` do CRM Hub são, por desenho, o lado cliente do relacionamento comercial.

Esta Sprint separa o registro físico de estoque de sua leitura consolidada — aplicando à Inventário o mesmo padrão Ledger→Balance já maduro em `FINANCE_DOMAIN_BLUEPRINT.md`.

Esta Sprint introduz o vocabulário de transformação — Produção, Composição/BOM (Bill of Materials), consumo de insumo e geração de produto acabado, ausentes de toda a plataforma até hoje.

Esta Sprint introduz o vocabulário de conformidade fiscal — Documento Fiscal, Regra Tributária, cálculo de imposto sobre a venda de mercadoria, distinto do controle de dinheiro já coberto pelo Finance Hub.

Esta Sprint preserva, sem exceção, cada princípio já estabelecido em `DOMAIN_OWNERSHIP_MATRIX.md` — nenhum dos cinco novos Hubs duplica Entidade já proprietária de outro módulo, e cada um publica Evento como único mecanismo de integração.

---

## 3. Princípios (herdados e aplicados)

Todos os dezesseis princípios de `DOMAIN_OWNERSHIP_MATRIX.md`, Capítulo 3, aplicam-se integralmente aos cinco novos Hubs, sem exceção e sem reinterpretação. Três merecem ênfase específica nesta Sprint, por serem os mais frequentemente tensionados por um domínio ERP:

**Ledger Before Snapshot.** Todo domínio que precisa de um valor "atual" (saldo de estoque, custo médio, posição financeira) o deriva de um histórico imutável de eventos, nunca o armazena como único campo mutável — o mesmo padrão que já existe em Finance Hub (`Ledger Entry` → `Balance`) é estendido nesta Sprint ao estoque físico (`Stock Movement` → `Stock Position`).

**Physical Before Financial.** A confirmação de um fato físico (mercadoria recebida, produto fabricado) sempre precede e nunca depende da confirmação do fato financeiro correspondente (pagamento ao fornecedor, custo lançado) — um recebimento é registrado mesmo que o pagamento ainda esteja pendente, replicando o desacoplamento já estabelecido entre `Order` e `Invoice` em `COMMERCE_HUB_ARCHITECTURE.md`, Capítulo 22.

**Strategy Above Transaction.** Onde uma Sprint pede um domínio "estratégico" (Procurement) e um domínio "transacional" (Purchase) para o mesmo processo de negócio, ambos permanecem no mesmo Bounded Context, sob o mesmo Owner — replicando a mesma decisão já tomada por `FINANCE_DOMAIN_BLUEPRINT.md` entre Billing estratégico (`Subscription`) e execução (`Recurring Billing`).

---

## 4. Os Cinco Novos Proprietários

```
                 CINCO NOVOS PROPRIETÁRIOS (ERP-001)
   ┌───────────────────────────────────────────────────────────┐
   │  Purchase Hub            aquisição de mercadoria/insumo         │
   │  Supplier Hub            relacionamento com fornecedor              │
   │  Inventory Movement Hub  ledger físico de estoque                      │
   │  Production Hub          transformação de insumo em Produto               │
   │  Fiscal Hub              conformidade tributária de mercadoria                │
   └───────────────────────────────────────────────────────────┘
```

**Purchase Hub** possui: Purchase Requisition, Purchase Order, Purchase Order Item, Receiving, Reorder Rule. Absorve "Procurement" como sua camada estratégica. Ver `PURCHASE_HUB.md`.

**Supplier Hub** possui: Supplier, Supplier Contact, Supplier Catalog Item, Supplier Performance Record, Supplier Contract. Ver `SUPPLIER_HUB.md`.

**Inventory Movement Hub** possui: Stock Movement, Stock Position, Stock Reservation, Stock Location, Stock Alert Rule. Redefine `Inventory` do Commerce Hub como Read Model consumidor — ver Capítulo 6.3 e `INVENTORY_MOVEMENT_HUB.md`.

**Production Hub** possui: Bill of Materials, Production Order, Production Consumption, Production Output, Work Center. Absorve "Manufacturing" como mesmo Bounded Context. Ver `PRODUCTION_HUB.md`.

**Fiscal Hub** possui: Fiscal Document, Tax Rule, Tax Calculation, Fiscal Obligation, Tax Regime. Aprofunda o que hoje é apenas `Tax Record` (stub) em Finance Hub. Ver `FISCAL_HUB.md`.

---

## 5. Contexto Consolidado (visão resumida — ver `ERP_CONTEXT_MAP.md` para o mapa completo)

```
        SUPPLY SIDE (novo — ERP-001)          DEMAND SIDE (já existente)
   ┌─────────────────────────────┐      ┌─────────────────────────────┐
   │  Supplier Hub                     │      │  CRM Hub                            │
   │       │                                │      │       │                              │
   │       ▼                                │      │       ▼                              │
   │  Purchase Hub                       │      │  Commerce Hub (Order/Cart/Price)         │
   │       │                                │      │       │                              │
   │       ▼                                │      │       ▼                              │
   │  Inventory Movement Hub ◄──────────────────────── consome StockPosition                │
   │       ▲                                │      │       │                              │
   │       │                                │      │       ▼                              │
   │  Production Hub                       │      │  Finance Hub (Invoice/Payment)           │
   │       │                                │      │       │                              │
   │       ▼                                │      │       ▼                              │
   │  Financial Hub (extensão) ─────────────────────────► Fiscal Hub                            │
   └─────────────────────────────┘      └─────────────────────────────┘
```

O eixo central de todo o desenho é o **Inventory Movement Hub** — é o único domínio consumido tanto pelo lado de suprimento (Purchase recebe, Production consome e produz) quanto pelo lado de demanda (Commerce reserva e decrementa), exatamente a razão pela qual ele precisa ser um Owner próprio em vez de uma extensão do Commerce Hub, conforme já formalizado na Nota de Posicionamento Documental acima.

---

## 6. Contratos de Integração com Domínios Já Existentes

### 6.1 CRM Hub

Nenhuma escrita em qualquer direção. O CRM Hub continua proprietário exclusivo de `Customer`/`Organization`/`Opportunity`. Quando uma `Opportunity` é ganha (`OpportunityWon`, já Official) e o Cliente também é fornecedor de outra Empresa do mesmo Tenant (cenário B2B), essa dualidade nunca é modelada como Entidade compartilhada — `Supplier` (Supplier Hub) e `Organization` (CRM Hub) permanecem duas Entidades distintas, mesmo quando referenciam a mesma pessoa jurídica externa, unidas apenas por um identificador externo opcional (CNPJ), nunca por chave estrangeira direta.

### 6.2 Commerce Hub

`Purchase Hub` nunca cria ou altera `Product` — todo novo Produto adquirido de um Fornecedor pressupõe um `Product` já existente no Catalog do Commerce Hub, criado por seu próprio Command; `Purchase Order Item` referencia `Product`/`Variant` por identificador. `Inventory Movement Hub` publica `InventoryReceived`/`InventoryAdjusted`; o Commerce Hub consome e recalcula sua própria projeção de `Inventory`, nunca escrevendo de volta. `Order Hub` (documento de reconciliação, não novo Owner) formaliza que `OrderPaid` (Commerce Hub) é o Evento que aciona `InventoryReserved`→`InventoryReleased` no Inventory Movement Hub.

### 6.3 Inventory — a redefinição central desta Sprint

`COMMERCE_HUB_ARCHITECTURE.md`, Capítulo 25, já reivindica `Inventory`/`Stock Movement` como propriedade do Commerce Hub. Esta Sprint propõe, como Change Request formal (nunca executado unilateralmente, per `DOCUMENTATION_CONSTITUTION.md`, §10), a seguinte reconciliação: o **ledger append-only** de movimentação física (`Stock Movement`) passa a ser propriedade do **Inventory Movement Hub**, porque é alimentado por quatro origens distintas — Purchase (recebimento), Production (consumo e geração), Commerce (reserva e decremento por venda), e ajuste manual — e nenhuma dessas quatro origens pode escrever diretamente sobre a estrutura interna de outra sem violar **Single Owner**. O Commerce Hub mantém `Inventory` como o nome de sua própria leitura, mas ela passa a ser uma **projeção derivada** de `Stock Position` (Inventory Movement Hub), consumida por Evento — o mesmo relacionamento que já existe, dentro do próprio Finance Hub, entre `Ledger Entry` (fonte) e `Balance` (projeção). Nenhuma Entidade é duplicada: existe exatamente um ledger de estoque na plataforma, e ele pertence ao Inventory Movement Hub.

### 6.4 Finance Hub

Nenhuma escrita em qualquer direção — `FINANCIAL_HUB.md` documenta com detalhe cada um dos novos Eventos que Purchase Hub, Production Hub e Fiscal Hub publicam para que o Finance Hub, por sua própria decisão e seu próprio Command interno, crie `Account Payable` (de uma compra recebida), `Ledger Entry` de custo (de uma produção concluída), ou `Invoice`/`Financial Document` (de uma venda fiscal). O Finance Hub nunca consulta ativamente nenhum dos cinco novos Hubs — toda informação chega até ele exclusivamente por Evento já publicado.

### 6.5 Fiscal Hub × Finance Hub

`Tax Record`, já Official do Finance Hub, permanece a referência conceitual mínima de tributo associado a uma transação financeira. `Fiscal Hub` aprofunda essa referência com o cálculo tributário completo (regime, alíquota, retenção) e o Documento Fiscal formal — a distinção já é a mesma que `COMMERCE_HUB_ARCHITECTURE.md` traçou entre `Financial Document` (Finance, comprovante de pagamento) e a nunca-antes-modelada nota fiscal de circulação de mercadoria, que este documento formaliza como `Fiscal Document`, propriedade exclusiva do Fiscal Hub.

### 6.6 Pricing (integração, não novo domínio)

O único ponto de contato entre `Purchase Hub`/`Supplier Hub` e a precificação do Commerce Hub é o campo `acquisitionCost` de `Purchase Order Item`, publicado no Evento `PurchaseReceived`. O Commerce Hub pode, por sua própria decisão de Command interno (nunca por escrita externa), consumir esse valor para calibrar seu próprio `Price` — uma regra de margem é responsabilidade exclusiva do Commerce Hub, nunca do Purchase Hub, que apenas expõe o custo real observado.

### 6.7 Analytics Hub

Todos os cinco novos Hubs publicam Evento consumido livremente pelo Analytics Hub, sem exceção — replicando `ANALYTICS_HUB.md`, ADR-001 ("Analytics é, por desenho, somente leitura em relação a todos os demais Business Hubs"). Nenhum dos cinco novos Hubs implementa seu próprio cálculo de indicador consolidado (custo médio de aquisição ao longo do tempo, giro de estoque, lead time de fornecedor) — todos são Metric/KPI do Analytics Hub, nunca duplicados localmente, aplicação direta de ADR-016 de `DOMAIN_OWNERSHIP_MATRIX.md`.

### 6.8 Automation Engine

Todo processo temporizado ou condicional do ERP Foundation — reposição automática de estoque abaixo do ponto de ruptura, aprovação automática de Purchase Order abaixo de um teto de alçada, alerta de vencimento de contrato de Fornecedor — é modelado como Trigger/Workflow do Automation Engine reagindo a Evento já publicado pelos cinco novos Hubs, nunca como lógica de agendamento interna a nenhum deles, aplicação direta de ADR-006 de `ADR_INDEX.md` ("Nenhum Hub de domínio implementa sua própria automação").

### 6.9 Knowledge Hub

Contrato de Fornecedor, Política de aprovação de compra e Procedimento de recebimento — hoje inexistentes como dado estruturado — são candidatos naturais a `Document`/`Policy`/`Procedure` do Knowledge Hub quando precisarem ser consultados por um Agente de IA; nenhum dos cinco novos Hubs armazena sua própria cópia de texto de política, apenas referencia o Document por identificador.

### 6.10 AI Hub e Automação de Agentes (arquitetura, sem implementação)

Ver Capítulo 8.

### 6.11 Business Profile Engine e Branding Hub

Nenhum dos cinco novos Hubs decide, por si, se está habilitado para um Tenant — essa decisão permanece exclusiva do Business Profile Engine (`CapabilityEnabled`/`CapabilityDisabled`, já Official), consumida por cada Hub sem exceção; uma Empresa de serviço puro nunca vê Purchase Hub/Inventory Movement Hub habilitados, por exemplo. `Fiscal Document`, quando impresso ou exibido, aplica `Brand Theme` (Branding Hub) exatamente como `Financial Document` já faz, sem que o Fiscal Hub jamais gere sua própria identidade visual.

---

## 7. Os Quatro Fluxos Ponta a Ponta

### 7.1 Fluxo de Compra

```
   Supplier Hub                Purchase Hub              Inventory Movement Hub
        │                            │                              │
   SupplierRegistered                │                              │
        │                            │                              │
        └──────────► PurchaseOrder criada (referencia Supplier)          │
                             │                                       │
                        PurchaseCreated                               │
                             │                                       │
                        PurchaseApproved (Automation, se dentro          │
                        de alçada — ou aprovação humana)                    │
                             │                                       │
                        PurchaseReceived ──────────────────────────► InventoryReceived
                             │                                       │
                             │                              Stock Movement criado (entrada)
                             │                                       │
                             ▼                                       ▼
                     Financial Hub (extensão)                Commerce Hub (Inventory
                     cria Account Payable                    projeção recalculada)
                     a partir de PurchaseReceived
```

### 7.2 Fluxo de Venda

```
   CRM Hub          Commerce Hub       Inventory Movement    Production Hub    Financial/Fiscal
      │                   │                    Hub                │                  │
  OpportunityWon           │                     │                 │                  │
      │                    │                     │                 │                  │
      └──────────► Order criado (Pending)              │                 │                  │
                          │                     │                 │                  │
                     CheckoutCompleted            │                 │                  │
                          │                     │                 │                  │
                          ├──────────► InventoryReserved             │                  │
                          │              (se Produto tem                │                  │
                          │               Composição/BOM,                 │                  │
                          │               aciona Produção)                  │                  │
                          │                     │                 │                  │
                          │                     │       ProductionStarted            │
                          │                     │                 │                  │
                          │                     │       ProductionCompleted            │
                          │                     │                 │                  │
                          │              ◄──────────────────── ProductionOutput            │
                          │              InventoryReleased                │                  │
                          │              (reserva convertida                │                  │
                          │               em decremento definitivo)          │                  │
                          ▼                     │                 │                  │
                     OrderPaid ─────────────────────────────────────────────────────► InvoiceCreated
                                                                              (Finance Hub)
                                                                                    │
                                                                              FiscalDocumentIssued
                                                                              (Fiscal Hub, consome
                                                                               InvoiceCreated)
```

### 7.3 Fluxo de Produção

```
   Production Hub
        │
   Bill of Materials já definida (Produto final → lista de insumos)
        │
   ProductionStarted (a partir de InventoryReserved insuficiente para
   atender um Order, ou de decisão manual de reabastecer estoque)
        │
        ├──────► ProductionConsumption ──► Inventory Movement Hub
        │         (Stock Movement: saída de cada insumo da BOM)
        │
        ├──────► (falha de insumo insuficiente) ProductionCancelled
        │
        ▼
   ProductionCompleted ──► ProductionOutput ──► Inventory Movement Hub
                            (Stock Movement: entrada do Produto final)
```

### 7.4 Fluxo Financeiro

```
   Purchase Hub / Production Hub / Commerce Hub
        │
        ├──► PurchaseReceived ──────────► Financial Hub: AccountPayable criada
        │
        ├──► ProductionCompleted ───────► Financial Hub: LedgerEntry de custo
        │                                  (COGS — Cost of Goods Sold)
        │
        └──► OrderPaid ──────────────────► Finance Hub (Official): InvoicePaid
                                             │
                                             ▼
                                       FinancialEntryCreated (extensão)
                                             │
                                             ▼
                                       Fiscal Hub: FiscalDocumentIssued
                                             │
                                             ▼
                                       Analytics Hub: Fluxo de Caixa consolidado
```

---

## 8. IA aplicada ao ERP Foundation (arquitetura, sem implementação)

Nenhum Agente de IA descrito nesta seção existe hoje como código — esta seção é o contrato de como um futuro Agente, operando sob `AI_HUB.md`/`AI_HUB_ARCHITECTURE.md`, consumiria os cinco novos Hubs, sempre sob **Human Oversight** (`AI_HUB.md`, Capítulo 5), nunca com autoridade de escrita direta.

**Agente de Reposição.** Consome `StockPosition`/`StockAlertRule` (Inventory Movement Hub) e `SupplierPerformanceRecord` (Supplier Hub); produz uma `AI Decision` sugerindo uma nova `Purchase Requisition` — nunca a cria diretamente; a criação real permanece um Command humano ou uma Regra determinística já configurada no Automation Engine, mesma disciplina de `DOMAIN_OWNERSHIP_MATRIX.md`, Capítulo 8.

**Agente de Seleção de Fornecedor.** Consome `SupplierCatalogItem`/`SupplierPerformanceRecord` de múltiplos Fornecedores candidatos para o mesmo insumo; produz uma `AI Recommendation` de melhor Fornecedor por preço, prazo e histórico de qualidade — decisão final permanece humana.

**Agente de Previsão de Demanda de Produção.** Consome `OrderCreated`/`OpportunityCreated` (sinal de demanda futura) e `BillOfMaterials`; projeta necessidade futura de insumo, insumo direto de Analytics Hub (`Forecast`), nunca aciona `ProductionStarted` sem confirmação.

**Agente de Conformidade Fiscal.** Consome `TaxRule`/`FiscalObligation` (Fiscal Hub); sinaliza risco de não conformidade antes da emissão de um `Fiscal Document` — nunca bloqueia ou emite automaticamente, aplicação direta do princípio Human Oversight.

Nenhum destes quatro Agentes é implementado por esta Sprint — cada um é um consumidor futuro do contrato de Evento já formalizado nos Capítulos 6 e 7, seguindo integralmente `AI_HUB.md`, ADR-009 ("AI Recommends") já Frozen.

---

## 9. Change Requests Propostas (nenhuma executada por este documento)

1. `COMMERCE_HUB_ARCHITECTURE.md`, Capítulo 25 — reclassificar `Inventory`/`Stock Movement` de Entidade própria para Read Model derivado de `Stock Position` (Inventory Movement Hub), preservando o nome `Inventory` como a leitura exposta ao Cliente do Commerce Hub. Ver ADR-IM-001 em `INVENTORY_MOVEMENT_HUB.md`.
2. `DOMAIN_OWNERSHIP_MATRIX.md`, Capítulo 4 — adicionar Purchase Hub, Supplier Hub, Inventory Movement Hub, Production Hub e Fiscal Hub como 15º a 19º proprietários, quando os cinco documentos desta Sprint avançarem de Draft para Official, mesmo processo já aplicado a Content Hub/Commerce Hub em `ARCHITECTURE_RECONCILIATION_AND_GOVERNANCE.md`, Capítulo 24.
3. `EVENT_CATALOG.md` — incorporar `DOMAIN_EVENT_CATALOG.md` (Capítulo 4 deste último) como nova seção por Hub, quando os cinco Hubs avançarem para Official.
4. `FINANCE_DOMAIN_BLUEPRINT.md` — nenhuma alteração de conteúdo recomendada; apenas nota cruzada referenciando `FINANCIAL_HUB.md` como extensão de integração, para prevenir leitura futura de que Finance Hub perdeu ownership de `Account Payable`.

---

## 10. ADRs deste documento

**ADR-ERP-001 — Cinco novos proprietários, não dez.** Dos dez nomes pedidos pela Sprint ERP-001, apenas cinco tornam-se Owner de conceito novo; Order, Financial e Pricing reconciliam com Owners já existentes (Commerce Hub, Finance Hub), e Procurement/Manufacturing são absorvidos como mesmo Bounded Context de Purchase/Production. Contexto: aplicação direta de `DOMAIN_OWNERSHIP_MATRIX.md`, Capítulo 11, sétimo passo.

**ADR-ERP-002 — Inventory Movement Hub é o eixo central.** É o único novo Hub consumido tanto pelo lado de suprimento quanto pelo lado de demanda; toda leitura de estoque em qualquer outro Hub é uma projeção derivada de seu ledger, nunca uma cópia estrutural. Contexto: Capítulo 6.3.

**ADR-ERP-003 — Physical Before Financial em todo o ERP Foundation.** Todo fato físico (recebimento, produção) é registrado independentemente da confirmação financeira correspondente. Contexto: Capítulo 3, replica o desacoplamento já estabelecido entre `Order` e `Invoice`.

**ADR-ERP-004 — Nenhum dos cinco novos Hubs calcula seu próprio indicador consolidado.** Todo indicador de giro, lead time ou custo médio permanece exclusivo do Analytics Hub. Contexto: Capítulo 6.7, aplicação de ADR-016 de `DOMAIN_OWNERSHIP_MATRIX.md`.

**ADR-ERP-005 — Nenhum Agente de IA descrito no Capítulo 8 possui autoridade de escrita.** Toda sugestão de Reposição, Seleção de Fornecedor, Previsão ou Conformidade permanece sujeita a confirmação humana ou Regra determinística já configurada. Contexto: `AI_HUB.md`, ADR-009.

---

## 11. Glossário desta Sprint

**ERP Foundation** — o conjunto dos cinco novos Bounded Contexts desta Sprint: Purchase Hub, Supplier Hub, Inventory Movement Hub, Production Hub, Fiscal Hub.

**Supply Side** — o eixo de domínios que precede a disponibilidade de um Produto para venda: Supplier, Purchase, Production.

**Demand Side** — o eixo de domínios já existente que trata da venda: CRM, Commerce, Finance.

**Ledger Before Snapshot** — princípio segundo o qual todo valor "atual" é derivado de um histórico imutável, nunca armazenado como único campo mutável.

**Physical Before Financial** — princípio segundo o qual a confirmação de um fato físico nunca depende da confirmação do fato financeiro correspondente.

Demais termos — Aggregate, Entity, Value Object, Command, Event, Repository Interface, Bounded Context, Owner, Consumer — usados neste documento na mesma definição já fixada em `DOMAIN_OWNERSHIP_MATRIX.md`, Capítulo 13.

---

## 12. Documentos desta Sprint

`PURCHASE_HUB.md`, `SUPPLIER_HUB.md`, `INVENTORY_MOVEMENT_HUB.md`, `PRODUCTION_HUB.md`, `FISCAL_HUB.md` — os cinco novos proprietários, cada um com Aggregates, Entidades, Value Objects, Commands, Eventos, Repository Interfaces (como especificação), Managers/Services (como especificação), regras de negócio e ADRs próprios.

`ORDER_HUB.md`, `FINANCIAL_HUB.md` — documentos de reconciliação, sem ownership novo.

`DOMAIN_EVENT_CATALOG.md` — catálogo consolidado de todo Evento novo introduzido por esta Sprint, no mesmo formato de `EVENT_CATALOG.md`.

`ERP_CONTEXT_MAP.md` — Context Map, Dependency Graph, Module Map e Aggregate Relations completos.

`docs/architecture/ERP_FOUNDATION_REPORT.md` — relatório de fechamento da Sprint, com validação explícita de decoupling, ausência de dependência circular, cobertura de Evento, e suporte a pequena empresa/crescimento/múltiplos segmentos/IA.
