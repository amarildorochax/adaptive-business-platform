# IMP-203 — Supplier HTTP API — Relatório de Implementação

**Adaptive Business Platform · Relatório de Sprint**

---

## Nota de Posicionamento Documental

Este relatório fecha a Sprint **IMP-203 — Supplier HTTP API**, a terceira etapa do Supplier Hub (Arquitetura ✅ ERP-001, Core ✅ IMP-201, Persistência ✅ IMP-202). Ela adiciona, exclusivamente ao pacote já existente `apps/api`, a camada de transporte HTTP sobre `SupplierManager` já aprovado — nenhuma alteração a `SupplierManager`, Services, Entities, Commands, Events, Policies, Validators, Factories, Repository Interfaces ou à Persistência (IMP-202). Nenhum Frontend, nenhum Workspace, nenhum DTO compartilhado com `apps/web`, nenhuma autenticação nova foi criada — `apps/web` não foi tocado.

---

## 1. Arquitetura Utilizada

Seguido, arquivo a arquivo, o mesmo padrão já estabelecido por `apps/api` para Business Profile, Branding, CRM (FUN-004) e IAM (FUN-100):

- **`dtos/supplier.dto.ts`** — interfaces `Request`/`Response` puras, nunca reexportando um tipo de `@abp/supplier-hub` diretamente, mesma disciplina de `crm.dto.ts`.
- **`mappers/supplier.mapper.ts`** — uma função `to{Entity}ResponseDto` por Entidade, convertendo `Date` → ISO 8601, mesma disciplina de `crm.mapper.ts`/`businessProfile.mapper.ts`.
- **`errors/mapSupplierError.ts`** — função de tradução de erro específica do domínio, delegando a `mapDomainError` (FUN-004) como fallback — mesmo mecanismo de `mapIamError.ts` (FUN-100). Ver Capítulo 6.
- **`routes/supplier.ts`** — um plugin Fastify (`FastifyPluginAsync`), cada handler seguindo rigorosamente `HTTP → DTO → SupplierManager → DTO → HTTP`, nenhuma lógica adicional.
- **Composição** — `server.ts` registra `supplierRoutes` na mesma lista de `fastify.register(...)`, sem alterar `managersPlugin` (`plugins/managers.ts`, intocado — `createManagerRegistry` já constrói `supplier` desde IMP-202).
- **OpenAPI** — `plugins/openapi.ts` ganhou a tag `supplier`; a documentação em `/documentation`/`/documentation/json` é gerada automaticamente por `@fastify/swagger` a partir do `schema` já declarado em cada rota, nunca escrita manualmente, per instrução explícita.

---

## 2. Endpoints Implementados

Onze endpoints — exatamente um por método público de `SupplierManager` (nove Commands mais `getSupplier`/`listActiveSuppliers`), nenhum inventado, nenhum omitido:

| Método | Rota | `SupplierManager` | Status de sucesso |
|---|---|---|---|
| POST | `/suppliers` | `registerSupplier` | 201 |
| GET | `/suppliers/:supplierId` | `getSupplier` | 200 (404 se ausente) |
| GET | `/suppliers/by-tenant/:tenantId` | `listActiveSuppliers` | 200 |
| PATCH | `/suppliers/:supplierId` | `updateSupplier` | 200 |
| POST | `/suppliers/:supplierId/disable` | `disableSupplier` | 200 |
| POST | `/suppliers/:supplierId/reactivate` | `reactivateSupplier` | 200 |
| POST | `/suppliers/:supplierId/contacts` | `addSupplierContact` | 201 |
| POST | `/supplier-catalog-items` | `registerSupplierCatalogItem` | 201 |
| PATCH | `/supplier-catalog-items/:catalogItemId` | `updateSupplierCatalogItem` | 200 |
| POST | `/supplier-contracts` | `createSupplierContract` | 201 |
| POST | `/supplier-performance-records` | `recordSupplierPerformance` | 201 |

