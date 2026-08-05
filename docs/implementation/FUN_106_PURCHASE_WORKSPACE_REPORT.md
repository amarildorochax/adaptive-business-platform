# FUN-106 — Purchase Workspace — Relatório

**Status:** Concluída. **Natureza:** décima segunda Sprint funcional — nenhuma arquitetura, ADR, Manager, Repository Interface, Command, Event ou Entity foi alterada. Todo trabalho aconteceu exclusivamente em `apps/web`; nenhuma mudança em `buildManagers.ts`/`seedDemoData.ts`/`core/commerce/productWorkspace.ts` foi necessária — este Sprint reutiliza integralmente a composição e o Read Model já construídos pela FUN-104/105.

---

## 1. Auditoria do `CommerceManager` — Foco em Purchase/Supplier/Inventory/Product/Cost/Adjustment/Stock/Movement

A leitura obrigatória citava `COMMERCE_HUB.md`/`COMMERCE_HUB_CORE_MIGRATION_REPORT.md`, os mesmos nomes divergentes já registrados nos relatórios da FUN-104/105 — os arquivos reais são `docs/architecture/COMMERCE_HUB_ARCHITECTURE.md` e `docs/implementation/COMMERCE_CORE_MIGRATION_REPORT.md`, ambos já lidos integralmente naquelas Sprints.

**Busca dedicada por "Purchase"/"Supplier"/"cost" em todo `packages/commerce-hub/src/` (todas as 39 Entidades/Services/Repositórios/Manager): zero ocorrências.** Busca equivalente em `docs/architecture/COMMERCE_HUB_ARCHITECTURE.md` (o documento inteiro, não apenas capítulos específicos): **zero ocorrências de "Purchase", "Fornecedor" ou "Supplier".** Isto é mais absoluto que qualquer lacuna já documentada nesta série — mais até que "Composição" (FUN-104/105, também zero ocorrências, mas ao menos adjacente a `Variant`) e muito mais que `StockMovement`/Reserva (FUN-105, catalogados mas não implementados). **Purchase e Supplier não são uma lacuna de implementação do Commerce Hub — são, simplesmente, um domínio ainda não descrito por nenhuma arquitetura desta plataforma**, exatamente como a própria Sprint nomeia ("o início do Purchase Hub").

**`Supplier` existe, mas em outro Hub, e também sem implementação.** `packages/crm-hub/src/Supplier.ts` declara o tipo (`supplierId`/`tenantId`/`relationshipId`/`createdAt`) — mas busca em `CRMManager.ts` por "Supplier" não encontra nenhuma ocorrência: nenhum `SupplierManager`, nenhum método de `CRMManager` cria, lê ou associa um Supplier. Mesmo achado já registrado no relatório da FUN-103, reconfirmado aqui.

**Os únicos métodos de `CommerceManager` com qualquer relação real com esta Sprint são os já auditados pela FUN-104/105** — nenhum novo método foi encontrado:

| Método | Relevância para Purchase Workspace |
|---|---|
| `adjustInventory` (Evento `StockUpdated`) | Único produtor de "entrada de estoque" — a base real de Recebimentos |
| `setPrice` (Evento `PriceChanged`) | Único produtor de dado monetário — a base real de Custos |
| `createProduct`/`updateProduct` | Produtos "adquiridos" (Visão Geral) |

Nenhum outro dos dezoito métodos de `CommerceManager` (Cart/Order/Discount/Coupon/Catalog/Category/Variant) tem relação com Purchase/Supplier/Cost/Adjustment além do já documentado.

**Dados realmente acessíveis a este Sprint:** exatamente os mesmos já conectados pela FUN-104/105 — nenhum dado novo, apenas uma terceira lente (procurement) sobre o mesmo Product Hub Workspace.

---

## 2. Decisão Central — Terceira Lente sobre o Mesmo Read Model, Nenhuma Mudança no Núcleo

Seguindo exatamente o precedente já estabelecido pela FUN-105 (Inventory Workspace): **nenhuma mudança em `buildManagers.ts`, `seedDemoData.ts` ou `core/commerce/productWorkspace.ts` foi necessária.** O Purchase Workspace é inteiramente uma nova interpretação do mesmo `["commerce","workspace"]` (`useProductWorkspace`) — "Recebimento" é honestamente reconstruído a partir de `StockUpdated` com `delta` positivo (o mesmo `delta`/`productId` já capturados pela FUN-105 para a mesma finalidade em Movimentações), e "Custo" reaproveita `Price`, a única fonte monetária de todo o domínio — já usada por Precificação e por Custos, ambas do Product Hub (FUN-104). Nenhuma segunda fonte de verdade foi criada.

