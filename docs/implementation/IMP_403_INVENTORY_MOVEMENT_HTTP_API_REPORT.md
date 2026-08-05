# IMP-403 — Inventory Movement HTTP API

**Adaptive Business Platform · Relatório de Implementação**

Status: Concluído · 2026-08-01

---

## Nota de Posicionamento

Terceira etapa do Inventory Movement Hub, sob STD-001, seguindo integralmente os blueprints de
IMP-203 (Supplier HTTP API) e IMP-303 (Purchase HTTP API). Esta Sprint implementa exclusivamente a
camada HTTP — nenhuma linha de Arquitetura, Core, Persistência, Repository Interfaces, Services,
Policies, Validators, Factories ou `InventoryMovementManager` foi alterada. Toda lógica permanece no
Core; HTTP é exclusivamente transporte.

---

## Sumário

1. Auditoria Realizada (Passo 1)
2. Endpoints Implementados
3. OpenAPI
4. DTOs
5. Validações
6. Domain Errors
7. Integração com InventoryMovementManager
8. Integração SQLite
9. Testes
10. Garantia de Append-Only
11. Divergências Encontradas
12. Limitações
13. Qualidade
14. Validação
15. Preparação para IMP-404

---

## 1. Auditoria Realizada (Passo 1)

Leitura integral de `ERP_ARCHITECTURE.md`, `INVENTORY_MOVEMENT_HUB.md`, `ERP_CONTEXT_MAP.md`,
`DOMAIN_EVENT_CATALOG.md`, `ERP_FOUNDATION_REPORT.md`, `IMP_401_INVENTORY_MOVEMENT_HUB_CORE_REPORT.md`,
`IMP_402_INVENTORY_MOVEMENT_PERSISTENCE_REPORT.md`, e leitura direta (não por memória) de
`apps/api/src/{dtos,mappers,errors,routes}/purchase.*`, `server.ts`, `plugins/managers.ts`,
`plugins/openapi.ts`, `testing/buildTestServer.ts`, `errors/HttpError.ts`, `errors/mapDomainError.ts`.

**Existe padrão reutilizável?** Sim, integralmente — `HttpError`/`mapDomainError` (intocados),
`buildServer`/`managersPlugin`/`openapiPlugin`, `buildTestServer` (real SQLite `:memory:` por teste),
estrutura de arquivo `{dtos,mappers,errors,routes}/{domain}.*`, o padrão de dois níveis de erro
(`map{Domain}Error` → `mapDomainError`), `fastify.inject()` como único mecanismo de teste (nunca mock).

**Existe oportunidade de abstração?** Sim, uma nova — `?locationId=` como `Querystring` tipado
opcional (`GET /stock-movements/by-product/:productId`, `GET /stock-positions/:productId`). Nenhum
Hub anterior (Supplier, Purchase) precisou de um filtro opcional sem Entidade própria — todos os
filtros anteriores eram path params obrigatórios (`by-tenant/:tenantId`, `by-supplier/:supplierId`).
Candidato a convenção para Production Hub/Fiscal Hub caso surjam filtros semelhantes; documentado,
nunca extraído preventivamente.

**Existe bug anteriormente corrigido que possa reaparecer?** Não. Auditoria específica de dois bugs já
documentados na série:
- **PATCH undefined-clobbering (IMP-203)**: nenhum dos sete Commands do Inventory Movement Hub
  corresponde a atualização parcial por merge — `releaseStockReservation`/`convertReservationToMovement`/
  `deactivateStockAlertRule` são transições sem corpo de requisição; `registerStockMovement`/
  `createStockReservation`/`createStockLocation`/`createStockAlertRule` são criações completas via
  Factory. Nenhum endpoint `PATCH` foi criado — mesma conclusão de auditoria já registrada para o
  Purchase Hub (IMP-303).
