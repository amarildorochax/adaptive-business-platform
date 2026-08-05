# IMP-503 — Production HTTP API

**Adaptive Business Platform · Relatório de Implementação**

Status: Completo
Data: 2026-08-04
Escopo: exclusivamente HTTP API (`apps/api`) — Arquitetura, Core, Persistence, Frontend e Workspace
permanecem fora de escopo, per instrução explícita desta Sprint.

---

## Nota de Posicionamento

Este relatório documenta a exposição HTTP completa do `ProductionManager` (`@abp/production-hub`,
IMP-501/IMP-502, ambos congelados), seguindo rigorosamente os três blueprints já consolidados: Supplier
HTTP API (IMP-203), Purchase HTTP API (IMP-303) e Inventory Movement HTTP API (IMP-403, o mais
recente). Nenhum padrão novo foi criado.

---

## 1. Auditoria Realizada (Passo 1)

Executada antes de qualquer código, comparando Arquitetura → Production Core → Production Persistence
→ Supplier HTTP → Purchase HTTP → Inventory HTTP.

**Existe endpoint parcial?** Não. Nenhum arquivo `production.*` existia em `apps/api/src/` antes desta
Sprint — confirmado por leitura completa de `dtos/`, `mappers/`, `errors/`, `routes/`, `server.ts` e
`plugins/openapi.ts`.

**Existe rota existente?** Não.

**Existe conflito?** Não — nenhum path novo (`/bills-of-materials*`, `/production-orders*`,
`/work-centers*`) colide com nenhuma rota já registrada pelos sete Hubs anteriores.

**Existe duplicação?** A duplicação estrutural esperada existe e é aceita como padrão sancionado, não
como pendência: `nonEmptyString`, o par `try/catch` + `mapXError`, o padrão `{ Params, Body }` tipado —
todos redeclarados em `routes/production.ts`, mesma disciplina já documentada como "candidato a
abstração, nunca executado" em IMP-303 §13/IMP-403.

