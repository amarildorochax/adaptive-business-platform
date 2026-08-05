# Fiscal Hub — Blueprint de Domínio

**Adaptive Business Platform · Documento Técnico (Draft)**

---

## Nota de Posicionamento Documental

Este documento nasce em status **Draft** (`DOCUMENTATION_CONSTITUTION.md`, §8.1), como parte da Sprint ERP-001 — ver `ERP_ARCHITECTURE.md` para a Nota de Posicionamento consolidada.

Fiscal Hub nasce vizinho de dois conceitos já Official do Finance Hub — `Tax Record` ("Registro conceitual de tributo aplicável") e `Financial Document` ("Invoice, Recibo ou Comprovante gerado"). A leitura atenta de `FINANCE_DOMAIN_BLUEPRINT.md` confirma que ambos são, deliberadamente, **stubs conceituais rasos** — uma linha de referência, nunca um capítulo de modelagem tributária completa (cálculo de alíquota, retenção, regime tributário, obrigação acessória). Este documento não disputa a Entidade já Official — `Tax Record` continua existindo como a referência mínima associada a uma transação financeira — mas aprofunda, sob um novo Owner, tudo que `Tax Record` nunca modelou: o **Documento Fiscal** formal (o equivalente conceitual de uma nota fiscal de circulação de mercadoria) e a **regra de cálculo tributário** que determina seu conteúdo.

A mesma distinção já foi traçada por `COMMERCE_HUB_ARCHITECTURE.md`, Capítulo 23 ("Notas Fiscais"), ao afirmar que `Financial Document` cobre Invoice/Recibo/Comprovante — mas nenhum documento desta plataforma, até esta Sprint, cobriu o documento fiscal exigido por autoridade tributária, distinto em finalidade (compliance perante o governo) e em estrutura (item, NCM/classificação fiscal, alíquota por item) de um comprovante de pagamento (finalidade: prova de quitação perante o Cliente). Fiscal Hub preenche exatamente essa lacuna, sem alterar nenhuma linha de `FINANCE_DOMAIN_BLUEPRINT.md`.

---

## 1. Introdução

O **Fiscal Hub** é o domínio responsável pela conformidade tributária de toda mercadoria movimentada pela plataforma — o cálculo de imposto devido sobre uma venda ou uma transferência, e a emissão do Documento Fiscal formal correspondente, consumindo fatos já publicados pelo Commerce Hub (`OrderPaid`) e pelo Finance Hub (`InvoiceCreated`), sem nunca decidir sobre dinheiro.

---

## 2. Responsabilidade

O Fiscal Hub é responsável por manter o ciclo de vida de `Fiscal Document`, `Tax Rule`, `Tax Calculation`, `Fiscal Obligation` e `Tax Regime`; por calcular o imposto devido sobre uma transação de venda de mercadoria, aplicando a `Tax Rule` vigente para o `Tax Regime` da Empresa; e por emitir e rastrear o status de um `Fiscal Document`, incluindo seu cancelamento formal quando aplicável.

---

## 3. Limites do Domínio

O Fiscal Hub nunca cria ou altera `Invoice`/`Payment`/`Account Payable`/`Account Receivable` — permanecem exclusivamente do Finance Hub; o Fiscal Hub apenas consome `InvoiceCreated`/`OrderPaid` para calcular e emitir seu próprio `Fiscal Document`, e publica `FiscalDocumentIssued`, consumido de volta pelo Finance Hub apenas para associação de referência, nunca para alterar valor já lançado.

O Fiscal Hub nunca decide o preço de venda de um Produto — consome `Price`/`Order Item` já confirmado pelo Commerce Hub, apenas para calcular a base de cálculo do imposto.

O Fiscal Hub nunca integra diretamente com uma autoridade tributária externa (SEFAZ ou equivalente) — toda comunicação técnica externa é mediada exclusivamente pelo Integration Hub, aplicação direta de ADR-012 de `DOMAIN_OWNERSHIP_MATRIX.md` ("Integration Owns External Connectivity").

O Fiscal Hub nunca substitui `Tax Record` (Finance Hub) — ambos coexistem; `Tax Record` permanece a referência mínima associada a uma transação financeira, `Fiscal Document`/`Tax Calculation` são o aprofundamento formal usado apenas quando a Empresa opera sob obrigação fiscal de emissão.

---

## 4. Aggregates

**Fiscal Document** é o Aggregate Root — representa o documento fiscal formal de uma operação (venda, devolução, transferência entre `Stock Location`); agrupa linha de item fiscal como parte interna; uma vez emitido, é imutável, exceto por seu próprio ciclo de cancelamento formal (nunca edição de conteúdo já emitido).