- **FK de segundo-Receiving (IMP-302/IMP-303, ainda aberto no Purchase Hub)**: não se aplica aqui —
  `stock_movements` não tem tabela filha, e a Persistência deste Hub (IMP-402) já documentou zero
  FOREIGN KEY entre suas próprias tabelas (Seção 3 daquele relatório). Nenhuma classe de bug análoga
  tem superfície neste domínio.

**Existe endpoint que não faz sentido em um Ledger?** Esta é a pergunta central desta Sprint — a
resposta é a ausência deliberada, não um endpoint. Nenhuma rota `PUT`/`PATCH`/`DELETE` existe para
`/stock-movements/:movementId`, nem para nenhum outro path deste arquivo — porque
`InventoryMovementManager` não tem nenhum método público que altere ou remova um `StockMovement` já
registrado (`registerStockMovement` só cria; não existe `updateStockMovement`/`deleteStockMovement`).
Seguindo a regra "criar apenas endpoints correspondentes aos métodos públicos do Manager", a ausência é
automática — não foi necessário decidir "não criar" um endpoint, porque não existe método
correspondente a criar a partir dele. Ver Seção 10 para a garantia formal disso.

---

## 2. Endpoints Implementados

Treze endpoints, um por método público de `InventoryMovementManager` (sete Commands, seis Query) —
mesma disciplina "um endpoint por método público do Manager" já aplicada por IMP-303. Nenhum inventado,
nenhum omitido.

| Método | Rota | Manager |
|---|---|---|
| POST | `/stock-movements` | `registerStockMovement` |
| GET | `/stock-movements/by-product/:productId` (`?locationId=`) | `listStockMovementsByProduct` |
| GET | `/stock-movements/by-origin-reference/:originReferenceId` | `listStockMovementsByOriginReference` |
| GET | `/stock-positions/:productId` (`?locationId=`) | `getStockPosition` |
| POST | `/stock-reservations` | `createStockReservation` |
| GET | `/stock-reservations/:reservationId` | `getStockReservation` |
| GET | `/stock-reservations/by-order/:orderId` | `listStockReservationsByOrder` |
| POST | `/stock-reservations/:reservationId/release` | `releaseStockReservation` |
| POST | `/stock-reservations/:reservationId/convert` | `convertReservationToMovement` |
| POST | `/stock-locations` | `createStockLocation` |
| GET | `/stock-locations/by-tenant/:tenantId/active` | `listActiveStockLocations` |
| POST | `/stock-alert-rules` | `createStockAlertRule` |
| POST | `/stock-alert-rules/:ruleId/deactivate` | `deactivateStockAlertRule` |

**Decisão de status HTTP para `convert`**: `POST /stock-reservations/:reservationId/convert` retorna
`200`, não `201` — apesar de criar um novo `StockMovement` como efeito colateral real, a URL está
escopada sob a Reservation já existente (`/stock-reservations/:id/...`), mesmo padrão de
`/purchase-orders/:id/approve`/`/send`/`/cancel` (uma transição sobre uma Entidade já existente, `200`)
em vez do padrão de `/receivings` (criação de um novo recurso de topo, `201`). Documentado
explicitamente no próprio arquivo de rotas.

---

## 3. OpenAPI

Gerada automaticamente a partir do `schema` de cada rota — nenhuma documentação manual. Nova tag
`inventory-movement` registrada em `plugins/openapi.ts`. Teste dedicado confirma os treze paths e a
tag; um segundo teste dedicado confirma, a partir do próprio documento OpenAPI gerado (não apenas por
inspeção do código-fonte), que nenhum path `/stock-movements*` expõe `put`/`patch`/`delete` — a
garantia de append-only é verificável na própria documentação pública da API, não apenas no código.

---

## 4. DTOs

