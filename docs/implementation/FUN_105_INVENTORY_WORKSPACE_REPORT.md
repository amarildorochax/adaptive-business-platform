# FUN-105 — Inventory Workspace — Relatório

**Status:** Concluída. **Natureza:** décima primeira Sprint funcional — nenhuma arquitetura, ADR, Manager, Repository Interface, Command, Event ou Entity foi alterada. Todo trabalho aconteceu exclusivamente em `apps/web`; nenhuma mudança em `buildManagers.ts`/`seedDemoData.ts` foi necessária — este Sprint reutiliza integralmente a composição do `CommerceManager` já feita pela FUN-104.

---

## 1. Auditoria do `CommerceManager` — Foco em Inventory/Stock/Movement/Product/Composition

A leitura obrigatória desta Sprint citava `COMMERCE_HUB.md`/`COMMERCE_HUB_CORE_MIGRATION_REPORT.md`, os mesmos nomes divergentes já registrados no relatório da FUN-104 — os arquivos reais são `docs/architecture/COMMERCE_HUB_ARCHITECTURE.md` e `docs/implementation/COMMERCE_CORE_MIGRATION_REPORT.md`, ambos já lidos integralmente naquela Sprint; esta auditoria revisita especificamente os métodos com relação a estoque.

**Apenas um método de `CommerceManager` toca `Inventory`:**

| Método | Assinatura | Evento |
|---|---|---|
| `adjustInventory` | `(productId, delta, variantId?) => Inventory` | `StockUpdated` |

`InventoryService.adjust(productId, delta, variantId?)` é o único método do Service subjacente também — mas `InventoryService.findByProduct(productId, variantId?)` **existe e nunca é exposto por `CommerceManager`**, mesmo padrão de método `get`/`list` não exposto já documentado para `ProductService`/`CategoryService`/`CatalogService`/`VariantService` no relatório da FUN-104.

**`StockMovement` — catalogado, nunca implementado.** `COMMERCE_HUB_ARCHITECTURE.md` trata `StockMovement` como Entidade própria (capítulo de Inventory & Stock Movement, tabela de Ownership, Roadmap Fase 5), mas `COMMERCE_CORE_MIGRATION_REPORT.md` (Seção "Componentes Ausentes") documenta explicitamente que não foi implementada como tal — `Inventory.adjust()` emite `StockUpdated` a cada ajuste, "suficiente para o nível de domínio exigido pela Etapa 6", um ledger histórico completo foi adiado. Consequência direta: **não existe nenhum registro de quem/quando/por que uma quantidade específica mudou, além do `CommerceEvent` (`eventId`/`type`/`occurredAt`) que o próprio ajuste produz.**

**Reserva de estoque — catalogada, nunca implementada.** A arquitetura descreve o fluxo "Product com Inventory > 0 → reservado no Checkout → decrementado em `OrderPaid` (`StockMovement`) → revertido em `ReturnApproved`" — mas `Checkout` está inteiramente fora de escopo desde a IMP-006 (`COMMERCE_CORE_MIGRATION_REPORT.md`, "Componentes Ausentes"), e `Inventory` não tem nenhum campo de quantidade reservada. Nenhuma parte deste fluxo existe.

**Composição de Produto — nunca mencionada.** Busca por "Composition"/"Composição"/"Kit"/"Combo"/"Bundle" em ambos os documentos não encontra nenhuma ocorrência — diferente de `StockMovement`/Reserva (catalogados, ao menos, mesmo que não implementados), o conceito de produto composto nunca foi sequer descrito pela arquitetura do Commerce Hub. Confirma o achado já registrado no relatório da FUN-104.

**`Product.status` permanece a limitação mais consequente para "itens inativos"/"rascunhos":** confirmado de novo — `CommerceManager.updateProduct` nunca aceita o campo `status`, e `ProductService.publish()`/`discontinue()` nunca são expostos pelo Manager. Todo Product criado por qualquer Workspace desta série permanece `Draft` para sempre.

**Dados realmente acessíveis a este Sprint:** exatamente os mesmos já conectados pela FUN-104 — `Product`, `Category`, `Catalog`, `Price`, `Inventory`, e o `CommerceEvent` real de cada mutação (`ProductCreated`/`ProductUpdated`/`PriceChanged`/`StockUpdated`, os únicos quatro tipos que este Workspace de fato produz).

---

## 2. Decisão Central — Nenhum Novo Manager, Nenhuma Nova Semente

