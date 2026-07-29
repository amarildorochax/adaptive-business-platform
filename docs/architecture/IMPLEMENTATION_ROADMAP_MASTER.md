# Implementation Roadmap Master

**Adaptive Business Platform · Documento de Arquitetura (Draft)**

---

## Nota de Posicionamento Documental

Este documento não descobre nada novo. As nove Sprints anteriores (BP-001 a BP-009) já produziram toda a arquitetura e já registraram, em `ARCHITECTURE_RECONCILIATION_AND_GOVERNANCE.md`, todo conflito, toda lacuna e todo item de governança pendente. Este documento parte inteiramente desse inventário já fechado e responde a uma pergunta diferente: dada essa arquitetura, nessa ordem, com que critério, com que rede de segurança, e com que porta de saída por fase, a plataforma é efetivamente construída? Nenhuma linha aqui redefine um conceito, cria um domínio, altera ownership ou modifica qualquer Blueprint — este é um documento de sequenciamento e de estratégia de entrega, não de arquitetura de domínio.

Um ponto de leitura obrigatória exige registro explícito: três dos itens pendentes listados em `ARCHITECTURE_RECONCILIATION_AND_GOVERNANCE.md` — a reconciliação de nomenclatura do CRM (Organization/Company, Opportunity/Deal, Timeline Event/HistoryEntry), a decisão de nome de arquivo do Business Structure Hub, e a reconciliação das três definições de Agent — não são apenas itens de documentação. Eles são, também, **riscos de implementação de primeira ordem**, porque cada um, se não resolvido antes da fase correspondente começar, se propaga para nome de tabela, nome de endpoint, e nome de classe em código real. Este documento os trata dessa forma — como pré-requisito de fase, não apenas como nota de rodapé documental — nos Capítulos 11 e nas fichas de fase correspondentes.

---

## 1. Introdução

Este é o Plano Diretor de Implementação da Adaptive Business Platform. Ele traduz nove documentos de arquitetura — um modelo de 8 Hubs, sete Blueprints de domínio e um documento de reconciliação — em uma sequência executável de doze fases, cada uma com objetivo, dependência, risco, entregável e critério de saída explícitos.

---

## 2. Objetivos do Roadmap

Definir a ordem correta de construção, de modo que nenhum Hub seja implementado antes de um Hub do qual depende estruturalmente. Tornar explícito, para cada fase, o que "concluído" significa, evitando o padrão comum de fases que nunca terminam formalmente. Estabelecer uma estratégia de entrega incremental que nunca exija uma parada de Big Bang. Registrar, antes que aconteçam, os riscos já visíveis a partir da arquitetura hoje consolidada.

---

## 3. Princípios da Implementação

**Arquitetura antes de código.** Nenhuma fase começa sem que o Blueprint correspondente já exista — condição já satisfeita para as doze fases deste roadmap, porque BP-001 a BP-008 já cobriram todo Hub aqui sequenciado.

**Incremental sobre Big Bang.** Toda fase entrega valor de forma isolada e reversível, nunca dependente de uma virada simultânea de múltiplos Hubs.

**Reconciliação antes de escala.** Nenhum item de nomenclatura pendente listado em `ARCHITECTURE_RECONCILIATION_AND_GOVERNANCE.md` é ignorado só porque "não bloqueia o código de rodar" — quanto mais tarde resolvido, mais caro fica, princípio já demonstrado pela própria divergência Organization/Company já existente em produção.

**Reversibilidade sempre disponível.** Toda entrega usa Feature Flag, já detalhado como mecanismo nativo em `SAAS_ARCHITECTURE.md`, Capítulo 10 — nenhuma fase é lançada sem caminho de reversão.

**Governança contínua, não só ao final.** Review e Approval, per `DOCUMENTATION_CONSTITUTION.md`, §13/§14, não esperam o fim de uma fase — acontecem em checkpoints definidos no Capítulo 34.

---

## 4. Premissas

A arquitetura documentada por BP-001 a BP-009 é considerada estável o suficiente para orientar implementação, mesmo permanecendo Draft — Draft não impede implementação, apenas impede que outro documento a cite como autoridade assentada (`DOCUMENTATION_CONSTITUTION.md`, §8.1). A implementação real hoje cobre apenas Dashboard e o módulo operacional de CRM. Nenhuma equipe de implementação começa uma fase sem ter lido o Blueprint correspondente e o Capítulo de reconciliação relevante deste roadmap. Toda equipe tem acesso a `ARCHITECTURE_RECONCILIATION_AND_GOVERNANCE.md` como referência de conflitos conhecidos.

---

## 5. Estado Atual da Plataforma

Implementado em código: Dashboard, módulo operacional de CRM (`src/app/features/crm/`), navegação global (`GlobalNavSidebar`). Documentado, não implementado: Content Hub, Conversation Hub (extensões sobre Communication Hub já Official), Marketing Hub (extensões sobre Growth Hub já Official), Commerce Hub, Business Structure Hub, extensões de AI Hub (Tool/MCP/RAG/Vector/Prompt System). Já maduro e Official/Frozen, mas parcialmente implementado: Identity, Finance, Analytics, Automation, Knowledge, Integration, Business Profile, Branding — nenhum ainda com implementação confirmada além do que CRM já consome indiretamente.

---

## 6. Estado Desejado

