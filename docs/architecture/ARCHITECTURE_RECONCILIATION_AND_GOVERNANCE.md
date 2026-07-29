# Architecture Reconciliation & Governance

**Adaptive Business Platform · Documento de Arquitetura (Draft)**

---

## Nota de Posicionamento Documental

Este documento consolida oito Sprints (BP-001 a BP-008), que produziram oito novos documentos Draft em `docs/architecture/`: `ADAPTIVE_PLATFORM_MASTER_BLUEPRINT.md`, `CONTENT_HUB_ARCHITECTURE.md`, `CONVERSATION_HUB_ARCHITECTURE.md`, `CRM_HUB_ARCHITECTURE.md`, `MARKETING_HUB_ARCHITECTURE.md`, `COMMERCE_HUB_ARCHITECTURE.md`, `BUSINESS_STRUCTURE_HUB_ARCHITECTURE.md` e `AI_HUB_ARCHITECTURE.md`. Nenhum código, componente, rota, banco de dados ou API foi tocado por nenhuma dessas oito Sprints, nem por esta. Este documento não cria domínio novo, não redefine arquitetura já estabelecida, não altera nenhum documento Official, e não altera nenhum documento Frozen — sua função é exclusivamente registrar, em um único lugar, o que as oito Sprints anteriores descobriram, decidiram deixar pendente, e reconciliaram.

Dois fatos precisam ser ditos antes de qualquer inventário. Primeiro: a disciplina aplicada ao longo da série funcionou — nenhuma Entidade foi genuinamente duplicada, nenhum Evento foi republicado por um segundo Owner, e todo documento novo abriu com uma "Nota de Posicionamento Documental" citando, em vez de redefinir, o que já existia. Segundo: exatamente por essa disciplina, a série acumulou uma lista longa e honesta de itens de governança pendente — nomenclatura, um conflito de ownership genuíno e pré-existente, um documento com nome de arquivo trocado, e um Índice de Documentação que já está desatualizado em relação ao próprio repositório. Este documento existe para que essa lista pare de estar espalhada em oito "Notas de Posicionamento" diferentes e passe a existir em um só lugar, consultável.

---

## 1. Introdução

Este é o nono e último documento de uma série que começou com uma pergunta de vocabulário — "o que é um Hub" — e terminou precisando responder a uma pergunta de governança: com nove documentos novos, dois deles cobrindo o mesmo domínio que um documento Frozen já cobre com outro nome, como a plataforma mantém uma única fonte de verdade por conceito, do jeito que `DOCUMENTATION_CONSTITUTION.md`, Princípio 1, exige? Este documento é a resposta a essa pergunta, e nada além dela.

---

## 2. Objetivos da Governança

Registrar, sem resolver unilateralmente, todo conflito de nomenclatura e todo conflito de ownership descoberto pela série. Consolidar, em uma única matriz, o ownership já estabelecido por `DOMAIN_OWNERSHIP_MATRIX.md` mais as extensões genuínas produzidas pelas oito Sprints. Indicar, para cada divergência, qual documento é autoritativo hoje. Propor, sem executar, os Amendments e Change Requests necessários para fechar cada item pendente. Estabelecer um roteiro de doze fases que ordena a evolução futura da plataforma.

---

## 3. Estado Atual da Arquitetura

A plataforma opera, hoje, sob duas camadas de documentação simultâneas. A primeira é o corpo já maduro do Volume I — `PLATFORM_MANIFESTO.md` (Frozen), `BUSINESS_HUB_ARCHITECTURE.md` (Frozen), `DOMAIN_OWNERSHIP_MATRIX.md` (Frozen), `CRM_DOMAIN_BLUEPRINT.md`/`CRM_HUB.md` (Frozen), `AI_HUB.md` (Frozen), mais dezenove documentos Official cobrindo Communication, Finance, Growth, Analytics, Identity, Knowledge, Integration, Automation, Business Profile, Branding, SaaS. A segunda é a série desta Sprint — oito documentos, todos Draft, que reorganizam esse mesmo território sob um modelo de 8 Hubs (`ADAPTIVE_PLATFORM_MASTER_BLUEPRINT.md`) e preenchem lacunas genuínas descobertas ao longo do caminho (Content Hub, Commerce Hub, Business Unit/Branch, Tool/MCP/RAG/Vector/Prompt System). A implementação real em código (`src/app/features/crm/`) cobre, hoje, apenas uma fração — Dashboard e CRM operacional — do que qualquer uma das duas camadas de documentação descreve; o restante é arquitetura pronta para implementação futura, não capacidade já entregue.

---

## 4. Inventário dos Documentos

**Volume I — Architecture Handbook (pré-existente).** Frozen: `PLATFORM_MANIFESTO.md`, `AI_HUB.md`, `BUSINESS_HUB_ARCHITECTURE.md`, `DOMAIN_OWNERSHIP_MATRIX.md`, `CRM_DOMAIN_BLUEPRINT.md`, `CRM_HUB.md`. Official: `ANALYTICS_DOMAIN_BLUEPRINT.md`, `ANALYTICS_HUB.md`, `AUTOMATION_ENGINE.md`, `BRANDING_HUB.md`, `BUSINESS_PROFILE_ENGINE.md`, `COMMAND_CATALOG.md`, `COMMUNICATION_DOMAIN_BLUEPRINT.md`, `COMMUNICATION_HUB.md`, `EVENT_CATALOG.md`, `EVENT_INTERACTION_MATRIX.md`, `FINANCE_DOMAIN_BLUEPRINT.md`, `FINANCE_HUB.md`, `GROWTH_DOMAIN_BLUEPRINT.md`, `IDENTITY_HUB.md`, `INTEGRATION_HUB.md`, `KNOWLEDGE_HUB.md`, `NON_FUNCTIONAL_REQUIREMENTS.md`, `QUERY_CATALOG.md`, `SAAS_ARCHITECTURE.md`. Draft: `SYSTEM_BLUEPRINT.md`, `GROWTH_HUB.md`, `ADR_INDEX.md`, `IMPLEMENTATION_GUIDELINES.md`.

