# BUG-001 — Purchase Hub `registerReceiving` HTTP 500

**Adaptive Business Platform · Relatório de Correção de Defeito**

Status: Corrigido · Categoria: Implementation Documentation · Data: 2026-08-06

---

## Nota de Posicionamento Documental

Esta Sprint tem como único objetivo corrigir o bug confirmado pela auditoria `ERP_001_ERP_FOUNDATION_FINAL_REVIEW.md`. Nenhuma funcionalidade nova foi implementada, nenhuma refatoração foi realizada, nenhum contrato público ou arquitetura foi alterado. A correção tocou exatamente um método privado de uma classe (`SqlitePurchaseOrderRepository.replaceItems`, `packages/persistence`) e dois arquivos de teste (um flip de `it.fails` para `it`, um teste novo de regressão na camada de Persistência). Nenhum outro Hub, nenhuma outra rota, nenhum Frontend foi tocado.

---

## 1. Resumo Executivo

O segundo `registerReceiving` contra o mesmo Purchase Order retornava HTTP 500 desde que o bug foi encontrado e isolado por IMP-303 (2026-08-01), com raiz em IMP-302. O defeito estava na camada de **Persistência** — `SqlitePurchaseOrderRepository.replaceItems`, chamado por `update()`, regravava `purchase_order_items` por completo (`DELETE` + `INSERT`) a cada chamada; a partir da segunda Receiving contra o mesmo Purchase Order, esse `DELETE` violava a `FOREIGN KEY` que `receiving_lines.purchase_order_item_id` já mantinha sobre a linha existente, propagando um erro de constraint bruto do SQLite (nunca um `PurchaseDomainError`) até a resposta HTTP, onde caía em 500 por não ser reconhecido por nenhum mapper de erro.

A correção substitui o padrão `DELETE`-completo-e-reinserção por um `diff` seletivo — `UPDATE` para item já existente, `INSERT` apenas para item genuinamente novo, `DELETE` apenas para item genuinamente removido — exatamente a Amendment já proposta por `IMP_303_PURCHASE_HTTP_API_REPORT.md`, Capítulo 8, e nunca executada até agora. `PurchaseOrderRepository` (Repository Interface, Core) não mudou; nenhum outro Hub foi tocado.

O teste que documentava o bug (`it.fails`, `apps/api/src/routes/purchase.test.ts`) agora passa como asserção normal. Um segundo teste de regressão, na própria camada de Persistência (onde o defeito de fato vivia), foi adicionado a `packages/persistence/src/repositories/purchase/SqliteRepositories.test.ts`. `pnpm typecheck`/`pnpm build`/`pnpm lint`/`pnpm test` foram executados três rodadas completas cada — todas limpas, exceto a mesma falha intermitente pré-existente e não relacionada (`apps/web/src/pages/fiscal/FiscalPage.test.tsx`, já documentada por `IMP_605`/`ERP_001_ERP_FOUNDATION_FINAL_REVIEW.md` como flake de contenção de CPU sob paralelismo pesado), reproduzida de forma idêntica nas três rodadas, nunca no Purchase Hub.

---

## 2. Reprodução

**Antes da correção**, com `it.fails` ainda presente, `npx vitest run apps/api/src/routes/purchase.test.ts --reporter=verbose` reportava:

```
Test Files  1 passed (1)
     Tests  21 passed | 1 expected fail (22)
```

O `1 expected fail` é o próprio `it.fails` — a Vitest API que marca esse teste como "passando" precisamente porque a asserção do comportamento correto (`second.statusCode` = 201, `fullyReceived: true`) falha hoje.

**Confirmação isolada da causa, fora do teste HTTP**, via um script standalone reproduzindo apenas a transação SQLite relevante (`purchase_order_items` referenciada por `receiving_lines`, seguida de um `DELETE` sobre a linha já referenciada):

```
ERROR CAUGHT: FOREIGN KEY constraint failed
ERROR CODE: ERR_SQLITE_ERROR
ERROR CONSTRUCTOR: Error
```

Confirma exatamente o diagnóstico já registrado por IMP-303: um `Error` puro do `node:sqlite`, nunca uma subclasse de `PurchaseDomainError` — por isso nem `mapPurchaseError.ts` (que mapeia por `instanceof`/`code`) nem a heurística de texto de `mapDomainError.ts` o reconhecem, e ele cai no `500` genérico de fallback do Fastify.

---

## 3. Causa Raiz

**Camada:** Persistence (`packages/persistence/src/repositories/purchase/SqlitePurchaseOrderRepository.ts`, método privado `replaceItems`).

**Mecanismo exato:**