Doze Hubs/domínios operando sob o mesmo Event Bus e Command Bus já descritos em `SYSTEM_BLUEPRINT.md`, cada um respeitando exatamente o ownership já consolidado em `DOMAIN_OWNERSHIP_MATRIX.md` e na Matriz Definitiva proposta por `ARCHITECTURE_RECONCILIATION_AND_GOVERNANCE.md`, Capítulo 27. Nenhuma divergência de nomenclatura entre Blueprint e código remanescente. Toda nova capacidade de IA passando pelo AI Hub já estendido por `AI_HUB_ARCHITECTURE.md`.

---

## 7. Estratégia Geral de Implementação

Construção por camada de dependência, não por ordem alfabética ou por prioridade de produto isolada: primeiro a fundação técnica (Fase 1), depois identidade e estrutura organizacional (Fases 2-3), depois o domínio já mais maduro e já parcialmente implementado (Fase 4 — CRM), depois os domínios que dependem de CRM para fazer sentido (Fases 5-8), depois o domínio financeiro que fecha o ciclo comercial (Fase 9), depois inteligência artificial madura o suficiente para operar sobre uma base de dados já real (Fase 10), e por último as duas camadas que são, por desenho, consumidoras universais — Analytics e Integration (Fases 11-12).

---

## 8. Arquitetura de Entregas

Cada fase produz: um conjunto de Command/Query/Event já formalizado no Blueprint correspondente; a integração com o Event Bus já descrita em `SYSTEM_BLUEPRINT.md`; e, quando aplicável, a superfície de UI consumida a partir do Dashboard já existente. Nenhuma fase entrega infraestrutura nova fora do que já está descrito em `SYSTEM_BLUEPRINT.md` — esta é uma restrição deliberada, para que a Fase 1 nunca precise ser revisitada.

---

## 9. Dependências entre Hubs

Identity é pré-condição de todo Hub, porque nenhuma operação de negócio acontece sem Autenticação e Autorização resolvidas primeiro (`IDENTITY_HUB.md`, Capítulo 4). Business Structure depende de Identity para Membership. CRM depende de Business Structure para Territory/Branch, mas pode operar sem eles no caso mais simples de Empresa única. Conversation depende de CRM para o Inbox único convergir para um Customer já existente. Content é a mais independente de todas — só depende de Identity. Marketing depende de CRM (Lead Scoring consumido) e de Conversation (canal de disparo). Commerce depende de Finance para o handshake Order→Invoice, mas pode ter Catalog e Cart implementados antes disso. Finance não depende de nenhum Hub novo desta série — já é Official e madura. AI depende de todo Hub cuja Query/Command uma Tool for invocar, portanto é deliberadamente sequenciada tarde. Analytics e Integration são consumidores universais, por desenho sequenciados por último.

---

## 10. Matriz de Dependências

| Hub / Fase | Depende de | Bloqueia | Prioridade | Complexidade | Risco | Status Esperado ao Fim |
|---|---|---|---|---|---|---|
| Foundation | Nenhum | Todas as demais | Crítica | Média | Baixo | Event Bus/Command Bus operacionais |
| Identity | Foundation | Business, CRM, todas as demais | Crítica | Média | Baixo | RBAC/ABAC operacional |
| Business (Structure) | Identity | CRM (parcial), Analytics (dimensão) | Alta | Baixa | Médio — nome de arquivo pendente | Business Unit/Branch consultáveis |
| CRM | Identity, Business (parcial) | Conversation, Marketing, Commerce (parcial), Finance (parcial) | Crítica | Alta | Alto — divergência de nomenclatura já em produção | Nomenclatura reconciliada e Timeline operacional |
| Conversation | CRM, Identity | Marketing (canal) | Alta | Alta | Médio — nome pendente (Conversation/Communication) | Inbox único operacional |
| Content | Identity | Marketing (conteúdo) | Média | Média | Baixo | `LeadCaptured` publicado e consumido pelo CRM |
| Marketing | CRM, Conversation, Content | Analytics (indicador) | Média | Alta | Médio — Lifecycle Stage e nome pendentes | Growth Loop mensurável |
| Commerce | Identity, Finance (handshake) | Analytics | Média | Muito Alta | Médio — maior superfície nova (20 entidades) | Checkout→Delivery íntegro |
| Finance | Nenhum novo | Commerce, Marketing (parcial) | Crítica | Baixa (já Official) | Baixo | Consumo de eventos de Commerce íntegro |
| AI | Todo Hub cuja Tool invoca | Nenhum | Alta | Muito Alta | Alto — três definições de Agent não reconciliadas | Primeira Tool interna rastreável |
| Analytics | Todas as anteriores (parcial) | Nenhum | Alta | Média (já Official) | Baixo | Indicador por Business Unit/Branch/Growth Loop |
| Integration | AI (MCP) | Nenhum | Média | Média | Médio — risco de sobreposição com MCP | Nenhuma sobreposição observada em produção |

---

## 11. Ordem Oficial de Implementação

Foundation → Identity → Business → CRM → Conversation → Content → Marketing → Commerce → Finance → AI → Analytics → Integration. Esta ordem não é arbitrária: cada Hub aparece depois de todo Hub do qual depende estruturalmente, conforme a Matriz do Capítulo 10, e Finance aparece depois de Commerce apenas porque o handshake exige ambos operacionais para ser testado de ponta a ponta — a implementação técnica de Finance, por já ser Official e madura, poderia começar em paralelo a qualquer momento a partir da Fase 1.

---

### Fases Oficiais de Implementação — Especificação Completa