**Volume II — Intelligent Agent Architecture (pré-existente).** Frozen: `AI_MANIFESTO.md`. Official: `AI_ARCHITECTURE.md`, `AGENT_FRAMEWORK.md`, `AI_ORCHESTRATOR.md`, `CONTEXT_FRAMEWORK.md`, `AI_GOVERNANCE.md`, `AI_OBSERVABILITY.md`. Draft: `AI_IMPLEMENTATION.md`, `01_AI_VISION.md` a `11_MULTI_AGENT_SYSTEM.md`, `AI_AGENT_ECOSYSTEM.md`, `VOLUME_II_AI_HANDBOOK.md`, `VOLUME_II_CONSOLIDATION_REPORT.md`, `VOLUME_II_FOUNDATIONAL_DECISIONS.md` (este último efetivamente Approved como registro de decisão, ainda que o documento raiz permaneça Draft).

**Série BP-001 a BP-008 (produzida por esta Sprint), todos Draft:** `ADAPTIVE_PLATFORM_MASTER_BLUEPRINT.md`, `CONTENT_HUB_ARCHITECTURE.md`, `CONVERSATION_HUB_ARCHITECTURE.md`, `CRM_HUB_ARCHITECTURE.md`, `MARKETING_HUB_ARCHITECTURE.md`, `COMMERCE_HUB_ARCHITECTURE.md`, `BUSINESS_STRUCTURE_HUB_ARCHITECTURE.md`, `AI_HUB_ARCHITECTURE.md`.

**Fora do Documentation System** (per `DOCUMENTATION_INDEX.md`, §10): a documentação legada sob nome de produto anterior ("Andreia AI Platform") em `docs/requirements/growth/`, e demais arquivos de raiz de `docs/` que antecedem a Constituição.

---

## 5. Classificação (Draft / Official / Frozen)

| Status | Volume I | Volume II | Série BP-001–008 |
|---|---|---|---|
| Frozen | 6 documentos | 1 documento (`AI_MANIFESTO.md`) | 0 |
| Official | 19 documentos | 6 documentos | 0 |
| Draft | 4 documentos | 16 documentos | 8 documentos |

Nenhum documento da série BP-001–008 avançou além de Draft — nenhum passou por Review (`DOCUMENTATION_CONSTITUTION.md`, §13) ou Approval (§14), conforme regra explícita desta Sprint. Isso é o estado correto e esperado: todo documento novo nasce Draft, per §8.1.

---

## 6. Mapa Geral dos Hubs

| Categoria | Membros |
|---|---|
| Platform Services | AI Hub, Identity Hub, Knowledge Hub, Integration Hub |
| Adaptive Intelligence | Business Profile Engine, Branding Hub, Automation Engine |
| Business Hubs (já Frozen/Official) | CRM Hub, Communication Hub, Finance Hub, Growth Hub, Analytics Hub |
| Business Hubs (novos, Draft) | Content Hub, Commerce Hub |
| Domínio renomeado (Draft, mesmo Bounded Context) | "Conversation Hub" = Communication Hub; "Marketing Hub" = Growth Hub |
| Domínio de estrutura organizacional (Draft) | Business Structure Hub — publicado sob esse nome exatamente para não colidir com o arquivo `BUSINESS_HUB_ARCHITECTURE.md` já Frozen (Capítulo 11) |
| Não é um Hub de domínio | Dashboard (superfície operacional, per `ADAPTIVE_PLATFORM_MASTER_BLUEPRINT.md`, §12) |

Total de proprietários de conceito, somando os doze já registrados em `DOMAIN_OWNERSHIP_MATRIX.md` mais as duas extensões genuínas desta série (Content Hub, Commerce Hub): **catorze**, dos quais apenas doze estão formalmente na Matrix hoje — ver Capítulo 9.

---

## 7. Inventário dos Bounded Contexts

CRM (Frozen), Communication/Conversation (Official + extensão Draft), Finance (Official), Growth/Marketing (Official + extensão Draft), Analytics (Official), Automation (Official), Identity (Official), Knowledge (Official), Integration (Official), Business Profile (Official), Branding (Official), Content (novo, Draft), Commerce (novo, Draft), estrutura organizacional/Business Structure (novo, Draft), AI/Agent (Official em seis documentos do Volume II + extensão Draft em `AI_HUB_ARCHITECTURE.md`).

---

## 8. Estado de cada Contexto

| Contexto | Documento(s) proprietário(s) | Status | Maturidade |
|---|---|---|---|
| CRM | `CRM_DOMAIN_BLUEPRINT.md`, `CRM_HUB.md` | Frozen | Alta — 33 componentes, 26 ADRs |
| Communication/Conversation | `COMMUNICATION_DOMAIN_BLUEPRINT.md`, `COMMUNICATION_HUB.md` | Official | Alta — 33 componentes, 15 ADRs |
| Finance | `FINANCE_DOMAIN_BLUEPRINT.md`, `FINANCE_HUB.md` | Official | Alta — 19 capacidades, 12 ADRs |
| Growth/Marketing | `GROWTH_DOMAIN_BLUEPRINT.md` (Official), `GROWTH_HUB.md` (Draft) | Misto | Alta no Blueprint, média na arquitetura técnica |
| Analytics | `ANALYTICS_DOMAIN_BLUEPRINT.md`, `ANALYTICS_HUB.md` | Official | Alta |
| Content | `CONTENT_HUB_ARCHITECTURE.md` | Draft | Nova — absorve seis documentos legados já maduros |
| Commerce | `COMMERCE_HUB_ARCHITECTURE.md` | Draft | Nova — território genuinamente livre |
| Business Structure | `BUSINESS_STRUCTURE_HUB_ARCHITECTURE.md` | Draft | Predominantemente citação; apenas Business Unit e Branch são propriedade nova |
| AI (Volume II) | `AI_MANIFESTO.md` (Frozen) + 6 Official | Frozen/Official | Alta, exceto `MEMORY_OS.md`, ausente |
| AI (extensão) | `AI_HUB_ARCHITECTURE.md` | Draft | Nova — Tool, MCP, RAG, Vector, Prompt System |

---

## 9. Domain Ownership Consolidado

`DOMAIN_OWNERSHIP_MATRIX.md` permanece a autoridade formal — Frozen, doze proprietários. Esta Sprint não a altera. Ela está, no entanto, desatualizada frente ao que a série BP-001–008 já produziu: não lista Content Hub nem Commerce Hub como proprietários, e não reflete a equivalência Conversation=Communication nem Marketing=Growth. Ver Capítulo 27 para a matriz consolidada proposta — que permanece uma proposta, nunca uma substituição.

