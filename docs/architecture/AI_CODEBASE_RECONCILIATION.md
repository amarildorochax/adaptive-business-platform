# AI Codebase Reconciliation

**Adaptive Business Platform · Documento de Arquitetura (Draft)**

---

## Nota de Posicionamento Documental

Esta Sprint parte de uma premissa do BP-011 — "existe um sistema de IA funcional em produção" — e a submete a uma leitura de código linha a linha, não apenas de nome de arquivo. O resultado corrige essa premissa em um ponto importante e a confirma em outro.

**Correção — os provedores não são funcionais.** `ClaudeProvider`, `OpenAIProvider` e `GeminiProvider` (`src/providers/`) são estruturalmente reais — cada um implementa a interface correta, é registrado na `AIProviderFactory`, e é resolvido pelo `AIRouter` — mas cada `doGenerate()` apenas delega internamente a `MockAIProvider`. Nenhuma chamada de rede é feita, nenhuma credencial é lida, e o próprio código documenta isso explicitamente: "nenhuma chamada de rede é feita; nenhuma credencial é lida ou usada por este arquivo." O sistema multi-provedor é uma arquitetura de encaixe corretamente construída, esperando uma implementação real — não um sistema em produção.

**Correção — RAG não existe no código legado, em nenhuma forma além do nome do campo.** `MemoryEmbedding.ts` e `KnowledgeEmbedding.ts` são, os dois, interfaces puras com um campo `vector: number[]` nunca populado, nunca lido, nunca comparado — e ambos carregam o mesmo comentário explícito: "explicitamente proibido implementar embeddings reais ou qualquer vector store nesta Sprint." A busca real que existe hoje (`MemoryIndex`, `KnowledgeIndex`) é busca textual ingênua por substring, documentada como tal pelo próprio código: "não é busca semântica." RAG é tão aspiracional no código legado quanto em `AI_HUB_ARCHITECTURE.md` — não há ativo prévio a reconciliar aqui, apenas uma convenção de nome de campo que pode ser aproveitada ao construir do zero.

**Confirmação — o Gateway, o Orchestrator, o Prompt Manager e o Memory Manager são reais.** `AIGateway.generate()`, `AgentOrchestrator.execute()`, `PromptManager.generate()` e `MemoryManager.create/update/search()` têm corpo de método completo, emitem evento, registram métrica, e tratam erro — exatamente como o BP-011 já havia caracterizado, agora confirmado campo a campo.

**Achado de nomenclatura de pacote**: o contexto desta Sprint presume a existência de `platform/packages/ai-hub/`. Esse diretório **não existe**. Os pacotes reais são `platform/packages/ai/` (102 arquivos, contratos de tipo do Volume II inteiro — Agent, Context, Governance, Memory, MultiAgent, Observability, Planning, Reasoning, Skill, Tool) e `platform/packages/ai-agents/` (6 arquivos). Isso é consistente, não um erro do repositório: per `PACKAGE_STRUCTURE_MANIFEST.md`, "AI" é um dos oito agrupamentos arquiteturais de topo, distinto de "Business Hubs" — e apenas os pacotes de Business Hub levam o sufixo `-hub` (`crm-hub`, `finance-hub`, etc.). Este documento usa `platform/packages/ai` como o pacote de destino em todo o restante do texto e corrige a premissa do contexto, sem propor nenhum rename.

---

## 1. Introdução

Este documento é a Reconciliação Oficial da Base de Código de IA da Adaptive Business Platform — a decisão sobre como o subsistema real hoje existente em `src/core/{ai,prompt,memory,knowledge,orchestrator,agents}` e `src/providers/` converge para a arquitetura já documentada em `AI_HUB.md` (Frozen), `AI_HUB_ARCHITECTURE.md` (Draft) e o Volume II (`docs/ai/`).

---

## 2. Objetivos

Determinar, com evidência de código e não de suposição, o que já está maduro o suficiente para portar, o que precisa de adaptação, e o que precisa ser construído do zero. Preservar todo investimento real já demonstrado — a arquitetura de Gateway/Provider/Router, o Prompt Manager, o Memory Manager, o Orchestrator sequencial — sem portá-lo cegamente onde a arquitetura documentada já exige mais rigor do que o código legado entrega.

---

## 3. Contexto Histórico