#### Fase 1 — Foundation

**Objetivo.** Estabelecer o Event Bus, o Command Bus e a Data Layer multi-tenant já descritos em `SYSTEM_BLUEPRINT.md`. **Escopo.** Infraestrutura transversal apenas; nenhuma lógica de domínio. **Dependências.** Nenhuma. **Pré-requisitos.** Nenhum. **Riscos.** `SYSTEM_BLUEPRINT.md` é Draft — risco de a implementação divergir de um documento ainda não estabilizado; mitigado tratando esta fase como a mais sujeita a ajuste retroativo de documentação, nunca de código já em produção por outras fases. **Entregáveis.** Event Bus operacional; Command Bus operacional; isolamento de dado por Tenant verificável. **Critérios de entrada.** Nenhum — fase inicial. **Critérios de saída.** Um evento publicado por um serviço de teste é corretamente isolado por Tenant e consumido por um segundo serviço de teste. **Critérios de aceite.** Zero vazamento de dado entre Tenant em teste de carga cruzada. **Métricas de sucesso.** Latência de publicação/consumo de evento dentro do orçamento definido por `NON_FUNCTIONAL_REQUIREMENTS.md`.

#### Fase 2 — Identity

**Objetivo.** Tenant, Workspace, Autenticação e RBAC/ABAC operacionais, conforme `SAAS_ARCHITECTURE.md` e `IDENTITY_HUB.md`, ambos Official. **Escopo.** Identity Hub completo; nenhuma lógica de negócio de outro Hub. **Dependências.** Fase 1. **Pré-requisitos.** Fase 1 concluída. **Riscos.** Baixo — domínio maduro e já Official; risco residual apenas de cronograma. **Entregáveis.** Login, Sessão, os oito Papéis nomeados, Permission Resolver operacional. **Critérios de entrada.** Event Bus disponível. **Critérios de saída.** Um Usuário autentica, recebe um Papel, e tem uma ação negada corretamente por falta de Permissão. **Critérios de aceite.** Toda tentativa de acesso cruzado entre Workspace é negada em teste. **Métricas de sucesso.** Cobertura de teste de autorização por Papel nomeado, 100% dos oito Papéis exercitados.

#### Fase 3 — Business (Structure)

**Objetivo.** Business Unit e Branch operacionais, conforme `BUSINESS_STRUCTURE_HUB_ARCHITECTURE.md`. **Escopo.** As duas Entidades genuinamente novas daquele documento; nenhuma reimplementação de Tenant/Workspace/Role, já cobertos pela Fase 2. **Dependências.** Fase 2. **Pré-requisitos.** Decisão formal do nome de arquivo definitivo (ADR-BS-001, ainda pendente per `ARCHITECTURE_RECONCILIATION_AND_GOVERNANCE.md`, Capítulo 15) — resolver antes de nomear tabela ou módulo de código, para não repetir a divergência já sofrida pelo CRM. **Riscos.** Médio — se a fase começar antes da decisão de nome, o código herda a mesma ambiguidade já identificada na documentação. **Entregáveis.** Business Unit e Branch consultáveis; Membership com escopo opcional de ABAC por Branch. **Critérios de entrada.** Fase 2 concluída e nome de arquivo/módulo decidido. **Critérios de saída.** Um Financeiro de teste tem Permissão restrita a uma Branch específica. **Critérios de aceite.** Nenhuma Permissão vazando entre Branch da mesma Empresa. **Métricas de sucesso.** Zero incidente de escopo incorreto em teste de Branch múltipla.

#### Fase 4 — CRM

**Objetivo.** Consolidar a implementação já existente com o Blueprint Frozen, fechando a divergência de nomenclatura. **Escopo.** Todo o domínio já descrito em `CRM_DOMAIN_BLUEPRINT.md`/`CRM_HUB.md`, mais Note, ContactCreated e CustomerMerged, propostos por `CRM_HUB_ARCHITECTURE.md`. **Dependências.** Fase 2, Fase 3 (parcial, para Territory). **Pré-requisitos.** **Crítico**: decisão formal do Amendment de nomenclatura (Organization/Company, Opportunity/Deal, Timeline Event/HistoryEntry), per `ARCHITECTURE_RECONCILIATION_AND_GOVERNANCE.md`, Capítulo 23 — esta é a única fase deste roadmap com um pré-requisito de governança bloqueante, porque código de produção já existe e diverge do Blueprint Frozen. **Riscos.** Alto — todo dia sem essa decisão aumenta o custo de uma eventual migração de nome de tabela/classe em produção. **Entregáveis.** Nomenclatura convergente entre Blueprint e código; Note, ContactCreated e CustomerMerged implementados; Timeline imutável operacional. **Critérios de entrada.** Fase 2 concluída; Amendment de nomenclatura decidido (não necessariamente executado, mas decidido). **Critérios de saída.** Toda entidade de CRM em produção usa o nome formalmente decidido, sem exceção. **Critérios de aceite.** Zero referência ao nome descontinuado em código novo. **Métricas de sucesso.** 100% de cobertura de migração de nome nas tabelas já em produção, medida por auditoria de schema.

#### Fase 5 — Conversation

