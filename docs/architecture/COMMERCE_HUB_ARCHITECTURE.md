# Commerce Hub Architecture — Blueprint Oficial do Commerce Hub

**Adaptive Business Platform · Documento Técnico Oficial**

---

## Nota de Posicionamento Documental

Este documento nasce em status **Draft** (`DOCUMENTATION_CONSTITUTION.md`, §8.1) e enfrenta uma reconciliação de natureza diferente das quatro anteriores desta série. Content Hub carvou território nunca formalmente reivindicado; Conversation Hub e Marketing Hub são, cada um, o mesmo Bounded Context de um domínio já existente sob outro nome (Communication Hub, Growth Hub). O Commerce Hub é genuinamente novo — mas nasce **vizinho de um domínio já Official extremamente maduro e facilmente confundível com ele**: `FINANCE_DOMAIN_BLUEPRINT.md`, que já reivindica `Invoice`, `Payment`, `Payment Method`, `Payment Intent`, `Refund`, `Subscription`, `Recurring Billing`, `Discount`, `Tax Record` e `Financial Document` — seis das vinte Entidades explicitamente pedidas por esta Sprint (`Price`/`Discount`/`Coupon`, `Subscription`, `Invoice`, `Payment`, `Refund`) já têm, total ou parcialmente, um proprietário Official.

A fronteira que este documento traça, e que atravessa cada capítulo a seguir, é a mesma distinção já estabelecida em `FINANCE_DOMAIN_BLUEPRINT.md`, Capítulo 1, entre "quem a Empresa conhece" (CRM) e "quanto é devido" (Finance) — aqui aplicada a uma terceira dimensão que nenhum dos dois cobre: **o que está sendo vendido, e o processo pelo qual um Cliente decide comprá-lo.** `Product`, `Catalog`, `Cart`, `Checkout`, `Order`, `Quote`, `Inventory` e `Shipment` não são mencionados, nem para pertencer nem para ser excluídos, em nenhuma tabela de Boundaries já Official ou Frozen desta série — território genuinamente livre. `Invoice`/`Payment`/`Refund`/`Subscription`(billing)/`Discount`(de Invoice)/`Tax Record`/`Financial Document` continuam exclusivamente do Finance Hub, sem nenhuma exceção.

Três reconciliações formais seguem dessa fronteira:

**Primeira — `Subscription` (Commerce) nunca é `Subscription` (Finance).** Este documento define `Subscription Plan` como a oferta comercial — o que está incluído, o produto associado, o preço de catálogo —, proprietária do Commerce Hub; `Subscription`, já Official do Finance Hub, continua sendo exclusivamente o acordo de cobrança recorrente em si (periodicidade, `Recurring Billing`). Quando um Cliente assina um `Subscription Plan`, o Commerce Hub publica um Evento consumido pelo Finance Hub, que então cria sua própria `Subscription` — nunca o inverso, e nunca uma única Entidade fundindo os dois conceitos.

**Segunda — `Discount`/`Coupon` (Commerce) nunca são `Discount` (Finance).** Este documento define `Discount`/`Coupon` como regra promocional aplicada durante `Cart`/`Checkout` — uma decisão de precificação de catálogo. `Discount`, já Official do Finance Hub, é a redução aplicada a uma `Invoice` já emitida. O valor decidido pelo `Discount`/`Coupon` do Commerce Hub é transportado, por Evento, ao Finance Hub, que o registra como seu próprio `Discount` no momento de criar a `Invoice` — nunca uma Entidade financeira duplicada dentro do Commerce Hub.

**Terceira — `Invoice`, `Payment`, `Refund`, `Tax Record` e `Financial Document` nunca são criados pelo Commerce Hub.** `Order` (Commerce, novo) é o Aggregate central deste domínio, e desencadeia — nunca cria diretamente — cada uma dessas cinco Entidades já Official do Finance Hub, exatamente pelo mesmo padrão já estabelecido entre `Opportunity` (CRM) e `Invoice` (Finance) em `CRM_DOMAIN_BLUEPRINT.md`, Capítulo 11, e já antecipado, como consumidor, em `CRM_HUB_ARCHITECTURE.md`, Capítulo 28, linha `OpportunityWon`.

Nenhuma linha de `FINANCE_DOMAIN_BLUEPRINT.md`, `FINANCE_HUB.md` ou `DOMAIN_OWNERSHIP_MATRIX.md` é alterada por este documento. Nenhum código, componente, rota, banco de dados ou API foi alterado para produzi-lo.

---

## 1. Introdução

Este documento é o Blueprint oficial do **Commerce Hub** — o domínio responsável por toda operação comercial da Adaptive Business Platform: catálogo, precificação, carrinho, checkout, pedido, assinatura (como oferta), estoque e entrega. Ele implementa o momento de conversão em ambos os Modelos de negócio já descritos em `ADAPTIVE_PLATFORM_MASTER_BLUEPRINT.md` — o ponto em que um `Lead`/`Deal` do CRM Hub, ou uma decisão de compra direta iniciada em `Conversation`, se torna uma transação real.

Ele nunca será proprietário de `Customer`/`Lead` (CRM Hub), `Content` (Content Hub), `Conversation` (Conversation Hub) ou `Campaign` (Marketing Hub) — exigência explícita desta Sprint, e nunca será proprietário de `Invoice`/`Payment`/`Refund`/`Tax Record` (Finance Hub) — reconciliação explícita da Nota de Posicionamento acima.

---

## 2. Missão

Executar o ciclo comercial completo — do catálogo à entrega — de forma consistente, auditável e desacoplada, consumindo identidade e relacionamento do CRM Hub, conteúdo do Content Hub, canal de conversa do Conversation Hub e execução financeira do Finance Hub, sem jamais duplicar nenhum desses domínios, e publicando Evento sobre cada etapa do próprio ciclo para que os demais Hubs reajam de forma independente.

---

## 3. Visão