**Tax Rule** é um Aggregate independente — representa uma regra de cálculo (alíquota, base de cálculo, isenção condicional) vigente para uma combinação de `Tax Regime`, categoria de Produto e jurisdição.

**Fiscal Obligation** é um Aggregate independente — representa uma obrigação acessória periódica (por exemplo, uma declaração), com data de vencimento e status, nunca a execução do cálculo em si.

---

## 5. Entidades

**Fiscal Document.** Identificador; `orderId`/`invoiceId` de origem (Commerce Hub/Finance Hub, por identificador); tipo (`Sale`, `Return`, `Transfer`); lista de `Fiscal Document Line`; status (`Issued`, `Cancelled`); número e série (quando aplicável ao regime); data de emissão.

**Fiscal Document Line.** `productId` (Commerce Hub); quantidade; valor unitário; classificação fiscal (Value Object `TaxClassification`); `Tax Calculation` aplicado.

**Tax Rule.** Identificador; `taxRegimeId`; classificação fiscal aplicável; alíquota (Value Object `TaxRate`); condição de isenção, quando houver; vigência (data início/fim).

**Tax Calculation.** Identificador; `fiscalDocumentLineId`; `taxRuleId` aplicada; valor de imposto calculado (Value Object `Money`); é sempre o resultado determinístico de uma `Tax Rule` vigente no momento do cálculo — nunca um valor editável manualmente.

**Fiscal Obligation.** Identificador; tipo; periodicidade; data de vencimento; status (`Pending`, `Fulfilled`, `Overdue`).

**Tax Regime.** Identificador; nome (referência conceitual ao enquadramento tributário da Empresa); associado a exatamente uma Empresa por Tenant.

---

## 6. Value Objects

**TaxClassification** — código de classificação fiscal de um item (equivalente conceitual a NCM), nunca modelado como campo livre-texto de Produto no Commerce Hub — referenciado por identificador a partir de `Fiscal Document Line`, mantendo o Catalog do Commerce Hub livre de conceito fiscal.

**TaxRate** — alíquota percentual ou fixa, com vigência temporal explícita.

**Money** — mesmo Value Object já usado em toda a plataforma.

---

## 7. Commands

`RegisterTaxRegime`, `CreateTaxRule`, `DeactivateTaxRule`, `CalculateTax`, `IssueFiscalDocument`, `CancelFiscalDocument`, `RegisterFiscalObligation`, `MarkFiscalObligationFulfilled`.

Todo Command é processado exclusivamente pelo `FiscalManager` (Capítulo 10).

---

## 8. Eventos

Ver `DOMAIN_EVENT_CATALOG.md` para o contrato completo: `TaxRuleCreated`, `TaxCalculated`, `FiscalDocumentIssued`, `FiscalDocumentCancelled`, `FiscalObligationRegistered`, `FiscalObligationOverdue`.

---

## 9. Repository Interfaces (especificação)

```
interface FiscalDocumentRepository {
  findById(id): FiscalDocument | null
  findByOrigin(orderId): FiscalDocument[]
  save(document): void
}

interface TaxRuleRepository {
  findApplicable(taxRegimeId, classification, date): TaxRule | null
  save(rule): void
}

interface FiscalObligationRepository {
  findPending(): FiscalObligation[]
  findOverdue(): FiscalObligation[]
  save(obligation): void
}

interface TaxRegimeRepository {
  findByTenant(tenantId): TaxRegime | null
  save(regime): void
}
```

---

## 10. Managers e Services (especificação)

**FiscalManager** é a única fachada pública — todo Command do Capítulo 7 passa exclusivamente por ele.

**TaxCalculationService** é o único ponto que produz `Tax Calculation`, aplicando a `Tax Rule` vigente de forma determinística — a mesma entrada (classificação, valor base, regime, data) sempre produz a mesma saída, nunca sujeita a variação por implementação divergente em outro Hub.

**FiscalDocumentIssuanceService** consome `InvoiceCreated`/`OrderPaid` e é o único ponto que publica `FiscalDocumentIssued`; nunca emite um Documento Fiscal sem `Tax Calculation` completo associado a cada linha.

**FiscalObligationTrackingService** avalia periodicamente `Fiscal Obligation` pendente e publica `FiscalObligationOverdue` quando o vencimento é ultrapassado — acionado pelo Automation Engine, nunca por agendador interno.

---

## 11. Regras de Negócio