---

## 10. Conflitos de Ownership

Um único conflito de ownership genuíno e verificado foi encontrado, pré-existente à série e apenas descoberto por ela: **Lifecycle Stage** aparece na própria tabela "Pertence ao CRM" de `CRM_DOMAIN_BLUEPRINT.md` (linha 73, Frozen) e, simultaneamente, na própria tabela "Pertence ao Growth" de `GROWTH_DOMAIN_BLUEPRINT.md` (linha 63, Official) — cada documento proprietário reivindicando o mesmo conceito na sua própria fonte primária, não uma leitura equivocada de terceiros. `MARKETING_HUB_ARCHITECTURE.md`, ADR-MK-005, já registrou esse achado e já aplicou o critério de desempate de `DOMAIN_OWNERSHIP_MATRIX.md`, Capítulo 9 ("divergência resolvida a favor do documento proprietário de maior autoridade") — Frozen prevalece sobre Official, portanto Lifecycle Stage é do CRM Hub. Este documento reafirma essa leitura, sem alterar nenhum dos dois documentos-fonte. Nenhum outro conflito de ownership foi encontrado — cada divergência restante identificada pela série é de nomenclatura (Capítulo 11), nunca de ownership competindo pelo mesmo dado.

---

## 11. Conflitos de Nomenclatura

| Termo A | Termo B | Fonte de A | Fonte de B | Situação |
|---|---|---|---|---|
| Conversation Hub | Communication Hub | `ADAPTIVE_PLATFORM_MASTER_BLUEPRINT.md` (Draft) | `COMMUNICATION_DOMAIN_BLUEPRINT.md`/`COMMUNICATION_HUB.md` (Official) | Mesmo Bounded Context. Verificado: "Conversation Hub" tem zero ocorrências em qualquer documento Official-fonte. Pendente — ADR-CV-001. |
| Marketing Hub | Growth Hub | `ADAPTIVE_PLATFORM_MASTER_BLUEPRINT.md` (Draft) | `GROWTH_DOMAIN_BLUEPRINT.md` (Official) | Mesmo Bounded Context. Pendente — ADR-MK-001. |
| Organization | Company | `CRM_DOMAIN_BLUEPRINT.md` (Frozen) | Implementação real (`src/app/features/crm/`) | Mesmo conceito. Pendente — ADR-CR-001. |
| Opportunity | Deal | `CRM_DOMAIN_BLUEPRINT.md` (Frozen) | Implementação real | Mesmo conceito. Pendente — ADR-CR-001. |
| Timeline Event | HistoryEntry | `CRM_DOMAIN_BLUEPRINT.md` (Frozen) | Implementação real | Mesmo conceito. Pendente — ADR-CR-001. |
| "Customer Notes" | Note | `CRM_DOMAIN_BLUEPRINT.md` (Frozen, nunca formalizado) | `CRM_HUB_ARCHITECTURE.md` (Draft) | Formalização proposta, não correção — ADR-CR-002. |
| Business Hub (meta-padrão) | Business Hub (8º Hub do Master Blueprint) | `BUSINESS_HUB_ARCHITECTURE.md` (Frozen) | `ADAPTIVE_PLATFORM_MASTER_BLUEPRINT.md` (Draft) | Colisão de nome de arquivo evitada publicando o segundo como `BUSINESS_STRUCTURE_HUB_ARCHITECTURE.md`. Tensão de taxonomia ainda pendente — ver Capítulo 19. |
| Customer Journey | Journey | `CRM_HUB_ARCHITECTURE.md` (Draft, como Query) | `GROWTH_DOMAIN_BLUEPRINT.md` (Official, como Entidade) | Não é conflito — deliberadamente distintos por desenho; Customer Journey é uma leitura, Journey é uma Entidade estratégica. Resolvido — ADR-CR-003. |
| Discount (Commerce) | Discount (Finance) | `COMMERCE_HUB_ARCHITECTURE.md` (Draft) | `FINANCE_DOMAIN_BLUEPRINT.md` (Official) | Não é conflito — regra promocional vs. valor já aplicado à Invoice. Resolvido — ADR-CM-002. |
| Subscription Plan | Subscription | `COMMERCE_HUB_ARCHITECTURE.md` (Draft) | `FINANCE_DOMAIN_BLUEPRINT.md` (Official) | Não é conflito — oferta comercial vs. acordo de billing. Resolvido — ADR-CM-003. |
| Return | Refund | `COMMERCE_HUB_ARCHITECTURE.md` (Draft) | `FINANCE_DOMAIN_BLUEPRINT.md` (Official) | Não é conflito — decisão comercial vs. execução financeira. Resolvido — ADR-CM-005. |
| Agent (definição 1) | Agent (definição 2) | Agent (definição 3) | `AI_MANIFESTO.md` (glossário) | `AGENT_FRAMEWORK.md` (10 propriedades) — `AI_AGENT_ECOSYSTEM.md` (3 propriedades, inglês) | Três definições nunca reconciliadas. Pendente — não resolvido por nenhum documento até hoje. |
| Prompt Management | — | `AI_HUB.md` (regra, Frozen) | `AI_HUB_ARCHITECTURE.md` (sistema, Draft) | Não é conflito — regra vs. sistema que a operacionaliza. Resolvido nesta Sprint. |
| Agent Registry (nome) | Agent Coordinator (componente real) | `05_AGENT_REGISTRY.md` (Draft, nome organizacional) | `AI_ORCHESTRATOR.md` (Official, componente real) | Reconciliado — `AI_HUB_ARCHITECTURE.md`, Capítulo 18, formaliza o Registry como catálogo real sem substituir o Coordinator. |

Dos treze itens desta tabela, seis permanecem genuinamente pendentes (Conversation/Communication, Marketing/Growth, Organization/Company, Opportunity/Deal, Timeline Event/HistoryEntry, Business Hub/Business Structure Hub, três definições de Agent — sete, contando à parte), e seis já foram resolvidos por desenho dentro da própria série, sem exigir Amendment.

---

## 12. Entidades Duplicadas