**Achado que mais moldou o desenho desta Sprint: a ausência quase total de dado real em duas das oito abas pedidas.** Diferente do Product Hub (FUN-104, a maioria das abas reais) e do Inventory Workspace (FUN-105, seis de dez reais), o Purchase Workspace tem exatamente duas abas 100% sem dado real (Ordens de Compra, Fornecedores) — porque, como a Seção 1 confirma, nenhuma das duas tem qualquer grounding arquitetural, não apenas de implementação. Isso moldou a decisão de **não** construir um novo componente de status para Ordem de Compra (`PurchaseStatusBadge`, sugerido pela Sprint) — não existe nenhum enum de status real para mapear, e criar um Badge vazio seria antecipar uma estrutura de dado que ainda nem foi desenhada (Seção 4).

---

## 3. Estrutura — Oito Seções

| Seção | Dado real | Fonte |
|---|---|---|
| Visão Geral | Sim (exceto Fornecedores) | Product Hub Workspace + integração somente leitura |
| Ordens de Compra | Não (nenhum suporte arquitetural, não apenas de implementação) | — |
| Fornecedores | Não (nenhum suporte arquitetural, não apenas de implementação) | — |
| Recebimentos | Sim (`StockUpdated` com `delta` positivo) | Product Hub Workspace |
| Custos | Sim (`Price`, única fonte monetária do domínio) | Product Hub Workspace |
| Histórico | Sim (reutiliza `HistorySection` da FUN-104, sem duplicar) | Product Hub Workspace |
| Analytics | Sim | Product Hub Workspace |
| Configurações | Parcial (reutiliza `SettingsSection` da FUN-104 — tema claro/escuro, real) | `core/theme` (UX-001) |

### 3.1. Visão Geral (Purchase Dashboard)

Quatro indicadores (`KPIGrid`/`MetricCard`): Produtos adquiridos, Últimas entradas (mesma contagem real de Recebimentos), Custo médio (`Price`), Fornecedores (`NotConnectedNotice` — nenhum dado real). "Integração" (per instrução explícita, cinco fontes): Business Profile, Branding, CRM (todos já reais desde FUN-101/102/103), Product Hub e Inventory — os dois últimos lidos do mesmo Workspace, cada fato sob o rótulo conceitual correto (Produtos/Categorias via Product Hub, unidades em estoque via Inventory).

### 3.2. Ordens de Compra

Inteiramente placeholder. `PurchaseCard` (novo, FUN-106) já pronto, sem nenhum dado fabricado.

### 3.3. Fornecedores

Inteiramente placeholder, per instrução explícita ("Nunca criar cadastro fictício"). `SupplierBadge` (novo, FUN-106) já pronto, sem nenhum dado fabricado.

### 3.4. Recebimentos

"Mostrar entradas de estoque provenientes de eventos reais": cada `StockUpdated` com `delta` positivo vira um `ReceivingCard` (novo, FUN-106) — mesma fonte já usada por Movimentações do Inventory Workspace (FUN-105), nunca duplicada, apenas reapresentada sob a ótica de procurement. `supplierName` nunca é preenchido (nenhum dado real existe).

### 3.5. Custos

"Somente dados reais": `Price` é a única fonte monetária de todo o Commerce Hub (já documentado no relatório da FUN-104) — "Custo médio" é a média real dos `Price.amount` já conhecidos; "Últimos custos" lista cada `Price` real por Produto, via `CostIndicator` (novo, FUN-106). `NotConnectedNotice` nomeia explicitamente o que a Sprint pediu mas não existe: custo de aquisição distinto do preço de venda, frete, impostos de compra.

### 3.6. Histórico

**Reutiliza, sem duplicação, o mesmo `HistorySection` já usado pelo Inventory Workspace (FUN-105) e originalmente construído pela FUN-104** — terceiro uso consecutivo do mesmo componente de seção, prova direta de que ele já nasceu genérico o bastante. Consome exclusivamente `CommerceEvent` reais, per instrução explícita ("Consumir CommerceEvents... Nunca criar Timeline artificial").

### 3.7. Analytics

Indicadores reais: contagem de Recebimentos, unidades recebidas, custo médio, distribuição de Produtos por Categoria. `NotConnectedNotice` para tendência histórica, previsão de custo e "melhor Fornecedor" (per instrução explícita, "Nunca criar IA fictícia").

### 3.8. Configurações

**Reutiliza, sem duplicação, o mesmo `SettingsSection`** já usado pelo Product Hub e pelo Inventory Workspace — os três módulos têm exatamente zero suporte de configuração no domínio.

---

## 4. Componentes Novos (Compartilhados, Design System UX-001)

Quatro componentes genuinamente novos; dois nomes sugeridos pela Sprint foram deliberadamente **não** construídos, com a razão documentada explicitamente (per "Eliminar duplicações"):

