# Commerce Core Migration Report

**Adaptive Business Platform · Documento de Implementação**

Status: Approved · Sprint: IMP-006 — Commerce Hub Migration (Fase 1 — Commerce Core)

---

## Nota de Posicionamento Documental

Como em toda Sprint desta série, o contexto e o texto da própria Sprint divergem do estado real do repositório em pontos que precisam ser registrados antes de qualquer decisão técnica.

**`src/core/catalog/` e `src/core/store/`, apesar do nome, não têm nenhuma relação com Commerce.** A leitura obrigatória desta Sprint aponta ambos como legado a investigar; a auditoria (Etapa 1) confirma que `src/core/catalog/` é o catálogo de **Agentes de IA** (`AgentCatalog`, `AgentCapability`, `AgentDependency`, `AgentDiscovery`, `AgentHealth`, `AgentVersioning`, entre outros) e `src/core/store/` é `AgentStore.ts` — armazenamento de estado de Agente, também de IA. Uma coincidência pura de nomenclatura ("catalog"/"store" no sentido de orquestração de Agentes, não no sentido de e-commerce). Nenhum dos dois foi usado como origem de qualquer Entidade desta Sprint.

**`src/core/commerce/`, `src/core/orders/` e `src/core/products/` não existem** — nenhum dos três diretórios está presente em `src/core/`. Uma busca adicional, não restrita aos três diretórios sugeridos pela leitura obrigatória, confirmou que nenhum arquivo em todo `src/` declara `interface`/`class` para `Product`, `Order`, `Cart`, `Checkout`, `Inventory`, `Coupon` ou `Catalog` (produto) — o Commerce Hub é, portanto, um domínio **genuinamente novo**, sem nenhum precedente legado de Extração, mesma situação exata do Content Hub em IMP-004 (não a do CRM/Communication/Growth Hub, todos com legado real). `platform/packages/commerce-hub/` também não existia — criado do zero por esta Sprint.

**`COMMERCE_HUB_ARCHITECTURE.md` nunca catalogou Commands**, mesma lacuna sistêmica já encontrada em `CONTENT_HUB_ARCHITECTURE.md` (IMP-004). O documento tem um Capítulo 29 ("Eventos do Domínio") com 21 Eventos, mas em nenhum lugar existe um capítulo equivalente de Commands. Por isso, assim como `ContentOperationResult`, o `CommerceOperationResult` desta Sprint **nunca tem um campo `command`**, nem mesmo opcional.

**A lista de Entidades da própria Sprint (Etapa 2) diverge, por omissão, do Blueprint.** `Category` está na lista de investigação da Etapa 1, mas não na lista de implementação da Etapa 2 — omissão que o próprio fluxo do Blueprint (Capítulo 9: "Product criado → associado a Category → publicado no Catalog") não sustenta; `Category` foi implementada mesmo assim. `CartItem` não aparece em nenhuma das duas listas da Sprint, mas o Blueprint (Capítulo 16) descreve Cart e CartItem como o mesmo par agregado ("Ciclo de vida de Cart/CartItem") — também implementada. Por outro lado, a Sprint pede "ProductVariant"/"InventoryItem"; o Blueprint (Capítulo 37.1, tabela de Ownership) usa exclusivamente "Variant"/"Inventory" — esta Sprint usa o vocabulário já aprovado pelo Blueprint em ambos os casos, tratando o texto de exemplo da Sprint como ilustrativo, mesmo padrão já aplicado em toda Sprint anterior desta série.

**Nenhum Value Object dedicado foi criado** (`ProductId`, `Money`, `Currency`, `Timestamp`, etc., pedidos pela Etapa 3). Nenhuma das quatro Sprints anteriores desta série (CRM, Communication, Content, Growth) criou um tipo de Value Object próprio — todas usam `string`/`number`/`Date` diretamente nos campos da Entidade, e nenhum Blueprint desta série cataloga Value Objects como uma seção própria (diferente do que já fazem, cuidadosamente, para Commands/Events). Esta Sprint preserva essa mesma consistência: `ProductStatus`/`OrderStatus`/`CartStatus`/`DiscountKind` são tipos-união de string literal (mesmo padrão de `CampaignStatus`, `ArticleStatus`), e identificadores permanecem `string` simples.

