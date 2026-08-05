# Financial Hub (Extensão ERP) — Documento de Reconciliação

**Adaptive Business Platform · Documento Técnico (Draft)**

---

## Nota de Posicionamento Documental

Este documento **não introduz um novo proprietário de conceito.** É, por desenho, um documento de reconciliação e extensão — a Sprint ERP-001 pediu nominalmente um "Financial Hub" entre os dez domínios a desenhar; este documento formaliza, com o mesmo rigor de verificação prévia já exigido por `DOMAIN_OWNERSHIP_MATRIX.md`, Capítulo 11 (sétimo passo), a conclusão de que **todo o vocabulário financeiro que "Financial Hub" nomearia — Invoice, Payment, Ledger Entry, Account Payable, Account Receivable, Tax Record — já pertence, integralmente e desde muito antes desta Sprint, ao Finance Hub** (`FINANCE_DOMAIN_BLUEPRINT.md`, `FINANCE_HUB.md`, ambos **Official**, dezenove Eventos já catalogados, doze ADRs já fixados). Não existe território livre a ocupar sob esse nome.

O que existe, e que este documento formaliza como sua única contribuição real, é uma lacuna de **integração**: até esta Sprint, nenhum Evento existia para que o Finance Hub soubesse que uma compra foi recebida (e portanto uma `Account Payable` deveria existir) ou que uma produção foi concluída (e portanto um `Ledger Entry` de custo deveria ser lançado). Essa lacuna é o escopo integral deste documento — nunca uma redefinição de `Invoice`/`Payment`/`Ledger Entry`, que permanecem, sem exceção, exclusivamente descritos e possuídos por `FINANCE_DOMAIN_BLUEPRINT.md`.

Nenhuma linha de `FINANCE_DOMAIN_BLUEPRINT.md`, `FINANCE_HUB.md` ou `DOMAIN_OWNERSHIP_MATRIX.md` é alterada por este documento.

---

## 1. O que este documento não é

Não é um novo Bounded Context. Não introduz `Invoice`, `Payment`, `Payment Method`, `Payment Intent`, `Refund`, `Ledger Entry`, `Balance`, `Financial Account`, `Account Receivable`, `Account Payable`, `Subscription`, `Currency` — todos já Official, exclusivos do Finance Hub, listados em `DOMAIN_OWNERSHIP_MATRIX.md`, Capítulo 4. Não redefine nenhum ADR já fixado em `FINANCE_DOMAIN_BLUEPRINT.md`. Não propõe nenhum Command novo sobre Entidade já existente do Finance Hub — toda nova capacidade financeira exigida pelo ERP Foundation é responsabilidade do próprio Finance Hub, exercida através de seus próprios Commands já especificados, nunca por um Command externo.

---

## 2. O que este documento é

É o contrato de **três novos Eventos de origem** (publicados pelos cinco novos Hubs desta Sprint) e da **regra de reação esperada do Finance Hub** a cada um — regra que, por preservar integralmente Single Owner, é executada inteiramente por decisão e por Command interno do próprio Finance Hub, nunca por escrita externa de nenhum dos cinco novos Hubs.

### 2.1 `PurchaseReceived` (Purchase Hub) → `Account Payable`

Quando o Purchase Hub publica `PurchaseReceived`, o Finance Hub — por sua própria decisão interna, seguindo exatamente o mesmo padrão já estabelecido entre `OpportunityWon` (CRM Hub) e `InvoiceCreated` (Finance Hub), documentado em `CRM_DOMAIN_BLUEPRINT.md`, ADR-005 — cria uma nova `Account Payable`, referenciando `supplierId` (por identificador externo ao Supplier Hub, nunca por leitura de sua estrutura interna) e o valor total recebido (`Purchase Order Item.acquisitionCost` somado). A condição de pagamento (`PaymentTerms`, Supplier Hub) informa o prazo dessa `Account Payable`, consumida pelo mesmo mecanismo de referência por identificador.

### 2.2 `ProductionCompleted` (Production Hub) → `Ledger Entry` de custo (COGS)