1. `ReceivingService.register` (Core, `packages/purchase-hub/src/ReceivingService.ts`) sempre chama `purchaseOrderRepository.update(...)` **antes** de `receivingRepository.create(...)` — a ordem já documentada em IMP-302/303, nunca alterada por esta correção.
2. `SqlitePurchaseOrderRepository.update` chama `replaceItems(purchaseOrderId, items)`, que fazia `DELETE FROM purchase_order_items WHERE purchase_order_id = ?` seguido de reinserção completa de cada item.
3. Na primeira `registerReceiving`, nenhuma `receiving_lines` referencia ainda nenhum `purchase_order_item_id` — o `DELETE` é trivial, a transação completa sem erro, e só então a primeira `Receiving` é criada, com sua `receiving_lines.purchase_order_item_id` passando a referenciar por `FOREIGN KEY` (`0003_purchase_hub.sql`) a linha de `purchase_order_items` que acabou de ser reinserida.
4. Na **segunda** `registerReceiving` contra o mesmo Purchase Order, `replaceItems` executa o mesmo `DELETE` completo — mas agora a `receiving_lines` da primeira Receiving já referencia por `FOREIGN KEY` a linha que o `DELETE` está tentando remover. O SQLite (com `PRAGMA foreign_keys = ON`, ativo desde `client.ts`) verifica a constraint por instrução, não de forma adiada, e rejeita o `DELETE` imediatamente — revertendo toda a transação (`BEGIN`/`ROLLBACK` explícitos em `update()`) e propagando `FOREIGN KEY constraint failed`, um `Error` puro.
5. Esse `Error` sobe sem tradução até o handler HTTP de `POST /receivings`, que não o reconhece nem por `mapPurchaseError` (mapeia apenas `PurchaseDomainError`) nem pela heurística de `mapDomainError` (nunca viu essa mensagem), caindo no `500` de fallback do próprio Fastify.

**Por que não em Core, HTTP ou Mapper:** `ReceivingService`/`PurchaseValidator` (Core) nunca foram alterados nem precisaram ser — a ordem de chamadas e as validações de negócio (`ensureReceivingWithinPending`, transição de status) já estavam corretas; o defeito nunca é de regra de negócio. `routes/purchase.ts`/`mapPurchaseError.ts` (HTTP) também não precisaram de alteração — o problema não é a tradução de erro em si (`mapPurchaseError` já delega corretamente ao fallback genérico para qualquer erro fora de `PurchaseDomainError`), é que a Persistência nunca deveria ter produzido esse erro de constraint em primeiro lugar, para uma operação de negócio inteiramente válida (um segundo recebimento parcial legítimo).

**Classificação:** Persistence / Repository — especificamente, o padrão "regravar tabela filha por completo" aplicado a uma tabela que passou a ser referenciada por `FOREIGN KEY` de uma terceira tabela, exatamente a lição já registrada (mas nunca corrigida) em `ADAPTIVE_DEVELOPMENT_STANDARD.md`, Capítulo 6.

---

## 4. Correção

Único arquivo de produção alterado: `packages/persistence/src/repositories/purchase/SqlitePurchaseOrderRepository.ts`.

`replaceItems` deixou de fazer `DELETE`-completo-e-reinserção e passou a fazer um `diff` seletivo:

1. Lê os `purchase_order_item_id` já persistidos para o Purchase Order.
2. Calcula quais desses ids **não** estão mais na lista recebida (`staleIds`) — apenas esses são removidos via `DELETE ... WHERE purchase_order_item_id = ?`, um a um. No fluxo real de `registerReceiving`, `staleIds` é sempre vazio (a lista de itens nunca perde membros durante um recebimento), então nenhuma linha referenciada por `receiving_lines` é jamais excluída.
3. Para cada item da lista recebida: se o id já existia, executa `UPDATE` (campos mutáveis: `product_id`, `quantity_ordered`, `quantity_received`, `acquisition_cost_amount`, `acquisition_cost_currency_code`, `status`); se é genuinamente novo, executa `INSERT`, exatamente como antes.

Nenhuma mudança de assinatura pública — `PurchaseOrderRepository` (Repository Interface, Core, `@abp/purchase-hub`) permanece idêntica; `create`/`update`/`findById`/`findBySupplier`/`findByStatus`/`findOpen` continuam com a mesma assinatura e o mesmo comportamento observável (o Aggregate completo, com todos os seus itens, é sempre o que `findById` devolve depois). Nenhum outro Repository, nenhuma migração SQL, nenhum Manager, nenhuma rota HTTP, nenhum Hook de Frontend foi alterado.

---

## 5. Testes

**Antes da correção**, executado e confirmado (Capítulo 2): `it.fails` passava por conta da falha esperada, comprovando o bug ativo.

**Depois da correção:**