Nenhuma. A verificação cruzada, entidade por entidade, contra `DOMAIN_OWNERSHIP_MATRIX.md` e contra os seis documentos-fonte da série, não encontrou nenhum caso de duas Entidades com o mesmo dado modelado por dois Owners diferentes. Todo caso que parecia uma duplicação (Discount, Subscription, Return, Lead Scoring, Journey) resolveu-se como distinção legítima de conceito, já registrada em ADR próprio de cada Blueprint, per Capítulo 11.

---

## 13. Capacidades Duplicadas

Nenhuma capacidade de cálculo foi duplicada. O caso mais próximo — Lead Scoring, mencionado em `CRM_HUB_ARCHITECTURE.md` como parte do contrato `CrmAiAssistProvider` — foi corrigido dentro da própria série, sem exigir edição de nenhum documento já publicado: `MARKETING_HUB_ARCHITECTURE.md`, ADR-MK-004, reposiciona `CrmAiAssistProvider.scoreLead` como ponto de consumo, nunca de cálculo, e atribui o cálculo estratégico ao Growth/Marketing Hub, como extensão do já-Official Engagement Score.

---

## 14. Eventos Duplicados

Nenhum. O Catálogo Consolidado (Capítulo 28) verifica que todo novo Evento introduzido pela série tem nome distinto de todo Evento já Official ou Frozen, e que nenhum novo Evento republica, sob nome diferente, um Evento já existente.

---

## 15. ADRs Pendentes

| ADR | Documento | Pendência |
|---|---|---|
| ADR-CV-001 | `CONVERSATION_HUB_ARCHITECTURE.md` | Reconciliação de nome Conversation/Communication |
| ADR-CV-009 | `CONVERSATION_HUB_ARCHITECTURE.md` | Incorporação formal de 9 novas Entidades ao par Official |
| ADR-CR-001 | `CRM_HUB_ARCHITECTURE.md` | Reconciliação Organization/Company, Opportunity/Deal, Timeline Event/HistoryEntry |
| ADR-CR-002 / ADR-CR-006 | `CRM_HUB_ARCHITECTURE.md` | Formalização de Note/ContactCreated/CustomerMerged no par Frozen |
| ADR-MK-001 | `MARKETING_HUB_ARCHITECTURE.md` | Reconciliação de nome Marketing/Growth |
| ADR-MK-005 | `MARKETING_HUB_ARCHITECTURE.md` | Correção formal do conflito de ownership de Lifecycle Stage |
| ADR-CH-009 | `CONTENT_HUB_ARCHITECTURE.md` | Inclusão de Content Hub em `DOMAIN_OWNERSHIP_MATRIX.md` |
| ADR-CM-007 | `COMMERCE_HUB_ARCHITECTURE.md` | Inclusão de Commerce Hub em `DOMAIN_OWNERSHIP_MATRIX.md` |
| ADR-BS-001 | `BUSINESS_STRUCTURE_HUB_ARCHITECTURE.md` | Decisão definitiva de nome de arquivo (colisão com `BUSINESS_HUB_ARCHITECTURE.md`) |
| — | `BUSINESS_STRUCTURE_HUB_ARCHITECTURE.md`, Capítulo 20 | Posição taxonômica do domínio — Business Hub, Platform Service, ou categoria própria |
| ADR-AH-008 | `AI_HUB_ARCHITECTURE.md` | `MEMORY_OS.md` — pendência já assumida pelo próprio Volume II (Decisão 008) |
| — | `AI_HUB_ARCHITECTURE.md`, Nota de Posicionamento | Reconciliação das três definições divergentes de Agent |
| — | `ADAPTIVE_PLATFORM_MASTER_BLUEPRINT.md`, §20 Fase 0 | Reconciliação do modelo de 8 Hubs com a taxonomia de 11 documentos do Volume I |

Treze itens pendentes, nenhum resolvido unilateralmente por este documento, per instrução explícita desta Sprint.

---

## 16. Lacunas Arquiteturais

Todas as lacunas arquiteturais genuínas identificadas ao longo da série já foram preenchidas pelos próprios documentos que as descobriram: Business Unit e Branch (`BUSINESS_STRUCTURE_HUB_ARCHITECTURE.md`), Tool/Tool Registry/MCP Server/MCP Integration/RAG/Embedding/Vector Index/sistema de Prompt/Agent Registry real/Agent Workflow (`AI_HUB_ARCHITECTURE.md`), SEO/Blog/Landing Pages/Web Stories como propriedade formal de um Hub dedicado (`CONTENT_HUB_ARCHITECTURE.md`), Growth Loop (`MARKETING_HUB_ARCHITECTURE.md`), Product/Cart/Checkout/Order/Inventory/Shipment (`COMMERCE_HUB_ARCHITECTURE.md`), Queue/Department/SLA/Bot/ConversationalFlow (`CONVERSATION_HUB_ARCHITECTURE.md`). Nenhuma lacuna arquitetural nova é identificada por este documento — sua função é de inventário, não de descoberta adicional.

---

## 17. Lacunas Documentais

`DOMAIN_OWNERSHIP_MATRIX.md` não lista Content Hub nem Commerce Hub como proprietários — desatualizada frente à série. `DOCUMENTATION_INDEX.md`, §7.2, não lista nenhum dos oito documentos desta série em seu Dashboard de Status — por sua própria regra de Manutenção (§12), isso já configura, formalmente, um defeito documental, não uma lacuna cosmética. `MEMORY_OS.md` (Volume II) permanece ausente, autoreconhecido. As três definições de Agent nunca foram unificadas em um único Glossário — violação latente do Princípio "Single Source of Truth" de `DOCUMENTATION_CONSTITUTION.md`, §3.1, ainda que nenhuma delas se contradiga tecnicamente, apenas divirja em nível de detalhe.

---

## 18. Lacunas de Implementação

A implementação real em código cobre hoje Dashboard e o módulo operacional de CRM (`src/app/features/crm/`), per Sprints 32/33/33A já concluídas antes desta série. Nenhum dos oito domínios documentados por esta Sprint — Content, Conversation (além do que CRM já toca), Marketing, Commerce, Business Structure, AI (Tool/MCP/RAG/Vector) — possui implementação correspondente. Isso é o estado esperado: toda a série foi, por instrução explícita de cada Sprint, documentação pura, sem nenhuma alteração de código.

---

## 19. Divergências entre Blueprint e Código

