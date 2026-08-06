# IMP-603 — Fiscal HTTP API

**Adaptive Business Platform · Relatório de Implementação**

---

## 1. Resumo Executivo

IMP-603 expõe a camada HTTP completa do Fiscal Hub — o quinto e último domínio da ERP Foundation a
ganhar API HTTP, seguindo rigorosamente o padrão consolidado por IMP-203 (Supplier), IMP-303 (Purchase),
IMP-403 (Inventory Movement) e IMP-503 (Production). Quinze endpoints, um por método público de
`FiscalManager` (oito Commands, seis Query, mais `evaluateFiscalObligations`), nenhum inventado, nenhum
omitido.

`FiscalManager` (`@abp/fiscal-hub`, IMP-601) e `createManagerRegistry` (IMP-602) permaneceram
inteiramente intocados — este Sprint é estritamente HTTP: DTOs, Mappers, Error Mapping, Routes, OpenAPI
e integração no bootstrap do servidor. Nenhum Hub anterior (Supplier/Purchase/Inventory
Movement/Production) foi alterado.

Trinta testes de rota novos, cobrindo Commands, Queries, validação de schema, mapeamento de erro,
OpenAPI e as três classes de bug histórico já conhecidas — todos passando desde a primeira execução, sem
nenhuma correção necessária depois da primeira rodada de `typecheck`. Três rodadas completas de
`typecheck`/`build`/`lint`/`test` no workspace inteiro, todas limpas.

---

## 2. Auditoria Inicial