---

## Resumo Executivo

Esta Sprint criou `platform/packages/commerce-hub` do zero e implementou o núcleo do domínio Commerce — Catálogo (`Product`, `Variant`, `Catalog`, `Category`, `Price`), Promoção (`Discount`, `Coupon`), Carrinho (`Cart`, `CartItem`), Pedido (`Order`, `OrderItem`) e Estoque em nível de domínio (`Inventory`) — sem nenhum precedente legado, um domínio genuinamente novo desde o Content Hub (IMP-004). `pnpm typecheck`, `pnpm build`, `pnpm lint` e `pnpm test` completam sem erro em todo o workspace (18 projetos, um a mais que na IMP-005), com 17 testes novos (82 no total).

---

## Inventário e Classificação

| Conceito | Origem | Classificação | Evidência |
|---|---|---|---|
| `platform/packages/commerce-hub/` | — | **Inexistente** — criado nesta Sprint | `ls platform/packages/` não o listava antes desta Sprint |
| `Product`, `Order`, `Cart`, `Checkout`, `Inventory`, `Coupon`, `Catalog` (produto) | `src/core/commerce/`, `src/core/orders/`, `src/core/products/` | **Inexistente** | Nenhum dos três diretórios existe em `src/core/` |
| `AgentCatalog`/`AgentCapability`/`AgentDependency`/etc. | `src/core/catalog/` | Falso cognato — não portado | Catálogo de Agentes de IA, não de Product; nenhuma relação com Commerce apesar do nome |
| `AgentStore` | `src/core/store/` | Falso cognato — não portado | Armazenamento de estado de Agente de IA, não Cart/Store de e-commerce |
| Qualquer feature de loja/produto/pedido | `src/app/features/` | **Inexistente** | Nenhum dos 14 diretórios (`analytics`, `automation`, `business-intelligence`, `campaign`, `crm`, `dashboard`, `execution`, `finance`, `knowledge`, `marketing`, `notifications`, `settings`, `workflow`) corresponde |
| Commands do Commerce Hub | — | **Inexistente, também no Blueprint** | `COMMERCE_HUB_ARCHITECTURE.md` cataloga 21 Eventos (Capítulo 29) mas nunca um catálogo de Commands — mesma lacuna já confirmada em `CONTENT_HUB_ARCHITECTURE.md` |
| Events do Commerce Hub (21) | `COMMERCE_HUB_ARCHITECTURE.md`, Capítulo 29 | Já aprovado, reutilizado integralmente | Catálogo completo declarado em `CommerceEvent.ts`; dez efetivamente exercidos nesta Sprint (`ProductCreated`, `ProductUpdated`, `PriceChanged`, `CartCreated`, `CartAbandoned`, `OrderCreated`, `OrderPaid`, `OrderCancelled`, `OrderFulfilled`, `StockUpdated`) |
| `Invoice`, `Payment`, `Refund`, `Subscription` (billing), `Tax Record`, `Financial Document` | `FINANCE_DOMAIN_BLUEPRINT.md` (Finance Hub, já Official) | Fora de escopo, propositalmente nunca tocado | Fronteira explícita do próprio Blueprint (ADR-CM-001/002/003/006) — nenhum tipo de `@abp/finance-hub` é importado por nenhum arquivo desta Sprint |
| `Customer`/`Lead`/`Opportunity` (CRM Hub), `Campaign`/`Audience Segment` (Growth Hub) | `@abp/crm-hub`, `@abp/growth-hub` | Referenciado por identificador opaco, nunca importado | `Cart.customerReferenceId`, `Order.customerReferenceId`, `Coupon.campaignReferenceId` — mesmo padrão ADR-002 já aplicado a `Audience.memberReferenceIds` (Growth Hub) |
| `Checkout`, `Quote`, `SubscriptionPlan`, `Shipment`, `Return`, Marketplace | `platform/packages/commerce-hub` (não criado) | Fora de escopo desta Sprint | Fases 2/4/5/6/7 do Roadmap Evolutivo do próprio Blueprint (Capítulo 38); dependem de Finance Hub operacional (Fase 3, nota do próprio Roadmap) ou de logística/pagamento, ambos explicitamente excluídos |