Que o Commerce Hub se torne o único lugar, dentro da Adaptive Business Platform, onde uma Empresa define o que vende, decide como precifica, e processa cada pedido do carrinho à entrega — permanecendo, ao mesmo tempo, inteiramente dependente do Finance Hub para tudo relacionado a dinheiro, e do CRM Hub para tudo relacionado a quem está comprando.

---

## 4. Objetivos Estratégicos

| # | Objetivo | Descrição |
|---|---|---|
| OE-1 | **Ocupar território genuinamente livre** | Product, Catalog, Cart, Checkout, Order, Quote, Inventory, Shipment — nenhum já reivindicado por outro Hub Official/Frozen. |
| OE-2 | **Nunca duplicar Finance Hub** | Invoice, Payment, Refund, Subscription (billing), Discount (Invoice), Tax Record, Financial Document permanecem exclusivos do Finance Hub. |
| OE-3 | **Nunca duplicar CRM, Content, Conversation ou Marketing Hub** | Reafirmação explícita exigida pelo ESCOPO. |
| OE-4 | **Orquestrar dois caminhos de venda** | Fechamento formal via `OpportunityWon`/Deal (CRM Hub) e checkout direto (Content Hub/Conversation Hub), ambos convergindo para o mesmo `Order`. |
| OE-5 | **Preparar IA aplicada ao Commerce** | Doze capacidades (Capítulo 28), nenhuma implementada. |
| OE-6 | **Preservar Multi-Tenant e escalabilidade desde o desenho** | Mesmo padrão já Official/Frozen de toda a série. |

---

## 5. Escopo

**Dentro do escopo:** Catálogo de Produtos, Gestão de Produtos, Categorias, Variações, Precificação (lista de preço), Descontos/Cupons (promocionais), Carrinho, Checkout, Pedidos, Cotações, Assinaturas (oferta comercial), Estoque, Frete e Entrega, Marketplace.

**Fora do escopo:** Invoice, Payment, Refund, Subscription (billing), Tax Record, Financial Document, Ledger (todos Finance Hub); identidade de relacionamento (CRM Hub); conteúdo (Content Hub); canal de comunicação (Conversation Hub); estratégia de campanha (Marketing Hub); execução de Workflow genérico (Automation Engine); cálculo de indicador consolidado (Analytics Hub).

---

## 6. Responsabilidades

O Commerce Hub é responsável por manter o catálogo de `Product`/`Category`/`Variant` e sua `Price` de lista; por administrar `Discount`/`Coupon` promocionais; por gerenciar `Cart` e `Checkout`; por criar e conduzir `Order` do momento de criação até entrega; por emitir `Quote` quando a venda exige negociação prévia; por administrar `Subscription Plan` como oferta comercial; por manter `Inventory`/`Stock Movement`; e por coordenar `Shipment`.

O Commerce Hub não é responsável por processar pagamento, emitir cobrança formal, calcular tributo, gerar comprovante fiscal, ou manter qualquer registro contábil — todas essas responsabilidades pertencem exclusivamente ao Finance Hub, consumido por Evento, nunca acessado diretamente.

```
              LIMITES ENTRE COMMERCE HUB E OS DEMAIS HUBS
   ┌───────────────────────────────────────────────────────────┐
   │  Commerce Hub decide o quê vender e conduz o Pedido             │
   │       │                                                        │
   │       ├──► Finance Hub processa Invoice/Payment/Refund/Tax          │
   │       ├──► CRM Hub formaliza o relacionamento e a Opportunity          │
   │       ├──► Content Hub fornece a Landing Page/CTA de origem                │
   │       ├──► Conversation Hub conduz a venda quando fechada em conversa          │
   │       ├──► Marketing Hub mede Attribution/ROI da conversão                        │
   │       └──► Integration Hub media qualquer sistema de logística externo               │
   └───────────────────────────────────────────────────────────┘
```

---

## 7. Arquitetura Geral

```
                              Platform
                                 │
                                 ▼
                           Commerce Hub
                (novo — território livre, vizinho de Finance Hub)
                                 │
                                 ▼
                          Business Capabilities
     (Catalog Management, Cart/Checkout, Order Management,
      Quote Management, Subscription Plan Management, Inventory,
      Shipment Management, Marketplace Management)
                                 │
                                 ▼
                       Domain Model (Capítulo 22 em diante)
   (Product, Variant, Catalog, Category, Price, Discount, Coupon,
    Cart, CartItem, Checkout, Quote, Order, OrderItem,
    SubscriptionPlan, Inventory, StockMovement, Shipment)
                                 │
                                 ▼
                          Domain Events (Capítulo 29)
                                 │
                 ┌───────────────┼───────────────┐
                 ▼               ▼               ▼
            Finance Hub       CRM Hub        Analytics Hub
        (cria Invoice a    (consome        (consolida
         partir de         OrderPaid)       indicador)
         OrderPlaced)
```

---

## 8. Conceito de Commerce Hub

O Commerce Hub é um Business Hub, categoria já estabelecida em `BUSINESS_HUB_ARCHITECTURE.md`, Capítulo 1. Ele é, entre os seis Hubs já especificados nesta série, o primeiro cujo papel é inteiramente transacional em sentido literal — não gerencia relacionamento, não gerencia conteúdo, não gerencia conversa, não gerencia estratégia; gerencia a **transação em si**, do catálogo à entrega, sempre delegando tudo que é dinheiro ao Finance Hub e tudo que é identidade ao CRM Hub.

---

## 9. Catálogo de Produtos

**Objetivo.** Ser a fonte única de verdade sobre o que uma Empresa vende.

**Responsabilidades.** Ciclo de vida de `Catalog`, `Product`, `Category`, `Variant`.

**Funcionalidades.** Publicação e organização de produto; associação de `MediaAsset` do Content Hub (referenciado por identificador, nunca duplicado); ativação/desativação por canal de venda.

**Fluxos.** `Product criado → associado a Category → publicado no Catalog → disponível para Cart`.