Quando o Production Hub publica `ProductionCompleted`, o Finance Hub cria um novo `Ledger Entry` correspondente ao custo de produção — soma do `acquisitionCost` de cada insumo consumido (`Production Consumption`), atribuído ao Produto final gerado. Este é o único mecanismo desta Sprint para que um custo de produção afete a posição financeira consolidada da Empresa, preservando `Ledger Entry` como o único ponto de escrita contábil já Official.

### 2.3 `OrderPaid` (Commerce Hub) → já existente, sem mudança

`OrderPaid` já aciona `InvoiceCreated` desde `COMMERCE_HUB_ARCHITECTURE.md`, Capítulo 22 — este documento não altera esse fluxo, apenas o referencia como o terceiro vértice do Fluxo Financeiro completo (`ERP_ARCHITECTURE.md`, Capítulo 7.4), agora also alimentado pelas duas novas origens acima.

---

## 3. Regras de Negócio (desta extensão apenas)

`Account Payable` originada de `PurchaseReceived` nunca é criada em duplicidade — idempotência garantida pelo identificador do `Purchase Order`, mesmo princípio já exigido de todo Evento em `EVENT_CATALOG.md`, Capítulo 3 ("Idempotent Processing").

`Ledger Entry` de custo originado de `ProductionCompleted` referencia o `Production Order` de origem — rastreabilidade completa entre custo lançado e produção física que o gerou.

Nenhum dos cinco novos Hubs desta Sprint lê `Account Payable`/`Ledger Entry`/`Balance` já criado pelo Finance Hub — a relação é estritamente unidirecional (publica Evento, nunca consulta o resultado), preservando a mesma assimetria já descrita em `DOMAIN_OWNERSHIP_MATRIX.md`, Capítulo 6, para todo par de Business Hub.

---

## 4. Diagrama de Integração

```
   Purchase Hub ──PurchaseReceived──────┐
                                         │
   Production Hub ──ProductionCompleted─┼──► Finance Hub (Official, sem alteração
                                         │     de Entidade ou ADR já fixado)
   Commerce Hub ──OrderPaid─────────────┘         │
                                                   ├──► AccountPayable criada
                                                   ├──► LedgerEntry (COGS) criado
                                                   └──► InvoiceCreated (já existente)
```

---

## 5. ADRs

**ADR-FN-001 — Nenhum novo Owner financeiro é criado por esta Sprint.** Contexto: aplicação direta de `DOMAIN_OWNERSHIP_MATRIX.md`, Capítulo 11, sétimo passo; todo vocabulário financeiro nomeado pela Sprint ERP-001 já tem proprietário Official.

**ADR-FN-002 — Toda nova obrigação financeira do ERP Foundation nasce de Evento consumido, nunca de escrita externa.** Contexto: preservar Single Owner do Finance Hub; `Account Payable`/`Ledger Entry` de custo são sempre criados por Command interno do próprio Finance Hub, reagindo a `PurchaseReceived`/`ProductionCompleted`.

**ADR-FN-003 — Purchase Hub e Production Hub nunca consultam o resultado financeiro de sua própria publicação.** Contexto: preservar comunicação assíncrona e desacoplamento total, mesmo padrão já exigido de CRM Hub em relação a `Invoice` criada a partir de `OpportunityWon`.

---

## 6. Change Request Proposta

`FINANCE_DOMAIN_BLUEPRINT.md` — nenhuma alteração de conteúdo recomendada; Change Request proposta apenas para adicionar, em seu Capítulo de Eventos consumidos, uma nota cruzada referenciando `PurchaseReceived` e `ProductionCompleted` como novas origens externas de `Account Payable`/`Ledger Entry`, preservando a autoridade de `FINANCE_DOMAIN_BLUEPRINT.md` como documento proprietário, nunca substituída por este.

---

## 7. Glossário

**Account Payable (originada de compra)** — obrigação de pagamento a um Fornecedor, criada pelo Finance Hub a partir de `PurchaseReceived`; a Entidade em si permanece exclusivamente do Finance Hub.

**Ledger Entry de custo (COGS)** — lançamento contábil de custo de produção, criado pelo Finance Hub a partir de `ProductionCompleted`.