O subsistema de `src/core/` foi construído em Sprints numeradas de um produto anterior ("Andreia AI Platform"), com disciplina de documentação inline notavelmente honesta — quase todo arquivo stub encontrado nesta auditoria já se autodeclara como tal ("não implementado nesta Sprint", "apenas descritivo", "explicitamente proibido"). O Volume II (`docs/ai/`) e `AI_HUB_ARCHITECTURE.md` foram escritos depois, sem referência a esse código. `platform/packages/ai` foi escrito depois de ambos, já alinhado ao vocabulário do Volume II — mas, como confirmado nesta Sprint, sem nenhum arquivo relacionado a Prompt, e com apenas cobertura parcial de Tool.

---

## 4. Inventário da Implementação Atual

| Módulo | Responsabilidade | Maturidade | Aderência ao AI Hub |
|---|---|---|---|
| `src/core/ai/{AIGateway,AIRouter,AIProviderFactory,AIProviderRegistry}` | Ponto único de entrada, roteamento e resolução de provedor | **Real e funcional** — validação, roteamento, métricas, eventos | Alta — o próprio pipeline (validar→rotear→gerar→medir→emitir) já espelha `AI_HUB.md`, Capítulo 8 |
| `src/providers/{claude,openai,gemini,mock}` | Implementação por provedor | **Estruturalmente real, funcionalmente mock** — todos delegam a `MockAIProvider`, zero chamada de rede | Média — a interface e o registro já seguem Provider Agnostic (`AI_HUB.md`, Cap. 5), mas nenhum provedor está de fato implementado |
| `src/core/prompt/{PromptManager,PromptBuilder,PromptRegistry,PromptTemplate,PromptVariable}` | Composição e catálogo de prompt | **Real, mas simples** — substituição de variável ingênua, sem versionamento formal | Média — cumpre o papel do Prompt Engine de `AI_HUB.md`, mas não o sistema de Prompt Template/Version exigido por `AI_HUB_ARCHITECTURE.md` |
| `src/core/prompt/PromptABTest.ts` | Teste A/B de prompt | **Stub puro**, auto-declarado não implementado | Nenhuma — conceito nunca coberto por nenhum documento de arquitetura desta série |
| `src/core/memory/{MemoryManager,MemoryStore,MemoryIndex,MemoryCategory}` | CRUD e busca de memória | **Real** — busca textual/categoria/tag, sem busca semântica | Média — cobre o papel do Memory Engine, mas apenas uma fração de suas seis combinações de titularidade/duração já descritas em `AI_HUB.md`, Cap. 11 |
| `src/core/memory/MemoryEmbedding.ts` | Vetor semântico de memória | **Stub puro**, `vector: number[]` nunca populado | Nenhuma — RAG não existe aqui, apenas o nome do campo |
| `src/core/memory/ContextBuilder.ts` | Ponte entre Memory e Gateway | **Real, mas ingênuo** — concatenação de texto simples, sem ranking | Baixa — não implementa nenhuma das nove camadas de `CONTEXT_FRAMEWORK.md` |
| `src/core/knowledge/{KnowledgeProvider,KnowledgeIndex}` | Consulta e indexação de conhecimento | **Real** — busca textual ingênua; nunca escreve, apenas consulta | Alta — já respeita o princípio "Knowledge Connector consulta, nunca armazena" de `AI_HUB.md`, Cap. 12 |
| `src/core/knowledge/KnowledgeEmbedding.ts` | Vetor semântico de documento | **Stub puro**, idêntico em maturidade a `MemoryEmbedding.ts` | Nenhuma |
| `src/core/orchestrator/{AgentOrchestrator,ExecutionPlanner,AgentSelector}` | Orquestração de execução de Agent | **Real, mas sequencial e simples** — sem paralelismo, sem dependência entre passos | Baixa — está muito aquém do pipeline de 12 passos e 9 componentes de `AI_ORCHESTRATOR.md` |
| `src/core/agents/registry/{AgentRegistry,AgentTypes}` | Catálogo de Agent | **Real, porém mínimo** — mapa em memória, sem estado de ciclo de vida | Baixa — muito aquém do Contrato de 17 elementos e do ciclo de vida de 9 estados de `AGENT_FRAMEWORK.md`; apenas 1 de 10 tipos de Agent declarados (`BLOG`) está de fato registrado |