**Dependências.** Media Library (Content Hub, referenciada); Business Hub (moeda/região, quando aplicável).

**Eventos.** `ProductCreated`, `ProductUpdated`.

**Integrações.** Content Hub (imagem/descrição reaproveitada); Analytics Hub (desempenho de catálogo).

**Limites do domínio.** O Catálogo nunca define preço final de venda com imposto incluído — isso é resultado de `Price` (Commerce) combinado com `Tax Record` (Finance), nunca calculado ou armazenado aqui.

---

## 10. Gestão de Produtos

Já coberto pelo Catálogo (Capítulo 9) — `Product` é a Entidade central; este capítulo detalha seu ciclo de vida próprio: rascunho → publicado → descontinuado (nunca removido fisicamente, mesmo padrão Soft Delete já Frozen em `CRM_HUB.md`, ADR-008, aplicado aqui por analogia).

---

## 11. Categorias

`Category` organiza `Product` hierarquicamente, mesma disciplina de Taxonomia já estabelecida para `Category`/`ContentTag` em `CONTENT_HUB_ARCHITECTURE.md`, Capítulo 24 — nomeada aqui `Category` (Commerce) para evitar qualquer colisão com `Category` (Content Hub, já própria daquele Bounded Context, distinta por natureza: uma organiza produto, a outra organiza conteúdo editorial).

---

## 12. Variações

`Variant` representa uma combinação específica de atributo de um `Product` (tamanho, cor), cada uma com seu próprio `Price` e `Inventory` — nunca um `Product` novo e independente, sempre subordinada ao `Product` original.

---

## 13. Precificação

**Objetivo.** Definir o preço de lista de um `Product`/`Variant`, antes de qualquer `Discount`/`Coupon`.

**Responsabilidades.** Ciclo de vida de `Price`; suporte a múltiplas listas de preço (por Segmento de Cliente, por região — referenciando `Segment`/`Audience Segment` já proprietários de CRM Hub/Marketing Hub por identificador, nunca duplicando).

**Funcionalidades.** Preço base; preço promocional programado; preço por Variant.

**Fluxos.** `Price definido no Catalog → consumido por Cart no momento de adição → confirmado no Checkout`.

**Dependências.** Catalog (Capítulo 9).

**Eventos.** `PriceChanged`.

**Integrações.** Marketing Hub (Personalização de preço por Audience Segment, quando aplicável — decisão sempre do Marketing Hub, execução sempre do Commerce Hub).

**Limites do domínio.** `Price` nunca inclui imposto final calculado — essa responsabilidade é do Finance Hub (`Tax Record`), aplicada apenas no momento de emissão da `Invoice`.

---

## 14. Descontos

**Objetivo.** Aplicar redução promocional de catálogo — nunca a redução de uma `Invoice` já emitida, que permanece exclusiva do Finance Hub (`Discount`, já Official).

**Responsabilidades.** Ciclo de vida de `Discount` (Commerce) — regra promocional (percentual, valor fixo, condição de elegibilidade) aplicável a `Product`/`Category`/`Cart`.

**Funcionalidades.** Desconto automático por volume; desconto por Segmento; janela de vigência.

**Fluxos.** `Discount configurado → avaliado no momento de Checkout → valor transportado ao Finance Hub, que registra seu próprio Discount na Invoice`.

**Dependências.** Catalog, Cart.

**Eventos.** `DiscountRuleApplied` (Commerce) — nunca confundido com `DiscountApplied` (Finance, já Official, publicado pelo Finance Hub sobre a própria Invoice).

**Integrações.** Marketing Hub (Campanha promocional pode configurar um Discount); Finance Hub (consumidor do valor calculado).

**Limites do domínio.** Ver Nota de Posicionamento, Segunda reconciliação.

---

## 15. Cupons

`Coupon` é uma especialização de `Discount` (Commerce) resgatável por código, com limite de uso e associação opcional a uma `Campaign` do Marketing Hub (referenciada por identificador). Mesmo ciclo de vida e mesma fronteira já descrita no Capítulo 14.

---

## 16. Carrinho

**Objetivo.** Reter a intenção de compra de um visitante ou Cliente antes da confirmação de `Checkout`.

**Responsabilidades.** Ciclo de vida de `Cart`/`CartItem`; cálculo provisório de total (Price + Discount, sem imposto final).

**Funcionalidades.** Adição/remoção de item; persistência entre sessões, quando o `Cart` já está associado a um `Lead`/`Customer` do CRM Hub (referenciado por identificador); expiração configurável.

**Fluxos.** `CartCreated → CartItem adicionado(s) → CartAbandoned (se expirado sem Checkout) ou CheckoutStarted`.

**Dependências.** Catalog, Price, Discount.

**Eventos.** `CartCreated`, `CartAbandoned`.

**Integrações.** Marketing Hub (consumidor de `CartAbandoned` para Remarketing, já descrito em `MARKETING_HUB_ARCHITECTURE.md`, Capítulo 20); CRM Hub (associação a `Lead`/`Customer` quando identificado).

**Limites do domínio.** `Cart` nunca é, ele mesmo, um compromisso comercial — apenas `Order`, criado a partir de um `Checkout` confirmado, o é.

---

## 17. Checkout

**Objetivo.** Conduzir a confirmação de um `Cart` em `Order`, incluindo captura de dado necessário à entrega e ao pagamento.

**Responsabilidades.** Orquestração do fluxo de confirmação — nunca o processamento de pagamento em si, apenas a iniciação da `Payment Intent` (Finance Hub, via Evento).

**Funcionalidades.** Confirmação de endereço de entrega; seleção de `Shipment` (Capítulo 26); confirmação de `Coupon` aplicado; disparo do fluxo de pagamento.

**Fluxos.** Ver Capítulo 22 (Fluxo completo de Pedido).

**Dependências.** Cart, CRM Hub (identidade do comprador), Finance Hub (Payment Intent).