`dtos/inventoryMovement.dto.ts` — nunca `StockMovement`/`StockPosition`/`StockReservation`/
`StockLocation`/`StockAlertRule` do Core expostos diretamente. `StockLocationAddressDto` permanece
aninhado (`{ line: string }`), mesma exceção deliberada já usada para `Money`/`ApprovalThreshold`
(Purchase Hub) — um Value Object com identidade estrutural própria, não achatado como `TaxId`.
`RegisterStockMovementResponseDto`/`ConvertReservationToMovementResponseDto` são DTOs compostos,
refletindo `RegisterStockMovementResult`/`ConvertReservationToMovementResult` (Core) — mesmo padrão de
`RegisterReceivingResponseDto` (Purchase Hub).

---

## 5. Validações

Limitadas a tipo/formato/campo obrigatório/enum, nunca regra de negócio — critério aplicado com uma
distinção explícita e nova nesta Sprint: um campo recebe um guard de schema (`minimum`) apenas quando
**nenhuma camada do domínio já o valida** (mesmo critério retroativamente identificado em
`addPurchaseOrderItemBodySchema.quantityOrdered`, Purchase Hub — nunca antes declarado como regra
explícita). Aplicado assim:

- `quantityDelta` — **sem** `minimum`/`not: {const: 0}`, porque `InvalidQuantityDeltaError` (Core) já
  é o único ponto que decide "zero é inválido"; duplicar essa regra no schema violaria "jamais validar
  regra de negócio". Testado explicitamente: `quantityDelta: 0` passa a validação de schema (não gera
  400) e retorna 422 via `mapInventoryMovementError`.
- `quantity` (Stock Reservation) — **com** `minimum: 1`, porque o Core (`InventoryFactory.createStockReservation`)
  não valida positividade em nenhum ponto (limitação já documentada em IMP-401) — sem este guard, uma
  Reservation de quantidade zero/negativa seria aceita sem rejeição em nenhuma camada da plataforma.
- `thresholdQuantity` — `minimum: 0` (permite alerta em zero), mesmo critério do Purchase Hub
  (`reorder_rules.threshold_quantity`).
- `origin` — enum fechado com os seis valores de `MovementOrigin` (Core).
- Nenhuma validação condicional (`originReferenceId` obrigatório apenas para `ProductionConsumption`/
  `ProductionOutput`) foi implementada em JSON Schema — essa é uma regra de negócio real
  (`MovementOriginReferenceRequiredError`), decidida exclusivamente pelo Core.

---

## 6. Domain Errors

`errors/mapInventoryMovementError.ts`, seguindo exatamente `mapPurchaseError.ts`/`mapSupplierError.ts`
— mapeamento por `instanceof InventoryDomainError` + `code`, delegando a `mapDomainError.ts` (intocado)
apenas para erro genuinamente fora da hierarquia:

| Code | HTTP |
|---|---|
| `STOCK_RESERVATION_NOT_FOUND` | 404 |
| `STOCK_ALERT_RULE_NOT_FOUND` | 404 |
| `STOCK_RESERVATION_INVALID_STATUS_TRANSITION` | 409 |
| `INVENTORY_INVALID_QUANTITY_DELTA` | 422 |
| `INVENTORY_MOVEMENT_ORIGIN_REFERENCE_REQUIRED` | 422 |
| `STOCK_RESERVATION_EXCEEDS_AVAILABLE` | 422 |
| `INVENTORY_INVALID_STOCK_LOCATION` | 422 |

Auditoria (Passo 1) não encontrou nenhuma mensagem de `InventoryDomainError` fora do alcance desta
tabela — `mapDomainError` só é alcançado para erro genuinamente externo ao Hub.

---

## 7. Integração com InventoryMovementManager

Exclusivamente via `fastify.managers.inventoryMovement`, decorado uma única vez por `managersPlugin`
(`@abp/persistence`, `createManagerRegistry`) — nenhuma rota instancia o Manager, um Service ou um
Repository diretamente. Nenhuma alteração em `plugins/managers.ts` foi necessária — `ManagerRegistry.inventoryMovement`
já existia desde IMP-402.

---