Diferente de toda Sprint anterior desta série, **o Inventory Workspace não precisou de nenhuma mudança em `buildManagers.ts` nem em `seedDemoData.ts`.** `CommerceManager` já está conectado em processo desde a FUN-104 (Composition Root já existente); o Inventory Workspace é inteiramente uma **nova lente operacional** sobre o mesmo `["commerce","workspace"]` (`core/commerce/productWorkspace.ts`, `useProductWorkspace`) já acumulado pelo Product Hub — nunca uma segunda fonte de verdade, nunca uma nova consulta ao Manager além das mutações que já existiam (`useAdjustInventory`). Consistente com a instrução explícita desta Sprint ("Nunca criar Services... Nunca criar Repository... Nunca criar Query APIs") e com sua própria Visão do Produto ("núcleo operacional... integrado com Product Hub").

**Único ajuste real feito no núcleo compartilhado (`core/commerce/productWorkspace.ts`), motivado pela seção Movimentações:** `ProductEventLogEntry` ganhou dois campos opcionais, `delta` e `productId`. Nenhum dos dois vem do `CommerceEvent` em si (`CommerceEvent.ts` só declara `eventId`/`type`/`occurredAt` — nenhum campo de correlação com o Product ou com o valor ajustado) — ambos são capturados no momento real da própria mutação (`variables`/`result`, já conhecidos pelo hook que a executou), nunca reconstruídos depois. Sem `productId`, a seção Movimentações não teria como saber a qual Produto uma entrada do `eventLog` pertence; sem `delta`, não haveria como diferenciar Entrada de Saída. Os quatro hooks de mutação já existentes (`useCreateProduct`/`useUpdateProduct`/`useSetPrice`/`useAdjustInventory`) foram atualizados para preencher esses campos; a semente inicial do Workspace (`buildInitialProductWorkspace`) preenche `productId` (conhecido do próprio `DemoSnapshot.product`) mas **nunca** `delta` — o ajuste de estoque semeado no bootstrap não tem, no `DemoSnapshot`, o valor de `delta` usado (só o resultado final), então sua entrada no log mostra "Ajuste" sem direção, honestamente, em vez de um valor inventado.

---

## 3. Estrutura — Dez Seções

| Seção | Dado real | Fonte |
|---|---|---|
| Visão Geral | Sim (exceto Reservados/Em composição) | Product Hub Workspace + integração somente leitura |
| Inventário | Sim | Product Hub Workspace |
| Movimentações | Sim (`CommerceEvent` reais + `delta`/`productId` conhecidos) | Product Hub Workspace + `useAdjustInventory` |
| Disponibilidade | Parcial (Disponível/Rascunho reais; Reservado/Em uso não) | Product Hub Workspace |
| Reservas | Não (nenhum suporte no domínio) | — |
| Composições | Parcial (Produtos reais como potenciais componentes; composição em si não) | Product Hub Workspace |
| Alertas | Sim | Product Hub Workspace |
| Histórico | Sim (reutiliza `HistorySection` da FUN-104, sem duplicar) | Product Hub Workspace |
| Analytics | Sim | Product Hub Workspace |
| Configurações | Parcial (reutiliza `SettingsSection` da FUN-104 — tema claro/escuro, real) | `core/theme` (UX-001) |

### 3.1. Visão Geral (Inventory Dashboard)

Cinco indicadores (`KPIGrid`/`MetricCard`, FUN-103): Itens cadastrados, Disponíveis (Produtos com `Inventory.quantity > 0`), Reservados (`NotConnectedNotice` — nenhum campo real), Em composição (`NotConnectedNotice` — nenhuma relação real), Sem estoque. "Integração" (per instrução explícita, quatro fontes): Segmento (Business Profile), Tema ativo (Branding), Clientes (CRM Workspace, FUN-103), Catálogos (Product Hub Workspace) — todas somente leitura, nenhuma dependência nova.

### 3.2. Inventário

Lista moderna real: busca por nome, filtro por Categoria e por status de disponibilidade (`inventoryStatus`, FUN-104), tudo client-side. Cada item em `InventoryCard` (novo, FUN-105) — foco operacional, nunca preço.

### 3.3. Movimentações

Entradas/Saídas/Ajustes reais, todos originados do único Command que produz `StockUpdated` (`adjustInventory`). A `Timeline` compartilhada (UX-001/FUN-101) mostra a sequência cronológica; `MovementCard` (novo, FUN-105) detalha cada uma com a direção derivada do sinal real do `delta` (Seção 2). Um formulário "Registrar Movimentação" reaproveita `useAdjustInventory` — o mesmo Command já usado pela seção Estoque do Product Hub (FUN-104), nunca duplicado.

