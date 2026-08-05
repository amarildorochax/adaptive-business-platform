# Supplier Hub — Blueprint de Domínio

**Adaptive Business Platform · Documento Técnico (Draft)**

---

## Nota de Posicionamento Documental

Este documento nasce em status **Draft** (`DOCUMENTATION_CONSTITUTION.md`, §8.1), como parte da Sprint ERP-001 — ver `ERP_ARCHITECTURE.md` para a Nota de Posicionamento consolidada.

Supplier Hub é território genuinamente livre, mas nasce vizinho de um domínio já Frozen facilmente confundível com ele: `CRM_DOMAIN_BLUEPRINT.md` já reivindica `Organization`/`Contact` como o lado **cliente** do relacionamento comercial — "Entidade jurídica do relacionamento comercial" (`DOMAIN_OWNERSHIP_MATRIX.md`, linha `Organization`). Este documento traça, com o mesmo rigor já exigido de toda reconciliação desta série, a fronteira entre os dois: **CRM Hub é quem compra da Empresa; Supplier Hub é quem vende para a Empresa.** São dois lados opostos e nunca sobrepostos da mesma cadeia de valor — mesmo quando, no mundo real, a mesma pessoa jurídica externa (mesmo CNPJ) é simultaneamente Cliente e Fornecedor de uma Empresa (cenário B2B comum em atacado), ela é modelada como duas Entidades distintas nesta plataforma, uma em cada Hub, unidas apenas por um identificador externo opcional, nunca por uma Entidade compartilhada — aplicação direta de **No Shared Ownership**, `DOMAIN_OWNERSHIP_MATRIX.md`, Capítulo 3.

---

## 1. Introdução

O **Supplier Hub** é o domínio responsável por todo o relacionamento com quem fornece mercadoria, insumo ou serviço à Empresa — o espelho, do lado do suprimento, do que o CRM Hub já é do lado do cliente. Onde o CRM Hub responde "quem a Empresa conhece e vende para", o Supplier Hub responde "quem a Empresa conhece e compra de".

---

## 2. Responsabilidade

O Supplier Hub é responsável por manter o ciclo de vida de `Supplier`, `Supplier Contact`, `Supplier Catalog Item`, `Supplier Performance Record` e `Supplier Contract`; por registrar e atualizar dado cadastral de Fornecedor; por manter a associação entre Fornecedor e o item de Catalog que ele fornece, incluindo preço de tabela e prazo de entrega prometido; e por consolidar um histórico observável de desempenho (pontualidade, taxa de divergência de recebimento) a partir de Evento consumido do Purchase Hub.

---

## 3. Limites do Domínio

O Supplier Hub nunca cria `Purchase Order` — apenas é referenciado por identificador; a decisão de comprar permanece exclusiva do Purchase Hub.

O Supplier Hub nunca modifica `Customer`/`Organization` do CRM Hub, mesmo quando o mesmo CNPJ está cadastrado em ambos os Hubs — nenhuma escrita cruzada, nenhuma leitura de estrutura interna.

O Supplier Hub nunca calcula seu próprio Score de crédito ou risco consolidado além do `Supplier Performance Record` observável (dado bruto, não indicador projetado) — qualquer projeção de tendência ou benchmark de fornecedor é Metric/KPI do Analytics Hub.

O Supplier Hub nunca decide o preço de venda de um Produto — `Supplier Catalog Item.listPrice` é o preço de **compra** cotado pelo Fornecedor, nunca confundido com `Price` (Commerce Hub), que é o preço de **venda** ao Cliente final.

---

## 4. Aggregates

**Supplier** é o Aggregate Root — agrupa `Supplier Contact` e `Supplier Catalog Item` como parte interna; é a única Entidade deste domínio referenciada por identificador por Purchase Hub e Fiscal Hub.

**Supplier Contract** é um Aggregate independente, associado a um `Supplier` por identificador — representa um acordo comercial formal (prazo, volume mínimo, condição de pagamento) distinto do cadastro básico.

