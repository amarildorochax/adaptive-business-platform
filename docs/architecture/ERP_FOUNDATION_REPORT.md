# ERP-001 — Enterprise Resource Planning Foundation — Relatório de Fechamento

**Adaptive Business Platform · Relatório de Sprint**

---

## Nota de Posicionamento Documental

Este relatório fecha a Sprint ERP-001. Nenhum código, Manager, Service, Repository, endpoint, tabela, esquema SQLite, DTO ou tela foi criado, alterado ou sequer esboçado por esta Sprint — todo artefato produzido é documentação de domínio, em `docs/architecture/`: `ERP_ARCHITECTURE.md`, `PURCHASE_HUB.md`, `SUPPLIER_HUB.md`, `INVENTORY_MOVEMENT_HUB.md`, `PRODUCTION_HUB.md`, `FISCAL_HUB.md`, `FINANCIAL_HUB.md`, `ORDER_HUB.md`, `DOMAIN_EVENT_CATALOG.md`, `ERP_CONTEXT_MAP.md`, mais este relatório. Todos os dez nasceram em status **Draft** — arquitetura pronta para implementação futura, não capacidade já entregue.

---

## 1. Decisões Tomadas

**Cinco novos proprietários, não dez.** Dos dez domínios nomeados pela Sprint, apenas Purchase Hub, Supplier Hub, Inventory Movement Hub, Production Hub e Fiscal Hub tornam-se Owner de conceito novo. Order Hub, Financial Hub e Pricing (esta última sem documento próprio) reconciliam com Owners já existentes — Commerce Hub e Finance Hub, ambos previamente estabelecidos pela série BP-001–008 e pelo Volume I Architecture Handbook. Procurement é absorvido pelo Purchase Hub como sua camada estratégica; Manufacturing é o mesmo Bounded Context de Production Hub sob outro nome. Decisão registrada como ADR-ERP-001.

**Inventory Movement Hub torna-se o eixo central do desenho.** Elevado a Bounded Context próprio, separado do Commerce Hub, porque é o único domínio consumido tanto pelo lado de suprimento (Purchase, Production) quanto pelo lado de demanda (Commerce) — uma Change Request formal foi proposta contra `COMMERCE_HUB_ARCHITECTURE.md`, Capítulo 25, nunca executada unilateralmente. Decisão registrada como ADR-IM-001/ADR-ERP-002.

**Ledger Before Snapshot estendido ao estoque físico.** O padrão já maduro em Finance Hub (`Ledger Entry` → `Balance`) foi replicado para o domínio físico (`Stock Movement` → `Stock Position`), eliminando qualquer campo de saldo diretamente editável em favor de projeção sempre recalculada.

**Physical Before Financial como princípio transversal.** Todo fato físico (recebimento, produção) é registrado independentemente da confirmação financeira correspondente, replicando o desacoplamento já validado entre `Order` e `Invoice` no Commerce Hub.

**Financial Hub e Order Hub tratados como documentos de reconciliação, não Hubs.** Ambos declaram explicitamente "o que não são" antes de "o que são", seguindo o mesmo rigor de verificação prévia já exigido por `DOMAIN_OWNERSHIP_MATRIX.md`, Capítulo 11.

**Nenhum dos cinco novos Hubs calcula seu próprio indicador consolidado.** Giro de estoque, lead time de fornecedor, custo médio de aquisição e carga tributária consolidada permanecem exclusivos do Analytics Hub, aplicação direta de ADR-016 já Frozen.

**Nenhum Agente de IA descrito possui autoridade de escrita.** Os quatro Agentes desenhados no Capítulo 8 de `ERP_ARCHITECTURE.md` — Reposição, Seleção de Fornecedor, Previsão de Demanda de Produção, Conformidade Fiscal — produzem apenas sugestão, sujeita a confirmação humana ou Regra determinística já configurada.

---

## 2. Alternativas Descartadas