**Objetivo.** Queue, Department, SLA, Bot, ConversationalFlow, AttendanceSession, ChannelHandle operacionais sobre a base já Official de Communication Hub. **Escopo.** As nove Entidades novas de `CONVERSATION_HUB_ARCHITECTURE.md`; nenhuma reimplementação de Conversation/Message/Channel, já Official. **Dependências.** Fase 2, Fase 4 (Inbox único convergindo para Customer já existente). **Pré-requisitos.** Fase 4 concluída; nome "Conversation Hub" vs. "Communication Hub" não precisa estar resolvido para começar a implementação interna, mas deve estar resolvido antes de expor qualquer endpoint público ou nome de pacote. **Riscos.** Médio — Bot mal configurado pode criar Lead ou processar pagamento diretamente, violação já proibida por ADR-CV-005; mitigado por revisão obrigatória de todo fluxo de Bot antes de produção. **Entregáveis.** Inbox único; Queue/Department com roteamento; SLA mensurável; Bot restrito a publicar Evento, nunca a executar Command de outro Hub diretamente. **Critérios de entrada.** Fase 4 concluída. **Critérios de saída.** Uma Conversation é roteada corretamente por Department e escalada por SLA. **Critérios de aceite.** Nenhum Bot executando ação fora do escopo de ADR-CV-005 em teste de penetração funcional. **Métricas de sucesso.** Tempo médio de resposta dentro do SLA configurado, em ambiente de teste de carga.

#### Fase 6 — Content

**Objetivo.** Blog, SEO, Landing Page, Web Stories, Newsletter (conteúdo) como módulos do Content Hub. **Escopo.** Os doze módulos internos de `CONTENT_HUB_ARCHITECTURE.md`, absorvendo os seis documentos legados de `docs/requirements/growth/`. **Dependências.** Fase 2. **Pré-requisitos.** Idealmente, Change Request de atualização de cabeçalho dos seis documentos legados (per `ARCHITECTURE_RECONCILIATION_AND_GOVERNANCE.md`, Capítulo 24, item 5) decidido antes do início, para que a nova implementação já nasça sob o Owner correto sem exigir retrabalho de atribuição. **Riscos.** Baixo — território genuinamente livre, sem conflito de ownership. **Entregáveis.** CMS Engine, Blog Manager, SEO Manager, Landing Page Builder, Web Stories Manager; `LeadCaptured` publicado corretamente. **Critérios de entrada.** Fase 2 concluída. **Critérios de saída.** Um formulário publicado por Content Hub gera `LeadCaptured`, consumido corretamente pelo CRM Hub (Fase 4) sem que Content Hub crie o Lead diretamente. **Critérios de aceite.** Zero criação direta de Lead por Content Hub em teste — violação de ADR-CH-001. **Métricas de sucesso.** 100% dos Leads capturados por formulário rastreáveis de ponta a ponta até o CRM Hub.

#### Fase 7 — Marketing

**Objetivo.** Growth Loop e Lead Scoring operacionais sobre a base já Official de Growth Hub. **Escopo.** Growth Loop, per `MARKETING_HUB_ARCHITECTURE.md`; consumo correto de Lead Scoring pelo CRM Hub via `CrmAiAssistProvider`. **Dependências.** Fase 4 (consumo de Lead Scoring), Fase 5 (canal de disparo), Fase 6 (conteúdo alimentando o Loop). **Pré-requisitos.** Nenhum bloqueante — a leitura de desempate do conflito de Lifecycle Stage já está aplicada (CRM Hub vence, per ADR-MK-005); a correção formal da tabela de `GROWTH_DOMAIN_BLUEPRINT.md` é recomendada, mas não bloqueia início de implementação. **Riscos.** Médio — se Lead Scoring for implementado antes de ADR-MK-004 ser respeitado, risco de recriar o cálculo duplicado que a própria Sprint já preveniu na documentação. **Entregáveis.** Growth Loop mensurável; Lead Scoring calculado uma única vez, no Marketing/Growth Hub, consumido pelo CRM Hub. **Critérios de entrada.** Fase 4 e Fase 6 concluídas. **Critérios de saída.** Um Lead Score calculado é consumido pelo CRM Hub sem recálculo local. **Critérios de aceite.** Zero implementação paralela de cálculo de score fora do Growth/Marketing Hub. **Métricas de sucesso.** Growth Loop completo (aquisição→indicação→nova aquisição) mensurável no Analytics Hub (Fase 11).

#### Fase 8 — Commerce

**Objetivo.** Product, Variant, Catalog, Cart, Checkout, Order, Inventory, Shipment operacionais. **Escopo.** As vinte entidades de `COMMERCE_HUB_ARCHITECTURE.md`. **Dependências.** Fase 2; Fase 9 para o handshake completo Order→Invoice, embora Catalog e Cart possam ser implementados antes disso. **Pré-requisitos.** Nenhum bloqueante formal, mas recomenda-se a inclusão de Commerce Hub em `DOMAIN_OWNERSHIP_MATRIX.md` (Change Request, Capítulo 24 item 1 de `ARCHITECTURE_RECONCILIATION_AND_GOVERNANCE.md`) antes do fim da fase. **Riscos.** Médio-alto — maior superfície nova de todo o roadmap; risco específico de Commerce Hub criar Invoice/Payment/Refund diretamente, violação de ADR-CM-001; mitigado por revisão obrigatória de todo Command que produz efeito financeiro antes de merge. **Entregáveis.** Catálogo, Carrinho, Checkout, Pedido, Estoque, Remessa; `OrderCreated`/`OrderPaid` publicados corretamente. **Critérios de entrada.** Fase 2 concluída. **Critérios de saída.** Um Order criado dispara `OrderCreated`, consumido pelo Finance Hub, que cria sua própria Invoice — nunca o inverso. **Critérios de aceite.** Zero dado de pagamento sensível armazenado em Commerce Hub (ADR-CM-006), verificado por auditoria de schema. **Métricas de sucesso.** Fluxo completo Checkout→Delivery sem intervenção manual em teste de ponta a ponta.