- `apps/api/src/routes/purchase.test.ts` — o teste antes marcado `it.fails` foi reescrito para `it` normal (renomeado para deixar explícito que agora é uma asserção de regressão de BUG-001), exercitando exatamente o mesmo cenário via `fastify.inject()` real (criar Purchase Order → item → aprovar → enviar → dois `registerReceiving` sequenciais, 4 + 6 unidades). Resultado: `201`, `fullyReceived: true`, `status: "Received"`.
- `packages/persistence/src/repositories/purchase/SqliteRepositories.test.ts` — novo teste, direto na camada onde o defeito de fato vivia: cria um Purchase Order com um item, chama `update` (simulando a primeira Receiving), cria uma `Receiving` real via `SqliteReceivingRepository` (para que a `FOREIGN KEY` em `receiving_lines` passe a existir), e então chama `update` novamente sobre o mesmo item — confirmando que a chamada não lança, que o item foi atualizado (não duplicado, não recriado com novo id) e que a `receiving_lines` da primeira Receiving permanece íntegra e sem duplicação.

Nenhum teste pré-existente precisou de mock novo, alteração de asserção não relacionada, ou remoção. Ambos os testes rodam sobre SQLite real (`:memory:`), nunca mockado — mesma disciplina de toda a série ERP.

**Resultado consolidado (verbose, arquivo isolado, pós-correção):**

```
apps/api/src/routes/purchase.test.ts + packages/persistence/.../SqliteRepositories.test.ts
Test Files  2 passed (2)
     Tests  40 passed (40)
```

Nenhum `expected fail` remanescente.

---

## 6. Validação

`pnpm typecheck`, `pnpm build`, `pnpm lint` e `pnpm test` executados três rodadas completas cada, na raiz do monorepo (`platform/`), após a correção:

| Comando | Rodada 1 | Rodada 2 | Rodada 3 |
|---|---|---|---|
| `pnpm typecheck` | ✅ limpo | ✅ limpo | ✅ limpo |
| `pnpm lint` | ✅ limpo | ✅ limpo | ✅ limpo |
| `pnpm build` | ✅ limpo | ✅ limpo | ✅ limpo |
| `pnpm test` | ⚠ 1424 passaram / 2 falharam | ⚠ 1424 passaram / 2 falharam | ⚠ 1424 passaram / 2 falharam |

As duas falhas, **idênticas nas três rodadas**, são em `apps/web/src/pages/fiscal/FiscalPage.test.tsx` (interação `"Documento a consultar"`) — a mesma falha intermitente sob carga plena de paralelismo já documentada em `IMP_605_FISCAL_WORKSPACE_REPORT.md` e reconfirmada por `ERP_001_ERP_FOUNDATION_FINAL_REVIEW.md`, Capítulo 1. Não relacionada a este bug, a este Hub, ou a este arquivo — nenhum teste do Purchase Hub, de Persistência, ou de qualquer camada tocada por esta correção apareceu em nenhuma das seis listas de falha (2 por rodada × 3 rodadas). Confirmado, adicionalmente, isolado: `apps/api/src/routes/purchase.test.ts` + `SqliteRepositories.test.ts` juntos, fora da carga plena da suíte, `40/40` aprovados sem exceção.

Contagem de testes antes vs. depois: 1425 (1422 passaram + 1 expected fail + 2 falhas pré-existentes) → 1426 (1424 passaram + 0 expected fail + 2 falhas pré-existentes, mesmas de sempre) — o `+2` reflete o `it.fails` convertido em passagem real (+1) mais o novo teste de regressão em Persistência (+1); o `expected fail` que existia permanentemente desde IMP-303 não existe mais.

---

## 7. Conclusão

O bug HTTP 500 do segundo `registerReceiving` — conhecido, isolado e documentado desde IMP-303 (2026-08-01), citado como a única dívida técnica de Prioridade Alta ainda em aberto por `ERP_001_ERP_FOUNDATION_FINAL_REVIEW.md` — está corrigido. A correção seguiu exatamente a Amendment já formalmente proposta em `IMP_303_PURCHASE_HTTP_API_REPORT.md`, Capítulo 8, sem desviar dela: um `diff` seletivo em vez de `DELETE`-completo-e-reinserção, tocando apenas a Persistência, sem alterar nenhum contrato público, nenhuma outra camada, nenhum outro Hub. O teste que provava o bug (`it.fails`) agora é uma asserção de regressão permanente; um segundo teste, direto na camada onde o defeito vivia, cobre o mesmo cenário de forma ainda mais isolada. Três rodadas completas de `typecheck`/`build`/`lint`/`test` confirmam zero regressão introduzida — a única falha observada em qualquer rodada é a mesma flake pré-existente e já documentada, alheia a este Hub e a esta correção.

Esta correção resolve o item de Prioridade Alta #1 de `ERP_001_ERP_FOUNDATION_FINAL_REVIEW.md`, Capítulo 8 ("Dívida Técnica"). Os demais itens dessa lista — estado de commit do Fiscal Hub, inconsistências numéricas entre `ERP_CONTEXT_MAP.md`/`DOMAIN_EVENT_CATALOG.md` e `ADR_INDEX.md` — permanecem fora do escopo desta Sprint, que corrigiu exclusivamente o defeito nomeado por seu título.