`GET /suppliers/:supplierId` e `GET /suppliers/by-tenant/:tenantId` são Query, não Command — expostos porque são métodos públicos de `SupplierManager`, mesma leitura literal já aplicada a `businessProfileRoutes` (`findProfile`/`currentClassification`/`currentMaturity`/`currentStage`, também Query). `GET /suppliers/by-tenant/:tenantId` segue o padrão de rota `by-tenant/:tenantId` já existente em `businessProfile.ts` — decisão deliberada de não introduzir Querystring (`?tenantId=`), um estilo ainda ausente em toda a API, per Capítulo 5.

Nenhum método do Core não fez sentido como endpoint — os onze métodos públicos de `SupplierManager` mapeiam 1:1 para os onze endpoints acima, sem exceção a documentar.

---

## 3. Schemas OpenAPI

Cada rota declara `schema.tags`/`schema.summary`/`schema.body` (quando aplicável) diretamente no registro Fastify — `@fastify/swagger` já os consome automaticamente para gerar `/documentation/json`, sem nenhum passo manual adicional. Validação restrita a **formato, tipo e campo obrigatório**, nunca regra de negócio: `additionalProperties: false` em todo `body` (rejeita campo desconhecido, 400), `minLength: 1` para string obrigatória, `type: "integer", minimum: 0` para quantidade/prazo, `enum` para `SupplierContactRole`, `format: "date-time"` para toda data. Nenhuma verificação de duplicidade, de Fornecedor ativo, de transição de status ou de qualquer outra regra de domínio vive em nenhum schema — todas permanecem exclusivamente em `SupplierValidator`/`SupplierPolicy` (Core, intocados).

Testado explicitamente (`supplier.test.ts`, describe "Documentação OpenAPI") que `/documentation/json` expõe a tag `supplier` e os dez caminhos (`paths`) esperados — `@fastify/swagger` traduz a sintaxe de rota do Fastify (`:supplierId`) para a sintaxe OpenAPI (`{supplierId}`), confirmado pelo teste.

---

## 4. DTOs Utilizados

Ver `dtos/supplier.dto.ts` — dezesseis interfaces (oito de Request, oito de Response/auxiliar). Decisão de achatamento de Value Object de campo único: `TaxId` (`{ value: string }`) vira `taxId: string`; `PaymentTerms` (`{ dueInDays: number }`) vira `paymentTermsDueInDays: number` — nenhum DTO expõe a forma interna do Value Object. `Money` (`{ amount, currencyCode }`), por ter dois campos que sempre viajam juntos, permanece um objeto aninhado (`MoneyDto`) — única exceção deliberada, documentada no próprio arquivo.

---

## 5. Mapeamento HTTP

Todo handler segue `HTTP → DTO → SupplierManager → DTO → HTTP` sem exceção — nenhum handler contém `if`/regra de negócio além de tradução de forma (destructuring, `new Date(...)`, `.toISOString()`, envolver/desenvolver `TaxId`/`Money`/`PaymentTerms`). `GET /suppliers/by-tenant/:tenantId` foi a decisão de rota consciente contra usar Querystring — ver Capítulo 2.

---

## 6. Integração com `SupplierManager`

Nenhuma instanciação direta — toda rota acessa exclusivamente `fastify.managers.supplier`, decorado uma única vez por `managersPlugin` (`plugins/managers.ts`, intocado), que já constrói `SupplierManager` via `createManagerRegistry("real", handle)` desde IMP-202. Nenhuma dependência nova foi adicionada a `managers.ts`.

---

## 7. Integração com SQLite

`managersPlugin` já aplica `runMigrations(handle)` no boot do servidor, incluindo `0002_supplier_hub.sql` (IMP-202) — nenhuma alteração necessária. `testing/buildTestServer.ts` (intocado) já injeta um banco `:memory:` migrado por teste; todo teste desta Sprint exercita `fastify.inject()` contra esse banco real, nunca um mock — confirmado no Capítulo 11.

---

## 8. Divergência Encontrada e Corrigida (documentada, não corrigida silenciosamente em Core)