---

## 5. Inventário do AI Hub

| Conceito | Documentado em | Contrato em `platform/` | Implementação em `src/` |
|---|---|---|---|
| AI Gateway | `AI_HUB.md` | Não (nenhum arquivo `Gateway` em `platform/packages/ai`) | Sim — `AIGateway.ts` |
| Model Providers | `AI_HUB.md` | Não | Sim, estruturalmente — `AIProviderFactory`/`AIProviderRegistry` — mas sem chamada real |
| Model Registry / Model Version | `AI_HUB.md` / `AI_HUB_ARCHITECTURE.md` | Não (zero arquivo com "Model" no nome) | Parcial — `AIModel.ts` existe, mas sem versionamento formal |
| Orchestrator | `AI_ORCHESTRATOR.md` | Sim — `OrchestratorComponent.ts`, `OrchestratorMultiAgentCoordination.ts` | Sim, mais simples — `AgentOrchestrator.ts` |
| Agent | `AGENT_FRAMEWORK.md` | Sim — `AgentContract.ts` (17 campos), `AgentLifecycleState.ts` | Sim, mais simples — `AgentRegistry.ts` |
| Agent Registry (catálogo real) | `AI_HUB_ARCHITECTURE.md` | Não | Parcial — `AgentRegistry.ts` existe, mas como mapa simples, não catálogo consultável com contrato completo |
| Agent Workflow | `AI_HUB_ARCHITECTURE.md` | Não | Não — `ExecutionPlan`/`ExecutionStep` são o equivalente mais próximo, nunca persistidos |
| Context Assembly | `CONTEXT_FRAMEWORK.md` | Sim — família `Context*.ts` (13 arquivos) | Parcial — `ContextBuilder.ts`, muito mais simples |
| Memory | `AI_HUB.md`, `CONTEXT_FRAMEWORK.md` | Sim — família `Memory*.ts` (12 arquivos) | Sim — `MemoryManager` e correlatos |
| Knowledge | `KNOWLEDGE_HUB.md` (Volume I) | Não (Knowledge pertence a outro Hub, per `DOMAIN_OWNERSHIP_MATRIX.md`) | Sim — `KnowledgeProvider`/`KnowledgeIndex` |
| Embeddings | `AI_HUB_ARCHITECTURE.md` | Não | Não (stub puro) |
| Vector Index / Vector Search | `AI_HUB_ARCHITECTURE.md` | Não | Não |
| RAG | `AI_HUB_ARCHITECTURE.md` | Não | Não |
| Prompt Templates / Prompt Versioning | `AI_HUB.md` (regra) / `AI_HUB_ARCHITECTURE.md` (sistema) | **Não — zero arquivo com "Prompt" no nome em todo `platform/packages/ai`** | Sim, mas sem versionamento formal — `PromptManager`/`PromptTemplate`/`PromptRegistry` |
| Tool | `AI_HUB_ARCHITECTURE.md` | Parcial — 11 arquivos `Tool*.ts` | Não (nenhum vestígio) |
| Tool Registry | `AI_HUB_ARCHITECTURE.md` | Não | Não |
| MCP / MCP Server / MCP Integration | `AI_HUB_ARCHITECTURE.md` | Não | Não (zero ocorrência em toda a busca) |
| Governance | `AI_GOVERNANCE.md` | Sim — família `Governance*.ts` (9 arquivos) | Não |
| Observability | `AI_OBSERVABILITY.md` | Sim — família `Observability*.ts` (8 arquivos) | Parcial — eventos e métricas simples, sem Trace/Span formal |

---

## 6. Matriz Comparativa