#### Fase 9 — Finance

**Objetivo.** Consumir corretamente os eventos publicados por Commerce Hub, sem alteração de nenhuma capacidade já Official. **Escopo.** Apenas o ponto de consumo de `OrderCreated`/`OrderPaid`; nenhuma mudança ao domínio já existente de `FINANCE_DOMAIN_BLUEPRINT.md`/`FINANCE_HUB.md`. **Dependências.** Pode iniciar em paralelo a qualquer fase anterior, por já ser Official e madura; o handshake completo só é testável após a Fase 8. **Pré-requisitos.** Fase 8 parcialmente concorrente. **Riscos.** Baixo — nenhuma mudança de domínio, apenas novo ponto de consumo de evento. **Entregáveis.** `InvoiceCreated` disparado corretamente a partir de `OrderCreated`; `PaymentCaptured` retornando `OrderPaid` ao Commerce Hub. **Critérios de entrada.** Nenhum bloqueante — pode começar cedo. **Critérios de saída.** Handshake Order↔Invoice íntegro em teste de ponta a ponta com Fase 8. **Critérios de aceite.** Nenhuma duplicação de Discount, Subscription ou Refund entre os dois Hubs, per ADR-CM-002/003/005. **Métricas de sucesso.** 100% dos Orders pagos resultando em Invoice reconciliada, sem divergência de valor.

#### Fase 10 — AI

**Objetivo.** Tool e Tool Registry primeiro; MCP Integration depois; RAG por último, exatamente na ordem já definida pelo roadmap evolutivo de `AI_HUB_ARCHITECTURE.md`, Capítulo 42. **Escopo.** As seis áreas genuinamente novas daquele documento — Tool, Tool Registry, MCP Server, MCP Integration, RAG, Embedding, Vector Index, sistema de Prompt — mais Agent Registry e Agent Workflow como extensões. **Dependências.** Todo Hub cuja Query/Command uma Tool interna for invocar — na prática, Fases 4, 6, 7 e 8 ao menos parcialmente concluídas antes de qualquer Tool de negócio real. **Pré-requisitos.** Recomendado, não bloqueante: Review formal reconciliando as três definições divergentes de Agent (`AI_MANIFESTO.md`, `AGENT_FRAMEWORK.md`, `AI_AGENT_ECOSYSTEM.md`), per `ARCHITECTURE_RECONCILIATION_AND_GOVERNANCE.md`, antes de escalar o número de Agents em produção — não bloqueia a primeira Tool interna, mas deveria bloquear a segunda onda de Agents. **Riscos.** Alto — domínio de maior complexidade técnica de todo o roadmap; risco específico de Tool acessando dado de negócio diretamente, violação de ADR-AH-002. **Entregáveis.** Primeira Tool interna mapeada a um Command/Query já existente; Tool Registry consultável; Prompt Template/Version versionados. **Critérios de entrada.** Ao menos um Hub de negócio (CRM, Fase 4) já operacional para a Tool invocar. **Critérios de saída.** Uma Tool invocada por um Agent produz efeito correto no Hub de destino, com rastro completo de Trace/Span. **Critérios de aceite.** Zero acesso direto a dado de negócio fora do Command/Query formal, verificado por revisão de código de todo Tool Adapter. **Métricas de sucesso.** 100% das invocações de Tool rastreáveis de ponta a ponta via Observabilidade já Official do Volume II.

#### Fase 11 — Analytics

**Objetivo.** Consumir os novos eventos de todos os Hubs anteriores, sem alterar nenhuma capacidade já Official de `ANALYTICS_DOMAIN_BLUEPRINT.md`/`ANALYTICS_HUB.md`. **Escopo.** Apenas novos pontos de consumo — indicador por Business Unit, por Branch, por Growth Loop. **Dependências.** Todas as fases anteriores, parcialmente. **Pré-requisitos.** Catálogo de eventos consolidado (`ARCHITECTURE_RECONCILIATION_AND_GOVERNANCE.md`, Capítulo 28) estável. **Riscos.** Baixo — Analytics Hub já desenhado para consumo universal, somente leitura por desenho (ADR-001 daquele Hub). **Entregáveis.** Dashboard com indicador por Business Unit, por Branch e por Growth Loop. **Critérios de entrada.** Ao menos Fases 3, 4 e 7 emitindo eventos estáveis. **Critérios de saída.** Um indicador por Branch é calculado corretamente sem nenhuma escrita de volta ao Hub de origem. **Critérios de aceite.** Zero escrita do Analytics Hub em qualquer outro domínio, verificado por revisão de código. **Métricas de sucesso.** Cobertura de indicador: ao menos um KPI por Hub já implementado, disponível no Dashboard.

#### Fase 12 — Integration