**A heurística de `mapDomainError` não reconhece duas mensagens reais de `SupplierDomainError`.** `InvalidTaxIdError` ("...não respeita o formato aceito...") e `InvalidMoneyError` ("Valor monetário inválido...") não contêm nenhum dos padrões já reconhecidos por `mapDomainError.ts` (`/não encontrad[oa]/`, `/já (existe|possui|está|foi)/`, `/precisa|deve ser|não pode|obrigat[óo]ri|inválid|.../`) — a palavra "inválido" aparece nessas mensagens apenas como raiz de "InvalidTaxIdError"/"InvalidMoneyError" no *nome da classe*, nunca no texto exato produzido (`error.message`), então cairiam silenciosamente em 500 (`InternalServerError`) se esta Sprint reaproveitasse apenas `mapDomainError` sem camada adicional — um defeito real de classificação HTTP, encontrado antes de qualquer endpoint ser testado manualmente, através da leitura cuidadosa de `SupplierDomainError.ts` (IMP-201) contra as expressões regulares de `mapDomainError.ts`.

**Correção — não em `mapDomainError.ts`.** Seguindo exatamente o precedente já estabelecido por `mapIamError.ts` (FUN-100, "nunca reaproveitada por nenhuma outra rota, para não arriscar reclassificar uma mensagem legítima de outro domínio"), foi criado `mapSupplierError.ts` — mapeia por `instanceof SupplierDomainError`/`error.code` (a hierarquia tipada real que só o Supplier Hub possui, único domínio desta plataforma cujo Core não lança `Error` puro) e delega a `mapDomainError` como fallback para qualquer erro não reconhecido. `mapDomainError.ts` permanece inteiramente intocado. Testado explicitamente (`mapSupplierError.test.ts`, "divergência corrigida") que as duas mensagens problemáticas agora produzem 422, nunca 500.

**Segunda divergência — encontrada por teste, não por leitura de código: `updateSupplier` sobrescrevia campo já existente com `undefined`.** O primeiro rascunho de `PATCH /suppliers/:supplierId` desestruturava o corpo da requisição e reconstruía um objeto sempre com as três chaves (`legalName`, `supplyCategory`, `taxId`), mesmo quando ausentes do JSON original — produzindo um objeto com chaves presentes e valor `undefined`. `SupplierService.update` (Core, intocado, e corretamente projetado) faz `{ ...existing, ...input }`, um padrão que pressupõe — corretamente — que uma chave ausente de `input` nunca aparece nele; uma chave presente com valor `undefined` sobrescreve o dado já existente. O teste de fluxo completo (`PATCH` enviando apenas `legalName`) expôs isso imediatamente como um 500 real (`Cannot read properties of undefined`, porque `taxId` do Supplier já existente virava `undefined`, e o Repository tentava ler `taxId.value`). **Corrigido na camada HTTP** (`routes/supplier.ts`), nunca em Core: o handler agora desestrutura por resto (`const { taxId, ...rest } = request.body`) e só adiciona a chave `taxId` ao objeto de entrada quando de fato presente — nenhuma chave `undefined` explícita é construída. Documentado inline no próprio handler.

Nenhuma das duas divergências exigiu Amendment — ambas foram resolvidas inteiramente dentro do escopo desta Sprint (camada HTTP), sem tocar Core, Persistência ou Arquitetura.

---

## 9. Decisões Tomadas

**`GET`/lista expostos mesmo sendo Query, não Command.** Já justificado no Capítulo 2 — mesma leitura literal de "método público do Manager" já aplicada a `businessProfileRoutes`.

**Rota `by-tenant/:tenantId`, não Querystring.** Preserva o único estilo de "filtro por parâmetro" já usado nesta API (`business-profiles/by-tenant/:tenantId`) — introduzir Querystring agora seria um padrão novo sem necessidade real.

**`Money` como único Value Object aninhado no DTO.** Documentado no próprio `supplier.dto.ts` — os demais (campo único) são achatados a primitivo.

**Erro de domínio mapeado por `code`, não por regex de mensagem.** Diferente de `mapIamError`/`mapDomainError` (que precisam de heurística porque os Managers correspondentes lançam `Error` puro), `SupplierManager` é o primeiro cujo Core (IMP-201) já lança uma hierarquia tipada real — `mapSupplierError` aproveita essa informação estruturada em vez de reintroduzir a mesma fragilidade de regex que já causou a primeira divergência deste relatório.

---

## 10. Limitações Encontradas