| Conceito | AI Hub (documento) | src/core | providers | platform/packages/ai | Observações |
|---|---|---|---|---|---|
| Gateway | Definido em `AI_HUB.md` | Equivalente direto (`AIGateway`) | — | Inexistente | Implementação já compatível em espírito; sem contrato formal em `platform/` |
| Provider | Provider Agnostic (`AI_HUB.md`) | Equivalente direto (Factory/Router) | Equivalente parcial (estrutura real, chamada mock) | Inexistente | Nenhuma duplicação — um único caminho de código, mas incompleto |
| Prompt | Regra em `AI_HUB.md`; sistema em `AI_HUB_ARCHITECTURE.md` | Equivalente parcial (sem versionamento formal) | — | **Inexistente** | Maior lacuna de contrato desta auditoria — zero arquivo `Prompt*.ts` em `platform/` |
| Memory | `AI_HUB.md`, `CONTEXT_FRAMEWORK.md` | Equivalente parcial (CRUD real, sem seis combinações) | — | Equivalente direto (contrato completo) | Bom alinhamento — contrato maduro, implementação a portar e estender |
| Embedding/RAG/Vector | `AI_HUB_ARCHITECTURE.md` | Inexistente (stub) | — | Inexistente | Lacuna total dos dois lados — nada a reconciliar, apenas a construir |
| Orchestrator | `AI_ORCHESTRATOR.md` | Equivalente parcial (sequencial, simples) | — | Equivalente direto (contrato rico) | Contrato mais sofisticado que a implementação — expandir, não substituir |
| Agent | `AGENT_FRAMEWORK.md` | Equivalente parcial (registro simples) | — | Equivalente direto (Contrato de 17 campos) | Mesma relação — contrato maduro, implementação rudimentar |
| Tool/MCP | `AI_HUB_ARCHITECTURE.md` | Inexistente | — | Parcial (só Tool, sem Registry) | Construção nova, com ponto de partida parcial em `platform/` |

---

## 7. Conflitos Identificados

**Contrato sem implementação**: Governance, Observability formal (Trace/Span), Context Assembly de nove camadas, Agent Contract de 17 elementos — todos têm contrato rico em `platform/packages/ai`, zero implementação em qualquer lugar.

**Implementação sem contrato**: o sistema de Prompt inteiro (`src/core/prompt/`, 14 arquivos reais) não tem nenhum contrato correspondente em `platform/packages/ai` — a lacuna mais severa encontrada nesta auditoria, porque não é apenas "implementação mais simples que o contrato", é ausência total de contrato.

**Diferença conceitual, não apenas de nome**: o `AgentOrchestrator` de `src/core` executa passos sempre sequencialmente, sem grafo de dependência — `AI_ORCHESTRATOR.md` já documenta um pipeline de 12 passos com múltiplos componentes especializados (Intent Analyzer, Capability Selector, Planning Engine, Execution Policy Engine, Agent Coordinator, etc.). Não é uma diferença de nomenclatura a reconciliar — é uma diferença de sofisticação a evoluir.

**Lacuna, não conflito**: Tool Registry, MCP, Embedding, Vector Index, RAG, Agent Workflow, Model Version — nenhum desses tem qualquer forma de implementação nem de contrato duplicado; são construções novas, sem risco de conflito por não terem precedente algum.

**Nenhuma duplicidade real de implementação** foi encontrada — diferente do domínio CRM (ST-004), onde quatro variantes competiam pelo mesmo conceito, aqui cada conceito tem no máximo uma implementação real e um contrato de tipo, nunca dois candidatos concorrentes.

---

## 8. Avaliação Arquitetural

**A implementação atual confirma a arquitetura já documentada, na medida em que existe.** O pipeline de Gateway (validar→rotear→gerar→medir→emitir) já demonstrado em `src/core/ai` é exatamente o desenho já descrito em `AI_HUB.md`, Capítulo 8 — isso é evidência de que a arquitetura documentada é implementável como descrita, não apenas teoricamente coerente.

**A arquitetura não precisa de ajuste em função desta auditoria** — nenhum conceito documentado se provou impraticável ou mal desenhado à luz do código real. O que a auditoria revela é profundidade de implementação desigual, não erro de design.

**Um conceito novo surgiu na implementação, sem contrapartida em nenhum documento**: `PromptABTest` (teste A/B de variante de prompt). Nenhum documento desta série — nem `AI_HUB.md`, nem `AI_HUB_ARCHITECTURE.md`, nem o Volume II — cobre esse conceito. Registrado como recomendação de extensão futura, per Capítulo 11, sujeito ao processo de governança de `IMPLEMENTATION_GOVERNANCE.md`, nunca incorporado unilateralmente por este documento.

**Conceitos arquiteturais ainda não implementados em nenhuma forma**: Tool Registry, MCP, Embedding, Vector Index, RAG, Agent Workflow, Model Version, Governance e Observability formal — todos já documentados, nenhum com uma linha de código real em qualquer lugar do repositório.

---