---

## Componentes Criados

**Pacote**: `platform/packages/commerce-hub/` inteiro — `package.json`, `tsconfig.json`, wiring em `tsconfig.json` raiz e em `apps/web` (`package.json` e `tsconfig.json`).

**Entidades**: `Product.ts` (`ProductStatus`: `Draft`/`Published`/`Discontinued`, Soft Delete via `Discontinued`, per Capítulo 10), `Variant.ts`, `Catalog.ts`, `Category.ts` (hierárquica via `parentCategoryId`, nomeada para nunca colidir com `Category` do Content Hub), `Price.ts` (`currency` como `string` simples, nunca o tipo `Currency` de `@abp/finance-hub`), `Discount.ts` (`DiscountKind`: `Percentage`/`FixedAmount`, nunca confundido com `Discount` de Invoice, ADR-CM-002), `Coupon.ts` (especialização de Discount por código), `Cart.ts` (`CartStatus`: `Active`/`Abandoned`/`CheckedOut`), `CartItem.ts`, `Order.ts` (`OrderStatus`: `Pending`/`Paid`/`Fulfilling`/`Shipped`/`Delivered`/`Cancelled`, exatamente per Capítulo 18), `OrderItem.ts`, `Inventory.ts`.

**Catálogo de Eventos**: `CommerceEvent.ts` — declara os 21 tipos já aprovados (Capítulo 29); dez efetivamente produzidos nesta Sprint.

**Repositórios** (contratos apenas, per Etapa 7): um por Entidade (12 no total) — `ProductRepository`/`OrderRepository` sem `remove` (Soft Delete via `status`); `OrderItemRepository` sem `update`/`remove` (imutável após confirmação); `CartItemRepository` com `remove` (Blueprint, Capítulo 16: "Adição/remoção de item" é funcionalidade explícita, distinta da imutabilidade de OrderItem já confirmado no Checkout).

**Serviços**: um por Entidade (12 no total).

**Orquestrador**: `CommerceManager.ts` — expõe `createProduct`/`updateProduct`, `createVariant`, `createCatalog`, `createCategory`, `setPrice`, `createDiscount`/`createCoupon`, `createCart`/`abandonCart`/`addCartItem`, `createOrder`/`addOrderItem`/`markOrderPaid`/`cancelOrder`/`fulfillOrder`, `adjustInventory`.

## Componentes Reutilizados

Nenhum código foi reutilizado — este é o segundo domínio consecutivo (depois de Content Hub, IMP-004) sem nenhum precedente legado de Extração. O que **foi** reutilizado é o padrão arquitetural: o par Entidade/Repositório/Serviço/Manager, a disciplina de Domain Events coletados nunca publicados (mesmo Event Bus ausente já registrado por toda Sprint anterior), e — o precedente mais direto — a forma `{result, events}` sem campo `command`, herdada diretamente de `ContentOperationResult` (IMP-004), não de `CRMOperationResult`/`GrowthOperationResult` (que têm `command` opcional, por terem catálogo de Commands).

O padrão de Anti-Corruption Layer (referência opaca por identificador a outro Hub, nunca importação de tipo) segue o mesmo precedente já demonstrado por `Audience.memberReferenceIds` (Growth Hub, IMP-005) — aplicado aqui a `Cart.customerReferenceId`, `Order.customerReferenceId` (CRM Hub) e `Coupon.campaignReferenceId` (Growth Hub).