Todo `Fiscal Document` referencia exatamente uma origem (`Order` ou `Invoice`) — nunca é criado sem correlação rastreável a uma transação real já confirmada.

`Tax Calculation` é sempre determinístico e reproduzível a partir da `Tax Rule` vigente na data do cálculo — mesmo que a `Tax Rule` mude depois, o cálculo já realizado nunca é recalculado retroativamente; uma nova regra afeta apenas cálculo futuro.

Um `Fiscal Document` emitido é imutável quanto ao conteúdo — sua única transição posterior permitida é `Cancelled`, nunca edição de item ou de valor.

`Fiscal Document.taxClassification` de cada linha referencia um `Product` já existente no Catalog do Commerce Hub — o Fiscal Hub nunca cria Produto implicitamente, mesma disciplina já aplicada por Purchase Hub e Production Hub.

Uma Empresa sem `Tax Regime` registrado opera sem nenhuma emissão de `Fiscal Document` — Capability opcional via Business Profile Engine, nunca uma trava bloqueante da venda em si (o `Order`/`Invoice` seguem seu fluxo normal independentemente da emissão fiscal, que pode ser adicionada como capacidade posterior).

---

## 12. Fluxo Completo

```
   Commerce Hub: OrderPaid ──────────────────► Finance Hub: InvoiceCreated
                                                        │
                                                        ▼
                                              Fiscal Hub consome InvoiceCreated
                                                        │
                                                        ▼
                                              CalculateTax (por linha, via
                                              Tax Rule vigente)
                                                        │
                                                        ▼
                                              IssueFiscalDocument
                                                        │
                                                        ▼
                                              FiscalDocumentIssued
                                                        │
                                                        ▼
                                              Finance Hub associa referência
                                              (nunca altera valor já lançado)
                                                        │
                                                        ▼
                                              Analytics Hub consolida carga
                                              tributária como indicador
```

---

## 13. Integrações

**Finance Hub** — consumidor de `InvoiceCreated`/`OrderPaid`; produtor de `FiscalDocumentIssued`, consumido de volta apenas para associação de referência (`Tax Record`), nunca para alteração de `Ledger Entry` já lançado.

**Commerce Hub** — toda `Fiscal Document Line` referencia `Product`/`Order Item` por identificador; nenhuma escrita cruzada.

**Integration Hub** — mediador exclusivo de toda comunicação técnica futura com autoridade tributária externa; Fiscal Hub nunca implementa esse contato diretamente.

**Automation Engine** — consumidor de `FiscalObligationOverdue`; produtor do Trigger periódico que aciona `FiscalObligationTrackingService`.

**Branding Hub** — aplicação de `Brand Theme` na representação visual de um `Fiscal Document`, mesma disciplina já aplicada a `Financial Document`.

**Analytics Hub** — consumidor de todo Evento deste Hub, origem de indicador consolidado de carga tributária.

---

## 14. ADRs

**ADR-FI-001 — Fiscal Document é distinto de Financial Document, mesmo quando originados do mesmo Order.** Contexto: finalidade e estrutura divergentes (compliance perante o governo vs. comprovante de pagamento ao Cliente), mesma reconciliação já traçada em `COMMERCE_HUB_ARCHITECTURE.md`, Capítulo 23.

**ADR-FI-002 — Tax Calculation é sempre determinístico e nunca recalculado retroativamente.** Contexto: preservar Auditability by Design; uma mudança de `Tax Rule` nunca reescreve histórico fiscal já emitido.

**ADR-FI-003 — Fiscal Hub nunca integra diretamente com autoridade tributária externa.** Contexto: aplicação direta de ADR-012 de `DOMAIN_OWNERSHIP_MATRIX.md` — toda conectividade externa é exclusiva do Integration Hub.

**ADR-FI-004 — Emissão fiscal é Capability opcional, nunca bloqueante da venda.** Contexto: preservar suporte a pequena Empresa que ainda não opera sob obrigação de emissão formal, mesmo princípio de adaptação gradual de `BUSINESS_PROFILE_ENGINE.md`.

---

## 15. Glossário

**Fiscal Document** — documento fiscal formal de uma operação de venda, devolução ou transferência.

**Tax Rule** — regra de cálculo tributário vigente para uma combinação de regime, classificação e jurisdição.

**Tax Calculation** — resultado determinístico da aplicação de uma Tax Rule a uma linha de Fiscal Document.

**Tax Regime** — enquadramento tributário de uma Empresa.

**Fiscal Obligation** — obrigação acessória periódica de conformidade fiscal.