**Objetivo.** MCP Server externo e Connector de terceiro operando lado a lado, sem sobreposição de responsabilidade. **Escopo.** Conexão do primeiro MCP Server externo; nenhuma mudança ao Integration Hub já Official. **Dependências.** Fase 10 (MCP Integration). **Pré-requisitos.** Fase 10 concluída. **Riscos.** Médio — risco já nomeado em ADR-AH-003: MCP não deve substituir Integration Hub para integração de negócio que não envolve IA; mitigado por checklist de revisão obrigatório antes de qualquer novo MCP Server, verificando que nenhuma integração de negócio pura foi migrada indevidamente para MCP. **Entregáveis.** Primeiro MCP Server externo conectado; Connector de terceiro já existente, sem alteração de responsabilidade. **Critérios de entrada.** Fase 10 concluída. **Critérios de saída.** Uma Tool via MCP e um Connector via Integration Hub operam simultaneamente sem colisão de responsabilidade observada. **Critérios de aceite.** Nenhuma integração de negócio pura (sem envolvimento de Agent) migrada para MCP. **Métricas de sucesso.** Zero incidente de sobreposição de responsabilidade em produção nos primeiros 90 dias após lançamento.

---

## 12. Critérios de Priorização

Prioridade Crítica: Foundation, Identity, CRM, Finance — sem qualquer um destes, nenhum outro Hub opera de forma confiável. Prioridade Alta: Business Structure, Conversation, AI, Analytics — dependências diretas de Hubs críticos ou consumidores universais. Prioridade Média: Content, Marketing, Commerce, Integration — capacidades de valor de negócio real, mas sequenciáveis com mais flexibilidade relativa entre si.

---

## 13. Estratégia de Migração

A única migração de dado real e conhecida hoje é a de nomenclatura do CRM (Capítulo 4, Fase 4) — uma migração de nome de coluna/classe, nunca de modelo de dado ou de schema relacional, porque `Organization`/`Company`, `Opportunity`/`Deal` e `Timeline Event`/`HistoryEntry` já descrevem exatamente o mesmo conceito. Toda outra fase deste roadmap trata de território ainda não implementado, portanto não exige migração — apenas construção nova sob o nome já decidido desde o primeiro commit.

---

## 14. Estratégia Incremental

Cada fase é internamente fatiada em entregas menores, consumíveis de forma independente — por exemplo, dentro da Fase 8 (Commerce), Catalog e Cart podem ir a produção antes de Checkout e Order estarem prontos, desde que atrás de Feature Flag. Nenhuma fase deste roadmap exige que duas fases sejam lançadas simultaneamente para que qualquer uma delas produza valor observável.

---

## 15. Estratégia de Compatibilidade

Toda extensão sobre um Hub já Official ou Frozen — Conversation sobre Communication, Marketing sobre Growth — preserva 100% de compatibilidade com o contrato já existente, porque nenhum dos dois Blueprints redefiniu uma única Entidade ou Evento já Official/Frozen, conforme já verificado por `ARCHITECTURE_RECONCILIATION_AND_GOVERNANCE.md`, Capítulo 12. Isso significa que qualquer consumidor já existente de Communication Hub ou de Growth Hub continua funcionando sem alteração durante e depois das Fases 5 e 7.

---

## 16. Estratégia de Refatoração

A única refatoração já identificada como necessária é a de nomenclatura do CRM (Fase 4). Nenhuma outra refatoração é antecipada por este roadmap — toda demais fase constrói sobre território ainda não implementado, portanto "refatoração" não se aplica a ela, apenas "construção."

---

## 17. Estratégia para Componentes Legados

Os seis documentos de `docs/requirements/growth/` (BLOG, SEO, LANDING_PAGES, WEB_STORIES, EMAIL_MARKETING, ANALYTICS) descrevem um modelo funcional pré-existente, sob um nome de produto anterior, majoritariamente não implementado (⚪ no próprio inventário). A Fase 6 (Content) os absorve integralmente como especificação funcional de referência, nunca como código a ser migrado — porque, per `DOCUMENTATION_INDEX.md`, §10, eles descrevem majoritariamente funcionalidade ainda não construída, não um sistema legado em produção a ser substituído.

---

## 18. Estratégia para Código Existente

O único código existente relevante a este roadmap é `src/app/features/crm/` (Sprints 32/33/33A). A Fase 4 trata esse código como a base real sobre a qual a nomenclatura do Blueprint Frozen converge — nunca como algo a ser reescrito do zero. Toda nova capacidade de CRM proposta por `CRM_HUB_ARCHITECTURE.md` (Note, ContactCreated, CustomerMerged) é adicionada a esse código já existente, não como substituição.

---

## 19. Estratégia de Testes

Toda fase exige, no mínimo: teste de unidade sobre cada Command e Query formalmente exposta pelo Blueprint correspondente; teste de integração verificando que todo Evento publicado é corretamente consumido pelo Hub consumidor já documentado na Matriz de Eventos (`ARCHITECTURE_RECONCILIATION_AND_GOVERNANCE.md`, Capítulo 28); e teste de isolamento multi-tenant, repetido a cada fase, nunca assumido herdado da Fase 1 sem nova verificação.

---

## 20. Estratégia de Validação Arquitetural

Antes de qualquer merge de fase, verificar contra o checklist arquitetural de 10 pontos já exigido por `BUSINESS_HUB_ARCHITECTURE.md`, Capítulo 17, para todo novo Business Hub, e contra o ADR específico de cada Blueprint listado nas fichas de fase do Capítulo 11 — em particular ADR-CH-001 (Fase 6), ADR-CV-005 (Fase 5), ADR-MK-004 (Fase 7), ADR-CM-001/002/003/005/006 (Fase 8), ADR-AH-002/003 (Fases 10 e 12).

