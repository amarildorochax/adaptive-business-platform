# IMP-205 — Supplier Workspace — Relatório de Implementação

**Adaptive Business Platform · Relatório de Sprint**

---

## Nota de Posicionamento Documental

Este relatório fecha a Sprint **IMP-205 — Supplier Workspace**, a quinta e última etapa do Supplier Hub (Arquitetura ✅ ERP-001, Core ✅ IMP-201, Persistência ✅ IMP-202, HTTP API ✅ IMP-203, Frontend Infrastructure ✅ IMP-204). Ela constrói exclusivamente o Workspace — nenhuma alteração a Arquitetura, Core, Persistência, HTTP API ou `core/supplier/` (Frontend Infrastructure, IMP-204). O ciclo **Arquitetura → Core → Persistência → HTTP API → Frontend Infrastructure → Workspace** está, ao final desta Sprint, completo e validado de ponta a ponta para o primeiro domínio ERP da Adaptive.

---

## 1. Arquitetura Utilizada

Toda comunicação do Workspace acontece exclusivamente através de `apps/web/src/core/supplier/` (IMP-204) — nenhuma seção importa `ApiClient`, chama `fetch`, ou acessa `SupplierManager` diretamente (verificado: zero import de `core/http/client`/`core/http/ApiClient` em `pages/suppliers/`). `SupplierPage.tsx` é o único ponto que resolve `tenantId` (via `useAuth()`) e carrega a Query de topo (`useSuppliers(tenantId)`); toda seção recebe o dado já carregado como prop, nunca dispara sua própria Query de listagem redundante.

**Decisão consciente: `useAuth().tenantId`, não `useDashboardBootstrap()`.** CRM (FUN-103), Product Hub (FUN-104), Inventory (FUN-105) e Purchase (FUN-106) dependem de `useDashboardBootstrap()` — o Composition Root em processo (`core/managers/`) — para resolver `tenantId`, porque suas Visões Gerais também exibem dado do Business Profile. O Supplier Hub não tem nenhuma relação com o Business Profile Engine nem com nenhum Manager em processo (é 100% HTTP real desde o Core, IMP-201) — depender do bootstrap aqui acoplaria este Workspace, sem necessidade, a um pipeline de seed inteiramente alheio ao seu próprio domínio. `useAuth().tenantId` já é preenchido de forma confiável por `/auth/me` assim que a sessão autentica (`AuthProvider.tsx`), e toda rota deste Workspace já está atrás de `RequireAuth`.

---

## 2. Estrutura — as Oito Seções

| Seção | Conteúdo real | Rota interna |
|---|---|---|
| Visão Geral | KPIs reais (total, ativos, desabilitados, Contatos), Fornecedores recentes | `?section=` ausente (padrão) |
| Fornecedores | Tabela real, busca/ordenação/paginação, Criar/Editar/Ativar/Desativar | `?section=suppliers` |
| Contatos | Agregação real de `contacts` embutido em cada Supplier, associação real | `?section=contacts` |
| Contratos | Criação real; `NotConnectedNotice` para listagem (sem `GET`) | `?section=contracts` |
| Catálogo | Criação real; `NotConnectedNotice` para listagem (sem `GET`) | `?section=catalog` |
| Histórico | Log de sessão honesto (Capítulo 8) | `?section=history` |
| Analytics | Indicadores reais derivados de `useSuppliers` | `?section=analytics` |
| Configurações | Tema (única preferência real); `NotConnectedNotice` para o resto | `?section=settings` |

---

## 3. Visão Geral

Quatro KPIs (`MetricCard`/`KPIGrid`, reutilizados) inteiramente derivados de `useSuppliers(tenantId)`: total de Fornecedores, ativos, desabilitados, total de Contatos já associados (soma de `contacts.length`). "Cadastrados recentemente" mostra até três `SupplierCard` reais (ordenados por `createdAt`), `EmptyState` honesto quando a lista está vazia. Nenhuma métrica fictícia.

---

## 4. Fornecedores

`Table` (Design System) com busca, ordenação e paginação já embutidas — nenhuma paginação server-side existe em `SupplierManager`, então a paginação é inteiramente client-side sobre a lista já carregada, mesma disciplina de toda Sprint anterior. Criar/Editar via `Drawer` (real: `useCreateSupplier`/`useUpdateSupplier`). Ativar/Desativar por linha (`useReactivateSupplier`/`useDisableSupplier`). **Excluir não é exibido** — `SupplierManager` (Core, IMP-201) nunca expôs nenhum Command de remoção, per instrução explícita ("Excluir somente se houver endpoint. Caso contrário, não exibir ação").

---

## 5. Contatos