**Existe oportunidade de reutilização?** O formato de resultado composto (`{ previous, next }`,
`{ productionOrder, started }`, `{ productionOrder, consumption }`, `{ productionOrder, output }`) já
havia sido antecipado literalmente por `IMP_303_PURCHASE_HTTP_API_REPORT.md` §13 ("Hubs futuros com
resultado multi-Entidade (Inventory Movement, **Production**) provavelmente repetirão") — confirmado
por esta Sprint, mesmo padrão de `RegisterStockMovementResponseDto`/`ConvertReservationToMovementResponseDto`.

**Existe melhoria para STD-001?** Nenhuma identificada.

---

## 2. DTOs

`dtos/production.dto.ts` — nenhum tipo de `@abp/production-hub` reexportado diretamente. Datas sempre
`string` (ISO 8601) em DTO, convertidas apenas no mapper/handler. `availableQuantities`
(`StartProductionRequestDto`) é a única tradução estrutural própria desta Sprint: `Record<string,
number>` como forma HTTP de `ReadonlyMap<string, number>` (Core) — JSON não possui tipo Map nativo;
convertido de volta a `Map` apenas dentro do handler de `POST .../start` (`routes/production.ts`), nunca
lógica de negócio, mesma disciplina de `occurredAt: string → Date` já usada em toda rota anterior.

Quatro resultados compostos (mesmo formato de `RegisterStockMovementResponseDto`):
`SupersedeBillOfMaterialsResponseDto { previous, next }`, `StartProductionResponseDto {
productionOrder, started }`, `RegisterProductionConsumptionResponseDto { productionOrder, consumption
}`, `RegisterProductionOutputResponseDto { productionOrder, output }`.

## 3. Mappers

`mappers/production.mapper.ts` — uma função `to{Entidade}ResponseDto` por Entidade/Resultado, cada uma
cópia pura de campo + `.toISOString()` em todo campo `Date`. Sem `.test.ts` próprio — mesma decisão já
tomada para `inventoryMovement.mapper.ts`/`purchase.mapper.ts`/`supplier.mapper.ts` (pura o suficiente
para ser exercitada transitivamente pelos testes de rota).

## 4. Error Mapping

`errors/mapProductionError.ts` — mesmo mecanismo de `mapInventoryMovementError.ts`/`mapPurchaseError.ts`:
`instanceof HttpError` passthrough → `instanceof ProductionDomainError` → `switch(error.code)` →
`default: mapDomainError(error)`. `mapDomainError.ts` **não foi alterado**. Doze `code` de
`ProductionDomainError` (Core) mapeados por categoria:

| HTTP | `code` |
|---|---|
| 404 | `PRODUCTION_BILL_OF_MATERIALS_NOT_FOUND`, `PRODUCTION_ORDER_NOT_FOUND` |
| 409 | `PRODUCTION_BILL_OF_MATERIALS_NOT_ACTIVE`, `PRODUCTION_ORDER_INVALID_STATUS_TRANSITION`, `PRODUCTION_CONSUMPTION_NOT_ALLOWED`, `PRODUCTION_OUTPUT_NOT_ALLOWED`, `PRODUCTION_ORDER_HAS_NO_OUTPUT_CANNOT_COMPLETE`, `PRODUCTION_ORDER_HAS_CONSUMPTION_CANNOT_CANCEL` |
| 422 | `PRODUCTION_INVALID_BOM_LINE`, `PRODUCTION_INVALID_PLANNED_OUTPUT_QUANTITY`, `PRODUCTION_INVALID_CONSUMPTION`, `PRODUCTION_INVALID_OUTPUT`, `PRODUCTION_INVALID_WORK_CENTER_NAME` |

Auditoria não encontrou nenhuma mensagem de `ProductionDomainError` fora do alcance desta categorização
— `mapDomainError` só é alcançado para um erro genuinamente fora da hierarquia, mesma conclusão de
IMP-303/IMP-403.

## 5. Routes

`routes/production.ts` — 17 endpoints, um por método público de `ProductionManager` (9 Commands, 8
Query — nenhum inventado, nenhum omitido). `getTotalConsumedCost`/`getTotalGeneratedQuantity` são
consultas auxiliares, não Commands — documentado explicitamente no cabeçalho do arquivo, mesma
disciplina de `evaluateReorderRule` (Purchase Hub).

| Método | Path | Manager | Status (sucesso) |
|---|---|---|---|
| POST | `/bills-of-materials` | `createBillOfMaterials` | 201 |
| POST | `/bills-of-materials/:id/supersede` | `supersedeBillOfMaterials` | 201 |
| GET | `/bills-of-materials/:id` | `getBillOfMaterials` | 200 |
| GET | `/bills-of-materials/by-product/:outputProductId/active` | `getActiveBillOfMaterialsForProduct` | 200 |
| POST | `/production-orders` | `createProductionOrder` | 201 |
| GET | `/production-orders/:id` | `getProductionOrder` | 200 |
| GET | `/production-orders/by-status/:status` | `listProductionOrdersByStatus` | 200 |
| GET | `/production-orders/by-origin/:orderId` | `listProductionOrdersByOrigin` | 200 |
| GET | `/production-orders/:id/total-consumed-cost` | `getTotalConsumedCost` (auxiliar) | 200 |
| GET | `/production-orders/:id/total-generated-quantity` | `getTotalGeneratedQuantity` (auxiliar) | 200 |
| POST | `/production-orders/:id/start` | `startProduction` | 200 |
| POST | `/production-orders/:id/consumptions` | `registerProductionConsumption` | 201 |
| POST | `/production-orders/:id/outputs` | `registerProductionOutput` | 201 |
| POST | `/production-orders/:id/complete` | `completeProduction` | 200 |
| POST | `/production-orders/:id/cancel` | `cancelProduction` | 200 |
| POST | `/work-centers` | `createWorkCenter` | 201 |
| GET | `/work-centers/active` | `listActiveWorkCenters` | 200 |

**Registro**: `fastify.managers.production` (já decorado por `plugins/managers.ts`, nenhuma alteração
necessária ali — `createManagerRegistry` já retornava `production: ProductionManager` desde IMP-502).
Fluxo idêntico em todo handler: HTTP → DTO → `fastify.managers.production.<method>` → DTO → HTTP, sem
lógica adicional; `command`/`events` sempre descartados na desestruturação (`const { result } = ...`),
nunca serializados na resposta — mesma disciplina de todo Hub anterior.

## 6. OpenAPI

`plugins/openapi.ts`: uma linha adicionada a `tags` (`{ name: "production", description: "..." }`).
`server.ts`: `import { productionRoutes }` + `await fastify.register(productionRoutes)`, após
`inventoryMovementRoutes`. Nenhuma outra alteração — schemas/responses/tags/operationId são gerados
automaticamente a partir do `schema` já declarado em cada rota, verificado por teste (Seção 8).

---

## 7. Testes e Cobertura

`routes/production.test.ts` — 30 testes, cinco blocos `describe`:

| Bloco | Cobertura |
|---|---|
| Bill of Materials | CRUD HTTP completo (create/supersede/get/getActiveForProduct), 400 (schema), 422 (`InvalidBOMLineError`), 404, 409 (`BillOfMaterialsNotActiveError`) |
| Production Order | create/get/list-by-status/list-by-origin, 404/409 na criação, `start` insuficiente vs. suficiente, `consumptions`/`complete`/`cancel` com suas guardas específicas (409/422), fluxo feliz completo ponta a ponta com verificação dos dois totais consolidados |
| Work Center | create/list-active, 400 (schema) vs. 422 (Core) — achado explícito abaixo |
| Auditoria de bug conhecido | PATCH-clobber (nenhuma rota PATCH existe), FK second-write (duas chamadas consecutivas de `registerProductionConsumption` nunca falham), Ledger immutability (não se aplica — propriedade análoga verificada: nenhum PUT/DELETE) |
| OpenAPI | todos os 17 paths presentes com a tag `production`; nenhum path deste Hub expõe `put`/`patch`/`delete` |

**Resultado**: 30/30 aprovados, três execuções consecutivas sem flake. `pnpm test` (workspace
completo): 199 arquivos de teste (era 198 antes desta Sprint), 1181 testes aprovados + 1 falha esperada
(mesma de IMP-303/IMP-501/IMP-502, não relacionada), idêntico nas três execuções.

**Achado real, corrigido no próprio teste (não no código de produção)**: o primeiro rascunho do teste
`POST /work-centers — 422 para nome vazio` esperava 422 para `name: ""`, mas `createWorkCenterBodySchema.name`
já usa `nonEmptyString` (`minLength: 1`) — uma string vazia é rejeitada pelo **schema** (400), nunca
alcança o Core. O teste foi corrigido para dois casos distintos: `name: ""` → 400 (schema);
`name: "   "` (apenas espaços, passa `minLength: 1` mas falha `name.trim().length === 0` em
`ProductionValidator.ensureValidWorkCenterName`, Core) → 422. Nenhuma alteração de código de produção —
apenas a asserção do teste, documentado aqui per "encontrado por teste, não por leitura de código".

**Comparação com Inventory Movement HTTP API (IMP-403, referência de cobertura explícita desta
Sprint)**: IMP-403 cobriu 13 endpoints com 27 testes. Esta Sprint cobre 17 endpoints com 30 testes,
incluindo uma categoria adicional que IMP-403 não precisou exercitar isoladamente (guarda dupla
específica-antes-de-genérica: `PRODUCTION_ORDER_HAS_NO_OUTPUT_CANNOT_COMPLETE`/
`PRODUCTION_ORDER_HAS_CONSUMPTION_CANNOT_CANCEL`, análogas a `PURCHASE_ORDER_HAS_RECEIVING_CANNOT_CANCEL`
de Purchase Hub) e o fluxo feliz completo de nove passos (criar BOM → criar Order → iniciar → consumir
→ gerar → concluir → consultar dois totais).

---

## 8. Auditoria — Três Classes de Bug Já Conhecidas

Per instrução explícita desta Sprint ("Verificar explicitamente... mesmo quando inexistentes").

**1. PATCH-clobber (IMP-203).** O bug original exigia um endpoint `PATCH` cujo corpo é mesclado via
`{ ...existing, ...input }` (Core), reconstruindo todas as chaves mesmo quando ausentes do JSON
recebido, sobrescrevendo campo existente com `undefined`. **Nenhuma superfície aqui, verificado tanto
por leitura quanto por teste** (`routes/production.test.ts`, bloco "Auditoria de classes de bug
conhecidas"): `routes/production.ts` não define nenhum endpoint `PATCH` — os nove Commands do Production
Hub são criações completas via Factory com input totalmente tipado, transições de propósito específico
com corpo mínimo sempre obrigatório quando existente, ou sem corpo algum. Nenhum reconstrói um objeto
existente por merge parcial. Mesma conclusão de IMP-303/IMP-403.

**2. FK second-write (IMP-303).** O bug original exige duas condições estruturais simultâneas: (a) um
Aggregate cuja coleção filha é regravada por completo (`DELETE` + `INSERT`) a cada escrita, e (b) uma
tabela de um Aggregate *diferente* com FOREIGN KEY real apontando para essa coleção filha
(`receiving_lines` → `purchase_order_items`). `SqliteProductionOrderRepository` (IMP-502) tem a
condição (a) — `production_consumptions`/`production_outputs` são regravados por completo a cada
`save()` — mas **nenhuma tabela deste schema referencia** `production_consumptions.consumption_id`/
`production_outputs.output_id` por FOREIGN KEY (confirmado em `0005_production_hub.sql`: ambas são
tabelas-folha) — a condição (b) está ausente. **Verificado empiricamente**, não apenas por leitura de
código (per disciplina exigida pelos três relatórios anteriores): o teste "FK second-write (IMP-303) —
nenhuma superfície" executa duas chamadas consecutivas de `POST .../consumptions` contra a mesma
`ProductionOrder` e confirma 201 em ambas, com os dois registros presentes na leitura subsequente —
nunca um 500.

**3. Ledger immutability (IMP-403).** Não se aplica — `ProductionOrder` é uma máquina de estados
(`Planned`/`InProgress`/`Completed`/`Cancelled`), não um ledger append-only. `ProductionOrderRepository`/
`BillOfMaterialsRepository`/`WorkCenterRepository` (Core/Persistência, congelados) expõem `save`, nunca
apenas `append`, e nenhuma TRIGGER de imutabilidade existe (IMP-502, "SEM TRIGGER"). A propriedade de
segurança análoga e correta para um Aggregate de máquina de estados não é "ausência total de escrita",
mas **ausência de escrita arbitrária**: nenhuma rota permite a um cliente definir `status`/
`consumptions`/`outputs` diretamente — toda transição passa por um Command `POST .../start`/
`.../complete`/`.../cancel` de propósito específico. Verificado tanto por tentativa HTTP direta
(`PUT`/`DELETE` → 404) quanto pelo próprio documento OpenAPI (nenhum path deste Hub expõe
`put`/`patch`/`delete`).

---

## 9. Divergências Encontradas

Per `STD-001`: Arquitetura → Auditoria → Amendment → Implementação. Nenhuma corrigida silenciosamente.

**Nenhuma divergência real encontrada** — o único ajuste desta Sprint foi ao próprio teste (Seção 7,
"Achado real"), não ao código de produção, e não constitui uma divergência entre Arquitetura e
Implementação: o comportamento de produção (400 via schema, 422 via Core) já estava correto desde a
primeira versão do arquivo de rotas; apenas a expectativa do teste precisou ser corrigida para refletir
com precisão em qual camada cada guarda realmente atua.

---

## 10. Decisões Tomadas

**Códigos de status HTTP para transição vs. criação.** Critério explícito adotado por esta Sprint,
reconciliando a tensão entre os dois precedentes existentes (`convertReservationToMovement` → 200,
`convertRequisitionToPurchaseOrder` → 201, ambos endpoints de "ação" que produzem dado novo): **201
sempre que uma nova linha é persistida** (`createBillOfMaterials`, `supersedeBillOfMaterials` — cria a
próxima versão —, `createProductionOrder`, `registerProductionConsumption`, `registerProductionOutput`,
`createWorkCenter`); **200 para transição pura sobre linha já existente, sem nova linha** (`startProduction`,
`completeProduction`, `cancelProduction`). Critério mais literal (presença de `INSERT` real) que os dois
precedentes conflitantes, documentado aqui para uma Sprint futura de Fiscal/Financial Hub adotar o
mesmo raciocínio.

**`availableQuantities` como `Record<string, number>`, não `array` de pares.** Mais direto para
serializar/desserializar via `Object.entries`/`new Map(...)` que um array de `{ productId, quantity }`,
e mais idiomático a JSON (chave = identificador, valor = quantidade) — única tradução estrutural nova
desta Sprint, documentada em `dtos/production.dto.ts`.

**`getTotalConsumedCost`/`getTotalGeneratedQuantity` retornam objeto de campo único (`{
totalConsumedCost }`/`{ totalGeneratedQuantity }`), nunca um número bruto no corpo da resposta.**
Nenhum endpoint desta API retorna um primitivo como corpo JSON top-level em nenhum Hub anterior —
manter a mesma forma (`{ chave: valor }`) preserva extensibilidade (adicionar um campo futuro nunca
quebra um cliente existente que espera JSON, o que quebraria se o corpo fosse um número bruto).

**Sem `minItems` em `lines` (`CreateBillOfMaterials`/`SupersedeBillOfMaterials`).** Mesma leitura
conservadora já registrada pelo Core (IMP-501, "Decisões Tomadas": "nenhuma regra explícita da
arquitetura exige um mínimo") — duplicar uma restrição de tamanho que o próprio Core deliberadamente
não impõe inventaria uma regra de negócio não escrita.

**`nominalCapacity: { minimum: 0 }` em `createWorkCenterBodySchema`.** Único campo desta Sprint sem
nenhuma validação em qualquer camada do Core (`ProductionFactory.createWorkCenter` não a valida) — guard
de "óbvio input malformado" no schema, mesmo critério já usado por
`createStockReservationBodySchema.quantity` (IMP-403).

---

## 11. Qualidade (10 Perguntas Oficiais)

Per `ADAPTIVE_ENGINEERING_CHECKLIST.md`:

1. **Arquitetura respeitada?** Sim — todo endpoint corresponde a um método público real de
   `ProductionManager`; nenhuma lógica de negócio nova em DTO, Mapper, Error Mapper ou Route.
2. **Auditoria realizada?** Sim — Seções 1 e 8.
3. **Blueprint seguido?** Sim — DTO/Mapper/Error Mapping/Routes/OpenAPI idênticos a IMP-203/303/403;
   nenhuma infraestrutura paralela.
4. **Código duplicado?** A duplicação estrutural esperada (schemas primitivos, padrão try/catch) é
   idêntica à já aceita nos três Hubs anteriores — nenhuma duplicação evitável.
5. **Componentes reutilizados?** `HttpError`/`mapDomainError.ts`/`plugins/managers.ts`/
   `plugins/openapi.ts`/`testing/buildTestServer.ts` inteiros, sem modificação (exceto a única linha de
   tag em `openapi.ts` e o registro de rota em `server.ts`, ambos mecânicos).
6. **Limitações documentadas?** Sim — Seção 9 (nenhuma real encontrada, explicitamente registrado).
7. **Testes completos?** Sim — 30 testes cobrindo os 17 endpoints, as três classes de bug auditadas, e
   OpenAPI. Ver Seção 7 para comparação com IMP-403.
8. **OpenAPI validada?** Sim — testado via `/documentation/json`, todos os 17 paths presentes, nenhum
   `put`/`patch`/`delete`.
9. **Workspace sem acesso direto ao HTTP?** Não aplicável — nenhum Workspace/Frontend nesta Sprint.
10. **Documentação atualizada?** Sim — este relatório; nenhum documento de arquitetura alterado.

**Existe melhoria para Supplier/Purchase/Inventory Movement?** Nenhuma identificada.

Nenhuma refatoração além do estritamente necessário para esta Sprint foi realizada.

---

## 12. Validação

`pnpm typecheck`, `pnpm build`, `pnpm lint` e `pnpm test` executados três vezes consecutivas sobre o
workspace completo (26 pacotes + 2 apps, `@abp/api` agora com dependência real de `@abp/production-hub`):

| Execução | typecheck | build | lint | test |
|---|---|---|---|---|
| 1 | ✅ 0 erros | ✅ 0 erros | ✅ 0 erros | ✅ 199 arquivos, 1181 aprovados + 1 falha esperada |
| 2 | ✅ 0 erros | ✅ 0 erros | ✅ 0 erros | ✅ 199 arquivos, 1181 aprovados + 1 falha esperada |
| 3 | ✅ 0 erros | ✅ 0 erros | ✅ 0 erros | ✅ 199 arquivos, 1181 aprovados + 1 falha esperada |

**Nenhuma flake observada** — resultado idêntico nas três execuções. A única falha (`it.fails`)
continua sendo o bug de duplo `registerReceiving` já documentado por IMP-303, pré-existente, não
relacionado a esta Sprint.

---

## 13. Preparação para IMP-504

A HTTP API do Production Hub está completa e pronta para consumo por um Frontend:

- Os 17 endpoints cobrem 100% da superfície pública de `ProductionManager`, incluindo os dois totais
  consolidados (`total-consumed-cost`/`total-generated-quantity`) que uma futura tela de detalhe de
  ProductionOrder provavelmente exibirá diretamente.
- **Limitação herdada, relevante para IMP-504**: nenhum endpoint de consulta filtra por `tenantId`
  (`GET /bills-of-materials/:id`, `.../by-product/:id/active`, `/production-orders/by-status/:status`,
  `/production-orders/by-origin/:orderId`, `/work-centers/active`) — herdada do Core (IMP-501) e da
  Persistência (IMP-502), nunca resolvida silenciosamente em nenhuma camada até aqui. Um Frontend
  precisa estar ciente de que essas listagens não são automaticamente escopadas por Tenant.
  Não é uma "cobertura" HTTP fictícia — é a mesma limitação genuína propagada por três camadas.
- **`StartProduction` exige `availableQuantities` no corpo da requisição** — o Frontend (ou uma camada
  intermediária) precisará compor essa informação a partir de uma consulta real ao Inventory Movement
  Hub (`GET /stock-positions/:productId` por linha da BOM) antes de chamar `POST
  /production-orders/:id/start`; `@abp/production-hub` nunca faz essa consulta internamente (IMP-501,
  Divergência 2).
- Nenhuma mudança de schema OpenAPI é antecipada — os 17 endpoints já cobrem toda operação pública do
  domínio.

Ao final desta Sprint: Supplier Hub ✅, Purchase Hub ✅, Inventory Movement Hub ✅, Production Hub
(Core ✅, Persistence ✅, **HTTP API ✅**) — preparando IMP-504 (Production Frontend) e IMP-505
(Production Workspace).