A implementação real já usa `Company`, `Deal`, `HistoryEntry` onde `CRM_DOMAIN_BLUEPRINT.md` (Frozen) usa `Organization`, `Opportunity`, `Timeline Event` — a única divergência real entre arquitetura documentada e código já escrito encontrada por toda a série, registrada em `CRM_HUB_ARCHITECTURE.md`, Capítulo 36.1, e reafirmada aqui sem alteração. Nenhuma outra divergência Blueprint↔código foi encontrada, porque nenhum outro domínio desta série possui implementação ainda.

---

## 20. Divergências entre Volume I e Volume II

Nenhuma foi encontrada. A relação entre os dois Volumes já estava formalmente decidida antes desta Sprint, por `VOLUME_II_FOUNDATIONAL_DECISIONS.md`, Decisão 007: `AI_HUB.md` (Volume I) possui o contrato externo e a topologia de alto nível da IA como Platform Service; o Volume II possui o funcionamento interno; conflito resolve-se a favor de `AI_HUB.md`. `AI_HUB_ARCHITECTURE.md`, produzido por esta série, herdou essa relação sem a reabrir, e não introduziu nenhuma nova divergência.

---

## 21. Reconciliação entre Documentos Official

`GROWTH_DOMAIN_BLUEPRINT.md` × `CRM_DOMAIN_BLUEPRINT.md` (Lifecycle Stage) — ver Capítulo 10. `COMMUNICATION_DOMAIN_BLUEPRINT.md`/`COMMUNICATION_HUB.md` × `ADAPTIVE_PLATFORM_MASTER_BLUEPRINT.md` (nome) — ver Capítulo 11. `FINANCE_DOMAIN_BLUEPRINT.md` × `COMMERCE_HUB_ARCHITECTURE.md` (Discount, Subscription, Refund/Return) — já reconciliado por desenho, sem conflito real. Nenhuma reconciliação exige alteração de nenhum documento Official — todas foram absorvidas pelos novos documentos Draft através de citação.

---

## 22. Reconciliação entre Documentos Frozen

`CRM_DOMAIN_BLUEPRINT.md`/`CRM_HUB.md` × implementação real (nomenclatura) — ver Capítulo 19. `BUSINESS_HUB_ARCHITECTURE.md` × `ADAPTIVE_PLATFORM_MASTER_BLUEPRINT.md` (colisão de nome de arquivo, evitada) — ver Capítulo 11. Nenhum documento Frozen foi alterado, e nenhuma reconciliação aqui registrada propõe alterá-lo fora do processo de Amendment já exigido por `DOCUMENTATION_CONSTITUTION.md`, §10.

---

## 23. Plano de Amendments

Amendments (documentos Frozen, alto atrito, per §10) recomendados, nunca executados por este documento:

1. `CRM_DOMAIN_BLUEPRINT.md`/`CRM_HUB.md` — renomear Organization→Company, Opportunity→Deal, Timeline Event→HistoryEntry, para alinhar com a implementação real já existente, ou formalmente decidir o inverso (renomear o código). Este documento não recomenda uma direção específica — apenas que a decisão seja tomada formalmente.
2. `BUSINESS_HUB_ARCHITECTURE.md` — nenhuma alteração de conteúdo recomendada; apenas uma nota cruzada, adicionada por Amendment, referenciando a existência de `BUSINESS_STRUCTURE_HUB_ARCHITECTURE.md` como documento correlato de nome próximo, para prevenir confusão futura.

---

## 24. Plano de Change Requests

Change Requests (documentos Official, atrito ordinário, per §10) recomendados:

1. `DOMAIN_OWNERSHIP_MATRIX.md` — adicionar Content Hub e Commerce Hub como 13º e 14º proprietários, uma vez que `CONTENT_HUB_ARCHITECTURE.md` e `COMMERCE_HUB_ARCHITECTURE.md` avancem de Draft para Official.
2. `GROWTH_DOMAIN_BLUEPRINT.md` — remover Lifecycle Stage de sua própria tabela "Pertence ao Growth", reconhecendo formalmente o desempate já aplicado por `DOMAIN_OWNERSHIP_MATRIX.md`, Capítulo 9, a favor do CRM Hub (Frozen).
3. `COMMUNICATION_DOMAIN_BLUEPRINT.md`/`COMMUNICATION_HUB.md` — decisão formal sobre se o nome "Communication Hub" é mantido ou migrado para "Conversation Hub", refletindo o modelo de 8 Hubs do Master Blueprint.
4. `GROWTH_DOMAIN_BLUEPRINT.md`/`GROWTH_HUB.md` — mesma decisão formal para "Growth Hub" versus "Marketing Hub".
5. `docs/requirements/growth/BLOG.md`, `SEO.md`, `LANDING_PAGES.md`, `WEB_STORIES.md`, `EMAIL_MARKETING.md` — atualizar cabeçalho reconhecendo a promoção para módulos do Content Hub.

---

## 25. Roadmap de Promoção de Documentos

| Documento | De | Para | Pré-requisito |
|---|---|---|---|
| `ADAPTIVE_PLATFORM_MASTER_BLUEPRINT.md` | Draft | Official | Resolução da Fase 0 (reconciliação de taxonomia) |
| `CONTENT_HUB_ARCHITECTURE.md` | Draft | Official | Change Request #1 e #5 do Capítulo 24 |
| `CONVERSATION_HUB_ARCHITECTURE.md` | Draft | Official | Change Request #3 do Capítulo 24 |
| `CRM_HUB_ARCHITECTURE.md` | Draft | Official | Amendment #1 do Capítulo 23 |
| `MARKETING_HUB_ARCHITECTURE.md` | Draft | Official | Change Request #2 e #4 do Capítulo 24 |
| `COMMERCE_HUB_ARCHITECTURE.md` | Draft | Official | Change Request #1 do Capítulo 24 |
| `BUSINESS_STRUCTURE_HUB_ARCHITECTURE.md` | Draft | Official | Decisão de nome de arquivo (ADR-BS-001) |
| `AI_HUB_ARCHITECTURE.md` | Draft | Official | Reconciliação das três definições de Agent |

Nenhum dos oito é candidato a Frozen nesta fase — Frozen exige estabilidade demonstrada ao longo do tempo (`DOCUMENTATION_CONSTITUTION.md`, §8.3), e nenhum documento recém-criado satisfaz esse critério, per Princípio 9 da própria Constituição.