## Componentes Ausentes

Checkout (`Checkout`, fluxo de confirmação e captura de dado de entrega/pagamento), Quote (proposta comercial negociada, integração com CRM Hub Opportunity), Subscription Plan (oferta comercial recorrente), Shipment (frete e entrega física), Return (decisão comercial de devolução), Marketplace (associação de Vendedor, sub-Order) — todos já descritos no Blueprint (Capítulos 17, 19, 20, 26, 24, 27), nenhum implementado nesta Sprint, todos correspondendo às Fases 2, 4, 5, 6 e 7 já sequenciadas no próprio Roadmap Evolutivo (Capítulo 38), a maioria explicitamente dependente de Finance Hub operacional (Fase 3) ou de integração de logística — ambos fora do escopo já definido por esta própria Sprint.

`StockMovement` (Capítulo 25, o registro histórico de movimentação de estoque, citado ao lado de `Inventory` na mesma tabela de Ownership) não foi implementado como Entidade própria — `Inventory.adjust()` já emite `StockUpdated` a cada ajuste, suficiente para o nível de domínio exigido pela Etapa 6; um ledger histórico completo por movimentação foi adiado, registrado em `Inventory.ts` como decisão explícita.

---

## Lacunas Arquiteturais

**Nenhum Command foi ou pôde ser portado — o Blueprint nunca os catalogou.** Mesma lacuna, e mesma resolução, já registrada por `CONTENT_CORE_MIGRATION_REPORT.md` (IMP-004): `CommerceOperationResult` nunca tem campo `command`.

**`Variant`, `Catalog`, `Category`, `CartItem` e `OrderItem` não têm nenhum Evento de domínio próprio** no catálogo de 21 já aprovado. `CommerceManager` reflete isso com precisão — `createVariant`, `createCatalog`, `createCategory`, `addCartItem` e `addOrderItem` retornam `events: []`, nunca um Evento inventado.

**`DiscountRuleApplied` — o único Evento aprovado para Discount/Coupon — não tem produtor nesta Sprint.** O Blueprint (Capítulo 14) é explícito: este Evento é "avaliado no momento de Checkout" — e `Checkout` está fora do escopo desta Sprint (Fase 2 do Roadmap). `createDiscount`/`createCoupon` retornam `events: []`; a avaliação real, que produziria `DiscountRuleApplied` e transportaria o valor calculado ao Finance Hub, depende de uma Sprint futura que implemente Checkout.

**`OrderPaid` é, por definição do próprio Blueprint, uma reação a um Evento de outro Hub (`InvoicePaid`/`PaymentCaptured`, Finance Hub) — não a um Comando direto do Commerce Hub.** Nenhuma integração real entre Hubs existe ainda nesta plataforma (nenhum Event Bus implementado, mesmo estado já registrado por toda Sprint anterior desta série); `CommerceManager.markOrderPaid()` expõe apenas a transição de domínio (`Pending → Paid`, emitindo `OrderPaid`), documentada explicitamente como não processando pagamento algum (ADR-CM-001/ADR-CM-006) — uma Sprint de Infrastructure futura precisará conectar o consumo real de `InvoicePaid` a este método, ou a um equivalente.

**`Checkout` (fluxo e Entidade) está ausente, mas `Order` já pode ser criado sem ele.** O Blueprint descreve dois caminhos de criação de Order — via Checkout confirmado, e via `OpportunityWon` (CRM Hub, venda B2B consultiva direta). Esta Sprint implementa apenas o segundo caminho (`createOrder` aceita um `cartId` opcional, apenas como referência, nunca como resultado de um fluxo de Checkout real) — o primeiro caminho, tecnicamente completo, depende da Entidade `Checkout` ainda não implementada.

---

## Riscos