**Um único "ERP Hub" monolítico.** Descartado por violar High Cohesion e Single Owner — um único proprietário para Compra, Fornecedor, Estoque, Produção e Fiscal reproduziria exatamente o antipadrão que `BUSINESS_HUB_ARCHITECTURE.md`, Capítulo 3, já descreve como degradação silenciosa e inevitável.

**Inventory como propriedade exclusiva do Commerce Hub, mantendo o texto original de `COMMERCE_HUB_ARCHITECTURE.md`.** Descartado porque exigiria que Purchase Hub e Production Hub escrevessem indiretamente sobre uma estrutura que não é sua, violando Consumer Never Owns; a alternativa escolhida (Inventory Movement Hub como novo Owner do ledger, Commerce Hub como consumidor de projeção) preserva a garantia sem exigir reescrita de nenhuma linha já Draft.

**Financial Hub como novo Owner de Account Payable/Ledger Entry paralelo.** Descartado de imediato — criaria exatamente a "duplicação silenciosa de indicador" que ADR-016 de `DOMAIN_OWNERSHIP_MATRIX.md` trata como violação de ownership, não como otimização.

**Supplier como extensão de `Organization` (CRM Hub) via um campo de "tipo de relacionamento".** Descartado porque acoplaria estruturalmente o lado cliente e o lado fornecedor da cadeia de valor — uma mudança em `Organization` (CRM Hub) se propagaria involuntariamente para Supplier, violando Anti-Corruption Layer; a alternativa escolhida (duas Entidades distintas, unidas apenas por identificador externo opcional) preserva independência total de evolução.

**Order Hub como novo Aggregate de "Sales Order" distinto do `Order` já existente no Commerce Hub.** Descartado porque produziria exatamente o caso de "Duplicar Customer"/"Duplicar Invoice" já descrito como violação em `DOMAIN_OWNERSHIP_MATRIX.md`, Capítulo 10, aplicado a um terceiro conceito.

**Pricing Hub como novo Owner de uma segunda Entidade de preço "orientada a custo".** Descartado pelo mesmo motivo — `Price` já é Official do Commerce Hub, com implementação real confirmada; a alternativa escolhida documenta apenas um contrato de leitura de `acquisitionCost`, nunca uma segunda fonte de verdade de preço.

---

## 3. Validação Explícita

**Todos os domínios estão decoupled?** Sim. Cada um dos cinco novos Hubs comunica-se exclusivamente por Evento — nenhum Command de um Hub é invocado diretamente por outro, e nenhuma leitura de estrutura interna atravessa fronteira de Hub em nenhum dos sete documentos desta série. Verificado capítulo "Limites do Domínio" de cada um.

**Existe dependência circular?** Não. O Dependency Graph de `ERP_CONTEXT_MAP.md`, Capítulo 4, foi percorrido a partir de cada um dos sete nós (cinco novos Hubs mais Order/Financial como extensões) e nenhum caminho de consumo de Evento retorna ao nó de origem — é um DAG completo. O caso mais próximo de um ciclo aparente — Inventory Movement Hub consumido por Purchase Hub (via `InventoryAdjusted`→`ReorderRuleTriggered`) e Purchase Hub produzindo `PurchaseReceived`→Inventory Movement Hub — não é um ciclo real porque cada seta representa consumo de Evento assíncrono, nunca chamada de escrita síncrona; a mesma disciplina já valida ausência de ciclo entre CRM Hub e Finance Hub (`OpportunityWon`↔`InvoicePaid`) na plataforma já existente.

**Os Eventos cobrem todos os fluxos?** Sim, para os quatro fluxos ponta a ponta exigidos pela Sprint (Compra, Venda, Produção, Financeiro) — cada transição de estado relevante em cada um dos quatro diagramas de `ERP_ARCHITECTURE.md`, Capítulo 7, tem um Evento correspondente já catalogado em `DOMAIN_EVENT_CATALOG.md`. Nenhuma transição silenciosa (mudança de estado sem Evento publicado) foi encontrada na revisão cruzada dos quatro fluxos contra o catálogo.