## 9. Estratégia de Convergência

| Módulo | Decisão | Justificativa |
|---|---|---|
| AI Gateway / Router / Provider Factory | **Portar** | Pipeline já correto em espírito; falta apenas o contrato formal em `platform/packages/ai` e integração real de rede |
| Providers (Claude/OpenAI/Gemini) | **Adaptar** | Estrutura de registro preservada; a chamada real a cada API precisa ser escrita — não existe hoje, apesar da aparência |
| Prompt Manager / Builder / Registry / Template / Variable | **Portar e estender** | Lógica de composição e catálogo é real e reaproveitável; precisa ganhar o sistema formal de Prompt Version que `AI_HUB_ARCHITECTURE.md` exige e que não existe em nenhuma das duas árvores |
| Prompt A/B Test | **Aposentar por ora** | Stub puro, sem lógica, sem contrato de arquitetura correspondente — não há nada a portar; recomendação de extensão registrada, não implementação |
| Memory Manager / Store / Index / Category | **Portar e estender** | Contrato maduro já existe em `platform/packages/ai`; lógica de CRUD e busca por categoria já real, precisa apenas ser estendida às seis combinações de titularidade/duração |
| Memory/Knowledge Embedding | **Substituir por construção nova** | Stub sem nenhuma lógica reaproveitável; a convenção de nome de campo (`vector: number[]`, `topK`, `minScore`) pode inspirar o novo contrato, mas nada é portado |
| Context Builder | **Adaptar** | Papel correto (ponte Memory→Gateway), execução ingênua demais para as nove camadas já documentadas — expandir, não descartar o ponto de integração em si |
| Knowledge Provider / Index | **Portar** | Já respeita a disciplina "consulta, nunca armazena" exigida pela arquitetura; busca ingênua é aceitável como primeira versão, RAG vem depois como adição, não como substituição |
| Agent Orchestrator / Execution Planner | **Adaptar** | Delegação e emissão de evento corretas; execução sequencial precisa evoluir para o pipeline de 12 passos já documentado — expansão significativa, não reescrita total |
| Agent Registry (src/core) | **Substituir** | Contrato de 17 elementos e ciclo de vida de 9 estados já existem em `platform/packages/ai`; o mapa simples de `src/core` não cobre nem uma fração disso — mais rápido reconstruir sobre o contrato já pronto do que adaptar o registro atual |
| BlogAgent (único Agent real) | **Preservar como referência** | É a única prova end-to-end de que a cadeia completa (Orchestrator→Dispatcher→Prompt→Gateway→Provider) funciona; adaptar para o novo Agent Contract quando a implementação de Agent Framework começar, nunca descartar sem substituto testado |
| Tool / Tool Registry / MCP / Embedding / Vector Index / RAG / Agent Workflow / Model Version | **Construir do zero** | Sem implementação nem contrato completo em nenhuma das árvores — greenfield, seguindo integralmente `AI_HUB_ARCHITECTURE.md` |

---

## 10. Matriz de Migração

| Módulo Atual | Destino Arquitetural | Estratégia | Prioridade | Dependências |
|---|---|---|---|---|
| `src/core/ai/{AIGateway,AIRouter,AIProviderFactory}` | `platform/packages/ai` (novo contrato de Gateway) | Portar | Crítica | Nenhuma |
| `src/providers/*` | `platform/packages/ai` (Provider) | Adaptar (implementar chamada real) | Crítica | Credenciais/configuração de ambiente para cada provedor |
| `src/core/prompt/*` | `platform/packages/ai` (família `Prompt*.ts`, a ser criada) | Portar e estender | Alta | Nenhuma |
| `src/core/memory/*` (exceto Embedding) | `platform/packages/ai` (família `Memory*.ts`, já existente) | Portar e estender | Alta | Nenhuma |
| `src/core/memory/MemoryEmbedding.ts`, `src/core/knowledge/KnowledgeEmbedding.ts` | `platform/packages/ai` (Embedding, Vector Index — novos) | Substituir | Média | Escolha de provedor/mecanismo de embedding (decisão de implementação, per `AI_ARCHITECTURE.md`, ADR-010) |
| `src/core/knowledge/{KnowledgeProvider,KnowledgeIndex}` | `platform/packages/ai` (Context Source) + `KNOWLEDGE_HUB.md` | Portar | Média | Knowledge Hub (Volume I) |
| `src/core/orchestrator/*` | `platform/packages/ai` (família `Orchestrator*.ts`, já existente) | Adaptar | Alta | Agent Framework implementado |
| `src/core/agents/registry/*` | `platform/packages/ai` (`AgentContract.ts`, `AgentLifecycleState.ts`) | Substituir | Alta | — |
| `src/core/agents/blog/BlogAgent.ts` | Primeiro Agent real sob o novo contrato | Adaptar | Média | Agent Registry substituído |
| (nenhum precedente) | Tool, Tool Registry | Construir | Alta | Contrato de Tool já parcialmente existente em `platform/packages/ai` |
| (nenhum precedente) | MCP Server, MCP Integration | Construir | Média | Tool Registry implementado |
| (nenhum precedente) | Embedding, Vector Index, RAG | Construir | Média | Knowledge Hub e Memory portados |
| (nenhum precedente) | Agent Workflow | Construir | Baixa | Orchestrator adaptado |
| (nenhum precedente) | Model Version | Construir | Baixa | Provider real implementado |