---

## 21. Estratégia de Documentação

Toda fase produz, ao final, uma atualização de status no documento correspondente — nunca uma reescrita do Blueprint, apenas a evolução formal de Draft para Official quando aplicável, seguindo o Roadmap de Promoção já proposto em `ARCHITECTURE_RECONCILIATION_AND_GOVERNANCE.md`, Capítulo 25.

---

## 22. Estratégia de Rollout

Toda fase é lançada primeiro para um subconjunto reduzido de Tenants, atrás de Feature Flag já nativa da plataforma (`SAAS_ARCHITECTURE.md`, Capítulo 10), antes de alcançar a base completa — mesmo padrão de lançamento gradual já exigido por `SAAS_ARCHITECTURE.md`, ADR-010, para qualquer mudança de plataforma.

---

## 23. Estratégia de Versionamento

Todo Command, Query e Event novo introduzido por uma fase é versionado desde o primeiro commit, seguindo a mesma disciplina já exigida para Prompt por `AI_HUB.md`, ADR-010, e para Contrato de Business Hub por `BUSINESS_HUB_ARCHITECTURE.md`, princípio Backward Compatibility.

---

## 24. Estratégia de Observabilidade

Toda fase, a partir da Fase 1, herda Logging, Tracing e Metrics já descritos em `SYSTEM_BLUEPRINT.md`, e toda fase a partir da Fase 10 herda adicionalmente o esquema de Trace/Span já Official de `AI_OBSERVABILITY.md`. Nenhuma fase é considerada concluída sem os três sinais de observabilidade operacionais para toda nova capacidade que introduz.

---

## 25. Gestão de Riscos

| Risco | Categoria | Fase mais exposta | Mitigação |
|---|---|---|---|
| Divergência de nomenclatura CRM não resolvida a tempo | Documental/Técnico | Fase 4 | Amendment decidido antes do início da fase, per Capítulo 11 |
| Três definições de Agent nunca reconciliadas | Documental | Fase 10 | Review formal recomendado antes da segunda onda de Agents |
| Nome de arquivo Business Structure Hub ainda pendente | Documental | Fase 3 | Decisão de nome antes de nomear módulo/tabela |
| Conflito de ownership Lifecycle Stage | Arquitetural | Fase 7 | Desempate já aplicado (CRM vence); correção formal recomendada, não bloqueante |
| MCP sobrepondo Integration Hub | Arquitetural | Fase 12 | Checklist de revisão obrigatório, ADR-AH-003 |
| Tool acessando dado de negócio diretamente | Técnico | Fase 10 | Revisão obrigatória de todo Tool Adapter, ADR-AH-002 |
| Commerce Hub criando Invoice/Payment diretamente | Técnico | Fase 8 | Revisão obrigatória de todo Command financeiro, ADR-CM-001 |
| Bot executando ação fora de escopo | Técnico | Fase 5 | Revisão obrigatória de fluxo de Bot, ADR-CV-005 |
| Migração de dado mal dimensionada | Operacional | Fase 4 | Migração é apenas de nome, nunca de schema — risco relativamente contido |
| `DOCUMENTATION_INDEX.md` desatualizado | Documental | Transversal | Atualização recomendada a cada fase que promove um documento |

---

## 26. Plano de Mitigação

Para cada risco do Capítulo 25 classificado como Alto (nomenclatura CRM, três definições de Agent), a mitigação recomendada é resolver a decisão de governança formal **antes** do início da fase correspondente, nunca durante ou depois — o custo de uma decisão de nomenclatura tomada após código já em produção é sempre maior do que o custo de uma decisão tomada antes, conforme o próprio caso do CRM já demonstra.

---

## 27. Critérios de Go/No-Go

Toda fase só recebe Go quando: (1) todo Pré-requisito listado em sua ficha (Capítulo 11) está satisfeito; (2) todo Critério de entrada está satisfeito; (3) nenhum risco Alto da fase permanece sem mitigação decidida, mesmo que ainda não executada. Uma fase recebe No-Go quando qualquer um dos três falha — em particular, a Fase 4 (CRM) recebe No-Go automático se o Amendment de nomenclatura não tiver sido ao menos formalmente decidido.

---

## 28. Marcos (Milestones)

Marco 1 — Fundação e Identidade operacionais (fim da Fase 2). Marco 2 — CRM reconciliado e operacional, primeiro domínio de negócio completo (fim da Fase 4). Marco 3 — Ciclo completo de aquisição documentado (Content→Marketing→CRM→Conversation) operacional (fim da Fase 7). Marco 4 — Ciclo comercial completo (Commerce→Finance) operacional (fim da Fase 9). Marco 5 — Primeira capacidade de IA de negócio real em produção (fim da Fase 10). Marco 6 — Plataforma completa, doze Hubs operacionais e observáveis (fim da Fase 12).

---

## 29. Entregas por Fase

Ver a tabela de Entregáveis dentro de cada ficha de fase, Capítulo 11. Resumo: Fase 1-2 entregam infraestrutura e acesso; Fase 3-4 entregam estrutura organizacional e o primeiro domínio de negócio; Fase 5-8 entregam o ciclo completo de aquisição e venda; Fase 9 fecha o ciclo financeiro; Fase 10 entrega a primeira capacidade de IA de negócio real; Fase 11-12 entregam observabilidade consolidada e integração externa madura.

---

## 30. Critérios de Conclusão de Cada Fase