---

## 26. Roadmap de Consolidação

Curto prazo: fechar os cinco Change Requests do Capítulo 24, que não tocam nenhum documento Frozen e têm o menor atrito de aprovação. Médio prazo: decidir e executar o Amendment de nomenclatura CRM (Capítulo 23, item 1) antes que mais código divirja ainda mais do Blueprint Frozen. Longo prazo: promover os oito documentos Draft a Official na ordem do Capítulo 25, e só então avaliar quais, entre eles, demonstraram estabilidade suficiente para Frozen.

---

## 27. Matriz Definitiva de Ownership (Proposta)

| Entidade | Hub Proprietário | Documento de Origem | Status | Conflito Encontrado | Situação Final Recomendada |
|---|---|---|---|---|---|
| Customer, Lead, Organization, Opportunity, Pipeline, Timeline | CRM Hub | `CRM_DOMAIN_BLUEPRINT.md` | Frozen | Nomenclatura vs. código | Amendment (Capítulo 23) |
| Conversation, Message, Channel | Communication Hub ("Conversation Hub") | `COMMUNICATION_DOMAIN_BLUEPRINT.md` | Official | Nome | Change Request (Capítulo 24, item 3) |
| Invoice, Payment, Refund, Subscription (billing) | Finance Hub | `FINANCE_DOMAIN_BLUEPRINT.md` | Official | Nenhum | Manter |
| Campaign, Journey, Lifecycle Stage, Engagement Score | Growth Hub ("Marketing Hub") | `GROWTH_DOMAIN_BLUEPRINT.md` | Official | Nome + Lifecycle Stage duplicado na própria tabela | Change Request (Capítulo 24, itens 2 e 4) |
| Dashboard, Metric, KPI | Analytics Hub | `ANALYTICS_DOMAIN_BLUEPRINT.md` | Official | Nenhum | Manter |
| Blog, SEO, Landing Page, Web Story | Content Hub | `CONTENT_HUB_ARCHITECTURE.md` | Draft | Não está em `DOMAIN_OWNERSHIP_MATRIX.md` | Change Request (Capítulo 24, item 1) |
| Product, Cart, Checkout, Order, Inventory | Commerce Hub | `COMMERCE_HUB_ARCHITECTURE.md` | Draft | Não está em `DOMAIN_OWNERSHIP_MATRIX.md` | Change Request (Capítulo 24, item 1) |
| Business Unit, Branch | Business Structure Hub | `BUSINESS_STRUCTURE_HUB_ARCHITECTURE.md` | Draft | Nome de arquivo | Amendment #2 (Capítulo 23) |
| Tenant, Workspace, Role, Permission | SAAS_ARCHITECTURE.md / Identity Hub | `SAAS_ARCHITECTURE.md`, `IDENTITY_HUB.md` | Official | Nenhum | Manter |
| Agent, Orchestrator | AI Hub (Volume II) | `AGENT_FRAMEWORK.md`, `AI_ORCHESTRATOR.md` | Official | Três definições de Agent | Review formal (pendente) |
| Tool, MCP, RAG, Vector Index, Prompt System | AI Hub (extensão) | `AI_HUB_ARCHITECTURE.md` | Draft | Nenhum | Manter |

Esta matriz é uma proposta de leitura consolidada — ela não substitui, nem altera uma única linha de, `DOMAIN_OWNERSHIP_MATRIX.md`, que permanece a única fonte formalmente autoritativa até que os Change Requests do Capítulo 24 sejam aprovados.

---

## 28. Catálogo Consolidado de Eventos

Nenhum evento novo introduzido pela série colide, em nome, com um evento já Official ou Frozen. Novos eventos por documento: `CONTENT_HUB_ARCHITECTURE.md` (19, incl. `LeadCaptured`, `NewsletterSubscriptionRequested`); `CONVERSATION_HUB_ARCHITECTURE.md` (4 genuinamente novos: `AttendanceSessionStarted/Ended`, `ChannelHandleLinked`, mais reuso citado); `CRM_HUB_ARCHITECTURE.md` (3: `ContactCreated`, `NoteAdded`, `CustomerMerged`); `MARKETING_HUB_ARCHITECTURE.md` (2: `GrowthLoopStarted/Completed`); `COMMERCE_HUB_ARCHITECTURE.md` (catálogo próprio completo, por não haver precedente); `BUSINESS_STRUCTURE_HUB_ARCHITECTURE.md` (`BusinessUnitCreated/Updated/Archived`, `BranchCreated/Updated/Archived`); `AI_HUB_ARCHITECTURE.md` (16, incl. `ToolRegistered`, `MCPServerConnected`, `AgentWorkflowStarted`). A verificação cruzada contra `EVENT_CATALOG.md` (Official) não encontrou nenhuma colisão de nome.

---

## 29. Catálogo Consolidado de Entidades

Total de entidades genuinamente novas (Owner formal desta série, nunca de um documento pré-existente): Business Unit, Branch (Business Structure Hub); Tool, Tool Registry, MCP Server, RAG Pipeline, Embedding, Vector Index, Prompt Template, Prompt Version, Agent Workflow, Model Version, Agent Registry como catálogo real (AI Hub, extensão); Growth Loop (Marketing Hub); Queue, Department, SLAPolicy, ConversationLabel, QuickReply, Bot, ConversationalFlow, AttendanceSession, ChannelHandle (Conversation Hub); Note formalizado (CRM Hub, extensão de conceito já mencionado); Product, Variant, Catalog, Category, Cart, Checkout, Order, Quote, Inventory, Shipment, Discount/Coupon (Commerce), Subscription Plan (Commerce Hub). Todas as demais entidades mencionadas pelos oito documentos são citações de Owners já Frozen ou Official, per Capítulo 12.

---

## 30. Catálogo Consolidado de Hubs

Ver Capítulo 6. Catorze proprietários de conceito no total, considerando as extensões desta série; doze formalmente registrados em `DOMAIN_OWNERSHIP_MATRIX.md` hoje.

---

## 31. Catálogo Consolidado de ADRs