Respondido integralmente antes de qualquer código, per instrução explícita ("Responder tudo antes da
implementação"):

| Pergunta | Resposta |
|---|---|
| Existe API parcial? | Não — nenhum arquivo `fiscal.*` existia em `apps/api/src` antes desta Sprint. |
| Existe rota existente? | Não — `server.ts` não registrava nenhuma rota do Fiscal Hub. |
| Existe DTO existente? | Não — `dtos/fiscal.dto.ts` não existia. |
| Existe Mapper existente? | Não — `mappers/fiscal.mapper.ts` não existia. |
| Existe Error Mapping existente? | Não — `errors/mapFiscalError.ts` não existia. |
| Existe OpenAPI parcial? | Não — nenhuma tag `"fiscal"` existia em `plugins/openapi.ts`. |
| Existe integração parcial no server? | Não — `plugins/managers.ts` já expõe `fastify.managers.fiscal` desde IMP-602 (via `createManagerRegistry`), mas nenhuma rota o consumia. |
| Existe código legado? | Não. |
| Existe conflito com Finance Hub? | Não — reconfirmado nesta Sprint (ver Seção 3): `ERP_ARCHITECTURE.md` e `FINANCIAL_HUB.md` mantêm ADR-FN-001 ("Nenhum novo Owner financeiro é criado"), Fiscal Hub é o proprietário correto e único, `@abp/finance-hub` nunca é importado por nenhum arquivo desta Sprint. |

Nenhuma inconsistência encontrada — implementação prosseguiu sem necessidade de pausa/pergunta ao
usuário.

---

## 3. Leitura Obrigatória — Confirmação de Arquitetura

`ERP_ARCHITECTURE.md` (Capítulo 4, linha 90) confirma: **"Fiscal Hub possui: Fiscal Document, Tax Rule,
Tax Calculation, Fiscal Obligation, Tax Regime... Ver `FISCAL_HUB.md`."** `FINANCIAL_HUB.md`, ADR-FN-001,
reafirma que nenhum novo Owner financeiro nasce da Sprint ERP-001 — todo o vocabulário financeiro
(`Invoice`/`Payment`/`Account Payable`) permanece do Finance Hub, nunca do Fiscal Hub. `FISCAL_HUB.md`
não possui um capítulo dedicado a "HTTP API" — mesma ausência já observada em `PRODUCTION_HUB.md`/
`PURCHASE_HUB.md`/`INVENTORY_MOVEMENT_HUB.md`; a disciplina "um endpoint por método público do Manager",
consolidada por IMP-203/303/403/503, é a fonte de verdade para a superfície HTTP, não um capítulo de
arquitetura por Hub.

---

## 4. DTOs

`apps/api/src/dtos/fiscal.dto.ts` — nunca reutiliza `FiscalDocument`/`TaxRule`/`TaxRegime`/
`FiscalObligation`/`TaxCalculation` de `@abp/fiscal-hub` diretamente, mesma disciplina de
`production.dto.ts`/`purchase.dto.ts`.

Decisões de forma:

- **`MoneyDto`/`TaxClassificationDto`/`TaxRateDto`** permanecem objetos aninhados — mesma exceção
  deliberada de `MoneyDto` em `purchase.dto.ts`: campos que sempre viajam juntos, nunca achatados.
- **`TaxCalculationDto`** é reutilizado tanto como resposta de `POST /tax-calculations` quanto embutido
  em `IssueFiscalDocumentLineRequestDto.taxCalculation` — reflete `IssueFiscalDocumentLineInput.taxCalculation`
  (Core), que espera o objeto `TaxCalculation` já produzido por uma chamada anterior a `CalculateTax`,
  nunca recalculado internamente por `IssueFiscalDocument`. Mesma disciplina de reuso idêntico entre
  Request e Response já aplicada a `BOMLineDto` (Production Hub, IMP-503).
- Nenhum DTO de atualização parcial (`PATCH`) — auditoria confirmou que nenhum dos oito Commands do
  Fiscal Hub corresponde a uma atualização parcial por merge (ver Seção 8.1).

---

## 5. Mappers

`apps/api/src/mappers/fiscal.mapper.ts` — apenas transformação, nenhuma lógica de negócio. Uma função
por Entidade/Value Object de saída (`toTaxRegimeResponseDto`/`toTaxRuleResponseDto`/`toTaxCalculationDto`/
`toFiscalDocumentResponseDto`/`toFiscalObligationResponseDto`/`toEvaluateFiscalObligationsResponseDto`),
mais três helpers privados para os Value Objects aninhados (`toMoneyDto`/`toTaxClassificationDto`/
`toTaxRateDto`). Datas convertidas via `.toISOString()`, mesmo padrão de todo mapper já aprovado.

---

## 6. Error Mapping

`apps/api/src/errors/mapFiscalError.ts` — mesmo mecanismo de `mapProductionError.ts`/
`mapInventoryMovementError.ts`/`mapPurchaseError.ts`/`mapSupplierError.ts`: uma função de domínio
específica que delega a `mapDomainError.ts` (FUN-004, intocado) como fallback, nunca um sistema
paralelo. `FiscalManager` lança `FiscalDomainError` (hierarquia tipada, Core, congelada) — mapeado por
`instanceof`/`code`, nunca por heurística de texto.

Categorização dos quinze `code`:

| HTTP | Codes |
|---|---|
| 404 | `FISCAL_TAX_REGIME_NOT_FOUND`, `FISCAL_TAX_RULE_NOT_FOUND`, `FISCAL_NO_APPLICABLE_TAX_RULE_FOUND`, `FISCAL_DOCUMENT_NOT_FOUND`, `FISCAL_OBLIGATION_NOT_FOUND` |
| 409 | `FISCAL_DUPLICATE_TAX_REGIME`, `FISCAL_DOCUMENT_INVALID_STATUS_TRANSITION`, `FISCAL_OBLIGATION_INVALID_STATUS_TRANSITION` |
| 422 | `FISCAL_INVALID_TAX_REGIME_NAME`, `FISCAL_INVALID_TAX_CLASSIFICATION`, `FISCAL_INVALID_TAX_RATE`, `FISCAL_INVALID_MONEY`, `FISCAL_DOCUMENT_MISSING_ORIGIN`, `FISCAL_INVALID_DOCUMENT_LINE`, `FISCAL_INVALID_OBLIGATION` |

`FISCAL_NO_APPLICABLE_TAX_RULE_FOUND` foi deliberadamente categorizado como 404, não 422: embora
`taxRegimeId` possa existir, a mensagem ("nenhuma Tax Rule vigente encontrada...") é semanticamente
"recurso implícito não encontrado" (mesma leitura já validada pelo próprio `mapDomainError.ts`, cujo
regex `/não encontrad[oa]/i` bateria na mesma mensagem como fallback) — nunca um dado de entrada
malformado. `FISCAL_DOCUMENT_INVALID_STATUS_TRANSITION`/`FISCAL_OBLIGATION_INVALID_STATUS_TRANSITION`
foram categorizados como 409 (conflito de estado), não 422, mesmo critério já usado para
`PRODUCTION_ORDER_INVALID_STATUS_TRANSITION` em `mapProductionError.ts` — a mensagem contém a palavra
"inválida" mas a causa raiz é o estado atual do Aggregate, não o corpo da requisição.

Nenhum unit test dedicado (`mapFiscalError.test.ts`) foi criado — mesma decisão já tomada por IMP-503
(`mapProductionError.ts` não possui arquivo de teste próprio): todos os quinze `code` são exercitados
via `routes/fiscal.test.ts`, por asserção de `statusCode`, evitando duplicação de cobertura.

---

## 7. Routes

`apps/api/src/routes/fiscal.ts` — HTTP → DTO → `FiscalManager` → DTO → HTTP, sem regra de negócio
própria. Quinze endpoints:

| Método | Rota | Manager | Status (sucesso) |
|---|---|---|---|
| POST | `/tax-regimes` | `registerTaxRegime` | 201 |
| GET | `/tax-regimes/:tenantId` | `getTaxRegime` | 200 |
| POST | `/tax-rules` | `createTaxRule` | 201 |
| GET | `/tax-rules/:taxRuleId` | `getTaxRule` | 200 |
| POST | `/tax-rules/:taxRuleId/deactivate` | `deactivateTaxRule` | 200 |
| POST | `/tax-calculations` | `calculateTax` | 201 |
| POST | `/fiscal-documents` | `issueFiscalDocument` | 201 |
| GET | `/fiscal-documents/:fiscalDocumentId` | `getFiscalDocument` | 200 |
| GET | `/fiscal-documents/by-origin/:orderId` | `listFiscalDocumentsByOrigin` | 200 |
| POST | `/fiscal-documents/:fiscalDocumentId/cancel` | `cancelFiscalDocument` | 200 |
| POST | `/fiscal-obligations` | `registerFiscalObligation` | 201 |
| GET | `/fiscal-obligations/pending` | `listPendingFiscalObligations` | 200 |
| GET | `/fiscal-obligations/overdue` | `listOverdueFiscalObligations` | 200 |
| POST | `/fiscal-obligations/:fiscalObligationId/fulfill` | `markFiscalObligationFulfilled` | 200 |
| POST | `/fiscal-obligations/evaluate-overdue` | `evaluateFiscalObligations` | 200 |

`evaluateFiscalObligations` não é um dos oito Commands aprovados (`FiscalEvaluationResult`, sem
`command` no retorno) — mesmo tratamento de `evaluateReorderRule` em `routes/purchase.ts` (IMP-303):
público no Core, portanto exposto, per instrução explícita "criar somente endpoints correspondentes aos
métodos públicos do Manager". Único endpoint sem parâmetro de identificador — avalia toda `FiscalObligation`
pendente contra `asOfDate` (opcional, padrão: momento da chamada).

Consultas que retornam `T | undefined` (`getTaxRegime`/`getTaxRule`/`getFiscalDocument`) usam
`if (!result) throw new NotFoundError(...)`, sem `try/catch` — mesmo padrão de `getBillOfMaterials`/
`getProductionOrder` (IMP-503), porque o Core nunca lança nessas chamadas. Commands e transições que
podem lançar `FiscalDomainError` usam `try/catch` + `mapFiscalError`. `evaluateFiscalObligations` não usa
`try/catch` — internamente percorre apenas `findPending()` + `save()`, sem nenhum `getOrThrow`, portanto
sem caminho de exceção conhecido; mesmo critério de "nunca inventar tratamento de erro para cenário que
não pode acontecer".

---

## 8. Auditoria dos Bugs Históricos

### 8.1 PATCH-clobber (IMP-203)

**Nenhuma superfície.** Nenhum endpoint `PATCH` existe neste arquivo. Os oito Commands do Fiscal Hub são
ou criações completas via Factory com input totalmente tipado (`registerTaxRegime`/`createTaxRule`/
`calculateTax`/`issueFiscalDocument`/`registerFiscalObligation`), ou transições de propósito específico
que reconstroem a Entidade inteira dentro do próprio Service (`{ ...existing, status: 'X', ... }`),
nunca por merge parcial vindo do cliente (`deactivateTaxRule`/`cancelFiscalDocument`/
`markFiscalObligationFulfilled`). Verificado por `routes/fiscal.test.ts` ("nenhuma rota PATCH existe
neste Hub").

### 8.2 FK second-write (IMP-303)

O bug original exige duas condições simultâneas: (a) uma coleção filha regravada por completo
(`DELETE`+`INSERT`) a cada escrita, e (b) uma tabela de um Aggregate *diferente* com FOREIGN KEY
apontando para essa coleção filha.

`SqliteFiscalDocumentRepository.save()` (IMP-602) regrava `fiscal_document_lines` por completo a cada
chamada — inclusive quando `cancelFiscalDocument` reescreve um `FiscalDocument` já emitido (as `lines`
permanecem idênticas, mas passam pelo mesmo `DELETE`+`INSERT`) — **condição (a) está presente**. Mas
nenhuma tabela do schema (`0006_fiscal_hub.sql`) referencia `fiscal_document_lines.fiscal_document_line_id`
por FOREIGN KEY — é tabela-folha, apenas referenciada (por `fiscal_documents`/`tax_rules`), nunca
referenciadora — **condição (b) está ausente**. Confirmado empiricamente, não apenas por leitura de
código: `routes/fiscal.test.ts`, "cancelar um Fiscal Document regrava `fiscal_document_lines` por
completo, nunca falha por FOREIGN KEY" — emite, cancela, e verifica que a linha permanece intacta e a
resposta é 200, nunca 500.

### 8.3 Ledger immutability (IMP-403)

**Não se aplica.** `FiscalDocumentRepository`/`FiscalObligationRepository`/`TaxRuleRepository`/
`TaxRegimeRepository` (Core, congelados) expõem `save`, nunca apenas `append`; nenhuma TRIGGER de
imutabilidade existe na Persistência (IMP-602, migration sem `TRIGGER`). `FiscalDocument` e
`FiscalObligation` são, cada um, uma pequena máquina de estados (`Issued`/`Cancelled` e
`Pending`/`Fulfilled`/`Overdue`, respectivamente) — mesma categoria de `ProductionOrder` (IMP-503),
nunca um ledger append-only. A propriedade de segurança análoga e correta — ausência de escrita
*arbitrária*, não ausência de escrita — é garantida pela ausência total de `PUT`/`PATCH`: toda transição
passa por um Command `POST .../deactivate`/`.../cancel`/`.../fulfill` de propósito específico. Verificado
via HTTP direto e via documento OpenAPI (`routes/fiscal.test.ts`).

### 8.4 HTTP Status

Regra adotada por IMP-503 e reaplicada sem divergência: `201` reservado às cinco criações
(`registerTaxRegime`/`createTaxRule`/`calculateTax`/`issueFiscalDocument`/`registerFiscalObligation`);
`200` (padrão, sem `.status()` explícito) para as três transições e para `evaluateFiscalObligations`;
`400` (schema Fastify) para corpo malformado; `404` para identificador inexistente; `409` para conflito
de estado; `422` para dado de entrada inválido aceito pelo schema mas rejeitado pelo Core. Nenhuma
divergência encontrada.

---

## 9. OpenAPI

`plugins/openapi.ts` — uma tag nova: `{ name: "fiscal", description: "Fiscal Hub (ERP Foundation) —
conformidade tributária de mercadoria." }`, inserida após `"production"`, mesma ordem de introdução dos
cinco domínios ERP Foundation no restante do arquivo. Nenhum outro domínio alterado.

---

## 10. Server

`server.ts` — um import (`fiscalRoutes`) e um `await fastify.register(fiscalRoutes)`, inserido após
`productionRoutes`, preservando a ordem de registro já documentada no comentário do arquivo (nenhuma
relação de precedência entre domínios ERP, apenas ordem cronológica de Sprint). `plugins/managers.ts` já
expunha `fastify.managers.fiscal` desde IMP-602 — nenhuma alteração necessária ali.

`apps/api/package.json`/`tsconfig.json` — `@abp/fiscal-hub` adicionado como dependência de workspace e
referência de projeto TypeScript, mesma posição alfabética de todo outro Hub.

---

## 11. Testes

`apps/api/src/routes/fiscal.test.ts` — 30 testes novos, seis blocos `describe`:

- **Tax Regime** (4 testes): criação (201), schema (400), validação de domínio (422), duplicidade (409),
  consulta (200/404).
- **Tax Rule** (5 testes): criação (201) com verificação do valor de `rate` na resposta, schema (400),
  validação de domínio (422), consulta (200/404), desativação (200/404).
- **Tax Calculation** (3 testes): cálculo determinístico (201, 10% de 100 BRL = 10 BRL, verificado por
  valor exato), ausência de regra vigente (404), validação de domínio (422).
- **Fiscal Document** (6 testes): emissão (201) com Tax Calculation embutido, ausência de origem (422),
  linha inválida (422), consulta por id (200/404), consulta por origem (lista/vazio), cancelamento
  (200 → 409 na segunda tentativa → 404 para inexistente).
- **Fiscal Obligation** (6 testes): registro (201, status `Pending`), schema (400), validação de domínio
  (422), listagem de pendentes, cumprimento (200 → 409 → 404), avaliação de vencidas
  (`evaluate-overdue`: verifica que apenas a obrigação vencida aparece no resultado, que a lista
  `/overdue` reflete a transição, e que uma obrigação `Overdue` ainda pode ser cumprida).
- **Auditoria de classes de bug conhecidas** (3 testes): PATCH-clobber, Ledger immutability
  (PUT/DELETE), FK second-write (issue → cancel sem erro).
- **OpenAPI** (2 testes): todos os quinze paths expostos com a tag `"fiscal"`; nenhum path expõe
  PUT/PATCH/DELETE.

Todos os 30 testes passaram já na primeira execução (após a correção de tipo descrita na Seção 12.1) —
nenhuma correção de asserção foi necessária depois disso.

---

## 12. Validação

Três rodadas completas de `typecheck`/`build`/`lint`/`test`, workspace inteiro (`pnpm typecheck`/
`pnpm build`/`pnpm lint`/`npx vitest run`, 211 arquivos de teste, 1382 testes incluindo o 1 `it.fails`
esperado de `mapPurchaseError.test.ts`), todas as três rodadas limpas — nenhuma diferença entre elas.

| Rodada | typecheck | build | lint | test |
|---|---|---|---|---|
| 1 | ✅ | ✅ | ✅ | ✅ 211 arquivos / 1381 passed + 1 expected fail |
| 2 | ✅ | ✅ | ✅ | ✅ 211 arquivos / 1381 passed + 1 expected fail |
| 3 | ✅ | ✅ | ✅ | ✅ 211 arquivos / 1381 passed + 1 expected fail |

Diferente de IMP-601/IMP-602, o flake pré-existente e não relacionado de
`apps/web/src/pages/production/ProductionPage.test.tsx` (timeout intermitente de `waitFor` em jsdom) **não
se manifestou em nenhuma das três rodadas** desta Sprint — não é uma correção (nenhum arquivo de
`apps/web` foi tocado), apenas ausência de manifestação nesta execução; o flake permanece
estruturalmente presente e fora do escopo desta Sprint caso reapareça no futuro.

### 12.1 Correção de tipo durante a implementação

Primeira rodada de `typecheck` (`apps/api`) falhou: `IssueFiscalDocumentLineRequestDto.taxCalculation.calculatedAt`
é `string` (DTO, formato ISO) mas `IssueFiscalDocumentLineInput.taxCalculation.calculatedAt` (Core) é
`Date`. Corrigido no handler de `POST /fiscal-documents` (`routes/fiscal.ts`), convertendo cada linha
antes de chamar `fastify.managers.fiscal.issueFiscalDocument` — mesmo padrão já usado em toda rota que
recebe campo de data (`consumedAt`/`generatedAt` em `routes/production.ts`, `receivedAt` em
`routes/purchase.ts`). Não é uma divergência arquitetural, apenas o mesmo cuidado de conversão de
fronteira HTTP↔Core já exigido em todo Hub anterior — documentado aqui por transparência, nunca por
significância.

---

## 13. Divergências Encontradas

Nenhuma divergência arquitetural, dependência indevida, duplicação, dívida técnica ou violação foi
encontrada nesta Sprint. A única observação registrada é a correção de tipo da Seção 12.1, que não é uma
divergência de arquitetura — é o mesmo cuidado de fronteira já obrigatório em toda Sprint anterior.

Reconfirmado nesta Sprint (quarta vez consecutiva, após IMP-601/602 e a leitura obrigatória desta): `@abp/finance-hub`
nunca é importado por nenhum arquivo desta Sprint, nem por `apps/api` em geral fora do que já existia
antes desta Sprint — Fiscal Hub e Finance Hub permanecem domínios completamente desacoplados em toda a
pilha (Core → Persistence → HTTP).

---

## 14. Conclusão

IMP-603 fecha a camada HTTP do Fiscal Hub e, com isso, completa a exposição HTTP de toda a ERP
Foundation (Supplier/Purchase/Inventory Movement/Production/Fiscal — cinco domínios, todos agora com
Core, Persistence e HTTP API). Quinze endpoints, um por método público de `FiscalManager`, seguindo sem
desvio o padrão consolidado por IMP-203/303/403/503. Nenhum Hub anterior foi alterado. `FiscalManager` e
`createManagerRegistry` permaneceram intocados. Três rodadas de validação completa, todas limpas.

Não implementado nesta Sprint, per escopo explícito: Frontend e Workspace do Fiscal Hub — próximo passo
natural do roadmap (IMP-604/605), a ser iniciado apenas mediante briefing explícito do usuário.