**Eventos.** `CheckoutStarted`, `CheckoutCompleted`.

**Integrações.** Finance Hub (inicia `Payment Intent`); Identity Hub (autenticação do comprador, quando aplicável).

**Limites do domínio.** Checkout nunca confirma pagamento diretamente — apenas inicia a solicitação ao Finance Hub e aguarda `PaymentCaptured`/`InvoicePaid` (já Official) para transicionar `Order` a Pago.

---

## 18. Pedidos

**Objetivo.** Ser o Aggregate central e definitivo do Commerce Hub — o compromisso comercial confirmado.

**Responsabilidades.** Ciclo de vida completo de `Order`/`Order Item`, do `Checkout` confirmado até a entrega.

**Funcionalidades.** Criação a partir de `Checkout` ou de `OpportunityWon` (CRM Hub); acompanhamento de Status (`Pending`, `Paid`, `Fulfilling`, `Shipped`, `Delivered`, `Cancelled`); cancelamento com origem de `Refund` (Finance Hub).

**Fluxos.** Ver Capítulo 22.

**Dependências.** Checkout, Finance Hub (Invoice/Payment), Inventory, Shipment.

**Eventos.** `OrderCreated`, `OrderPaid`, `OrderCancelled`, `OrderFulfilled`.

**Integrações.** CRM Hub (consome `OrderPaid` para atualizar Timeline — mesmo padrão já Official de `PaymentConfirmed`, agora com origem explícita de Commerce Hub); Finance Hub (desencadeia Invoice/Payment); Marketing Hub (consome `OrderPaid` para ROI/Attribution).

**Limites do domínio.** `Order` nunca cria `Invoice` diretamente — apenas publica o Evento que o Finance Hub consome para criá-la, exatamente como `Opportunity`/`OpportunityWon` já faz hoje.

---

## 19. Cotações

**Objetivo.** Cobrir venda que exige negociação antes de um `Order` formal — típica do Modelo 01/B2B já descrito em `ADAPTIVE_PLATFORM_MASTER_BLUEPRINT.md`.

**Responsabilidades.** Ciclo de vida de `Quote` — proposta de preço/condição, com validade, associável a uma `Opportunity`/`Deal` do CRM Hub por identificador.

**Funcionalidades.** Geração de `Quote` a partir de itens de `Catalog`; conversão de `Quote` aceita em `Order`.

**Fluxos.** `Quote criada → associada a Opportunity (CRM Hub) → aceita → convertida em Order`.

**Dependências.** Catalog, CRM Hub (Opportunity/Deal).

**Eventos.** `QuoteCreated`, `QuoteAccepted`, `QuoteConvertedToOrder`.

**Integrações.** CRM Hub (referenciando `Opportunity`/`Deal`, nunca duplicando).

**Limites do domínio.** `Quote` nunca é, ela mesma, um compromisso financeiro — apenas o `Order` resultante, uma vez aceita, desencadeia o fluxo de Finance Hub.

---

## 20. Assinaturas

Ver Nota de Posicionamento, Primeira reconciliação. `Subscription Plan` (Commerce, novo) é a oferta comercial — o que está incluído, produto associado, preço recorrente de catálogo. Quando um Cliente confirma um `Checkout` de `Subscription Plan`, o Commerce Hub publica `SubscriptionPlanSubscribed`, consumido pelo Finance Hub, que cria sua própria `Subscription` (já Official) e assume o ciclo de `Recurring Billing` a partir daí — o Commerce Hub nunca gera nova cobrança recorrente diretamente.

---

## 21. Pagamentos

**Não é Entidade do Commerce Hub.** `Payment`/`Payment Method`/`Payment Intent`/`Charge` permanecem, sem exceção, do Finance Hub, já Official. O Checkout (Capítulo 17) apenas inicia a solicitação; o Finance Hub decide e executa tudo o mais, mediado pelo Integration Hub para qualquer gateway externo, exatamente como já estabelecido em `FINANCE_DOMAIN_BLUEPRINT.md`, ADR-004.

---

## 22. Faturamento

**Não é Entidade do Commerce Hub.** `Invoice`/`Invoice Item`/`Billing` permanecem do Finance Hub, já Official. O fluxo completo, formalizado por este documento:

```
              FLUXO COMPLETO DE PEDIDO (Checkout → Entrega)
   ┌───────────────────────────────────────────────────────────┐
   │  Cart → CheckoutStarted                                        │
   │       │                                                        │
   │       ▼                                                        │
   │  OrderCreated (Commerce Hub, Status: Pending)                    │
   │       │                                                        │
   │       ▼                                                        │
   │  Finance Hub consome OrderCreated ──► InvoiceCreated ──►             │
   │  PaymentIntent ──► Charge (via Integration Hub) ──►                     │
   │  PaymentCaptured ──► InvoicePaid                                            │
   │       │                                                        │
   │       ▼                                                        │
   │  Commerce Hub consome InvoicePaid ──► OrderPaid                    │
   │       │                                                        │
   │       ▼                                                        │
   │  Inventory decrementado (StockMovement) ──► Shipment criado             │
   │       │                                                        │
   │       ▼                                                        │
   │  OrderFulfilled ──► OrderDelivered                                          │
   └───────────────────────────────────────────────────────────┘
```

Este fluxo é a aplicação literal, ao Commerce Hub, do padrão Anti-Corruption Layer já exigido em `BUSINESS_HUB_ARCHITECTURE.md`, Capítulo 10 — `Order` nunca lê a estrutura interna de `Invoice`; consome apenas o Evento já publicado.

---

## 23. Notas Fiscais

**Não é Entidade do Commerce Hub.** `Financial Document`, já Official do Finance Hub, cobre Invoice/Recibo/Comprovante — o Commerce Hub apenas referencia esse documento por identificador quando exibe o histórico de um `Order` ao Cliente, nunca gera ou armazena sua própria cópia.

---

## 24. Reembolsos

