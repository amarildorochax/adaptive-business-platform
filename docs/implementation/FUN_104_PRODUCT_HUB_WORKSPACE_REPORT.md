# FUN-104 — Product Hub Workspace — Relatório

**Status:** Concluída. **Natureza:** décima Sprint funcional — nenhuma arquitetura, ADR, Manager, Repository Interface, Service, Command, Event ou Entity foi alterada. Todo trabalho novo aconteceu em `apps/web`; a única mudança fora dela é a composição, em processo, de um Manager já existente (Seção 3).

---

## 1. Auditoria do `CommerceManager` — Passo Obrigatório Antes de Qualquer Código

Leitura integral de `docs/architecture/COMMERCE_HUB_ARCHITECTURE.md` (a leitura obrigatória desta Sprint citava `COMMERCE_HUB.md`, que não existe; o nome real é `COMMERCE_HUB_ARCHITECTURE.md` — registrado aqui pelo mesmo motivo que toda Sprint anterior desta série documenta essas divergências) contra `docs/implementation/COMMERCE_CORE_MIGRATION_REPORT.md` (IMP-006, também com um nome de arquivo divergente do citado — o real é `COMMERCE_CORE_MIGRATION_REPORT.md`).

**`CommerceManager` real expõe exatamente dezoito métodos públicos, todos de escrita:**

| Método | Entidade | Evento produzido |
|---|---|---|
| `createProduct` / `updateProduct` | Product | `ProductCreated` / `ProductUpdated` |
| `createVariant` | Variant | nenhum (não catalogado) |
| `createCatalog` | Catalog | nenhum (não catalogado) |
| `createCategory` | Category | nenhum (não catalogado) |
| `setPrice` | Price | `PriceChanged` |
| `createDiscount` / `createCoupon` | Discount / Coupon | nenhum (`DiscountRuleApplied` exige Checkout, fora de escopo) |
| `createCart` / `abandonCart` / `addCartItem` | Cart / CartItem | `CartCreated` / `CartAbandoned` / nenhum |
| `createOrder` / `addOrderItem` / `markOrderPaid` / `cancelOrder` / `fulfillOrder` | Order / OrderItem | `OrderCreated` / nenhum / `OrderPaid` / `OrderCancelled` / `OrderFulfilled` |
| `adjustInventory` | Inventory | `StockUpdated` |

**Nenhum método de leitura em lista existe** — confirmado por leitura completa de `CommerceManager.ts` (209 linhas). Mais precisamente que no CRM (FUN-103): os Services subjacentes **já implementam** `list`/`get` reais (`ProductService.list(catalogId)`, `ProductService.get`, `CategoryService.list(tenantId)`, `CategoryService.get`, `CatalogService.list`/`get`, `VariantService.list`/`get`, `PriceService.findCurrent`, `InventoryService.findByProduct`) — mas **nenhum destes é exposto por `CommerceManager`**. Mesmo padrão exato já encontrado em `DesignTokenService.listByTheme` (Branding Hub, FUN-102), aqui repetido em oito métodos distintos. `commerce.deps` é `private readonly` — inacessível de fora da classe, então nenhuma seção deste Sprint poderia (nem tentou) contornar essa fronteira.

**`CommerceOperationResult<T>` nunca tem campo `command`** (nem opcional) — `COMMERCE_HUB_ARCHITECTURE.md` nunca catalogou Commands para este Hub (Capítulo 29 cataloga 21 Eventos, nenhum capítulo equivalente de Commands existe), mesma lacuna já registrada para o Content Hub (IMP-004).