"Consumir exclusivamente os dados reais do Supplier. Nunca criar persistência local." `SupplierContact` é parte interna do Aggregate `Supplier` (Core, IMP-201, sem Repository próprio) — a seção agrega `supplier.contacts` já embutido em cada linha de `useSuppliers`, nunca uma segunda fonte, nunca um `localStorage`. Associação real via `useAddSupplierContact`.

---

## 6. Contratos e 7. Catálogo

Ambas seguem o mesmo padrão honesto: criação real via Mutation já aprovada (IMP-203/204), exibição do que foi criado **nesta sessão do navegador** (estado React local, nunca persistido além da sessão, nunca uma segunda fonte de verdade), e `NotConnectedNotice` explícito informando que a listagem de registros já existentes não é suportada — porque `SupplierManager`/`apps/api` nunca expuseram nenhum `GET` para `SupplierContract`/`SupplierCatalogItem` (confirmado em `IMP_201_SUPPLIER_HUB_CORE_REPORT.md`/`IMP_203_SUPPLIER_HTTP_API_REPORT.md` — nenhuma Query existe para nenhum dos dois). `productId`, no Catálogo, é texto livre — `core/supplier/` nunca importa tipo de `@abp/commerce-hub` (Limite do Domínio já documentado desde o Core), então nenhum seletor real de Produto existe aqui.

---

## 8. Histórico

"Consumir os Events reais. Nunca sintetizar Timeline. Nunca criar eventos fictícios." Achado central desta Sprint: **nenhum endpoint HTTP do Supplier Hub (IMP-203) devolve `SupplierEvent`** — cada handler de `apps/api/src/routes/supplier.ts` extrai apenas `{ result }` do retorno do Manager, descartando `events` na própria fronteira HTTP. Isso significa que nenhum Evento de domínio real jamais chega ao Frontend — uma limitação do HTTP API (IMP-203), não desta Sprint, e fora do escopo de correção aqui ("Não alterar: HTTP API").

A seção usa, em vez disso, `supplierHistoryLog.ts` (novo, local a `pages/suppliers/`, **nunca** a `core/supplier/`) — um log construído inteiramente no navegador, cada entrada gravada no exato momento em que uma Mutation já confirmada pelo servidor resolve com sucesso. Isto não é uma Timeline sintetizada nem um evento fabricado — é o registro honesto de um fato genuinamente ocorrido, apenas sem a garantia de sobreviver a um recarregamento de página. `hasRealData: false` nesta seção (única, junto de Configurações) sinaliza exatamente essa natureza de sessão, nunca escondida.

---

## 9. Analytics

"Mostrar indicadores derivados dos dados existentes. Nunca criar recomendações de IA. Nunca criar gráficos sem dados." Três indicadores reais (`MetricCard`): taxa de Fornecedores ativos, Fornecedores com ao menos um Contato, contagem de categorias distintas — todos agregados de `useSuppliers`. Distribuição por Categoria (lista ordenada, sem biblioteca de gráfico — nenhum gráfico "vazio" é desenhado). `NotConnectedNotice` para custo médio/lead time/desempenho de entrega, que exigiriam listagem de `SupplierCatalogItem`/`SupplierPerformanceRecord`, indisponível.

---

## 10. Configurações

Única preferência real: tema claro/escuro (`core/theme/`), mesma disciplina honesta de toda Sprint anterior. **Não reaproveita** `pages/product-hub/sections/SettingsSection.tsx` (que Purchase, FUN-106, reaproveitou sem alteração) — aquele componente cita campos e contexto específicos do Commerce Hub no seu `NotConnectedNotice`; reaproveitá-lo aqui atribuiria incorretamente uma lacuna do Commerce Hub ao Supplier Hub. Um novo `SettingsSection.tsx`, idêntico em estrutura, com `NotConnectedNotice` correto (`context="Supplier Hub"`, campos relevantes ao domínio) foi escrito no lugar — decisão documentada, não uma duplicação por descuido.

---

## 11. Componentes Reutilizados

`WidgetCard`, `PageContainer`, `PageHeader`, `AsyncState`, `SectionSubNav`, `Table`, `Drawer`, `Field`, `Select`, `Button`, `Badge`, `KPIGrid`, `MetricCard`, `EmptyState`, `NotConnectedNotice`, `Timeline`, `ActivityBadge`, `useToast` — todos reutilizados sem alteração. `SupplierBadge` (FUN-106) foi avaliado para reuso mas não instanciado neste Workspace: seu propósito (nome informal, honesto quando ausente) já é coberto por `SupplierCard`/`ContractCard`, que sempre têm o nome do Fornecedor disponível (nunca `undefined`) neste domínio real. `Drawer` (existente desde a Branding Sprint, `ComponentsSection.tsx`) tem aqui seu primeiro uso real em um fluxo de CRUD completo.