**Objetivo.** Cobrir a decisão comercial de devolução — distinta da execução financeira, já Official do Finance Hub (`Refund`).

**Responsabilidades.** Ciclo de vida de `Return`/`OrderCancellation` (Commerce, novo) — a solicitação e a aprovação comercial de devolução, associada a um `Order`.

**Funcionalidades.** Solicitação de devolução por Cliente ou por atendente (via Conversation Hub); aprovação; reversão de `Inventory`.

**Fluxos.** `Return solicitado → aprovado → publica ReturnApproved → Finance Hub consome e processa seu próprio Refund → Inventory revertido`.

**Dependências.** Order, Inventory.

**Eventos.** `ReturnRequested`, `ReturnApproved`.

**Integrações.** Finance Hub (consumidor de `ReturnApproved`, único a criar `Refund`); CRM Hub (Timeline registra a devolução).

**Limites do domínio.** O Commerce Hub nunca processa devolução de valor — apenas a decisão comercial de que ela deve ocorrer.

---

## 25. Estoque

**Objetivo.** Garantir que um `Product`/`Variant` vendido tenha disponibilidade real, e registrar toda movimentação.

**Responsabilidades.** Ciclo de vida de `Inventory`/`Stock Movement`.

**Funcionalidades.** Reserva de estoque no `Checkout`; decremento em `OrderPaid`; reversão em `ReturnApproved`; alerta de estoque baixo.

**Fluxos.** `Product com Inventory > 0 → reservado no Checkout → decrementado em OrderPaid (StockMovement) → revertido em ReturnApproved, quando aplicável`.

**Dependências.** Catalog, Order.

**Eventos.** `StockUpdated`.

**Integrações.** Analytics Hub (indicador de giro de estoque); Integration Hub (quando um sistema de estoque externo é a fonte de verdade, mediado, nunca acessado diretamente).

**Limites do domínio.** `Inventory` nunca é ajustado por nenhum Hub além do Commerce Hub — nem mesmo o Finance Hub, mesmo quando um `Refund` está associado a uma devolução física.

---

## 26. Frete e Entrega

**Objetivo.** Coordenar a logística de entrega de um `Order` físico.

**Responsabilidades.** Ciclo de vida de `Shipment`.

**Funcionalidades.** Cálculo de frete no Checkout; rastreamento de status de entrega; confirmação de recebimento.

**Fluxos.** `OrderFulfilled → Shipment criado → em trânsito → entregue → OrderDelivered`.

**Dependências.** Order.

**Eventos.** `ShipmentCreated`, `ShipmentDelivered`.

**Integrações.** Integration Hub (transportadora externa, mediada — o Commerce Hub nunca implementa Connector próprio, mesma disciplina já Frozen/Official em toda a série).

**Limites do domínio.** `Shipment` nunca existe para um `Order` inteiramente digital (produto/serviço sem entrega física) — sua criação é condicional à natureza do `Product` vendido.

---

## 27. Marketplace

**Objetivo.** Cobrir o cenário em que múltiplos Vendedores oferecem `Product` dentro do mesmo `Catalog` de uma Empresa operando como plataforma para terceiros.

**Responsabilidades.** Associação de `Product` a um Vendedor (referenciado por identificador ao Identity Hub/Business Hub); divisão de `Order` multi-vendedor em sub-pedidos rastreáveis individualmente.

**Funcionalidades.** Catálogo por Vendedor; comissão (valor calculado pelo Commerce Hub, repassado ao Finance Hub como `Fee`, já Official, no momento de faturamento).

**Fluxos.** `Order multi-vendedor → decomposto em Order por Vendedor → cada um segue o fluxo padrão do Capítulo 22 independentemente`.

**Dependências.** Catalog, Order, Finance Hub (Fee).

**Eventos.** Nenhum Evento próprio adicional — reaproveita o catálogo já definido no Capítulo 29, aplicado a cada sub-`Order`.

**Integrações.** Finance Hub (repasse de comissão como `Fee`); Identity Hub (identidade do Vendedor).

**Limites do domínio.** Marketplace é uma capacidade de composição sobre `Catalog`/`Order` já existentes — nenhuma Entidade nova é necessária além da associação de Vendedor.

---

## 28. IA aplicada ao Commerce

Nenhuma capacidade descrita neste capítulo é implementada nesta Sprint — mesmo padrão de "preparação sem implementação prematura" já aplicado nos quatro Blueprints anteriores desta série.

**Precificação inteligente.** Sugestão de ajuste de `Price` a partir de padrão de demanda e de concorrência, sempre revisável antes de aplicação.

**Recomendação de produtos.** Sugestão de `Product`/`Variant` complementar dentro do `Cart` ou pós-`Order`, a partir de padrão de compra já observado.

**Previsão de demanda.** Estimativa de volume de venda futuro por `Product`, insumo direto de gestão de `Inventory`.

**Previsão de estoque.** Alerta antecipado de ruptura de `Inventory`, complementar à Previsão de demanda.

**Prevenção de abandono de carrinho.** Identificação de `Cart` em risco de `CartAbandoned`, sugerindo intervenção (cupom, lembrete via Conversation Hub) antes do abandono efetivo.

**Detecção de fraude.** Apoio à decisão de aprovação de `Order`/`Payment`, sempre como sinalização ao Finance Hub/Commerce Hub, nunca como bloqueio automático sem revisão — mesmo princípio Human Oversight já Frozen/Official em toda a série.

**Recomendação de descontos.** Sugestão de `Discount`/`Coupon` mais eficaz para um `Segment`/`Audience Segment` específico.

**Previsão de receita.** Estimativa de receita futura combinando `Order` já confirmado e `Cart` em andamento, entregue como insumo ao Analytics Hub.

**Otimização de catálogo.** Sugestão de reorganização de `Category`/destaque de `Product` a partir de desempenho observado.

**Previsão de churn em assinaturas.** Estimativa de cancelamento de `Subscription Plan`, cruzando sinal do Commerce Hub com o ciclo de `Recurring Billing` já Official do Finance Hub (consumido por Evento, nunca acessado diretamente).