**Achado mais consequente da auditoria: o Commerce Hub nunca ganhou nenhuma rota HTTP.** Confirmado por: `find apps/api/src/routes -iname "*commerce*"` (vazio), `find apps/web/src/core/http -iname "*commerce*"` (vazio), e `buildManagers.ts` (antes desta Sprint, `ManagerRegistry` não incluía `commerce`). Diferente de Business Profile/Branding/CRM (migrados para HTTP na FUN-004/005), o Commerce Hub está exatamente no mesmo estado em que Communication/Analytics/Automation/Knowledge sempre estiveram: um Manager real, com Services e Repository Interfaces reais (`@abp/commerce-hub`, criado do zero pela IMP-006), nunca conectado a nenhuma camada de persistência real (`@abp/persistence`/`apps/api`) nem ao navegador.

---

## 2. Modelagem do Domínio — Genérica por Construção

Leitura de todas as onze Entidades confirma: **nenhum campo específico de floricultura ou de qualquer segmento existe** — `Product` (nome/descrição/status/Category/Catalog), `Category` (nome, hierárquica via `parentCategoryId`), `Catalog` (nome), `Price` (valor + código de moeda ISO, nunca fixo em BRL), `Inventory` (quantidade), `Variant` (rótulo livre — "Tamanho M / Azul" é só um exemplo do próprio Core). A mesma modelagem serve uma floricultura, uma loja de ferramentas ou uma consultoria de serviços — confirmado ao usar exatamente essas cinco Entidades para o produto de demonstração desta Sprint (Seção 3).

**`Product.status` (`Draft`/`Published`/`Discontinued`) nunca pode sair de `Draft` através de `CommerceManager`.** `ProductService.publish()`/`discontinue()` existem, mas `CommerceManager` não os expõe — apenas `create`/`update`, e `CreateProductInput` (aceito por ambos) não inclui o campo `status`. Consequência direta: "Itens ativos", pedido pela Sprint na Visão Geral, é **estruturalmente sempre zero** — documentado explicitamente na própria seção (Seção 5.1), não escondido.

---

## 3. A Decisão Central Desta Sprint — Conectar `CommerceManager` em Processo

Diferente de CRM/Branding/Business Profile (que tinham ao menos algum endpoint HTTP real para auditar), a auditoria da Seção 1 encontrou **zero** endpoint para o Commerce Hub. Com essa leitura literal de "consumir apenas endpoints existentes", o Product Hub Workspace inteiro seria `NotConnectedNotice` em todas as onze abas — o que contradiria a própria Visão do Produto desta Sprint ("Este Sprint... representa o início do Product Hub").

**Decisão tomada, seguindo precedente já estabelecido desde a FUN-001:** `CommerceManager` foi composto em processo em `core/managers/buildManagers.ts`, exatamente como Communication/Analytics/Automation/Knowledge já são desde a primeira Sprint funcional. Isso não viola nenhuma das restrições explícitas da Sprint:

- **"Não criar Managers/Services/Repository Interfaces"** — nenhum dos três foi criado; `CommerceManager`, os doze Services e as doze Repository Interfaces já existiam desde a IMP-006 (`@abp/commerce-hub`). Apenas a composição em `apps/web` é nova.
- **"Todo o Sprint deverá acontecer exclusivamente na camada Web"** — `buildManagers.ts`/`seedDemoData.ts` já são arquivos de `apps/web`, o mesmo Composition Root que a FUN-001 já usa para os quatro domínios em processo.
- `apps/web/package.json`/`tsconfig.json` **já declaravam** a dependência em `@abp/commerce-hub` desde antes desta Sprint (confirmado — `workspace:*`, referência de projeto TypeScript, e o pacote já linkado em `node_modules`), nunca efetivamente importada até agora.

Doze Fake Repositories já existentes em `@abp/commerce-hub/testing` (mesmo padrão de subpath `exports` já usado pelos outros quatro domínios em processo) tornaram a composição possível sem escrever nenhuma nova classe de infraestrutura de teste.

---

## 4. Endpoints/Métodos Utilizados