**Os Managers continuam sendo a única fachada?** Sim — cada um dos cinco novos Hubs especifica exatamente um Manager (`PurchaseManager`, `SupplierManager`, `InventoryMovementManager`, `ProductionManager`, `FiscalManager`) como único ponto de entrada de Command, replicando o padrão já estabelecido em todo Hub existente (`CommerceManager`, `CRMManager`) e confirmado pelas auditorias FUN-103 a FUN-106.

**As Repository Interfaces estão isoladas?** Sim — cada Repository Interface especificada (Capítulo 10/9 de cada documento de Hub) referencia apenas Entidade do próprio domínio; toda referência a Entidade de outro Hub (`productId`, `supplierId`, `orderId`) é um identificador opaco no payload, nunca um tipo importado de outro domínio. Nenhuma implementação concreta (SQLite, in-memory) foi especificada — a interface permanece o único contrato normativo desta Sprint.

**A arquitetura suporta pequena Empresa?** Sim — `Stock Location` (Inventory Movement Hub) e `Work Center` (Production Hub) são explicitamente Capabilities opcionais, ausentes por padrão em uma Empresa de ponto físico único; `Tax Regime`/`Fiscal Document` (Fiscal Hub) são opcionais, nunca bloqueantes do fluxo de venda; uma Empresa de serviço puro pode operar com todos os cinco novos Hubs desabilitados via Business Profile Engine, exatamente como já ocorre hoje com Commerce Hub.

**A arquitetura suporta crescimento futuro?** Sim — `Stock Location` permite expansão para múltiplos pontos físicos sem mudança de Aggregate; `Bill of Materials` é versionada, suportando evolução de composição sem perda de histórico; `Reorder Rule` e os quatro Agentes de IA do Capítulo 8 de `ERP_ARCHITECTURE.md` são o caminho natural de automação crescente à medida que o volume de operação aumenta.

**A arquitetura suporta múltiplos segmentos de negócio?** Sim — nenhum dos cinco novos Hubs pressupõe um segmento específico; uma Empresa de manufatura usa os cinco integralmente, uma Empresa de revenda pura usa Purchase/Supplier/Inventory Movement sem nunca habilitar Production, e uma Empresa de serviço puro não habilita nenhum — a mesma adaptação por Capability já validada em `BUSINESS_PROFILE_ENGINE.md` aplica-se sem exceção.

**A arquitetura suporta IA?** Sim, sob Human Oversight estrito — os quatro Agentes do Capítulo 8 de `ERP_ARCHITECTURE.md` consomem exclusivamente Evento e Query já expostos, nunca leem estrutura interna; nenhum produz efeito de escrita sem confirmação humana ou Regra determinística já configurada, aplicação direta de ADR-009 de `AI_HUB.md`, já Frozen.

---

## 4. Limites do Domínio (consolidado)

Nenhum dos cinco novos Hubs decide preço de venda, cria Cliente, cria Produto, ou processa pagamento — cada um desses limites já está registrado individualmente em cada documento de Hub, Capítulo "Limites do Domínio", e é reafirmado aqui apenas como síntese: **o ERP Foundation desta Sprint cobre exclusivamente o lado de suprimento (comprar, receber, produzir, conformar-se fiscalmente) — nunca decide o lado de demanda (vender, cobrar, atender), que permanece intocado em CRM Hub, Commerce Hub e Finance Hub.**

---

## 5. Oportunidades Futuras (fora do escopo desta Sprint)

**Devolução ao Fornecedor.** `PURCHASE_HUB.md`, Capítulo 12, identifica explicitamente que cancelamento após recebimento parcial (devolução) está fora do escopo — Purchase Order só cancela antes de qualquer Receiving.

**Avaliação qualitativa manual de Fornecedor.** `SUPPLIER_HUB.md`, Capítulo 11, hoje restringe `Supplier Performance Record` a fato observável automático; uma nota subjetiva de relacionamento comercial é uma extensão natural, não modelada nesta Sprint.