**Análise de comportamento de compra.** Leitura de padrão de `Cart`/`Order` ao longo do tempo, insumo de Recomendação de produtos e de Previsão de demanda.

**Otimização comercial.** Consolidação das capacidades acima em recomendação acionável, sempre sujeita a confirmação humana, aplicação direta do princípio Human Oversight já Frozen em `AI_HUB.md`, Capítulo 5.

Toda capacidade acima é consumida através do contrato já estabelecido em `AI_HUB.md` — o Commerce Hub nunca implementa lógica de inteligência artificial própria.

---

## 29. Eventos do Domínio

| Evento | Produtor | Consumidor | Objetivo | Impacto |
|---|---|---|---|---|
| `ProductCreated` | Commerce Hub | Content Hub (mídia associada), Analytics Hub | Novo Product publicado. | Disponível no Catalog. |
| `ProductUpdated` | Commerce Hub | Analytics Hub | Atributo de Product alterado. | Mantém Read Model consistente. |
| `PriceChanged` | Commerce Hub | Analytics Hub, Marketing Hub | Preço de lista alterado. | Reavalia Discount/Coupon vigentes. |
| `DiscountRuleApplied` | Commerce Hub | Finance Hub (transporta valor), Analytics Hub | Regra promocional aplicada no Checkout. | Base do Discount (Finance) na Invoice resultante. |
| `CartCreated` | Commerce Hub | Analytics Hub | Novo Cart iniciado. | — |
| `CartAbandoned` | Commerce Hub | Marketing Hub, AI Hub | Cart expirado sem Checkout. | Base de Remarketing. |
| `CheckoutStarted` | Commerce Hub | Analytics Hub | Cliente inicia confirmação de compra. | — |
| `CheckoutCompleted` | Commerce Hub | CRM Hub, Analytics Hub | Checkout confirmado, Order criado. | — |
| `OrderCreated` | Commerce Hub | Finance Hub, CRM Hub | Order formal registrado. | Finance Hub inicia Invoice/Payment Intent. |
| `OrderPaid` | Commerce Hub (em reação a `InvoicePaid`/`PaymentCaptured`, já Official) | CRM Hub, Marketing Hub, Analytics Hub | Pagamento confirmado pelo Finance Hub. | Libera Inventory/Shipment. |
| `OrderCancelled` | Commerce Hub | Finance Hub (quando exige Refund), CRM Hub | Order cancelado antes ou depois do pagamento. | Preserva histórico, nunca remove. |
| `OrderFulfilled` | Commerce Hub | Analytics Hub | Order pronto para envio/entrega digital. | Dispara Shipment, quando físico. |
| `QuoteCreated` / `QuoteAccepted` / `QuoteConvertedToOrder` | Commerce Hub | CRM Hub, Analytics Hub | Ciclo de proposta comercial negociada. | Converte em Order ao ser aceita. |
| `SubscriptionPlanSubscribed` | Commerce Hub | Finance Hub | Cliente confirma assinatura de oferta. | Finance Hub cria sua própria Subscription. |
| `StockUpdated` | Commerce Hub | Analytics Hub | Movimentação de estoque registrada. | Base de alerta de ruptura. |
| `ShipmentCreated` / `ShipmentDelivered` | Commerce Hub | CRM Hub, Analytics Hub | Ciclo de entrega física. | Fecha o Order como Delivered. |
| `ReturnRequested` / `ReturnApproved` | Commerce Hub | Finance Hub, CRM Hub | Decisão comercial de devolução. | Finance Hub processa Refund; Inventory revertido. |

---

## 30. Integração com os demais Hubs

**CRM Hub.** Publica `OpportunityWon`/Deal fechado (já Frozen), consumido pelo Commerce Hub para criar `Order` diretamente, sem passar por `Checkout` (venda B2B consultiva). Consome `OrderPaid`/`OrderCancelled`/`ReturnApproved` para registrar Timeline, mesmo padrão já formalizado em `CRM_HUB_ARCHITECTURE.md`, Capítulo 17.

**Marketing Hub.** Consome `OrderPaid`/`CartAbandoned` para calcular ROI/Attribution e para acionar Remarketing (`MARKETING_HUB_ARCHITECTURE.md`, Capítulo 20); pode associar `Coupon` a uma `Campaign`, referenciada por identificador.

**Content Hub.** Fornece `LandingPage`/`MediaAsset` reaproveitados pelo Catálogo (Capítulo 9); um `CTAConverted` de uma LandingPage de produto pode iniciar diretamente um `Checkout`.

**Conversation Hub.** Quando uma venda é fechada dentro de uma `Conversation` (Modelo 02), o atendente ou `Bot` cria o `Order` diretamente através do mesmo Comando usado pelo Checkout self-service — o Conversation Hub nunca cria `Order` diretamente; ele apenas fornece o contexto que leva o atendente a fazê-lo.

**Business Hub.** Informa Segmento/Moeda/Região, consumido para calibrar `Price`/`Catalog` disponível.

**AI Hub.** Consumido nos termos do Capítulo 28.

**Identity Hub.** Autentica e autoriza toda operação sobre `Product`/`Order`/`Inventory`; identifica Vendedor em cenário de Marketplace (Capítulo 27).

**Analytics Hub.** Consome todo Evento publicado pelo Commerce Hub para indicador consolidado de receita/margem/giro de estoque — nunca calculado pelo próprio Commerce Hub.

**Integration Hub.** Única via para gateway de pagamento (mediado pelo Finance Hub, nunca diretamente pelo Commerce Hub), transportadora de frete, e qualquer sistema externo de estoque.