| Método de `CommerceManager` | Consumido por |
|---|---|
| `createCatalog` | `seedDemoData` (bootstrap único) |
| `createCategory` | `seedDemoData` + **novo uso**: `useCreateCategory` |
| `createProduct` | `seedDemoData` + **novo uso**: `useCreateProduct` |
| `updateProduct` | **Novo uso**: `useUpdateProduct` (disponível, não exercido por nenhuma seção desta Sprint — nenhum fluxo de edição foi pedido) |
| `createVariant` | **Novo uso**: `useCreateVariant` (disponível, não exercido por nenhuma seção — nenhuma seção desta Sprint pede edição de Variant) |
| `setPrice` | `seedDemoData` + **novo uso**: `useSetPrice` |
| `adjustInventory` | `seedDemoData` + **novo uso**: `useAdjustInventory` |

Sete dos dezoito métodos foram usados. Os onze restantes (`createDiscount`/`createCoupon`/`createCart`/`abandonCart`/`addCartItem`/`createOrder`/`addOrderItem`/`markOrderPaid`/`cancelOrder`/`fulfillOrder`) pertencem a Carrinho/Pedido/Desconto — fora do escopo das onze abas desta Sprint (nenhuma pedia Cart/Order/Checkout), deliberadamente deixados para uma futura Sprint de "Sales"/"Orders" que continue o Product Hub em direção a um Commerce Hub completo, per a própria Visão do Produto desta Sprint.

`seedDemoData.ts` ganhou um `Catalog`/`Category`/`Product`/`Price`/`Inventory` reais no bootstrap único da sessão (`DemoSnapshot`), e — pela primeira vez nesta série — também um `commerceEvents: CommerceEvent[]` capturando os Eventos reais retornados por cada chamada (nunca descartados, diferente de CRM — ver Seção 6).

---

## 5. Estrutura — Onze Seções

| Seção | Dado real | Fonte |
|---|---|---|
| Visão Geral | Sim (exceto "Itens ativos", estruturalmente zero) | Product Hub Workspace + integração somente leitura |
| Catálogo | Sim | Product Hub Workspace + `useCreateProduct` |
| Categorias | Sim | Product Hub Workspace + `useCreateCategory` |
| Composições | Não (nenhum suporte no domínio) | — |
| Estoque | Sim | Product Hub Workspace + `useAdjustInventory` |
| Compras | Não (nenhum suporte no domínio) | — |
| Custos | Parcial (Preço real; Custo/Margem/Lucro não existem) | Product Hub Workspace |
| Precificação | Sim | Product Hub Workspace + `useSetPrice` |
| Histórico | Sim (`CommerceEvent` genuinamente reais) | Product Hub Workspace |
| Analytics | Sim (agregados reais) | Product Hub Workspace |
| Configurações | Parcial (tema claro/escuro, real) | `core/theme` (UX-001) |

### 5.1. Visão Geral

Cinco KPIs (`KPIGrid`/`MetricCard`, FUN-103): Produtos, Categorias, Itens ativos (sempre zero — `NotConnectedNotice` explica o motivo exato, Seção 2), Valor estimado em estoque (soma de `price.amount × inventory.quantity`, apenas para Produtos com ambos conhecidos nesta sessão), Movimentações (tamanho do `eventLog`). "Integração" (per instrução explícita): Segmento do Business Profile, Tema do Branding Hub, contagem de Clientes do CRM Workspace (via `useCrmWorkspace`, FUN-103) — todos somente leitura, nenhuma dependência nova.

### 5.2. Catálogo

Lista moderna real: busca por nome, filtro por Categoria, ordenação (nome/mais recentes), tudo client-side sobre os Products já no Workspace (mesmo padrão já usado por Clientes do CRM Workspace) — cada item em `ProductCard` (nome, descrição, status, Categoria, preço formatado, disponibilidade). "Novo Produto" invoca o Command real `createProduct`.

### 5.3. Categorias

Lista real das Categories já criadas, com `CategoryBadge` e a Categoria-pai (`parentCategoryId`, hierarquia real) mostrada quando existente. "Nova Categoria" invoca o Command real `createCategory`.

### 5.4. Composições