Mesmo risco estrutural já registrado pelos quatro relatórios anteriores: nenhum Event Bus real existe, então todo `CommerceEvent` retornado é coletado, nunca publicado.

Risco específico desta Sprint: a vizinhança deliberada com o Finance Hub, já `Official` e maduro, é o ponto de maior risco de todo este domínio — o próprio Blueprint dedica sua Nota de Posicionamento inteira a esse risco. Esta implementação nunca importa nenhum tipo de `@abp/finance-hub`, nunca declara `Invoice`/`Payment`/`Refund`/`Subscription` (billing)/`Tax Record` como Entidade própria, e trata toda referência como campo `string` opaco — mas o risco de uma equipe futura, sob pressão de prazo, "atalhar" a integração Commerce↔Finance duplicando um desses conceitos dentro de `commerce-hub` permanece real e é o mais grave já identificado nesta série (duplicar `Invoice`/`Payment` fragmentaria o dado mais sensível da plataforma).

Risco secundário: `markOrderPaid()` existe como operação de domínio chamável diretamente, sem qualquer garantia estrutural de que só será invocada em reação a um Evento real do Finance Hub — em produção, expor este método sem uma camada de Infrastructure que garanta essa causalidade permitiria marcar um Order como pago sem pagamento algum ter ocorrido. Aceitável nesta Sprint (nenhuma API, nenhuma infraestrutura, per as próprias regras), mas deve ser resolvido antes de qualquer exposição real.

---

## Recomendações

Ao planejar a Fase 2 (Carrinho e Checkout, per Roadmap Evolutivo, Capítulo 38), implementar `Checkout` como Entidade própria com sua própria transição de estado (`CheckoutStarted`/`CheckoutCompleted`, já catalogados), e conectar `DiscountRuleApplied` como a primeira aplicação real de Discount/Coupon.

Ao planejar a Fase 3 (Pedido e integração com Finance Hub, dependente de Finance Hub operacional per o próprio Roadmap), tratar `markOrderPaid()` como candidato à substituição por um handler real de `InvoicePaid`/`PaymentCaptured`, nunca uma operação livremente invocável — mesma disciplina de Anti-Corruption Layer já exigida pelo Blueprint (Capítulo 22).

Registrar, como item de governança pendente já identificado pelo próprio Blueprint (ADR-CM-007), a inclusão formal do Commerce Hub em `DOMAIN_OWNERSHIP_MATRIX.md` como décimo quarto proprietário da plataforma — confirmado nesta Sprint que o documento ainda não menciona Commerce em nenhum lugar.

Priorizar Estoque e Entrega (Fase 5) apenas depois de Checkout/Pedido estarem maduros (Fases 2-3), já que `StockUpdated` (implementado nesta Sprint como ajuste manual de domínio) precisa, em produção, ser decrementado automaticamente em reação a `OrderPaid` — outra causalidade ainda não conectada por nenhuma Infrastructure real.

---

## Conclusão

Esta Sprint confirmou, como Content Hub já havia feito em IMP-004, que "vizinho de um domínio maduro" e "domínio genuinamente novo" podem coexistir na mesma Sprint — mas aqui com uma dimensão adicional de risco que Content Hub nunca teve: o vizinho (Finance Hub) já é `Official`, já é maduro, e a fronteira entre os dois, embora cuidadosamente documentada pelo próprio Blueprint, exige disciplina ativa de quem implementa, não apenas leitura passiva do documento. Nenhuma linha desta Sprint importa um tipo do Finance Hub; toda referência cross-Hub permanece opaca; e cada lacuna encontrada — Commands ausentes, `DiscountRuleApplied` sem produtor, `OrderPaid` sem causalidade real — foi documentada, nunca preenchida por conta própria. O Commerce Hub sabe o que vende e sabe conduzir um Pedido do carrinho à confirmação — mas, exatamente como o Blueprint exige, nunca soube, nem precisou saber, como o dinheiro se move.