Nenhuma paginação em `GET /suppliers/by-tenant/:tenantId` — mesma limitação já presente em toda rota de listagem desta API (nenhuma tem paginação ainda); não introduzida nem corrigida por esta Sprint, por ser um padrão pré-existente, não uma decisão nova.

`recordSupplierPerformance` sempre retorna um array (um ou dois registros, per `SupplierPerformanceService.recordFromReceiving` já implementado em Core) — o endpoint reflete isso fielmente (`201` com um array no corpo), decisão herdada do Core, não desta Sprint.

---

## 11. Testes Criados

Três novos arquivos, 21 testes, 100% via `fastify.inject()` contra SQLite `:memory:` real — nenhum mock usado para validar integração, per instrução explícita:

| Arquivo | Cobertura |
|---|---|
| `routes/supplier.test.ts` | Fluxo completo (registro → consulta → listagem → atualização → desabilitar → reativar → contato); fluxo de Catalog Item/Contract/Performance Record; 400 (schema); 404 (não encontrado, duas rotas); 409 (duplicidade, transição inválida); 422 (TaxId inválido, Money inválido); persistência real entre chamadas; documentação OpenAPI (tag e dez `paths`) |
| `errors/mapSupplierError.test.ts` | As seis subclasses de `SupplierDomainError` mapeadas para o código HTTP correto; `HttpError` já construído passa direto; erro não relacionado delega a `mapDomainError`; erro desconhecido cai em 500 |

Todo endpoint tem cobertura de sucesso e de ao menos um caso de erro mapeado — mesma amplitude já exigida pelos relatórios anteriores desta série (IMP-201/IMP-202).

---

## 12. Cobertura Obtida

`pnpm typecheck`, `pnpm build` e `pnpm lint` verdes. `pnpm test` executado três vezes na raiz do monorepo, como exigido — **as três execuções passaram integralmente, sem nenhum flake** (157 arquivos de teste, 634 testes em cada uma das três rodadas). O flake intermitente e pré-existente já documentado em `IMP_202_SUPPLIER_PERSISTENCE_REPORT.md` (`apps/web/src/app/router/routes.test.tsx`, nunca tocado por nenhuma Sprint do Supplier Hub) não se manifestou em nenhuma das três execuções desta Sprint — registrado aqui apenas para continuidade histórica, não como um problema desta Sprint.

---

## 13. Possíveis Amendments

Nenhum. As duas divergências encontradas (Capítulo 8) foram resolvidas inteiramente na camada HTTP, sem exigir mudança em nenhum documento Frozen/Official nem em nenhum Core/Persistência já aprovado.

---

## 14. Confirmação — Supplier Hub na Documentação OpenAPI

Confirmado por teste automatizado (`supplier.test.ts`, describe "Documentação OpenAPI"): `GET /documentation/json` inclui a tag `supplier` e os dez caminhos de rota únicos (`/suppliers`, `/suppliers/{supplierId}`, `/suppliers/by-tenant/{tenantId}`, `/suppliers/{supplierId}/disable`, `/suppliers/{supplierId}/reactivate`, `/suppliers/{supplierId}/contacts`, `/supplier-catalog-items`, `/supplier-catalog-items/{catalogItemId}`, `/supplier-contracts`, `/supplier-performance-records`); `GET /documentation` (Swagger UI) serve a mesma documentação navegável, herdada sem alteração de `openapiPlugin`.

---

## 15. Conclusão

O Supplier Hub agora está exposto por completo via HTTP, com validação estritamente de schema, mapeamento de erro específico do domínio (a primeira vez nesta plataforma que um Manager lança uma hierarquia de exceção tipada, tratada corretamente sem reintroduzir a fragilidade de regex), zero regra de negócio na camada de transporte, e zero alteração a Core ou Persistência. Duas divergências reais foram encontradas e corrigidas dentro do escopo permitido, documentadas com total transparência. O ciclo **Arquitetura → Core → Persistência → HTTP API** está validado de ponta a ponta para o Supplier Hub — pronto para a próxima etapa (Frontend/Workspace), repetindo o mesmo ciclo já comprovado pelos módulos da Fase 1.