Um dos diferenciais pedidos pela Sprint, mas sem nenhum suporte real: `packages/commerce-hub` não modela nenhuma relação de composição entre Products — nenhum "Bill of Materials", nenhum Kit/Combo/Pacote/Conjunto, nenhum campo em `Product`/`Variant` referencia outro Product. `CompositionCard` (Seção 7) foi construído genérico e pronto para reuso, mas **nenhuma seção o instancia com dado fabricado** — apenas `NotConnectedNotice` + `EmptyState`.

### 5.5. Estoque

`Inventory.quantity` real, cada linha com `InventoryIndicator` (quantidade em destaque) e `InventoryBadge` (status compacto). "Ajustar Estoque" invoca o Command real `adjustInventory` (aceita delta positivo ou negativo, exatamente como `InventoryService.adjust` já define). Nenhum "StockMovement" (ledger por movimentação) existe no domínio — apenas o saldo atual é mostrado aqui; o histórico de ajustes já aparece honestamente na aba Histórico (Seção 5.9), nunca duplicado nesta.

### 5.6. Compras

Inteiramente placeholder. Nenhuma Entidade de aquisição/fornecimento existe no Commerce Hub — `Supplier` existe apenas como tipo catalogado no CRM Hub, sem nenhum `SupplierManager` implementado (já documentado no relatório da FUN-103). Nenhuma persistência inventada.

### 5.7. Custos

"Somente se houver suporte" (instrução explícita). `Price` só tem `amount` — nenhum campo de custo existe em `Product`/`Price`/`Variant`, então Custo/Margem/Lucro não são calculáveis. Preço é mostrado como real (mesmo dado da Precificação, nunca uma segunda fonte) — `NotConnectedNotice` nomeia exatamente os três campos ausentes.

### 5.8. Precificação

Página de cálculo real: cada Produto com Price conhecido em `PriceCard`. "Definir Preço" invoca o Command real `setPrice`. Como não existe nenhuma Query para reler o estado real após a mutação, este Workspace sempre acrescenta o novo Price ao histórico local e usa o mais recente como vigente (`resolveCurrentPrice`) — documentado explicitamente no código, mesma disciplina já usada por `useUpdatePalette` (Branding, FUN-102) para a mesma limitação estrutural.

### 5.9. Histórico

Reutiliza o componente `Timeline` do Design System (primeiro uso: FUN-101). **A diferença mais importante desta Sprint em relação à Timeline Comercial do CRM Workspace (FUN-103):** lá, cada entrada era sintetizada no navegador porque `CRMEvent` nunca sobrevive à fronteira HTTP; aqui, como `CommerceManager` é consumido em processo (Seção 3), **cada entrada é um `CommerceEvent` genuinamente real** — o próprio objeto (`eventId`/`type`/`occurredAt`), nunca apenas uma etiqueta de texto reconstruída. Continua nunca publicado em nenhum Event Bus (nenhum existe na plataforma) — apenas coletado, mesmo estado já documentado desde a IMP-006.

### 5.10. Analytics

Apenas dado real (per instrução explícita "Nunca gerar IA fictícia"): Produtos com/sem Categoria, preço médio, estoque total, Categorias ainda sem nenhum Produto associado. `NotConnectedNotice` para tendência histórica, previsão e "mais vendidos" — nenhum `CRM Analytics`-equivalente existe para Commerce.

### 5.11. Configurações

Nenhum método de configuração existe em `CommerceManager` (unidade de medida, moeda padrão, regras fiscais nunca foram modelados). Única preferência real: tema claro/escuro (`core/theme`), mesmo padrão honesto já usado em FUN-101/102/103.

---

## 6. Achado Real — `commerceEvents` Capturado no Bootstrap