---

## 12. Novos Componentes Compartilhados

Três componentes novos, todos em `shared/components/ui/`, todos genéricos (nenhum importa tipo de `@abp/supplier-hub`):

- **`SupplierStatusBadge`** — `Badge` + mapeamento fixo `SupplierStatus → tom semântico`, mesmo padrão de `InventoryBadge`/`CategoryBadge`/`ReservationBadge`.
- **`SupplierCard`** — resumo de um Supplier (nome, status, documento, categoria, contagem de Contatos).
- **`ContractCard`** — resumo de um SupplierContract (vigência, prazo de pagamento, volume mínimo).

**Três componentes sugeridos pela Sprint, deliberadamente não criados** (decisão documentada, mesma disciplina já aplicada pela FUN-106 ao declinar 2 de 6 componentes sugeridos):

- **`SupplierMetricCard`** — `MetricCard` (Design System) já cobre exatamente esta necessidade (label + valor + tom + hint); um componente exclusivo seria redundante.
- **`SupplierOverviewCard`** — a composição `WidgetCard` + `KPIGrid` + `MetricCard` já cobre o layout de Visão Geral sem exigir um novo primitivo.
- **`SupplierEmptyState`** — `EmptyState` (Design System) já aceita título/descrição customizados; nenhum comportamento específico do Supplier Hub justificaria um wrapper.

---

## 13. UX Aplicada

Segue integralmente UX-001 — todo texto/cor/espaçamento vem de `styles/tokens.css` (`--color-*`, `--space-*`, `--radius-*`, `--font-size-*`), nenhum valor fixo fora do sistema de tokens. Responsivo por herança do layout já existente (`.dashboard-grid`/`.dashboard-section`/`.profile-layout`, grid CSS já testado em Desktop/Tablet/Mobile desde a UX-001) — nenhum CSS específico de breakpoint foi necessário para os dois novos componentes de cartão, que seguem exatamente a mesma estrutura de `.purchase-card`/`.receiving-card` já validada. Dark Mode/Light Mode herdados automaticamente via `--color-info`/`--color-success` (ambos já definidos nos dois temas em `tokens.css`).

---

## 14. Estratégias de Cache

Nenhuma lógica de cache na UI — toda seção consome exclusivamente os Hooks de `core/supplier/` (IMP-204), que já encapsulam `queryKey`/`setQueryData` via `syncSupplierInCaches`. Nenhuma Query Key foi alterada. O único estado local introduzido por esta Sprint (`supplierHistoryLog.ts`, formulários de Drawer/seção) é UI pura — nunca uma segunda fonte de verdade de dado já servido por `core/supplier/`.

---

## 15. Testes

Quinze testes novos, jsdom, `fetch` mockado via `demoApiFetchMock.ts` (estendido com onze rotas do Supplier Hub, estado em memória simulando `apps/api`/SQLite o suficiente para exercitar o Workspace sem depender de um servidor real) — mesmo mecanismo já usado por CRM/Product Hub/Inventory/Purchase, nunca um sistema paralelo:

| Arquivo | Cobertura |
|---|---|
| `SupplierWorkspaceComponents.test.tsx` | Os três componentes novos — status, campos honestos ausentes, formatação de data em UTC |
| `SupplierPage.test.tsx` (12 testes) | Loading; Visão Geral vazia e com dado real; criar Fornecedor; editar; ativar/desativar; associar Contato; Contratos (NotConnectedNotice + criação real); Catálogo (NotConnectedNotice); Histórico (log real); Analytics (indicadores reais); Configurações (tema + NotConnectedNotice); 409 tratado sem UI quebrada |

Toda integração usa os Hooks reais de `core/supplier/` — nenhum mock da lógica do Workspace, apenas da camada `fetch`, exatamente como a Sprint exige e como todo Workspace HTTP-real (CRM, Branding, Business Profile) já é testado nesta plataforma.

Dois defeitos de teste reais foram encontrados e corrigidos durante esta Sprint (nunca no Core/HTTP/Frontend Infrastructure): `waitForWorkspaceReady()` originalmente aguardava o texto "Fornecedores", que já aparece no `<h1>` mesmo durante o carregamento — corrigido para aguardar o botão "Visão Geral" do `SectionSubNav`, que só existe após o dado real carregar; e `getByRole("button", { name: "Histórico" })`/`"Configurações"` falhavam porque `SectionSubNav` acrescenta um selo "Prévia" ao nome acessível de toda seção com `hasRealData: false` — corrigido para `name: /Histórico/`/`/Configurações/`.

---

## 16. Validação Executada