## 8. Integração SQLite

Via `managersPlugin` → `createManagerRegistry("real", handle)`, exatamente como todo outro Hub —
`migrations` aplicadas no boot do servidor (incluindo `0004_inventory_movement_hub.sql`, IMP-402) antes
de qualquer rota aceitar tráfego. `buildTestServer()` cria um banco `:memory:` real por teste — nenhum
mock de persistência em nenhum teste desta Sprint.

---

## 9. Testes

37 novos testes: `mapInventoryMovementError.test.ts` (10) + `routes/inventoryMovement.test.ts` (27).
Todos via `fastify.inject()` contra o servidor real (`buildTestServer`), SQLite real, nunca mockados.

**Os quatro cenários obrigatórios do ledger, verbatim do prompt:**

1. *Registrar movimento → HTTP 201.* Testado no fluxo completo.
2. *Consultar movimento → HTTP 200.* Testado no fluxo completo e na listagem por origem/localização.
3. *Tentar atualizar movimento → Endpoint inexistente ou método não permitido.* Testado com `PUT` e
   `PATCH` contra `/stock-movements/:movementId` (e contra a coleção `/stock-movements` sem id) — 404
   em todos os casos, confirmando que a rota nunca foi registrada para esses verbos (Fastify não
   distingue "método não permitido" de "rota inexistente" quando nenhum verbo é registrado no mesmo
   path).
4. *Tentar remover movimento → Endpoint inexistente ou método não permitido.* Testado com `DELETE` —
   mesmo resultado, mais uma asserção de que o movimento original permanece intacto na consulta
   subsequente.
5. *Consultar histórico → Integridade preservada.* Testado registrando três movimentos e verificando
   ordem cronológica e soma total via `GET /stock-movements/by-product/:productId`.

**Cobertura adicional**: fluxo completo de Reservation (create→get→by-order→release), conversão em
Movement com Position recalculada, Location com/sem endereço, Alert Rule create/deactivate, todos os
sete Domain Errors mapeados, validação de schema (400) para cada campo obrigatório e para o enum de
`origin`, isolamento por `locationId` via querystring, e os dois testes de OpenAPI (Seção 3).

---

## 10. Garantia de Append-Only

Quatro camadas independentes, cada uma já registrada em sua própria Sprint, agora todas verificadas:

1. **Core (IMP-401)** — `StockMovementRepository` expõe apenas `append`; nenhum método de update/delete
   existe no contrato.
2. **Persistência (IMP-402)** — dois `TRIGGER` (`BEFORE UPDATE`/`BEFORE DELETE`) rejeitam qualquer
   alteração direta em `stock_movements`, mesmo fora do Repository.
3. **HTTP (esta Sprint)** — nenhuma rota registrada para `PUT`/`PATCH`/`DELETE` contra
   `/stock-movements*`; verificado tanto por chamada HTTP real (`fastify.inject()`) quanto pela própria
   definição OpenAPI gerada (Seção 3).
4. **Nenhum método do Manager** permite a operação — não há "decisão de não expor" um método existente;
   o método simplesmente não existe.

A imutabilidade do ledger é, portanto, estruturalmente impossível de violar por qualquer cliente HTTP
desta API — não uma convenção observada, uma ausência de superfície em quatro camadas independentes.

---

## 11. Divergências Encontradas

Nenhuma divergência exigiu Amendment. A única decisão registrada sem precedente direto foi o status
HTTP de `convert` (Seção 2) e o critério de quando aplicar `minimum` em schema (Seção 5) — ambas
documentadas explicitamente, nunca decididas silenciosamente.

---

## 12. Limitações