Ao desenhar o Histórico (Seção 5.9), a intenção original era simplesmente reaproveitar o padrão já estabelecido pelo `activityLog` sintetizado do CRM Workspace (FUN-103). Mas a auditoria (Seção 1) já havia confirmado que, em processo, `CommerceOperationResult.events` **não é descartado por nenhuma fronteira** — ao contrário do CRM, onde `apps/api` descarta `events` em toda rota HTTP. Isso levou a uma revisão de `seedDemoData.ts`: as cinco chamadas de bootstrap ao `CommerceManager` já retornavam `events` reais, simplesmente nunca capturados (apenas `.result` era usado, como em toda Sprint anterior). Corrigido: `DemoSnapshot.commerceEvents` agora acumula esses Eventos reais, e `productWorkspace.ts` os usa diretamente (`toLogEntry`) — nenhuma etiqueta sintetizada, apenas uma tradução de `CommerceEventType` para um rótulo legível. Documentado aqui como o achado que mais mudou o desenho desta Sprint em relação ao precedente do CRM Workspace.

---

## 7. Componentes Novos (Compartilhados, Design System UX-001)

Seis novos componentes, todos em `shared/components/ui/`, nenhum importa nenhum tipo de `@abp/commerce-hub` (genéricos por construção, per a instrução explícita "Criar componentes novos apenas se forem reutilizáveis"):

| Componente | Propósito |
|---|---|
| `ProductCard` | Cartão de catálogo — nome, descrição, status, Categoria, preço, disponibilidade, todos opcionais individualmente |
| `CategoryBadge` | Rótulo compacto de categoria/agrupamento — distinto de `Badge` (status) |
| `InventoryBadge` | Status de disponibilidade compacto (Em estoque / Estoque baixo / Sem estoque) |
| `InventoryIndicator` | Quantidade real em destaque — granularidade distinta de `InventoryBadge` |
| `PriceCard` | Cartão de valor monetário — `Intl.NumberFormat` sobre o código de moeda real, nunca fixo em BRL |
| `CompositionCard` | Cartão de Kit/Combo/Pacote/Conjunto — pronto para reuso, sem nenhum dado real por trás nesta Sprint (Seção 5.4) |

`inventoryStatus`/`InventoryStatus` (a lógica de classificação por limiar) foi extraída para `shared/components/ui/inventoryStatus.ts`, compartilhada por `InventoryBadge`/`InventoryIndicator` — evita duplicar a mesma regra em dois componentes (per "Eliminar duplicação", instrução explícita de Qualidade) e resolve um warning real de `react-refresh/only-export-components` (uma função exportada ao lado de um componente no mesmo arquivo).

Nenhum componente exclusivo deste módulo foi criado além dos seis acima — todas as onze seções reutilizam `WidgetCard`/`StatCard`/`Badge`/`Alert`/`Field`/`Select`/`Button`/`Table`/`Timeline`/`Tabs`/`Toast`/`AsyncState`/`EmptyState`/`NotConnectedNotice`/`SectionSubNav`/`KPIGrid`/`MetricCard`/`ActivityBadge`, todos já existentes desde UX-001/FUN-101/102/103.

Hooks novos (mesmo padrão `useMutation` + patch de cache já estabelecido, mas chamando `useManagers()` em vez de um HTTP client — primeira vez nesta série que um hook de mutação consome um Manager em processo em vez de `core/http/clients/*`): `useProductWorkspace`, `useCreateProduct`, `useUpdateProduct`, `useCreateVariant`, `useCreateCategory`, `useSetPrice`, `useAdjustInventory`.

---

## 8. Validação

```
pnpm typecheck   → 21/21 pacotes + apps, sucesso
pnpm build       → sucesso (apps/web: ProductHubPage seu próprio chunk, 23.7 kB/7.0 kB gzip)
pnpm lint        → sucesso, zero warning (inclui a correção do Seção 7)
pnpm test        → 527/527 testes, 141/141 arquivos (513/139 antes desta Sprint + 8 novos em
                    ProductHubPage.test.tsx + 6 novos em ProductHubComponents.test.tsx), suíte
                    completa executada duas vezes seguidas para confirmar ausência de flakiness
```

