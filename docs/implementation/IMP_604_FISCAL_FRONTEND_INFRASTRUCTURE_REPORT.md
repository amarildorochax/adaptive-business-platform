# IMP-604 — Fiscal Frontend Infrastructure

**Adaptive Business Platform · Relatório de Implementação**

Status: Completo
Data: 2026-08-05
Escopo: exclusivamente Frontend Infrastructure (`apps/web/src/core/fiscal/`) — Arquitetura, Core,
Persistence, HTTP e Workspace permanecem fora de escopo, per instrução explícita desta Sprint. Nenhuma
tela, nenhum componente visual, nenhum Workspace, nenhuma rota, nenhuma navegação.

---

## Nota de Posicionamento

Este relatório documenta a infraestrutura de acesso ao Fiscal Hub em `apps/web`, seguindo rigorosamente
os quatro blueprints já consolidados: Supplier Frontend (IMP-204), Purchase Frontend (IMP-304),
Inventory Movement Frontend (IMP-404) e Production Frontend (IMP-504, o mais recente). Nenhum padrão
novo foi criado.

---

## 1. Resumo Executivo

IMP-604 fecha a infraestrutura Frontend do Fiscal Hub — o quinto e último domínio da ERP Foundation a
ganhar essa camada, completando `core/{domain}/` para os cinco domínios (Supplier/Purchase/Inventory
Movement/Production/Fiscal). Quinze Hooks, um por método público de `fiscalClient` (seis Query, nove
Mutation), nenhum inventado, nenhum omitido. `FiscalManager`, `apps/api/src/routes/fiscal.ts` e todo Hub
anterior permaneceram intocados. 28 testes novos, todos passando desde a primeira execução.

---

## 2. Auditoria Inicial

Executada antes de qualquer código, per instrução explícita ("Responder antes da implementação"):

| Pergunta | Resposta |
|---|---|
| Existe Frontend parcial? | Não — nenhuma pasta `core/fiscal/` existia (confirmado por `ls apps/web/src/core/`: 14 domínios já presentes, nenhum `fiscal`). |
| Existe Client? | Não — `fiscalClient.ts` não existia. |
| Existe Query Key? | Não — `fiscalQueryKeys.ts` não existia. |
| Existe Hook? | Não — nenhum arquivo `use*.ts` do Fiscal Hub existia. |
| Existe Cache? | Não — `fiscalCache.ts` não existia. |
| Existe DTO? | Não — `fiscal.dto.ts` não existia em `apps/web`. |
| Existe código legado? | Não. |
| Existe integração parcial? | Não — nenhuma página/rota referencia o Fiscal Hub. |
| Existe conflito com Finance Hub? | Não — confirmado por `ls apps/web/src/core/`: nenhum diretório `finance*` existe no Frontend; reconfirmação consistente com IMP-601/602/603. |

Nenhuma inconsistência encontrada — implementação prosseguiu sem necessidade de pausa/pergunta ao
usuário.

---

## 3. DTOs