Ver "Critérios de saída" e "Critérios de aceite" dentro de cada ficha de fase, Capítulo 11 — nenhuma fase é considerada concluída sem ambos satisfeitos simultaneamente, nunca apenas um dos dois.

---

## 31. Indicadores de Progresso

Percentual de Command/Query/Event do Blueprint correspondente já implementado e testado, por fase. Percentual de item de governança pendente (Capítulo 25) já resolvido antes do início de cada fase subsequente. Número de Tenants em rollout gradual (Capítulo 22) por fase, crescendo de um subconjunto reduzido até a base completa.

---

## 32. Checklist de Prontidão

Antes de iniciar qualquer fase: Blueprint correspondente lido pela equipe; pré-requisitos da ficha de fase satisfeitos; riscos Altos mitigados ou formalmente aceitos por quem tem autoridade de Approval (`DOCUMENTATION_CONSTITUTION.md`, §14); ambiente de observabilidade da Fase 1 (ou já herdado) operacional.

---

## 33. Checklist de Encerramento

Ao final de qualquer fase: todo Critério de saída satisfeito; todo Critério de aceite verificado por teste automatizado, nunca apenas por inspeção manual; documentação de status atualizada, per Capítulo 21; nenhum risco novo descoberto durante a fase permanece sem registro no próximo ciclo deste roadmap.

---

## 34. Governança da Implementação

Processo de aprovação de fase: Go/No-Go (Capítulo 27) decidido pelo Owner do Hub correspondente, nunca pela própria equipe de implementação isoladamente, espelhando a regra de `DOCUMENTATION_CONSTITUTION.md`, §14, de que nenhum documento avança de status pela mesma parte que o escreveu. Critérios para início de Sprint: Blueprint já existente e lido; dependências da Matriz (Capítulo 10) satisfeitas. Critérios para encerramento de Sprint: Checklist de Encerramento (Capítulo 33) completo. Critérios para promoção de componente: mesmo processo de Review e Approval já exigido para documento, aplicado ao componente de código equivalente. Validação arquitetural obrigatória: Capítulo 20, a cada merge relevante. Checkpoints de revisão: ao menos um por fase, antes do Go final. Papel dos ADRs durante a implementação: todo ADR listado nas fichas de fase (Capítulo 11) é um teste de aceite obrigatório, não apenas uma nota de arquitetura — nenhuma fase encerra com um ADR relevante violado.

---

## 35. Roadmap Técnico

Ver Capítulo 11 para a sequência técnica completa, fase a fase. A prioridade técnica imediata, uma vez que este documento seja aceito, é iniciar a Fase 1 (Foundation) em paralelo à decisão de governança da Fase 4 (nomenclatura CRM), já que nenhuma das duas bloqueia a outra.

---

## 36. Roadmap Arquitetural

Nenhuma mudança arquitetural é proposta por este documento — o roadmap arquitetural já está integralmente definido pelos oito Blueprints e por `ARCHITECTURE_RECONCILIATION_AND_GOVERNANCE.md`. Este roadmap apenas sequencia a construção sobre essa arquitetura já fechada.

---

## 37. Roadmap de Governança

Ordem recomendada de resolução dos itens pendentes, para desbloquear as fases correspondentes o quanto antes: (1) Amendment de nomenclatura CRM — antes da Fase 4; (2) decisão de nome de arquivo Business Structure Hub — antes da Fase 3; (3) Change Requests de inclusão de Content Hub e Commerce Hub em `DOMAIN_OWNERSHIP_MATRIX.md` — antes do fim das Fases 6 e 8, respectivamente; (4) correção formal do conflito de Lifecycle Stage — recomendada antes da Fase 7, não bloqueante; (5) Review das três definições de Agent — recomendada antes da segunda onda de Agents na Fase 10, não bloqueante para a primeira Tool.

---

## 38. Recomendações Estratégicas

Resolver a decisão de nomenclatura do CRM (Capítulo 11, Fase 4) antes de qualquer outra decisão de governança deste roadmap — é o único item pendente com código de produção já divergente, portanto o único cujo custo de adiamento cresce ativamente todos os dias. Iniciar a Fase 1 e a Fase 2 imediatamente, em paralelo a qualquer decisão de governança pendente, já que nenhuma delas depende de nenhum item do Capítulo 25. Não iniciar a Fase 10 (AI) com múltiplos Agents simultâneos antes que a reconciliação das três definições de Agent seja ao menos formalmente encaminhada para Review.

---

## 39. Próximos Passos

Aprovar este roadmap como referência de sequenciamento. Iniciar a Fase 1. Encaminhar, em paralelo, a decisão de nomenclatura do CRM (Capítulo 11, Fase 4) como o item de governança de maior urgência, per `ARCHITECTURE_RECONCILIATION_AND_GOVERNANCE.md`, Capítulo 43.

---

## 40. Conclusão

Nove documentos de arquitetura e um documento de reconciliação já disseram o que a Adaptive Business Platform é. Este documento diz, pela primeira vez nesta série, em que ordem e sob que condição ela deve ser construída — doze fases, cada uma com uma porta de entrada e uma porta de saída explícitas, e uma lista curta e já conhecida de decisões de governança que, se adiadas, custam mais a cada dia que passam. Nenhuma arquitetura nova foi criada aqui. O que foi criado é a garantia de que a arquitetura já existente não precise ser descoberta de novo, fase a fase, por quem primeiro se sentar para construí-la.