```
              INTEGRAÇÃO DO COMMERCE HUB COM TODOS OS HUBS
   ┌───────────────────────────────────────────────────────────┐
   │  Commerce Hub                                                  │
   │    publica: OrderCreated · OrderPaid · OrderCancelled ·           │
   │             CartAbandoned · ShipmentDelivered ·                       │
   │             SubscriptionPlanSubscribed · ReturnApproved                   │
   │    consome: OpportunityWon (CRM Hub) · InvoicePaid, PaymentCaptured,          │
   │             RefundIssued (Finance Hub, já Official) · CTAConverted                │
   │             (Content Hub) · CampaignPublished (Marketing Hub)                        │
   └───────────────────────────────────────────────────────────┘
```

---

## 31. Segurança

Toda operação sensível — cancelamento de `Order`, aprovação de `Return`, alteração de `Price` — é autenticada e autorizada exclusivamente pelo Identity Hub. Dado de pagamento em si nunca transita pelo Commerce Hub além da confirmação de identidade do `Payment Method` já resolvida pelo Finance Hub — nenhum dado sensível de cartão é armazenado neste domínio, aplicação direta do princípio já implícito em `FINANCE_DOMAIN_BLUEPRINT.md`, ADR-004 (Integration é proprietário dos gateways).

---

## 32. Permissões

| Papel | Acesso típico |
|---|---|
| **Administrador de Loja** | Acesso total — Catálogo, Preço, Desconto, Marketplace. |
| **Vendedor** | Cria Quote, acompanha Order de sua carteira. |
| **Atendimento** | Cria Order a partir de Conversation, aprova Return. |
| **Logística** | Gerencia Inventory e Shipment. |
| **Analista** | Leitura de indicador consolidado; sem permissão de edição. |

---

## 33. Auditoria

Toda mudança relevante — `Order`, `Return`, ajuste de `Price` — produz registro auditável, mesmo padrão já Frozen/Official de toda a série. `Order`, uma vez `Cancelled`, preserva histórico integralmente, nunca removido fisicamente (Soft Delete).

---

## 34. Multi-Tenant

Nenhum componente mantém estado compartilhado entre `Catalog`/`Order` de Tenants diferentes, aplicação direta de `SAAS_ARCHITECTURE.md`, Capítulo 6 — inclusive em cenário de Marketplace (Capítulo 27), onde múltiplos Vendedores de um mesmo Tenant permanecem isolados de Vendedores de outro Tenant.

---

## 35. Escalabilidade

`Cart` e `Checkout`, de alto volume de leitura/escrita transitória, escalam independentemente de `Order`, de menor volume e maior necessidade de consistência forte — mesma disciplina de separação de caminho de escrita/leitura já Frozen em `CRM_HUB.md`, Capítulo 17. `Inventory` exige consistência mais rigorosa que `Cart` (nunca vender o mesmo estoque duas vezes), tratado como Aggregate com controle de concorrência dedicado, sem comprometer a escalabilidade do restante do domínio.

---

## 36. Diagramas ASCII

```
                    POSIÇÃO DO COMMERCE HUB NA PLATAFORMA
   ┌───────────────────────────────────────────────────────────┐
   │  Business Hubs                                                   │
   │  ┌─────────┐ ┌─────────┐ ┌────────────┐ ┌──────────┐ ┌─────────┐ │
   │  │ CRM Hub │ │Content  │ │Conversation │ │Marketing │ │Commerce │ │
   │  │         │ │Hub      │ │Hub          │ │Hub       │ │Hub (este│ │
   │  │         │ │         │ │             │ │          │ │documento)│ │
   │  └─────────┘ └─────────┘ └────────────┘ └──────────┘ └────┬────┘ │
   │                                                            │      │
   │                                                    (money) ▼      │
   │                                              Finance Hub (Official) │
   └───────────────────────────────────────────────────────────┘
```

```
              FRONTEIRA COMMERCE ↔ FINANCE (visão consolidada)
   ┌───────────────────────────────────────────────────────────┐
   │  Commerce Hub (o quê / processo)   Finance Hub (o dinheiro)    │
   │    Product/Variant                    —                          │
   │    Price (lista)                      —                             │
   │    Discount/Coupon (promocional)      Discount (de Invoice)             │
   │    Cart/Checkout                      Payment Intent/Charge                │
   │    Order                              Invoice/Payment                        │
   │    Subscription Plan (oferta)         Subscription (billing)                    │
   │    Return (decisão)                   Refund (execução)                            │
   │    —                                  Tax Record/Financial Document                    │
   └───────────────────────────────────────────────────────────┘
```

---

## 37. Tabelas Arquiteturais

### 37.1 Entidade → Ownership (verificação contra `DOMAIN_OWNERSHIP_MATRIX.md` e `FINANCE_DOMAIN_BLUEPRINT.md`)

| Entidade | Proprietário | Verificação |
|---|---|---|
| Product, Variant, Catalog, Category, Price, Discount (promocional), Coupon, Cart, CartItem, Checkout, Quote, Order, OrderItem, SubscriptionPlan, Inventory, StockMovement, Shipment, Return | Commerce Hub | Confirmado — território livre, nenhuma duplicação. |
| Invoice, Invoice Item, Payment, Payment Intent, Payment Method, Charge, Refund, Subscription (billing), Recurring Billing, Discount (de Invoice), Tax Record, Financial Document, Ledger Entry | Finance Hub | Confirmado — nenhum criado pelo Commerce Hub. |
| Customer, Lead, Opportunity/Deal | CRM Hub | Confirmado — Order referencia por identificador. |
| Campaign, Audience Segment | Marketing Hub | Confirmado — Coupon referencia Campaign por identificador. |

### 37.2 Reconciliação de nomenclatura

| Conceito | Nome no Commerce Hub (este documento) | Nome no Finance Hub (já Official) | Distinção |
|---|---|---|---|
| Redução de preço | Discount (promocional, de catálogo) | Discount (de Invoice) | Primeira é regra; segunda é o valor já aplicado à cobrança. |
| Cobrança recorrente | Subscription Plan (oferta) | Subscription (acordo de billing) | Primeira é o quê; segunda é o quanto/quando. |
| Devolução | Return (decisão comercial) | Refund (execução financeira) | Primeira aprova; segunda executa. |