**Rateio de custo indireto de produção.** `PRODUCTION_HUB.md` e `FINANCIAL_HUB.md` cobrem apenas o custo direto de insumo consumido (COGS simples); rateio de custo fixo (energia, mão de obra indireta) é uma extensão de `Ledger Entry`, fora do escopo de arquitetura pura desta Sprint.

**Múltiplas alíquotas compostas e retenção tributária.** `FISCAL_HUB.md` modela `Tax Rule` como uma alíquota única por classificação; composição de múltiplos tributos (federal, estadual, municipal) simultâneos sobre a mesma linha é uma extensão natural do mesmo Aggregate, não detalhada aqui.

**Regra de margem de precificação orientada a custo.** `ORDER_HUB.md`, Capítulo 2.4, formaliza apenas o contrato de leitura de `acquisitionCost`; a regra de decisão de margem em si (percentual fixo, dinâmico, por categoria) permanece a implementar no Commerce Hub, quando essa Sprint futura ocorrer.

**Multi-moeda em Purchase Hub para Fornecedor internacional.** `Money`/`Currency` já são Value Objects referenciados de Finance Hub, mas nenhuma regra de câmbio aplicada a uma compra internacional foi detalhada nesta Sprint.

---

## 6. Preparação para Fase 2

A Fase 2, quando comissionada, é a tradução deste desenho de domínio em construção real — seguindo exatamente o mesmo padrão de implementação já validado por FUN-101 a FUN-106: primeiro os pacotes de domínio (`packages/purchase-hub`, `packages/supplier-hub`, `packages/inventory-movement-hub`, `packages/production-hub`, `packages/fiscal-hub`, cada um com seu próprio Manager/Service/Repository real, seguindo as interfaces já especificadas nos Capítulos 9–10 de cada documento desta Sprint), depois sua composição em `buildManagers.ts` (mesmo padrão de wiring in-process já estabelecido desde FUN-001), e só então os Workspaces de Frontend correspondentes — o que hoje é `NotConnectedNotice` em Ordens de Compra e Fornecedores (`PurchasePage.tsx`, FUN-106) torna-se o primeiro candidato natural de conexão real, porque já existe UI esperando exatamente esses dois domínios.

A ordem recomendada de implementação, por menor acoplamento de dependência (per `ERP_CONTEXT_MAP.md`, Capítulo 4): **Supplier Hub primeiro** (nenhuma dependência de Evento de outro novo Hub) → **Purchase Hub** (depende de Supplier) → **Inventory Movement Hub** (depende de Purchase) → **Production Hub** (depende de Inventory Movement) → **Fiscal Hub** (depende de Finance/Commerce já existentes, independente dos quatro anteriores, podendo ser paralelizado).

---

## 7. Documentos Produzidos por Esta Sprint

| Documento | Papel |
|---|---|
| `ERP_ARCHITECTURE.md` | Documento mestre — reconciliação, quatro fluxos, integrações, IA |
| `PURCHASE_HUB.md` | Novo Owner — inclui Procurement |
| `SUPPLIER_HUB.md` | Novo Owner |
| `INVENTORY_MOVEMENT_HUB.md` | Novo Owner — eixo central |
| `PRODUCTION_HUB.md` | Novo Owner — inclui Manufacturing |
| `FISCAL_HUB.md` | Novo Owner |
| `FINANCIAL_HUB.md` | Reconciliação — extensão de Finance Hub |
| `ORDER_HUB.md` | Reconciliação — extensão de Commerce Hub; inclui Pricing |
| `DOMAIN_EVENT_CATALOG.md` | Extensão de `EVENT_CATALOG.md` — 31 novos Eventos |
| `ERP_CONTEXT_MAP.md` | Cinco diagramas: Context Map, Event Flow, Aggregate Relations, Dependency Graph, Module Map |
| `ERP_FOUNDATION_REPORT.md` | Este relatório |

Todos em status **Draft** — nenhum código foi escrito.