47 ADRs foram produzidos pela série: 9 em `CONTENT_HUB_ARCHITECTURE.md` (ADR-CH), 9 em `CONVERSATION_HUB_ARCHITECTURE.md` (ADR-CV), 6 em `CRM_HUB_ARCHITECTURE.md` (ADR-CR), 6 em `MARKETING_HUB_ARCHITECTURE.md` (ADR-MK), 7 em `COMMERCE_HUB_ARCHITECTURE.md` (ADR-CM), 6 em `BUSINESS_STRUCTURE_HUB_ARCHITECTURE.md` (ADR-BS), 8 em `AI_HUB_ARCHITECTURE.md` (ADR-AH). Nenhuma colisão de código foi encontrada — cada Blueprint usou um prefixo próprio precisamente para evitar essa colisão com a numeração ADR-001/002 de cada documento já Frozen ou Official que cita. Treze permanecem pendentes, listados no Capítulo 15.

---

## 32. Regras Arquiteturais Definitivas

Nenhuma regra nova é criada por este documento. As regras já Frozen ou Official permanecem definitivas: Domain Ownership (`BUSINESS_HUB_ARCHITECTURE.md`), Single Owner e No Duplicate Models (`DOMAIN_OWNERSHIP_MATRIX.md`), Events over Direct Calls, Human Oversight (`AI_MANIFESTO.md`, `AI_HUB.md`). Este documento apenas reafirma que nenhuma delas foi violada pela série BP-001–008.

---

## 33. Regras de Evolução da Plataforma

Todo novo Hub segue o processo de sete passos já exigido por `DOMAIN_OWNERSHIP_MATRIX.md`, Capítulo 11, incluindo a verificação prévia de que seu conceito central não é uma reformulação de algo já existente — verificação que `BUSINESS_STRUCTURE_HUB_ARCHITECTURE.md` aplicou e que resultou em um escopo muito mais estreito do que originalmente solicitado. Toda nova Entidade é registrada primeiro em seu documento proprietário, depois na Matrix — nunca o inverso. Nenhuma reconciliação de nomenclatura é resolvida por um documento Draft unilateralmente — sempre via Change Request ou Amendment, per Capítulos 23 e 24.

---

## 34. Processo de Governança

Governado inteiramente por `DOCUMENTATION_CONSTITUTION.md` — este documento não cria nenhum processo paralelo. Hierarquia: Constituição → Documentation System → Volume → Handbook → Documento → Seção (§4). Categorias: Business, Architecture, AI, Implementation (§5).

---

## 35. Processo de Review

Per §13 — realizado sempre por alguém que não o Owner do documento; examina consistência interna, adequação de Categoria, consistência hierárquica, integridade de referência, consistência terminológica, e adequação ao status pretendido. Nenhum dos oito documentos desta série passou por Review formal ainda — pré-requisito para qualquer promoção do Capítulo 25.

---

## 36. Processo de Approval

Per §14 — distinto de Review; Approval para um Documento é concedido pelo Owner do Handbook; para Freeze, exige um nível de aprovação acima do ordinário. Nenhum dos oito documentos foi submetido a Approval.

---

## 37. Processo de Versionamento

Per §9 — todo documento além de Draft carrega versão maior.menor; mudança que altera garantia já assumida por outro documento é sempre maior, independentemente do tamanho da edição. Os oito documentos desta série, sendo Draft, ainda não carregam número de versão formal.

---

## 38. Processo de Depreciação

Per §8.4 — nenhum documento desta série é candidato a Deprecated. O único candidato a descontinuação, condicional, são os seis documentos legados de `docs/requirements/growth/` cobertos pelo Content Hub — mas apenas após seu conteúdo ser formalmente absorvido via Change Request (Capítulo 24, item 5), nunca antes, per regra de retenção de §8.4.

---

## 39. Plano de Migração Arquitetural

Migração de nomenclatura (Organization→Company ou o inverso) deve preceder qualquer nova feature de CRM em código, para não ampliar a divergência já registrada no Capítulo 19. Migração de Content Hub deve ocorrer antes de qualquer nova funcionalidade de Blog/SEO ser implementada em código, para que a implementação já nasça sob o Owner correto. Nenhuma migração de dado é necessária — nenhuma das duas camadas de documentação alterou schema ou modelo de persistência.

---

## 40. Roadmap Técnico

Ver Capítulo 41 para o roteiro de doze fases. Tecnicamente, a prioridade imediata é a mesma indicada em `AI_HUB_ARCHITECTURE.md`: Tool e Tool Registry com um conjunto reduzido de Tools internas, antes de qualquer MCP Server externo.

---

## 41. Roadmap de Implementação — Doze Fases

**Fase 1 — Foundation.** Objetivo: base técnica comum (Event Bus, Command Bus, Data Layer multi-tenant) já descrita em `SYSTEM_BLUEPRINT.md`. Dependências: nenhuma. Riscos: já parcialmente implementada; risco de divergência entre o que `SYSTEM_BLUEPRINT.md` (Draft) descreve e o que existe. Pré-requisitos: nenhum. Critério de conclusão: Event Bus e Command Bus operacionais para todo Hub já entregue.

**Fase 2 — Identity.** Objetivo: Tenant, Workspace, RBAC/ABAC operacionais conforme `SAAS_ARCHITECTURE.md` e `IDENTITY_HUB.md`. Dependências: Fase 1. Riscos: baixo — ambos os documentos são Official e maduros. Pré-requisitos: Fase 1 concluída. Critério de conclusão: autenticação e autorização centralizadas cobrindo todo módulo já entregue.

**Fase 3 — Business.** Objetivo: Business Unit e Branch operacionais, per `BUSINESS_STRUCTURE_HUB_ARCHITECTURE.md`. Dependências: Fase 2. Riscos: nome de arquivo ainda não definitivo (ADR-BS-001) — resolver antes de nomear tabelas/migrations. Pré-requisitos: decisão de nome de arquivo. Critério de conclusão: Business Unit e Branch consultáveis pelo CRM Hub como refinamento de Territory.

**Fase 4 — CRM.** Objetivo: consolidar a implementação já existente (`src/app/features/crm/`) com o Blueprint Frozen. Dependências: Fase 2. Riscos: o maior risco identificado por todo este documento — divergência de nomenclatura já em produção (Capítulo 19). Pré-requisitos: Amendment de nomenclatura (Capítulo 23, item 1) decidido, mesmo que ainda não executado. Critério de conclusão: nomenclatura de código e Blueprint convergentes.