**Supplier Performance Record** é um Aggregate independente e imutável — cada registro é um fato observado (uma entrega pontual, um recebimento com divergência), nunca um valor consolidado sobrescrito; o consolidado é responsabilidade do Analytics Hub.

---

## 5. Entidades

**Supplier.** Identificador; razão social; identificador fiscal externo (CNPJ/CPF ou equivalente internacional, Value Object `TaxId`); status (`Active`, `Disabled`); categoria de fornecimento; data de cadastro.

**Supplier Contact.** Identificador; `supplierId`; nome; canal de contato (referenciando `Channel`, já Official do Communication Hub, por identificador — nunca reimplementado); papel (comercial, financeiro, logístico).

**Supplier Catalog Item.** Identificador; `supplierId`; `productId`/`variantId` (Commerce Hub, por identificador); `listPrice` (Value Object `Money`); prazo de entrega prometido em dias; quantidade mínima de pedido.

**Supplier Contract.** Identificador; `supplierId`; vigência (data início/fim); condição de pagamento (Value Object `PaymentTerms`); volume mínimo acordado, quando aplicável.

**Supplier Performance Record.** Identificador; `supplierId`; `purchaseOrderId` de origem (Purchase Hub, por identificador); tipo de observação (`OnTimeDelivery`, `LateDelivery`, `QuantityMatch`, `QuantityMismatch`); data do fato.

---

## 6. Value Objects

**TaxId** — identificador fiscal externo, validado por formato, nunca por autoridade externa nesta Sprint (integração fiscal real é responsabilidade futura do Integration Hub).

**Money** — mesmo Value Object já usado por Purchase Hub e Finance Hub, nunca reimplementado.

**PaymentTerms** — prazo de pagamento acordado (à vista, 30/60/90 dias), consumido pelo Financial Hub (extensão) no momento de criar `Account Payable`, nunca decidido pelo Financial Hub por conta própria.

**SupplierStatus** — enum fechado (`Active`, `Disabled`).

---

## 7. Commands

`RegisterSupplier`, `UpdateSupplier`, `DisableSupplier`, `ReactivateSupplier`, `AddSupplierContact`, `RegisterSupplierCatalogItem`, `UpdateSupplierCatalogItem`, `CreateSupplierContract`, `RecordSupplierPerformance`.

Todo Command é processado exclusivamente pelo `SupplierManager` (Capítulo 10).

---

## 8. Eventos

Ver `DOMAIN_EVENT_CATALOG.md` para o contrato completo: `SupplierRegistered`, `SupplierUpdated`, `SupplierDisabled`, `SupplierReactivated`, `SupplierCatalogItemRegistered`, `SupplierContractCreated`, `SupplierPerformanceRecorded`.

---

## 9. Repository Interfaces (especificação)

```
interface SupplierRepository {
  findById(id): Supplier | null
  findByTaxId(taxId): Supplier | null
  findActive(): Supplier[]
  save(supplier): void
}

interface SupplierCatalogItemRepository {
  findBySupplier(supplierId): SupplierCatalogItem[]
  findByProduct(productId): SupplierCatalogItem[]
  save(item): void
}

interface SupplierContractRepository {
  findBySupplier(supplierId): SupplierContract[]
  save(contract): void
}

interface SupplierPerformanceRepository {
  findBySupplier(supplierId): SupplierPerformanceRecord[]
  save(record): void
}
```

---

## 10. Managers e Services (especificação)

**SupplierManager** é a única fachada pública — todo Command do Capítulo 7 passa exclusivamente por ele.

**SupplierCatalogService** encapsula a associação Fornecedor↔Produto e a validação de que `productId` referencia um Produto já existente no Commerce Hub.

**SupplierPerformanceService** consome `PurchaseReceived`/`PurchasePartiallyReceived` (Purchase Hub) e produz `SupplierPerformanceRecord` automaticamente, comparando data prometida versus data real e quantidade solicitada versus quantidade recebida — nunca requer input manual para o registro básico.