| Nome pedido pela Sprint | Resolução |
|---|---|
| `PurchaseCard` | **Novo** — cartão de Ordem de Compra, pronto para reuso, sem dado real por trás (Seção 3.2) |
| `SupplierBadge` | **Novo** — rótulo de Fornecedor, mostra "Fornecedor não identificado" honestamente quando ausente |
| `CostIndicator` | **Novo** — indicador de custo, reaproveita a mesma formatação de moeda de `PriceCard` (FUN-104) |
| `ReceivingCard` | **Novo** — cartão de recebimento, direção sempre "entrada" (só existe para `delta` positivo) |
| `PurchaseStatusBadge` | **Não construído** — nenhum enum de status de Ordem de Compra existe em nenhum lugar (Seção 2); quando existir, reutilizará `Badge` (UX-001) diretamente, mesmo padrão já usado por todo status real desta série |
| `PurchaseSummaryCard` | **Não construído** — `PipelineCard` (FUN-103, já genérico: título/subtítulo/valor/metadados/ações) cobre exatamente a mesma forma; construir um segundo componente idêntico violaria "Eliminar duplicações" |

Nenhum componente exclusivo deste módulo foi criado além dos quatro genuinamente novos — todas as oito seções reutilizam `WidgetCard`/`Badge`/`KPIGrid`/`MetricCard`/`NotConnectedNotice`/`EmptyState`/`SectionSubNav`/`Timeline` (via `HistorySection` reutilizado), todos já existentes desde UX-001/FUN-101/102/103/104/105 — mais os dois componentes de seção inteiros reutilizados da FUN-104 (Histórico, Configurações), agora usados por três módulos diferentes sem nenhuma cópia.

---

## 5. Validação

```
pnpm typecheck   → 21/21 pacotes + apps, sucesso
pnpm build       → sucesso (apps/web: PurchasePage seu próprio chunk, 9.7 kB/3.4 kB gzip — o menor
                    de todos os Workspaces desta série, refletindo a reutilização máxima de HistorySection/
                    SettingsSection já compilados como chunks próprios e compartilhados)
pnpm lint        → sucesso, zero warning
pnpm test        → 551/551 testes, 145/145 arquivos (539/143 antes desta Sprint + 8 novos em
                    PurchasePage.test.tsx + 4 novos em PurchaseWorkspaceComponents.test.tsx), suíte
                    completa executada duas vezes seguidas para confirmar ausência de flakiness
```

Testes cobrindo exatamente a lista exigida pela Sprint: Dashboard (Visão Geral, KPIs), Timeline (Histórico reutilizado), Cards (`ReceivingCard`/`CostIndicator`/`PurchaseCard`), Indicadores (`CostIndicator`), Estados vazios (`EmptyState` de Ordens de Compra/Fornecedores/Recebimentos), Loading (estado inicial), `NotConnectedNotice` (Visão Geral/Ordens de Compra/Fornecedores/Custos/Analytics), Novos componentes compartilhados (arquivo dedicado, quatro testes). Um teste pré-existente atualizado: `navEntries.test.ts`, já que `/purchases` é uma rota nova (`status: "active"`, sem Manager próprio).

---

## 6. Limitações

- **Purchase e Supplier não existem em nenhuma arquitetura desta plataforma** — não é uma lacuna de implementação, é a ausência completa de um Bounded Context ainda não desenhado (Seção 1).
- **"Recebimento" é uma reinterpretação, não uma Entidade própria** — todo recebimento mostrado é, na verdade, um `StockUpdated` com `delta` positivo; sem `adjustInventory`, não há como saber se uma entrada de estoque teve origem em compra, devolução ou correção manual.
- **"Custo" é sempre `Price` (preço de venda), nunca um custo de aquisição distinto** — nenhum campo de custo separado existe em nenhuma Entidade do Commerce Hub.
- **Nenhum Fornecedor real** — `Supplier` existe como tipo no CRM Hub, mas sem nenhum Manager.
- **Nenhum dado sobrevive ao fechamento da aba** — mesma limitação já herdada do Product Hub/Inventory Workspace: `CommerceManager` nunca foi migrado para HTTP.
- **Nenhuma validação visual em navegador real** — mesma limitação já registrada em toda Sprint desta série; validação limitada a build bem-sucedido e à suíte de testes (`@testing-library/react` + jsdom).

## 7. Oportunidades Futuras

- Um Bounded Context de Purchase real (Purchase Order, Purchase Item, status de aprovação/recebimento) — o primeiro passo genuíno rumo ao "Purchase Hub" que esta Sprint apenas prepara o terreno para.
- Um `SupplierManager` real no CRM Hub, dando vida ao tipo `Supplier` já catalogado — desbloquearia Fornecedores com dado real e `SupplierBadge` com nomes reais.
- Um campo de custo de aquisição distinto de `Price.amount`, permitindo Margem/Lucro reais (mesma lacuna já nomeada nos relatórios da FUN-104/105).
- Uma Entidade `StockMovement` real (já recomendada no relatório da FUN-105) permitiria distinguir uma entrada por compra de uma por correção manual — hoje ambas são indistinguíveis (`StockUpdated` genérico).
- Integração real com Financeiro e Fiscal Hub — per a Visão do Produto desta Sprint, nenhuma antecipada aqui.
- Migração do Commerce Hub para HTTP real (`apps/api`), resolvendo a limitação de dado session-only compartilhada com Product Hub e Inventory Workspace.