**Fase 5 — Conversation.** Objetivo: Queue, Department, SLA, Bot, ConversationalFlow sobre a base já Official de Communication Hub. Dependências: Fase 2, Fase 4 (Inbox único). Riscos: nome ainda pendente (ADR-CV-001) — não crítico para implementação, crítico para nomenclatura de API pública. Pré-requisitos: Change Request #3 (Capítulo 24) idealmente resolvido antes de expor endpoint externo. Critério de conclusão: Inbox único operacional com roteamento por Departamento.

**Fase 6 — Content.** Objetivo: Blog, SEO, Landing Page, Web Stories como módulos do Content Hub. Dependências: Fase 2. Riscos: seis documentos legados ainda não formalmente promovidos (Capítulo 24, item 5). Pré-requisitos: Change Request #1 e #5. Critério de conclusão: `LeadCaptured` publicado pelo Content Hub e consumido pelo CRM Hub.

**Fase 7 — Marketing.** Objetivo: Growth Loop e Lead Scoring operacionais sobre a base já Official de Growth Hub. Dependências: Fase 4 (consumo de Lead Scoring pelo CRM). Riscos: conflito de ownership de Lifecycle Stage ainda não corrigido na fonte (Capítulo 24, item 2). Pré-requisitos: nenhum bloqueante — a leitura de desempate já está aplicada. Critério de conclusão: Growth Loop mensurável no Analytics Hub.

**Fase 8 — Commerce.** Objetivo: Product, Cart, Checkout, Order, Inventory operacionais. Dependências: Fase 9 (Finance) para o handshake Order→Invoice. Riscos: maior superfície nova de toda a série — 20 entidades. Pré-requisitos: Change Request #1 (Capítulo 24). Critério de conclusão: fluxo completo Checkout→Delivery com handshake financeiro íntegro.

**Fase 9 — Finance.** Objetivo: nenhuma mudança — já Official e madura; consumir eventos de Commerce Hub. Dependências: Fase 8 parcialmente concorrente. Riscos: nenhum novo. Pré-requisitos: nenhum. Critério de conclusão: `OrderPaid` consumido corretamente pelo Finance Hub.

**Fase 10 — AI.** Objetivo: Tool/Tool Registry primeiro, MCP depois, RAG por último, per roadmap já definido em `AI_HUB_ARCHITECTURE.md`, Capítulo 42. Dependências: todo Hub cujas Query/Command uma Tool vai invocar. Riscos: três definições de Agent ainda não reconciliadas — risco de implementação inconsistente entre equipes que leem documentos diferentes. Pré-requisitos: idealmente, Review formal unificando as três definições antes de escalar o número de Agents em produção. Critério de conclusão: primeira Tool interna operacional, rastreável de ponta a ponta.

**Fase 11 — Analytics.** Objetivo: consumir os novos eventos de todos os Hubs anteriores. Dependências: todas as fases anteriores parcialmente. Riscos: nenhum novo — Analytics Hub já é Official e desenhado para consumo universal. Pré-requisitos: catálogo de eventos consolidado (Capítulo 28) estável. Critério de conclusão: indicador por Business Unit, por Branch e por Growth Loop disponível.

**Fase 12 — Integration.** Objetivo: MCP Server externo e Connector de terceiro operacionais lado a lado, sem colisão de responsabilidade. Dependências: Fase 10 (MCP Integration). Riscos: risco já nomeado em `AI_HUB_ARCHITECTURE.md`, ADR-AH-003 — MCP nunca deve substituir Integration Hub para integração de negócio que não envolve IA. Pré-requisitos: Fase 10 concluída. Critério de conclusão: nenhuma sobreposição de responsabilidade entre MCP Integration e Integration Hub observada em produção.

---

## 42. Riscos Arquiteturais

O maior risco identificado por toda a série é a divergência de nomenclatura CRM já presente em código de produção (Capítulo 19) — quanto mais tempo sem resolução formal, maior o custo de qualquer futura migração. O segundo maior risco é a existência de três definições de Agent nunca reconciliadas, num domínio — IA — que esta mesma série identificou como o mais rapidamente crescente da plataforma. O terceiro é `DOCUMENTATION_INDEX.md` desatualizado, que já configura, pela própria regra da Constituição, um defeito documental ativo. O quarto é a taxonomia de 8 Hubs do Master Blueprint (Draft) nunca formalmente reconciliada com os 11 documentos técnicos do Volume I — enquanto isso não acontece, dois vocabulários paralelos e válidos coexistem, aumentando o risco de confusão para qualquer novo colaborador.

---

## 43. Recomendações Estratégicas

Priorizar, antes de qualquer nova Sprint de arquitetura, o fechamento dos cinco Change Requests do Capítulo 24 — todos de baixo atrito, nenhum tocando documento Frozen. Tratar a reconciliação de nomenclatura do CRM (Capítulo 23) como a decisão de maior urgência de todo este documento, por já haver código em produção divergente. Não iniciar uma nova Sprint de "Dashboard Architecture" ou de expansão adicional do modelo de 8 Hubs antes que a Fase 0 do Master Blueprint — a própria reconciliação de taxonomia — seja resolvida; adicionar mais documentos sobre uma fundação ainda não reconciliada composta o mesmo tipo de dívida que esta Sprint existe para começar a pagar.

---

## 44. Conclusão

Nove Sprints produziram nove documentos, e este é o único dos nove que não descobre território novo — sua contribuição é ter olhado para os outros oito ao mesmo tempo e ter dito, sem ambiguidade, o que cada um deles já havia admitido individualmente: seis itens de nomenclatura pendentes, um conflito de ownership genuíno e verificado, um documento publicado sob nome diferente do solicitado para preservar um Frozen, e um Índice de Documentação que já não reflete o estado real do próprio repositório. Nenhum desses itens foi resolvido aqui — por desenho, per instrução explícita desta Sprint, e porque resolvê-los unilateralmente seria exatamente o tipo de "substituição silenciosa" que `DOCUMENTATION_CONSTITUTION.md` existe para impedir. O que este documento oferece, em vez disso, é o que faltava para que essa resolução pudesse, finalmente, começar: uma lista única, completa e rastreável, do que precisa de Review, do que precisa de Approval, e da ordem em que isso deveria acontecer.