**Herdada do Core/Persistência**: a limitação de `variantId` (`StockPositionRepository`/
`StockReservationRepository` não recebem esse parâmetro) se propaga integralmente para
`GET /stock-positions/:productId` — a posição retornada nunca reflete um variant específico, apenas a
soma de todos os variants do Produto/Localização. `variantId` continua presente nos DTOs de
`StockMovement`/`StockReservation`/`StockAlertRule` (o dado existe e é devolvido quando informado na
criação), mas nunca é um parâmetro de consulta em nenhum endpoint — mesma limitação, agora
documentada pela terceira vez (IMP-401 → IMP-402 → aqui), nunca silenciosamente resolvida.

**`RegisterStockMovement` exposto sem restrição de uso**: `INVENTORY_MOVEMENT_HUB.md`, Capítulo 7,
descreve este Command como "interno, nunca exposto a um usuário final diretamente" — esta Sprint expõe
`POST /stock-movements` normalmente mesmo assim, decisão consciente registrada aqui: a API HTTP não tem
mecanismo de distinguir "chamada de integração/administrativa" de "chamada de usuário final" (isso é
responsabilidade de autenticação/autorização, fora do escopo desta Sprint) — o endpoint existe porque o
método público existe no Manager, e a Sprint proíbe tanto inventar quanto omitir endpoints
correspondentes a métodos públicos. Uma futura Sprint de segurança/integração pode decidir restringir
este endpoint a um Papel específico (ex.: `integration:inventory:write`), nunca removê-lo.

---

## 13. Qualidade

**STD-001 seguido?** Sim.

**Blueprint Supplier seguido?** Sim — `HttpError`/`mapDomainError` intocados, estrutura de arquivo
idêntica.

**Blueprint Purchase seguido?** Sim — dois níveis de erro, `RegisterStockMovementResponseDto` no
mesmo formato de `RegisterReceivingResponseDto`, mesma disciplina de "um endpoint por método público".

**Append-only preservado?** Sim — quatro camadas independentes, Seção 10.

**Existe duplicação?** Não.

**Existe abstração reutilizável?** Sim — `Querystring` opcional tipado (`?locationId=`), Seção 1,
candidato a convenção para filtros opcionais futuros (Production Hub, Fiscal Hub).

---

## 14. Validação

`pnpm typecheck`, `pnpm build`, `pnpm lint`, `pnpm test` executados três vezes na suíte completa do
monorepo (24 pacotes/apps), a partir de `platform/` (caminho absoluto confirmado a cada execução, per
[[feedback_bash_cwd_persistence]]). **Todas as três execuções totalmente limpas e idênticas**: 990
testes passando + 1 `it.fails` esperado (IMP-303) = 991 — zero flakes nesta Sprint. OpenAPI, servidor
HTTP e SQLite real validados integralmente através da própria suíte de testes (`fastify.inject()` +
`buildTestServer()` real, nunca mock).

---

## 15. Preparação para IMP-404

`apps/api` está pronto para receber consumo real de Frontend, seguindo o blueprint de IMP-304 (Purchase
Frontend) — `core/inventoryMovement/` com DTOs próprios (nunca compartilhados com `apps/api`),
`inventoryMovementClient.ts` (13 métodos), Query Keys centralizadas, Hooks um-por-endpoint. Três pontos
de atenção já identificados para aquela Sprint:

1. A limitação de `variantId` (Seção 12) deve ser documentada uma quarta vez no Frontend, nunca
   presumida como resolvida.
2. `RegisterStockMovement` exposto sem restrição (Seção 12) — se o Workspace (IMP-405) decidir nunca
   oferecer um formulário de "registrar movimento manual" na UI (mantendo o Command verdadeiramente
   "interno" na prática, mesmo exposto por HTTP), essa decisão deve ser explícita no relatório daquela
   Sprint, não uma omissão silenciosa.
3. O `Querystring` opcional (`?locationId=`) exige um padrão de Hook ainda não usado por Supplier/Purchase
   Frontend (nenhum hook anterior aceitou um filtro opcional sem Entidade própria) — primeira vez que
   `core/{domain}/` precisará de um Hook com parâmetro de query opcional genuinamente novo.