---

## 11. Recomendações

**O AI Gateway atual deve ser preservado** — seu pipeline já corresponde ao que `AI_HUB.md` exige; a lacuna real está nos provedores, não no Gateway. **O sistema de Prompt deve evoluir, não ser substituído** — a lógica de composição e catálogo já existente é sólida; falta exclusivamente o sistema formal de versionamento que nenhuma das duas árvores possui hoje, e que deve ser construído como extensão do que já existe, não como sistema paralelo. **O sistema de Memory deve ser incorporado ao AI Hub tal como já está desenhado em `platform/packages/ai`** — o contrato já existe e é mais rico que a implementação; a implementação real de CRUD e busca deve ser portada e depois estendida. **O Orchestrator atual não atende ao modelo arquitetural em sua forma atual** — é um seed razoável (delegação correta, emissão de evento correta), mas precisa de expansão substancial para alcançar o pipeline de 12 passos já documentado; não deve ser tratado como "pronto para produção" apenas por já existir. **A arquitetura de Providers pode ser reaproveitada estruturalmente, mas não funcionalmente** — a Factory/Registry/Router é um bom desenho; a ausência de qualquer chamada real de API é a lacuna funcional mais urgente de todo este documento, porque sem ela nenhuma capacidade de IA da plataforma opera de fato. **Tool Registry, MCP, Embeddings e RAG devem ser introduzidos como construção nova**, sem tentativa de encontrar precedente que não existe — o único ponto de partida real são os 11 arquivos `Tool*.ts` já existentes em `platform/packages/ai`, que definem vocabulário mas não comportamento.

---

## 12. Próximos Passos

Registrar, como proposta sujeita ao processo de governança de `IMPLEMENTATION_GOVERNANCE.md`, a criação da família `Prompt*.ts` em `platform/packages/ai` — hoje inexistente — como pré-requisito para qualquer migração de Prompt. Priorizar a implementação real de ao menos um provedor de IA (recomenda-se começar por aquele com a integração mais simples) antes de qualquer expansão de Orchestrator ou de Agent, já que nenhuma capacidade de geração real existe hoje sem isso. Sequenciar a construção de Tool/Tool Registry/MCP conforme já ordenado em `IMPLEMENTATION_ROADMAP_MASTER.md`, Fase 10, agora com a confirmação de que não há dívida de reconciliação a pagar antes de começar — é construção nova desde o primeiro dia.

---

## 13. Conclusão

Este documento parte de uma pergunta parecida com a do CRM (ST-004) — "qual implementação vence?" — mas a resposta é estruturalmente diferente. No CRM, quatro vocabulários competiam pelo mesmo conceito e um vencedor precisava ser escolhido. Aqui, exceto pela ausência total de contrato de Prompt em `platform/`, não há competição — há profundidade desigual de um mesmo desenho compartilhado, e a decisão certa raramente é escolher um lado e descartar o outro: é reconhecer que o contrato de `platform/packages/ai` sabe o que a plataforma precisa ser, o código de `src/core` sabe, em grande parte, como fazer parte disso funcionar de verdade, e a tarefa real desta convergência é portar a segunda coisa para dentro da primeira — nunca escolher entre elas como se fossem alternativas.