### 3.4. Disponibilidade

"Disponível" é a própria `Inventory.quantity`. "Rascunho" é real por uma via honesta: como nenhum Product pode sair de `Draft` (Seção 1), 100% dos Produtos estão hoje, de fato, em rascunho — mostrado com o mesmo `CategoryBadge` reaproveitado como rótulo simples. "Reservado" e "Em uso" — `NotConnectedNotice`. `ReservationBadge` (novo, FUN-105) aparece apenas com `status="available"`, o único status real possível.

### 3.5. Reservas

Inteiramente placeholder — nenhum campo de reserva existe em `Inventory` (Seção 1). `ReservationBadge` já pronto, sem nenhum dado fabricado nesta seção.

### 3.6. Composições

"Consumir dados reais do Product Hub" (instrução explícita): a seção mostra a lista real de Products como potenciais "componentes" (nome, Categoria, quantidade) — nunca uma composição em si, já que nenhuma relação existe no domínio (Seção 1). `NotConnectedNotice` para "Produtos compostos"/"Dependências". `CompositionCard` (FUN-104) permanece sem nenhum dado fabricado.

### 3.7. Alertas

Três alertas, todos derivados de dado real, per instrução explícita ("Nunca gerar alertas inventados"): Sem estoque (`quantity <= 0`), Itens inativos (`status === "Discontinued"` — a lógica é real e correta, mas estruturalmente nunca dispara, já que `CommerceManager` nunca expõe `discontinue()`), Rascunhos (`status === "Draft"` — sempre 100% dos Produtos, pelo mesmo motivo). Cada `AlertCard` (novo, FUN-105) mostra a contagem real e até cinco itens afetados.

### 3.8. Histórico

**Reutiliza, sem nenhuma duplicação, o mesmo componente `HistorySection` já construído pela FUN-104** (`pages/product-hub/sections/HistorySection.tsx`) — já genérico o bastante (recebe apenas `ProductWorkspaceSnapshot`, nenhum acoplamento à página de origem). Mostra o `eventLog` completo (todos os tipos), não apenas `StockUpdated` — a visão ampla, complementar à Movimentações (Seção 3.3, filtrada). Consome exclusivamente `CommerceEvent` reais, nunca sintetizados, per instrução explícita.

### 3.9. Analytics

Distribuição real por status de disponibilidade (Em estoque/Estoque baixo/Sem estoque), quantidade total em estoque, distribuição por Categoria. `NotConnectedNotice` para tendência histórica e previsão de ruptura.

### 3.10. Configurações

**Reutiliza, sem duplicação, o mesmo `SettingsSection` da FUN-104** — ambos os módulos têm exatamente zero suporte de configuração no domínio, então um componente idêntico (tema claro/escuro, real) é honesto, não preguiçoso.

---

## 4. Componentes Novos (Compartilhados, Design System UX-001)

Quatro componentes genuinamente novos, mais duas reutilizações explícitas dos nomes sugeridos pela Sprint (evitando duplicar componentes já existentes, per "Eliminar duplicações"):

| Nome pedido pela Sprint | Resolução |
|---|---|
| `InventoryCard` | **Novo** — cartão operacional (quantidade, Categoria, status, última atualização), nunca preço; distinto de `ProductCard` (FUN-104, foco em catálogo/venda) |
| `MovementCard` | **Novo** — direção (Entrada/Saída/Ajuste) derivada do `delta` real |
| `AlertCard` | **Novo** — alerta operacional com contagem e itens afetados; distinto de `Alert` (UX-001, mensagem de resultado de uma ação) |
| `ReservationBadge` | **Novo** — pronto para reuso, sem dado real por trás (Seção 3.5), mesmo padrão de `CompositionCard` (FUN-104) |
| `InventoryStatusBadge` | **Reaproveitado** — é exatamente `InventoryBadge` (FUN-104); criar um segundo componente com o mesmo propósito violaria "Eliminar duplicações" |
| `StockIndicator` | **Reaproveitado** — é exatamente `InventoryIndicator` (FUN-104), pelo mesmo motivo |

`movementDirection()`/`MovementDirection` (a lógica de classificação de direção) foi extraída para seu próprio arquivo (`movementDirection.ts`), mesmo padrão já aplicado a `inventoryStatus.ts` (FUN-104) — evita duplicar a regra e resolve o mesmo tipo de warning real de `react-refresh/only-export-components` encontrado naquela Sprint.