### 37.3 KPIs (fatos brutos — cálculo consolidado permanece do Analytics Hub)

| Indicador de origem | Módulo produtor |
|---|---|
| Taxa de abandono de Cart | Cart/Checkout |
| Ticket médio por Order | Order Management |
| Giro de Inventory | Inventory |
| Taxa de conversão de Quote em Order | Quote Management |

---

## 38. Roadmap Evolutivo

| Fase | Foco | Observação |
|---|---|---|
| **Fase 1 — Catálogo** | Product, Variant, Category, Price. | Fundação, sem dependência de Finance Hub. |
| **Fase 2 — Carrinho e Checkout** | Cart, CartItem, Checkout, Discount/Coupon. | — |
| **Fase 3 — Pedido e integração com Finance Hub** | Order, fluxo completo do Capítulo 22. | Depende de Finance Hub já operacional. |
| **Fase 4 — Cotação** | Quote, integração com CRM Hub. | Depende de Fase 3. |
| **Fase 5 — Estoque e Entrega** | Inventory, StockMovement, Shipment. | — |
| **Fase 6 — Assinatura** | Subscription Plan, integração com Recurring Billing (Finance Hub). | Depende de Fase 3. |
| **Fase 7 — Marketplace** | Associação de Vendedor, sub-Order. | Depende de Fase 3-5 maduras. |
| **Fase 8 — IA aplicada ao Commerce** | As doze capacidades do Capítulo 28. | — |

---

## 39. Regras Arquiteturais

**ADR-CM-001 — Commerce Hub nunca cria Invoice, Payment, Refund, Subscription (billing), Tax Record ou Financial Document.** Todos permanecem exclusivos do Finance Hub, consumidos por Evento. Contexto: preservar Domain Ownership já Official em `FINANCE_DOMAIN_BLUEPRINT.md`.

**ADR-CM-002 — `Discount`/`Coupon` (Commerce) e `Discount` (Finance) são conceitos distintos, nunca fundidos.** O primeiro é regra promocional de catálogo; o segundo é a redução já aplicada a uma Invoice. Contexto: Nota de Posicionamento, Segunda reconciliação.

**ADR-CM-003 — `Subscription Plan` (Commerce) e `Subscription` (Finance) são conceitos distintos, nunca fundidos.** O primeiro é a oferta comercial; o segundo é o acordo de cobrança. Contexto: Nota de Posicionamento, Primeira reconciliação.

**ADR-CM-004 — `Order` é sempre a origem, nunca o destino, de qualquer Evento financeiro.** O Commerce Hub publica; o Finance Hub decide como e quando emitir Invoice/Payment Intent. Contexto: mesmo padrão já Frozen entre Opportunity (CRM) e Invoice (Finance), `CRM_DOMAIN_BLUEPRINT.md`, Capítulo 11.

**ADR-CM-005 — `Return` (Commerce) nunca processa devolução de valor diretamente.** Apenas aprova a decisão comercial; o Finance Hub cria seu próprio `Refund`. Contexto: preservar Domain Ownership já Official.

**ADR-CM-006 — Nenhum dado sensível de pagamento é armazenado pelo Commerce Hub.** Toda informação de `Payment Method` permanece exclusiva do Finance Hub, mediada pelo Integration Hub. Contexto: aplicação direta de `FINANCE_DOMAIN_BLUEPRINT.md`, ADR-004, e de boa prática de segurança de dado sensível.

**ADR-CM-007 — Este documento não altera `FINANCE_DOMAIN_BLUEPRINT.md`, `FINANCE_HUB.md` ou `DOMAIN_OWNERSHIP_MATRIX.md`.** A inclusão formal do Commerce Hub como décimo quarto proprietário da plataforma é um item de governança pendente. Contexto: mesmo princípio já registrado em `CONTENT_HUB_ARCHITECTURE.md`, ADR-CH-009; `CONVERSATION_HUB_ARCHITECTURE.md`, ADR-CV-009; `CRM_HUB_ARCHITECTURE.md`, ADR-CR-006; `MARKETING_HUB_ARCHITECTURE.md`, ADR-MK-006.

---

## 40. Conclusão

Este documento estabelece o Commerce Hub como o sexto domínio de negócio desta série, e o primeiro genuinamente novo desde o Content Hub — mas, diferente daquele, nasce cercado por um domínio já Official extremamente maduro (Finance Hub) com o qual a confusão seria fácil e o dano, se cometido, seria grave: duplicar `Invoice` ou `Payment` fragmentaria exatamente o dado mais sensível de toda a plataforma, o dinheiro, contrariando o próprio motivo pelo qual `FINANCE_DOMAIN_BLUEPRINT.md` foi escrito.

A disciplina central deste documento — nunca criar o que o Finance Hub já cria, sempre desencadear por Evento e aguardar de volta — é a mesma disciplina que `CRM_HUB_ARCHITECTURE.md` já demonstrou funcionar entre `Opportunity` e `Invoice`, agora replicada, com o mesmo rigor, entre `Order` e `Invoice`. O Commerce Hub sabe o que vende, sabe para quem (via CRM Hub), sabe como conversou sobre a venda (via Conversation Hub) e sabe por que a venda aconteceu (via Marketing Hub) — mas nunca sabe, e nunca precisa saber, como o dinheiro efetivamente se move. Essa ignorância deliberada é, precisamente, o que preserva o Finance Hub como fonte única de verdade financeira, exatamente como seus próprios ADRs já exigem.

Um item de governança permanece pendente: a inclusão formal do Commerce Hub em `DOMAIN_OWNERSHIP_MATRIX.md` como décimo quarto proprietário da plataforma (ADR-CM-007), não resolvido por este documento isoladamente — exige seu próprio processo de Review e Approval, conforme `DOCUMENTATION_CONSTITUTION.md`, §13 e §14.