---

## 11. Regras de Negócio

Todo `Supplier` é identificado de forma única por `TaxId` dentro do Tenant — um cadastro duplicado do mesmo identificador fiscal é rejeitado, nunca criado como segunda Entidade.

Um `Supplier` desabilitado (`SupplierDisabled`) bloqueia a criação de novo `Purchase Order` contra ele (regra aplicada pelo Purchase Hub, consumindo este Evento) mas nunca altera Pedidos já em andamento.

`Supplier Performance Record` é sempre gerado a partir de fato observado no Purchase Hub — nunca inserido manualmente como avaliação subjetiva nesta Sprint (Oportunidade Futura: avaliação qualitativa manual, ver `ERP_FOUNDATION_REPORT.md`).

`Supplier Catalog Item.listPrice` é informativo — nunca vincula automaticamente o `Purchase Order Item.acquisitionCost`, que pode divergir por negociação pontual; a divergência em si é um dado observável, não um erro.

---

## 12. Fluxo Completo

```
   RegisterSupplier ──► SupplierRegistered
        │
        ▼
   RegisterSupplierCatalogItem ──► SupplierCatalogItemRegistered
        │
        ▼
   (consumido por Purchase Hub na criação de Purchase Order,
    como origem sugerida de supplierId)
        │
        ▼
   PurchaseReceived (Purchase Hub) ──► SupplierPerformanceRecorded
        │
        ▼
   (consumido por Analytics Hub — indicador de desempenho consolidado)
```

---

## 13. Integrações

**Purchase Hub** — consumidor de `SupplierRegistered`/`SupplierDisabled`; produtor de `PurchaseReceived`, consumido por este Hub para `SupplierPerformanceRecorded`.

**Commerce Hub** — `Supplier Catalog Item` referencia `Product`/`Variant` por identificador; nenhuma escrita cruzada.

**CRM Hub** — nenhuma integração de escrita; possível futura correlação de `TaxId` para exibição consolidada de "parceiro comercial" (Cliente e Fornecedor simultâneos), explicitamente fora do escopo desta Sprint.

**Communication Hub** — `Supplier Contact` referencia `Channel` por identificador para contato técnico, nunca duplica canal.

**Financial Hub (extensão)** — consumidor de `SupplierRegistered`/`Supplier Contract` (condição de pagamento) no momento de criar `Account Payable`.

**Analytics Hub** — consumidor de `SupplierPerformanceRecorded`, origem de todo indicador consolidado de desempenho de Fornecedor.

---

## 14. ADRs

**ADR-SU-001 — Supplier e Customer/Organization são Entidades distintas, mesmo sob o mesmo CNPJ.** Contexto: aplicação direta de No Shared Ownership; a alternativa (Entidade compartilhada) acopla CRM Hub e Supplier Hub de forma irreversível.

**ADR-SU-002 — Supplier Performance Record é sempre derivado de fato observado, nunca de avaliação subjetiva nesta fase.** Contexto: preservar Ledger Before Snapshot (`ERP_ARCHITECTURE.md`, Capítulo 3) — todo registro de desempenho é rastreável a um `Purchase Order`/`Receiving` real.

**ADR-SU-003 — Supplier Catalog Item.listPrice nunca é a fonte de verdade de Purchase Order Item.acquisitionCost.** Contexto: preservar honestidade de custo real observado versus tabela nominal, mesma disciplina que distingue `Price` de lista e `Price` efetivamente cobrado no Commerce Hub.

---

## 15. Glossário

**Supplier** — pessoa jurídica ou física que fornece mercadoria ou insumo à Empresa.

**Supplier Catalog Item** — associação entre um Fornecedor e um Produto que ele fornece, com preço de tabela e prazo prometido.

**Supplier Performance Record** — fato observável de desempenho de entrega de um Fornecedor.

**Supplier Contract** — acordo comercial formal com um Fornecedor.