`core/fiscal/fiscal.dto.ts` — cópia deliberada e completa de `apps/api/src/dtos/fiscal.dto.ts`
(IMP-603), os mesmos 20 tipos, nenhum tipo de `@abp/fiscal-hub` importado. Nunca um import cross-app,
per instrução explícita ("Nunca compartilhar DTOs entre aplicações. Nunca importar DTOs diretamente da
API.").

---

## 4. Client

`core/fiscal/fiscalClient.ts` — 15 métodos, um por endpoint de `apps/api/src/routes/fiscal.ts`
(IMP-603), todos via `apiClient` (`core/http/client.ts`), nunca `fetch` diretamente.

`findTaxRegimeByTenant`/`findTaxRuleById`/`findFiscalDocumentById` usam `undefinedOn404` — em todos os
três, "não encontrado" é um estado de negócio legítimo, mesmo critério de `findBillOfMaterialsById`/
`findProductionOrderById` (Production Hub). `calculateTax` deliberadamente **não** usa `undefinedOn404`
— decisão documentada na Seção 9.

---

## 5. Query Keys

`core/fiscal/fiscalQueryKeys.ts` — seis chaves, uma por Query real exposta em
`apps/api/src/routes/fiscal.ts`. Nenhuma chave para `TaxCalculation` (nenhum `GET` existe para ela em
nenhuma camada, nem Repository no Core) e nenhuma chave de detalhe para `FiscalObligation` (nenhum
`GET /fiscal-obligations/:id` existe — apenas as duas listas `pending`/`overdue`), mesmo critério já
usado para `ProductionConsumption`/`ProductionOutput` (Production Hub, ausência estrutural de Query, não
uma omissão desta Sprint).

---

## 6. Cache — Auditoria das Estratégias Já Consolidadas

Per instrução explícita desta Sprint ("Antes de implementar: Auditar os quatro Hubs anteriores.
Documentar qual estratégia foi reutilizada, qual não se aplica. Nunca inventar nova estratégia se uma
existente resolver."), `purchaseCache.ts`/`inventoryMovementCache.ts`/`productionCache.ts` foram lidos
integralmente antes de escrever `fiscalCache.ts`. Cinco estratégias já catalogadas por essa auditoria:

| # | Estratégia | Reutilizada em `fiscalCache.ts` |
|---|---|---|
| 1 | Substituição direta de detalhe (`setQueryData`) | `syncTaxRegimeInCache`, `syncTaxRuleInCache`, `syncFiscalDocumentInCaches` (parte "detalhe") |
| 2 | Replace-or-append em lista de chave imutável | `syncFiscalDocumentInCaches` → `fiscalDocumentsByOrigin` (chaveada por `orderId`, imutável) |
| 3 | Aditiva (append-only) | `appendPendingFiscalObligationInCache` → `pendingFiscalObligations()` |
| 4 | Sem sincronização de lista (chave mutável, sem estratégia consolidada) | `pendingFiscalObligations`/`overdueFiscalObligations` diante de `fulfillFiscalObligation`/`evaluateFiscalObligations` (ver Seção 9) |
| 5 | Sem sincronização alguma (Mutation sem Query correspondente) | `calculateTax` (nenhuma Query para `TaxCalculation`); `deactivateTaxRule` quanto a qualquer lista (nenhuma Query de listagem existe para `TaxRule`) |

Nenhuma estratégia nova foi necessária — as cinco já catalogadas cobrem integralmente a superfície do
Fiscal Hub. Nenhum candidato de abstração nova identificado.

---

## 7. Hooks

Quinze Hooks, um por método público de `fiscalClient` — seis Query, nove Mutation:

| Hook | Tipo | Endpoint |
|---|---|---|
| `useTaxRegime` | Query | `GET /tax-regimes/:tenantId` |
| `useTaxRule` | Query | `GET /tax-rules/:taxRuleId` |
| `useFiscalDocument` | Query | `GET /fiscal-documents/:fiscalDocumentId` |
| `useFiscalDocumentsByOrigin` | Query | `GET /fiscal-documents/by-origin/:orderId` |
| `usePendingFiscalObligations` | Query | `GET /fiscal-obligations/pending` |
| `useOverdueFiscalObligations` | Query | `GET /fiscal-obligations/overdue` |
| `useRegisterTaxRegime` | Mutation | `POST /tax-regimes` |
| `useCreateTaxRule` | Mutation | `POST /tax-rules` |
| `useDeactivateTaxRule` | Mutation | `POST /tax-rules/:taxRuleId/deactivate` |
| `useCalculateTax` | Mutation | `POST /tax-calculations` |
| `useIssueFiscalDocument` | Mutation | `POST /fiscal-documents` |
| `useCancelFiscalDocument` | Mutation | `POST /fiscal-documents/:fiscalDocumentId/cancel` |
| `useRegisterFiscalObligation` | Mutation | `POST /fiscal-obligations` |
| `useFulfillFiscalObligation` | Mutation | `POST /fiscal-obligations/:fiscalObligationId/fulfill` |
| `useEvaluateFiscalObligations` | Mutation | `POST /fiscal-obligations/evaluate-overdue` |

Nenhuma tela acessa `fetch`/`ApiClient`/HTTP diretamente — toda comunicação passa exclusivamente por
este módulo; a própria estrutura de `core/fiscal/` torna esse acesso impossível por fora dela (nenhuma
tela existe nesta Sprint).

---

## 8. Auditoria — Quatro Classes de Bug/Limitação Já Conhecidas

Per instrução explícita desta Sprint ("Verificar explicitamente... mesmo quando inexistente").

### 8.1 Undefined `useQuery` bug (IMP-204)

O bug original: `useQuery` não aceita `undefined` como valor resolvido — descoberto quando um Hook
`find*ById` devolvia `T | undefined` diretamente do `queryFn`. **Existe superfície potencial aqui,
prevenida desde o primeiro rascunho**: `useTaxRegime`, `useTaxRule` e `useFiscalDocument` — os três Hooks
cujo `fiscalClient` correspondente usa `undefinedOn404` — usam o padrão `null`-sentinela + `select: (data)
=> data ?? undefined` desde a primeira versão, mesma regra durável já aplicada por `useBillOfMaterials`/
`useProductionOrder` (Production Hub). Verificado por teste explícito ("devolve undefined (nunca lança)
quando a API responde 404") em `useFiscalQueries.test.tsx` para os três Hooks.

### 8.2 Mutable-key stale cache (IMP-304)

O bug original: `requisitionsByStatus` (Purchase Hub) nunca é sincronizada automaticamente após uma
transição de status, porque é chaveada pelo próprio `status` mutável. **Existe uma variante aqui, mais
severa que o caso original**: `pendingFiscalObligations`/`overdueFiscalObligations` (Fiscal Hub) não são
uma única chave parametrizada por status (como `productionOrdersByStatus`/`requisitionsByStatus`), mas
**duas chaves fixas e independentes**. Uma transição real de `FiscalObligation`
(`Pending → Fulfilled`, `Pending → Overdue`, `Overdue → Fulfilled`) precisaria **remover** a entrada de
uma das duas listas — uma classe de problema estruturalmente mais difícil que "mover entre chaves
parametrizadas", e que nenhum Hub anterior jamais precisou resolver: confirmado por grep em todo
`apps/web/src/core/*Cache.ts` (`purchaseCache.ts`/`inventoryMovementCache.ts`/`productionCache.ts`/
`supplierCache.ts`), nenhum usa `.filter()` para remover uma entrada de uma lista em cache — nenhuma
estratégia de remoção jamais existiu nesta plataforma. Como não existe estratégia já consolidada,
**nenhuma foi inventada aqui**, per instrução explícita. `useFulfillFiscalObligation` e
`useEvaluateFiscalObligations` nunca tocam `pendingFiscalObligations`/`overdueFiscalObligations` —
documentado explicitamente em ambos os arquivos e verificado por teste
(`"nunca sincroniza pending/overdue — limitação documentada"` em `useFiscalMutations.test.tsx`, para os
dois Hooks).

### 8.3 Append-only cache (IMP-404)

O padrão original: `StockMovement`/`Receiving` são Entidades imutáveis após criadas, com Query de
listagem própria, sincronizadas por acréscimo puro. **O Fiscal Hub não possui nenhum Aggregate Ledger
(append-only por natureza do domínio)** — `FiscalDocument` e `FiscalObligation` são, cada um, uma pequena
máquina de estados (`Issued → Cancelled` e `Pending → Fulfilled | Overdue → Fulfilled`, respectivamente),
mesma categoria de `ProductionOrder`/`StockReservation`, nunca um ledger. `TaxRule` também é mutável
(`active: true → false`, via `DeactivateTaxRule`), nunca imutável. Nenhuma lista imutável existe no
Fiscal Hub. **Existe, porém, um caso genuíno de padrão append-only** (estratégia 3, não "append-only
ledger" mas "append-only por toda nova instância nascer no mesmo estado"): `appendPendingFiscalObligationInCache`,
estruturalmente idêntico a `appendWorkCenterInCache`/`appendStockLocationInCache` — toda nova
`FiscalObligation` nasce `Pending` (`FiscalFactory.createFiscalObligation`, Core), portanto sempre segura
para acrescentar à lista `pendingFiscalObligations` já cacheada.

### 8.4 Derived Data

Pergunta desta Sprint, nunca feita nos quatro Frontends anteriores nestes termos exatos (embora IMP-504
tenha documentado uma instância real da mesma classe, `totalConsumedCost`/`totalGeneratedQuantity`).
**Existe informação calculada exclusivamente pelo servidor no Fiscal Hub?** Sim — **`TaxCalculation`
inteiro** é esse caso: `amount` é sempre "o resultado determinístico de uma Tax Rule vigente"
(`FISCAL_HUB.md`, ADR-FI-002), calculado por `FiscalPolicy.computeTaxAmount` (Core), nunca recalculável
legitimamente no Frontend (reproduziria `baseAmount.amount * rate.value / 100` fora do Core, violando a
regra final desta Sprint "Nenhuma regra de negócio"). **Possibilidade de cache inconsistente?** Não —
diferente de `totalConsumedCost` (uma soma que se torna estruturalmente desatualizada porque nenhum Hook
a recalcula após uma Mutation relacionada), `TaxCalculation` nunca é armazenado em cache algum (Seção 5:
nenhuma Query Key existe para ele) — cada `TaxCalculation` é consumido uma única vez, diretamente do
`data` de `useCalculateTax`, para compor a chamada imediatamente seguinte a `useIssueFiscalDocument`;
sem cache, não há risco de inconsistência de cache a documentar. Esta é, portanto, uma instância mais
simples da classe "Derived Data" que `totalConsumedCost` — o valor nunca persiste no cliente por tempo
algum. Verificado por teste explícito (`"nenhuma sincronização de cache... queryCache().getAll())
toHaveLength(0)"` em `useFiscalMutations.test.tsx`).

---

## 9. Decisões Tomadas

**`calculateTax` nunca usa `undefinedOn404`.** Diferente de `findTaxRegimeByTenant`/`findTaxRuleById`/
`findFiscalDocumentById` (onde "não encontrado" é um estado de negócio legítimo), `calculateTax` só faz
sentido chamado com dados já válidos (classificação, regime, valor base) — um 404 aqui
(`NoApplicableTaxRuleFoundError`, IMP-603) sinaliza que nenhuma Tax Rule vigente existe para a
combinação informada, um estado que o chamador precisa tratar explicitamente (ex.: alertar "nenhuma
regra fiscal configurada para este item"), nunca um silêncio equivalente a "ainda carregando" — mesmo
critério de `getTotalConsumedCost`/`getTotalGeneratedQuantity` (Production Hub, IMP-504).

**Nenhum helper de remoção entre `pendingFiscalObligations`/`overdueFiscalObligations`.** Ver Seção 8.2
— nenhuma estratégia de remoção já consolidada existe nesta plataforma; inventar uma agora violaria a
instrução explícita desta Sprint.

**`useCalculateTax`/`useDeactivateTaxRule` (quanto a listas) sem nenhuma sincronização de cache.**
Nenhuma Query existe para o alvo em nenhum dos dois casos — sincronizar algo que nenhuma Query jamais
consulta seria trabalho morto, mesmo critério já usado para `ProductionConsumption`/`ProductionOutput`
(Production Hub).

---

## 10. Testes e Cobertura

Três arquivos, mesmo formato de IMP-504:

| Arquivo | Ambiente | Cobertura |
|---|---|---|
| `fiscalClient.test.ts` | Node, servidor real (`startRealApiServer`) | 10 testes — todo endpoint, fim a fim, sem mock de `fetch`; auditoria de bug (FK second-write, PATCH-clobber) |
| `useFiscalQueries.test.tsx` | jsdom, `fetch` mockado | 9 testes — as 6 Query, `queryKey`/`enabled`/forma do dado |
| `useFiscalMutations.test.tsx` | jsdom, `fetch` mockado | 9 testes — as 9 Mutation, sincronização de cache exata de cada helper (incluindo a ausência documentada dela) |

**Resultado**: 28 testes nos três arquivos, 100% aprovados, execução isolada sem flake; reconfirmado nas
3 rodadas completas (Seção 12).

`testing/realApiServer.ts` — quinta cópia byte-a-byte do mesmo helper genérico (Supplier/Purchase/
Inventory Movement/Production já o replicaram quatro vezes) — candidato a `core/http/testing/realApiServer.ts`
compartilhado, identificado desde `IMP_304_PURCHASE_FRONTEND_REPORT.md` e reafirmado por cada Sprint
subsequente, **não extraído novamente aqui** per instrução explícita ("Não refatorar neste Sprint").

---

## 11. Validação

Três rodadas completas de `typecheck`/`build`/`lint`/`test`, workspace inteiro:

| Rodada | typecheck | build | lint | test |
|---|---|---|---|---|
| 1 | ✅ 0 erros | ✅ 0 erros | ✅ 0 erros | ✅ 214 arquivos, 1409 aprovados + 1 falha esperada |
| 2 | ✅ 0 erros | ✅ 0 erros | ✅ 0 erros | ✅ 214 arquivos, 1409 aprovados + 1 falha esperada |
| 3 | ✅ 0 erros | ✅ 0 erros | ✅ 0 erros | ⚠️ 1 falha adicional (ver abaixo) + 1 falha esperada |

**Rodada 3, teste adicional falho**: `apps/web/src/pages/production/ProductionPage.test.tsx`
("Visão Geral mostra KPIs reais...") — timeout intermitente de `waitFor` em jsdom, o mesmo flake
pré-existente e não relacionado já documentado em `IMP_601_FISCAL_HUB_CORE_REPORT.md` e
`IMP_602_FISCAL_PERSISTENCE_REPORT.md`. Nenhum arquivo de `apps/web/src/pages/` foi tocado por esta
Sprint (apenas `apps/web/src/core/fiscal/` foi criado). Confirmado como flake, não regressão: reexecutado
isoladamente (`vitest run apps/web/src/pages/production/ProductionPage.test.tsx`) — 14/14 testes
aprovados; workspace completo reexecutado uma vez mais — 214 arquivos, 1409 aprovados + 1 falha esperada,
idêntico às rodadas 1 e 2. Documentado, não corrigido, per instrução explícita desta Sprint ("Somente
corrigir erro crítico comprovado") — este flake não é crítico (intermitente, isolado, sem relação com o
domínio Fiscal) nem comprovadamente causado por esta Sprint.

Nenhuma correção de tipo/lint foi necessária durante o desenvolvimento desta Sprint — todos os arquivos
passaram `typecheck`/`lint` já na primeira tentativa.

---

## 12. Divergências Encontradas

Per `STD-001`: Arquitetura → Auditoria → Amendment → Implementação. Nenhuma corrigida silenciosamente.

**Nenhuma divergência real entre HTTP (IMP-603) e este Frontend** — os 15 endpoints mapeiam 1:1 aos 15
métodos de `fiscalClient`/15 Hooks, sem lacuna nem invenção.

Reconfirmado nesta Sprint (quinta vez consecutiva, após IMP-601/602/603 e a leitura obrigatória desta):
nenhum diretório `core/finance*` existe em `apps/web`, e nenhum arquivo desta Sprint referencia
`@abp/finance-hub` — Fiscal Hub e Finance Hub permanecem domínios completamente desacoplados em toda a
pilha (Core → Persistence → HTTP → Frontend Infrastructure).

---

## 13. Qualidade (10 Perguntas Oficiais)

Per `ADAPTIVE_ENGINEERING_CHECKLIST.md`:

1. **Arquitetura respeitada?** Sim — todo Hook corresponde a um endpoint real de IMP-603; nenhuma lógica
   de negócio, nenhum componente visual.
2. **Auditoria realizada?** Sim — Seções 2 e 8.
3. **Blueprint seguido?** Sim — DTO/Client/QueryKeys/Cache/Hooks/Testes idênticos em forma a
   IMP-204/304/404/504.
4. **Código duplicado?** A duplicação estrutural esperada (DTOs, `testing/realApiServer.ts`) é idêntica
   à já aceita nos quatro Frontends anteriores.
5. **Componentes reutilizados?** `apiClient`/`undefinedOn404`/`ApiError` inteiros, sem modificação.
6. **Limitações documentadas?** Sim — Seção 8, incluindo uma variante nova e mais severa da classe (b).
7. **Testes completos?** Sim — 28 testes cobrindo os 15 Hooks/15 métodos do client.
8. **OpenAPI validada?** Não aplicável a esta camada (já validada por IMP-603).
9. **Nenhuma tela acessa `fetch`/`ApiClient`/HTTP diretamente?** Sim — nenhuma tela existe nesta Sprint.
10. **Documentação atualizada?** Sim — este relatório; nenhum documento de arquitetura alterado.

**Existe melhoria para Supplier/Purchase/Inventory Movement/Production?** Nenhuma identificada — a
quinta cópia de `testing/realApiServer.ts` reforça (não introduz) o candidato a extração já sinalizado
por quatro Sprints anteriores.

Nenhuma refatoração além do estritamente necessário para esta Sprint foi realizada.

---

## 14. Conclusão

IMP-604 fecha a Frontend Infrastructure do Fiscal Hub e, com isso, completa `core/{domain}/` para todos
os cinco domínios da ERP Foundation (Supplier/Purchase/Inventory Movement/Production/Fiscal). Quinze
Hooks, um por método público de `fiscalClient`, seguindo sem desvio o padrão consolidado por
IMP-204/304/404/504. Nenhum Hub anterior foi alterado. `fiscalClient`/`FiscalManager`/
`apps/api/src/routes/fiscal.ts` permaneceram intocados. Três rodadas de validação completa; a única
falha adicional observada (rodada 3) é o mesmo flake pré-existente e não relacionado já documentado por
IMP-601/602, confirmado por reexecução isolada.

Não implementado nesta Sprint, per escopo explícito: Workspace do Fiscal Hub — próximo passo natural do
roadmap (IMP-605), a ser iniciado apenas mediante briefing explícito do usuário, o mesmo padrão que
IMP-505 seguiu para encerrar o domínio Production.