Testes cobrindo exatamente a lista exigida pela Sprint: Catálogo (busca/filtro/criação real), Cards (`ProductCard`/KPIs), Timeline (Histórico, componente + `CommerceEvent` reais), KPIs (Visão Geral/Analytics), Loading (estado inicial antes do Workspace resolver), Estados vazios (`EmptyState` de Composições), `NotConnectedNotice` (Composições/Compras/Custos/Analytics), Novos componentes compartilhados (arquivo dedicado, seis testes, um por componente). A suíte de regressão completa de Business Profile/Branding/CRM foi reexecutada a cada mudança em `buildManagers.ts`/`seedDemoData.ts`, permanecendo 100% verde durante todo o processo — inclusive um teste pré-existente (`navEntries.test.ts`) atualizado para refletir `/commerce` saindo de `"planned"` para `"active"`.

---

## 9. Limitações

- **Zero capacidade de leitura em `CommerceManager`** — mesma limitação central já documentada para `CRMManager` (FUN-103), aqui ainda mais evidente: oito métodos `list`/`get` já existem a nível de Service, nenhum exposto pelo Manager.
- **Nenhuma rota HTTP para Commerce** — decisão desta Sprint de conectar `CommerceManager` em processo, documentada em detalhe na Seção 3; nenhum dado deste módulo sobrevive ao fechamento da aba.
- **Todo Product criado permanece `Draft` para sempre** — `CommerceManager` nunca expõe `publish()`/`discontinue()` (Seção 2); "Itens ativos" é estruturalmente sempre zero.
- **Nenhuma Composição/Kit/Combo** — nenhuma modelagem existe no domínio.
- **Nenhuma gestão de Compras/Fornecedor** — nenhuma Entidade correspondente existe no Commerce Hub nem no CRM Hub (`Supplier` é um tipo não implementado).
- **Custo/Margem/Lucro inexistentes** — `Price` só tem `amount` (preço de lista).
- **Preços/Estoque acumulam localmente, nunca refletem o histórico completo real** — como não existe Query para reler o estado, cada mutação apenas se soma ao que já foi visto nesta sessão (mesma disciplina de `useUpdatePalette`, FUN-102).
- **Nenhuma validação visual em navegador real** — mesma limitação já registrada em toda Sprint desta série; validação limitada a build bem-sucedido e à suíte de testes (`@testing-library/react` + jsdom).

## 10. Oportunidades Futuras

- Ao menos uma Query real em `CommerceManager` — `listProducts`/`getCatalogSummary` são os candidatos mais diretos, já que os Services subjacentes (`ProductService.list`, etc.) já existem e só precisam ser expostos.
- `publish()`/`discontinue()` expostos por `CommerceManager` — resolveria a limitação de "Itens ativos" sempre zero sem exigir nenhuma mudança de domínio.
- Uma Sprint "Sales"/"Orders" continuando o Product Hub em direção a um Commerce Hub completo: Cart/Order/Checkout, os onze métodos de `CommerceManager` não exercidos nesta Sprint (Seção 4).
- Uma Entidade de composição real (Bill of Materials/Kit), desbloqueando a aba Composições com dado real e o já pronto `CompositionCard`.
- Integração real com o Commerce Hub à API (`apps/api`), seguindo o mesmo padrão de migração já demonstrado por Business Profile/Branding/CRM na FUN-004/005 — o passo natural para que o Product Hub deixe de depender de dado apenas em processo.
- Campos de Custo em `Price`/`Product`, desbloqueando Margem/Lucro reais na aba Custos.
- Um endpoint de listagem de Estoque/Preço por Theme/Catalog, resolvendo a limitação de "sempre o mais recente localmente conhecido" nomeada acima.
- Per a Visão do Produto desta Sprint: integração futura com Estoque real (WMS), Compras, Produção, Financeiro, Fiscal Hub, Analytics, Automação e Agentes de IA — nenhuma antecipada por esta Sprint, todas preparadas pela modelagem genérica confirmada na Seção 2.