Nenhum componente exclusivo deste módulo foi criado além dos quatro genuinamente novos — todas as dez seções reutilizam `WidgetCard`/`Badge`/`CategoryBadge`/`InventoryBadge`/`InventoryIndicator`/`Field`/`Select`/`Button`/`Timeline`/`Toast`/`AsyncState`/`EmptyState`/`NotConnectedNotice`/`SectionSubNav`/`KPIGrid`/`MetricCard`, todos já existentes desde UX-001/FUN-101/102/103/104 — mais os dois componentes de seção inteiros reutilizados da FUN-104 (Seção 3.8, 3.10).

---

## 5. Validação

```
pnpm typecheck   → 21/21 pacotes + apps, sucesso
pnpm build       → sucesso (apps/web: InventoryPage seu próprio chunk, 16.4 kB/5.1 kB gzip)
pnpm lint        → sucesso, zero warning (inclui a correção do Seção 4)
pnpm test        → 539/539 testes, 143/143 arquivos (527/141 antes desta Sprint + 8 novos em
                    InventoryPage.test.tsx + 4 novos em InventoryWorkspaceComponents.test.tsx),
                    suíte completa executada duas vezes seguidas para confirmar ausência de flakiness
```

Testes cobrindo exatamente a lista exigida pela Sprint: Inventory Dashboard (Visão Geral, KPIs), Cards (`InventoryCard`), Timeline (Movimentações — `Timeline` compartilhada + `MovementCard` com direção real), Indicadores (`InventoryIndicator`/`InventoryBadge` reaproveitados), Estados vazios (`EmptyState` de Reservas e do filtro do Inventário), Loading (estado inicial antes do Workspace resolver), `NotConnectedNotice` (Visão Geral/Disponibilidade/Reservas/Composições), Novos componentes compartilhados (arquivo dedicado, quatro testes, um por componente novo). Um teste pré-existente atualizado: `navEntries.test.ts`, já que `/inventory` é uma rota nova (`status: "active"`, sem Manager próprio — documentado no próprio arquivo).

---

## 6. Limitações

- **Nenhum `StockMovement` real** — apenas o `CommerceEvent` de cada ajuste (`eventId`/`type`/`occurredAt`), sem nenhum ledger histórico dedicado; catalogado na arquitetura, nunca implementado (Seção 1).
- **`delta`/`productId` são conhecimento do Frontend, não do Evento em si** — `CommerceEvent` nunca carrega nenhum dos dois; a movimentação semeada no bootstrap não tem `delta` conhecido, mostrada honestamente como "Ajuste" sem direção.
- **Nenhuma Reserva de estoque** — nenhum campo em `Inventory`, nenhum fluxo de Checkout implementado.
- **Nenhuma Composição de Produto** — conceito nunca mencionado em nenhum documento de arquitetura do Commerce Hub.
- **"Itens inativos" estruturalmente sempre vazio, "Rascunhos" estruturalmente sempre 100%** — `CommerceManager` nunca expõe `publish()`/`discontinue()` (limitação já documentada na FUN-104, reconfirmada aqui).
- **Nenhum dado sobrevive ao fechamento da aba** — mesma limitação já herdada do Product Hub Workspace (FUN-104): `CommerceManager` nunca foi migrado para HTTP.
- **Nenhuma validação visual em navegador real** — mesma limitação já registrada em toda Sprint desta série; validação limitada a build bem-sucedido e à suíte de testes (`@testing-library/react` + jsdom).

## 7. Oportunidades Futuras

- Uma Entidade `StockMovement` real, per o próprio Roadmap já catalogado em `COMMERCE_HUB_ARCHITECTURE.md` (Fase 5) — daria a esta seção um histórico completo por movimentação, não apenas o `CommerceEvent` genérico.
- Um campo de quantidade reservada em `Inventory`, ou a implementação completa do fluxo Checkout→Reserva já descrito na arquitetura — desbloquearia a aba Reservas com dado real.
- Uma Entidade de composição/Bill of Materials — desbloquearia Composições com dado real, usando o já pronto `CompositionCard` (FUN-104).
- `publish()`/`discontinue()` expostos por `CommerceManager` — resolveria tanto "Itens ativos" (FUN-104) quanto "Itens inativos" (esta Sprint) sempre estruturalmente vazios/cheios.
- Integração real com Compras (Purchase Hub), Produção, Financeiro e Fiscal Hub — per a Visão do Produto desta Sprint, nenhuma antecipada aqui.
- Migração do Commerce Hub para HTTP real (`apps/api`), seguindo o precedente já demonstrado por Business Profile/Branding/CRM — resolveria a limitação de dado session-only compartilhada com o Product Hub.