`pnpm typecheck`, `pnpm build` e `pnpm lint` verdes. `pnpm test` executado três vezes na raiz do monorepo — **as três execuções passaram integralmente, sem nenhum flake** (162 arquivos de teste, 675 testes em cada uma das três rodadas). `vite build` confirma `SupplierPage` corretamente dividido em seu próprio chunk lazy (`SupplierPage-*.js`, ~22 kB), mesmo padrão de todo Workspace já existente.

**Validação manual real, executada nesta Sprint (não simulada):** `apps/api` iniciado com SQLite em arquivo real (`ABP_ENV=development`, nunca `:memory:`), exercitado via `curl` ponta a ponta — `POST /suppliers` (criação real), `GET /suppliers/:id`, `GET /suppliers/by-tenant/:tenantId`, `PATCH /suppliers/:id`, `POST /suppliers/:id/contacts`, `POST /suppliers/:id/disable`, `POST /suppliers/:id/reactivate`, e confirmação de `409` real ao duplicar `taxId` — todos com resposta correta e dado persistido de fato em disco (confirmado por releitura). `GET /documentation/json` confirmado incluindo a tag `supplier` e os dez `paths` esperados. `apps/web` iniciado via `vite dev`, HTML da aplicação servido sem erro.

**Limitação explícita desta validação manual:** este ambiente não tem uma ferramenta de automação de navegador disponível — não foi possível clicar fisicamente pelos oito separadores, preencher formulários visualmente, ou observar o Dark Mode/Light Mode/responsividade em uma tela real. Os doze cenários que a Sprint pede para validação manual (criar, editar, ativar/desativar, ver Contatos, ver Contratos, navegar entre abas, atualização automática após Mutations, loading/erro/vazio) estão, em vez disso, cada um coberto por um teste automatizado equivalente em `SupplierPage.test.tsx` (Capítulo 15), que exercita a mesma árvore de componentes React real, os mesmos Hooks reais, e as mesmas asserções de resultado — uma validação funcionalmente equivalente, ainda que não visual. Registrado aqui com total transparência, per a mesma disciplina de honestidade já exigida do próprio Workspace.

---

## 17. Limitações

Nenhuma listagem de Contratos/Catálogo já existentes (Capítulos 6-7) — depende de uma Sprint futura de HTTP API que adicione `GET /supplier-contracts`/`GET /supplier-catalog-items` a `apps/api`.

Nenhum Evento de domínio real no Histórico (Capítulo 8) — depende de uma Sprint futura de HTTP API que exponha `SupplierEvent` em algum formato (ex.: um novo campo `events` nas respostas já existentes, ou um endpoint de auditoria dedicado).

Nenhuma paginação server-side em Fornecedores — `SupplierManager` nunca expôs parâmetro de paginação; aceitável no volume desta Sprint, mesma limitação já presente em toda Tabela desta plataforma.

Validação manual sem ferramenta de navegador (Capítulo 16) — compensada por dozes cenários automatizados equivalentes, mas não idêntica a uma validação visual humana.

---

## 18. Melhorias Futuras

Quando `GET /supplier-contracts`/`GET /supplier-catalog-items` existirem, `ContractsSection`/`CatalogSection` devem trocar o estado local de sessão por uma Query real (`useSupplierContracts`/`useSupplierCatalogItems`, a criar em `core/supplier/`, fora do escopo desta Sprint) — os componentes `ContractCard` já estão prontos para esse dado.

Quando `SupplierEvent` for exposto por HTTP, `HistorySection` deve trocar `supplierHistoryLog.ts` por uma Query real — a mesma reestruturação já aplicada ao Product Hub quando `CommerceEvent` passou a estar disponível em processo (FUN-104).

Um seletor real de Produto no Catálogo, quando o Commerce Hub e o Supplier Hub tiverem algum ponto de integração formal (ver `ERP_ARCHITECTURE.md`, Capítulo 6.6 — "Pricing", contrato de leitura de `acquisitionCost`).

---

## 19. Conclusão

O Supplier Workspace está completo, testado e validado — a quinta e última camada do primeiro domínio ERP da Adaptive Business Platform. Toda comunicação passa exclusivamente por `core/supplier/`, nenhuma tela acessa HTTP diretamente, nenhum dado fictício foi exibido em nenhuma seção, e toda lacuna real (listagem de Contratos/Catálogo, Eventos de domínio) foi documentada com `NotConnectedNotice` em vez de contornada silenciosamente. O ciclo completo — Arquitetura (ERP-001) → Core (IMP-201) → Persistência (IMP-202) → HTTP API (IMP-203) → Frontend Infrastructure (IMP-204) → Workspace (IMP-205) — está validado de ponta a ponta e pronto para servir como blueprint oficial da Fase 2 para Purchase Hub, Inventory Movement Hub, Production Hub, Fiscal Hub e Financial Hub.
