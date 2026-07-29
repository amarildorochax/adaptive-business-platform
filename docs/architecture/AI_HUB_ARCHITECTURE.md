# AI Hub Architecture — Tool, MCP, RAG e o Sistema de Prompt

**Adaptive Business Platform · Documento de Arquitetura (Draft)**

---

## Nota de Posicionamento Documental

Esta Sprint solicitou um documento de 44 seções projetando "completamente" o AI Hub — Gateway, Model Registry, Providers, Orchestrator, Prompt, Agents, Multi-Agent, Tool Calling, MCP, RAG, Embeddings, Vector Search, Knowledge Base, Memória, Contexto, Workflows, Observabilidade, Governança, Segurança e Human-in-the-Loop. A leitura obrigatória revelou que quase todo esse território já está integralmente construído — não em um lugar, mas em dois: `AI_HUB.md` (Frozen, Volume I) e um Volume II inteiro, "Intelligent Agent Architecture" (`docs/ai/`), fundado por `AI_MANIFESTO.md` (Frozen) e já contendo seis documentos Official — `AI_ARCHITECTURE.md`, `AGENT_FRAMEWORK.md`, `AI_ORCHESTRATOR.md`, `CONTEXT_FRAMEWORK.md`, `AI_GOVERNANCE.md`, `AI_OBSERVABILITY.md` — mais uma série numerada Draft (01 a 11) e três documentos de governança do próprio Volume. Isso é uma escala de sobreposição muito maior do que qualquer Sprint anterior desta série, e exige registro explícito antes de qualquer conteúdo técnico.

**A relação entre Volume I e Volume II já está formalmente decidida, e este documento a herda sem alterá-la.** `VOLUME_II_FOUNDATIONAL_DECISIONS.md`, Decisão 007, já estabelece: `AI_HUB.md` possui o contrato externo e a topologia de alto nível da IA como Platform Service; o Volume II possui o funcionamento interno — Orchestrator, Agent Framework, Context, Governança, Observabilidade; nenhum dos dois substitui o outro; um conflito entre ambos resolve-se sempre a favor de `AI_HUB.md`. Este documento se posiciona dentro dessa mesma relação já decidida, nunca a reabre.

**O que já está integralmente definido, e que este documento cita sem redefinir:** AI Gateway, Provider Manager, Provider Factory, Model Registry (como conceito), Context Manager, Memory Engine (como conceito), Cost Manager, Policy Engine, Observabilidade técnica, isolamento multiempresa — tudo já Frozen em `AI_HUB.md`. Agent, Agent Contract (17 elementos), o ciclo de vida de 9 estados, o ciclo de raciocínio de 5 passos — já Official em `AGENT_FRAMEWORK.md`. O Orchestrator com seus 9 componentes internos e o pipeline de 12 passos — já Official em `AI_ORCHESTRATOR.md`. O Context OS com 9 camadas hierárquicas e 13 passos de ciclo de vida — já Official em `CONTEXT_FRAMEWORK.md`. Toda a disciplina de Policy, RiskTier, Audit Trail, Exception — já Official em `AI_GOVERNANCE.md`. Toda a disciplina de Trace, Span, SLI/SLO/SLA — já Official em `AI_OBSERVABILITY.md`. Nenhuma dessas áreas é reescrita aqui.

**O que genuinamente não existe em nenhum documento de nenhum dos dois Volumes — a lacuna real e verificada.** A leitura obrigatória, cruzada com uma varredura de todo o corpus de ambos os Volumes, confirma que os seguintes conceitos, explicitamente solicitados por esta Sprint, não são definidos, nem parcialmente, em nenhum lugar: **Tool Registry** como entidade nomeada e endereçável; **Tool Calling** como protocolo ou esquema de chamada; **MCP Server e MCP Integration**, sem nenhuma ocorrência em todo o corpus; **RAG**, **Embeddings** e **Vector Index/Vector Search**, cuja única menção em ambos os Volumes é uma única linha em `AI_ARCHITECTURE.md`, ADR-010, que existe exclusivamente para declarar que a arquitetura é deliberadamente neutra e silenciosa sobre eles — nunca para defini-los; o **sistema** de Prompt Template e Prompt Version — a regra de que todo prompt é versionado já existe (`AI_HUB.md`, ADR-010, reafirmada como GOV-10 em `AI_GOVERNANCE.md`), mas nenhum documento possui o modelo de dado, o catálogo ou o fluxo de aprovação desse sistema, uma lacuna que o próprio `VOLUME_II_AI_HANDBOOK.md`, §12, já reconhece explicitamente sob o nome "Prompt Governance"; **Agent Registry** como entidade real e persistida — o nome existe apenas como capítulo organizacional (`05_AGENT_REGISTRY.md`), mas o componente real por trás dele é o **Agent Coordinator**, um subcomponente interno do Orchestrator, nunca um catálogo endereçável próprio; e **Agent Workflow** como processo multi-etapas persistido e distinto tanto do Workflow determinístico do Automation Engine quanto do Plano efêmero de uma única requisição.

**Este documento assume, portanto, um mandato mais estreito e mais honesto do que o solicitado.** Em vez de redefinir 44 seções de arquitetura já Frozen e Official em outro lugar, ele cita extensivamente essas 44 seções onde já resolvidas, e define com profundidade real apenas as lacunas genuínas listadas acima: Tool, Tool Registry, MCP Server, MCP Integration, RAG, Embeddings, Vector Index, o sistema de Prompt (Prompt Template, Prompt Version), Agent Registry como entidade real, Agent Workflow como entidade persistida, e Model Version como entidade explícita do Model Registry. Um item adicional é deliberadamente **não** endereçado por este documento: `MEMORY_OS.md`, o documento técnico dedicado de Memória, permanece como pendência já formalmente registrada e assumida pelo próprio Volume II (`VOLUME_II_FOUNDATIONAL_DECISIONS.md`, Decisão 008; `11_MULTI_AGENT_SYSTEM.md`, §9) — preenchê-lo pertence à governança do Volume II, não a este documento de Volume I, e este documento respeita essa fronteira em vez de a atravessar.

**Um segundo item é registrado, mas não resolvido, como pendência de reconciliação:** existem três definições independentes e nunca conciliadas de "Agent" — em `AI_MANIFESTO.md` (glossário), em `AGENT_FRAMEWORK.md` (10 propriedades, a mais detalhada) e em `AI_AGENT_ECOSYSTEM.md` (3 propriedades, em inglês). Este documento adota integralmente a definição de `AGENT_FRAMEWORK.md` como autoritativa, por ser a mais completa e a mais citada pelos demais documentos Official, mas não tem autoridade para emendar os outros dois — essa reconciliação formal permanece pendente de Review e Approval, per `DOCUMENTATION_CONSTITUTION.md`, §13/§14.

---

## 1. Introdução

Este documento estende o AI Hub — já definido em profundidade por `AI_HUB.md` (Volume I) e pelo Volume II inteiro — com as capacidades de acesso a ferramenta externa, recuperação aumentada por busca semântica, e o sistema formal de gestão de Prompt que nenhum documento anterior havia especificado. Ele não é um novo Hub, não é um novo Volume, e não reabre nenhuma decisão já tomada — é uma extensão pontual, no ponto exato em que a arquitetura já construída para de responder às perguntas que esta Sprint fez.

---

## 2. Missão

Preencher, com o mesmo rigor de Domain-Driven Design já aplicado a toda a plataforma, exatamente as lacunas confirmadas no Capítulo anterior — nunca mais, nunca menos — e servir como o documento de referência que qualquer engenheiro deve consultar quando a pergunta for "como uma capacidade de IA da plataforma chama uma ferramenta externa, busca em uma base vetorial, ou usa um prompt versionado" — perguntas que, até este documento, não tinham resposta arquitetural em lugar nenhum.

---

## 3. Visão

Toda capacidade de Tool Calling, MCP, RAG e Prompt da Adaptive Business Platform opera sob a mesma disciplina já estabelecida para o restante do AI Hub: centralizada, observável, governada, e nunca implementada de forma isolada por um módulo de negócio individual. Nenhuma nova infraestrutura paralela é criada — Tool, MCP Server e Vector Index são novos componentes dentro do AI Hub já existente, consumindo o mesmo AI Gateway, o mesmo Policy Engine, e a mesma Observabilidade já Frozen e Official.

---

## 4. Objetivos Estratégicos

Definir Tool e Tool Registry como o único caminho pelo qual um Agent ou uma Skill acessa uma capacidade externa. Definir MCP Server e MCP Integration como a implementação concreta e padronizada desse acesso, quando o protocolo Model Context Protocol é o mecanismo escolhido. Definir RAG, Embedding e Vector Index como a implementação concreta da "Retrieval" já mencionada, mas nunca especificada, por `CONTEXT_FRAMEWORK.md`. Definir o sistema de Prompt Template e Prompt Version que torna operacional a regra já existente em `AI_HUB.md`, ADR-010. Reconciliar Agent Registry com o Agent Coordinator já existente, sem duplicar ownership. Definir Agent Workflow como entidade distinta de Plano efêmero e de Workflow determinístico.

---

## 5. Escopo

Dentro do escopo: Tool, Tool Registry, MCP Server, MCP Integration, RAG, Embedding, Vector Index, Prompt Template, Prompt Version, Agent Registry (reconciliação), Agent Workflow, Model Version. Fora do escopo, por já pertencerem a outro documento: AI Gateway, Provider Manager, Model Registry como conceito geral, Context Manager, Memory Engine, Cost Manager, Policy Engine, Agent Contract, Orchestrator, Governança, Observabilidade técnica — todos citados, nenhum redefinido. Também fora do escopo: `MEMORY_OS.md`, cuja lacuna pertence à governança do próprio Volume II.

---

## 6. Responsabilidades

Este documento é responsável por especificar a estrutura, o ciclo de vida e os limites de cada entidade nova listada no Capítulo 5, e por registrar, de forma explícita e rastreável, onde cada uma se conecta à arquitetura já existente. Este documento não é responsável por implementar nenhuma dessas entidades, por escolher um fornecedor específico de banco vetorial ou de embedding — decisão de implementação, deliberadamente fora do escopo arquitetural, conforme `AI_ARCHITECTURE.md`, ADR-010 —, nem por redefinir qualquer componente já Frozen ou Official.

---

## 7. Arquitetura Geral

```
                    Módulos de Negócio (todos os Hubs)
                                 │
                                 ▼
                    AI Gateway (AI_HUB.md — Frozen)
                                 │
                                 ▼
                    AI Orchestrator (AI_ORCHESTRATOR.md — Official)
              (Intent Analyzer, Context Builder, Memory Manager,
               Capability Selector, Planning Engine, Execution
               Policy Engine, Agent Coordinator, Result
               Consolidator, Response Builder)
                                 │
                    ┌────────────┼────────────┐
                    ▼                         ▼
                  Agent                  Agent Workflow
        (AGENT_FRAMEWORK.md —          (novo — Capítulo 27)
         Official)                              │
                    │                            │
                    ▼                            ▼
              Skill Invocation ──────────► Tool Adapter
        (AGENT_FRAMEWORK.md,                     │
         AI_ARCHITECTURE.md)                     ▼
                                            Tool Registry
                                          (novo — Capítulo 19)
                                                  │
                                    ┌─────────────┼─────────────┐
                                    ▼             ▼             ▼
                              MCP Server    Integration Hub  Query Catalog
                            (novo — Cap. 20)  (Volume I)      (Volume I)
                                 │
                                 ▼
                          Contexto (CONTEXT_FRAMEWORK.md — Official)
                                 │
                                 ▼
                    RAG Pipeline (novo — Capítulo 21)
              (Embedding Generator → Vector Index → Retriever)
                                 │
                                 ▼
                    Knowledge Hub (Volume I — Official)
```

Este diagrama estende, sem substituir, o diagrama já Frozen em `AI_HUB.md`, Capítulo 6 — todo componente já existente permanece exatamente onde estava; os cinco novos componentes (Tool Registry, MCP Server, RAG Pipeline, Embedding Generator, Vector Index) e a nova entidade Agent Workflow são inseridos apenas nos pontos onde a arquitetura anterior era silenciosa.

---

## 8. Conceito de AI Hub

Já integralmente definido em `AI_HUB.md`, Capítulos 1 a 4 — "o cérebro da Adaptive Business Platform", toda inteligência artificial centralizada, nenhum módulo de negócio implementa lógica própria de IA. Este documento não redefine esse conceito, apenas o estende com os componentes citados no Capítulo 7.

---

## 9. AI Gateway

Já integralmente definido em `AI_HUB.md`, Capítulo 7 — único ponto de entrada, validação e encaminhamento, sem lógica de decisão própria. Toda nova capacidade descrita neste documento — Tool Calling, MCP, RAG — entra pela mesma porta, sem exceção.

---

## 10. Model Registry

Já integralmente definido como conceito em `AI_HUB.md`, Capítulo 16 — catálogo de modelos, capacidades, limites e custo por unidade de uso, com versionamento do próprio registro já mencionado como necessário. Este documento acrescenta apenas a formalização de **Model Version** como entidade explícita, descrita no Capítulo 12 abaixo, porque `AI_HUB.md` menciona a necessidade de versionamento mas não modela a entidade correspondente.

---

## 11. AI Providers

Já integralmente definido em `AI_HUB.md`, Capítulo 15 — Provider Layer, Provider Factory, múltiplos provedores simultâneos, nenhum tratamento privilegiado. Nenhuma extensão necessária.

---

## 12. Model Version — Entidade Nova

**Objetivo.** Formalizar a versão específica de um Model dentro do Model Registry, já que `AI_HUB.md`, Capítulo 16, afirma que "a plataforma precisa saber, a qualquer momento, exatamente qual versão de qual modelo está sendo usada" sem modelar essa entidade.

**Estrutura.** Model Version referencia um Model já registrado (Owner: AI_HUB.md), e acrescenta: identificador de versão do provedor externo, data de disponibilização, data de descontinuação quando aplicável, e o conjunto específico de capacidades e limites daquela versão — já que duas versões do mesmo Model frequentemente diferem em capacidade.

**Ciclo de vida.** Registrada quando um provedor disponibiliza uma nova versão; ativada quando aprovada para uso em produção; descontinuada quando o provedor a retira, disparando `ModelVersionDeprecated` para que o Provider Manager já existente redirecione tráfego.

**Ownership.** Esta entidade permanece sob o mesmo Owner de Model — o AI Hub definido em `AI_HUB.md` — este documento apenas formaliza sua estrutura, nunca reivindica ownership separado.

---

## 13. Prompt Management — Sistema Novo

`AI_HUB.md`, Capítulo 9, já define as quatro camadas de composição de prompt (System, Business, Brand, User) e o papel do Prompt Composer e do Prompt Validator. O que nenhum documento define é o sistema que administra o ciclo de vida de um Prompt Template como artefato versionado e aprovável — a lacuna confirmada em `VOLUME_II_AI_HANDBOOK.md`, §12.

**Prompt Template — Entidade Nova.** Um Prompt Template é o artefato reutilizável a partir do qual o Prompt Engine (`AI_HUB.md`) compõe um prompt concreto. Contém: identificador, capacidade associada (a mesma "capacidade solicitada" já mencionada em `AI_HUB.md`, Capítulo 4), texto-base com variáveis nomeadas, camada de origem (System/Business/Brand/User), e o Módulo consumidor autorizado a usá-lo.

**Prompt Version — Entidade Nova.** Cada mudança em um Prompt Template produz uma nova Prompt Version, nunca uma sobrescrita — aplicação direta da regra já existente em `AI_HUB.md`, ADR-010. Uma Prompt Version é imutável após publicada; reverter significa ativar uma versão anterior, nunca editar a atual.

**Fluxo de aprovação.** Rascunho → Em Revisão → Aprovado → Publicado → Ativo → Deprecado — o mesmo padrão de ciclo de vida em nove ou menos estágios já usado por `AI_GOVERNANCE.md` para Policy, aplicado aqui a Prompt por analogia estrutural, sem que isso implique que Governança seja proprietária de Prompt.

**Ownership.** Prompt, Prompt Template e Prompt Version pertencem ao AI Hub, sob a mesma autoridade já estabelecida em `AI_HUB.md` para o Prompt Engine — este documento formaliza o sistema, não transfere ownership.

---

## 14. Prompt Versioning

Ver Capítulo 13, Prompt Version. A disciplina de versionamento em si — nenhuma mudança em produção sem revisão e reversibilidade — já é regra Frozen em `AI_HUB.md`, ADR-010, e GOV-10 em `AI_GOVERNANCE.md`. Este documento apenas fornece a entidade que operacionaliza essa regra já existente.

---

## 15. Prompt Library

Já mencionada nominalmente em `AI_HUB.md`, Capítulo 9, como "o repositório central de todos os templates disponíveis". Este documento formaliza a Prompt Library como a coleção consultável de todos os Prompt Templates em sua Prompt Version ativa, organizada por capacidade e por Módulo consumidor — a materialização do repositório já citado, sem alterar sua definição original.

---

## 16. AI Agents

Já integralmente definido em `AGENT_FRAMEWORK.md` (Official) — Agent Contract de 17 elementos, arquitetura interna de 7 componentes, ciclo de vida de 9 estados, ciclo de raciocínio de 5 passos. Este documento cita essa definição como autoritativa, conforme já registrado na Nota de Posicionamento Documental, e não a redefine.

---

## 17. Multi-Agent Architecture

Já coberta por múltiplos documentos convergentes — `AI_MANIFESTO.md` Capítulo 8, `AI_ARCHITECTURE.md` Capítulo 14, `AGENT_FRAMEWORK.md` Capítulo 15, `AI_ORCHESTRATOR.md`, e `11_MULTI_AGENT_SYSTEM.md` — todos concordando no mesmo princípio central: colaboração entre Agents é sempre mediada pelo Orchestrator, nunca direta. Este documento não acrescenta nova arquitetura aqui; nota apenas, como já registrado na Nota de Posicionamento Documental, que o documento técnico prosa dedicado (`MULTI_AGENT_SYSTEM.md`, distinto do capítulo numerado 11) permanece pendente, e essa pendência não é resolvida por este documento.

---

## 18. Agent Registry — Reconciliação

A pesquisa obrigatória confirma que "Agent Registry" não é um componente próprio — é o nome do capítulo organizacional `05_AGENT_REGISTRY.md`, que por sua vez aponta para o **Agent Coordinator**, um subcomponente interno do Orchestrator já definido em `AI_ORCHESTRATOR.md`. Não existe, em nenhum documento, um catálogo persistido e endereçável de todos os Agents da plataforma, consultável independentemente de uma requisição em andamento.

Este documento formaliza esse catálogo como **Agent Registry**, uma entidade real: um índice consultável de todo Agent já registrado, contendo o subconjunto do Agent Contract necessário para descoberta — Identidade, Capacidades declaradas, Domínio de atuação, Estado do ciclo de vida (dos 9 já definidos em `AGENT_FRAMEWORK.md`), e Versão ativa. O Agent Registry não substitui o Agent Coordinator — o Coordinator decide, em tempo de requisição, qual Agent invocar; o Registry é a fonte consultável, fora do caminho crítico de uma requisição, que responde "quais Agents existem, e o que cada um declara ser capaz de fazer" — útil para Governança, para Observabilidade, e para o próprio Feature Advisor do Business Profile Engine ao recomendar uma nova capacidade de IA a uma Empresa.

**Ownership.** Agent Registry pertence ao AI Hub, como extensão do Orchestrator já definido em `AI_ORCHESTRATOR.md` — este documento não cria um novo proprietário, apenas nomeia e estrutura um catálogo que o Agent Coordinator já precisa manter implicitamente para funcionar.

---

## 19. Tool e Tool Registry — Entidades Novas

**Tool.** Uma Tool é uma capacidade externa concreta que um Agent pode invocar através da cadeia já definida em `AGENT_FRAMEWORK.md` — Skill Invocation → Tool Adapter — mas cuja estrutura de chamada nunca foi especificada. Este documento define: Tool possui identificador, nome de capacidade (o verbo de negócio que expõe — "consultar Invoice", "criar Task"), esquema de entrada e de saída, e o Contrato do Hub de domínio que efetivamente a implementa — uma Tool nunca acessa dado diretamente; ela invoca a Query ou o Command já expostos pelo Hub proprietário, conforme `DOMAIN_OWNERSHIP_MATRIX.md`.

**Tool Registry.** O catálogo consultável de toda Tool disponível na plataforma, análogo em estrutura ao Agent Registry do Capítulo 18 e ao Model Registry já existente — permite que o Capability Selector do Orchestrator (`AI_ORCHESTRATOR.md`) resolva, para uma solicitação específica, quais Tools estão disponíveis e autorizadas para o Agent e o Módulo de origem.

**Limites do domínio.** Uma Tool nunca escreve diretamente em nenhum Hub de domínio — ela invoca, sempre, um Command ou uma Query já formalmente exposta pelo Hub proprietário, preservando integralmente `DOMAIN_OWNERSHIP_MATRIX.md`. Uma Tool nunca decide por si só se deve ser executada — essa decisão pertence ao Execution Policy Layer já definido em `AI_ARCHITECTURE.md`, Capítulo 10.

---

## 20. MCP Integration e MCP Server — Entidades Novas

Nenhuma menção a Model Context Protocol existe em qualquer documento de qualquer Volume até este. Este documento define MCP como a implementação técnica concreta e padronizada da cadeia Tool → Tool Adapter já conceituada em `AGENT_FRAMEWORK.md`, quando o mecanismo escolhido para expor uma capacidade externa segue esse protocolo padrão de mercado.

**MCP Server.** Um MCP Server é um processo externo, aderente ao protocolo MCP, que expõe um conjunto de Tools através de uma interface padronizada. A plataforma pode consumir um MCP Server de terceiro, ou expor seus próprios Hubs de domínio através de um MCP Server interno — em ambos os casos, o MCP Server nunca é acessado diretamente por um Agent; o acesso é sempre mediado pelo Tool Adapter, que traduz uma chamada MCP para uma Tool já registrada no Tool Registry, preservando a Anti-Corruption Layer já exigida por `BUSINESS_HUB_ARCHITECTURE.md`, Capítulo 8.

**MCP Integration.** O componente, dentro do AI Hub, responsável por conectar, autenticar e manter viva a comunicação com um ou mais MCP Servers — tecnicamente equivalente em papel ao Provider Factory já existente para modelos de linguagem em `AI_HUB.md`, Capítulo 15, aplicado aqui a servidores de ferramenta em vez de provedores de modelo.

**Limites do domínio.** MCP Integration nunca substitui o Integration Hub já existente para integração externa de negócio — MCP é especificamente o protocolo pelo qual um Agent descobre e invoca Tool, nunca o canal geral de integração com sistema externo de terceiro para fins que não envolvem IA, que permanece exclusivamente do Integration Hub conforme `DOMAIN_OWNERSHIP_MATRIX.md`, ADR-012.

---

## 21. RAG — Retrieval-Augmented Generation

`CONTEXT_FRAMEWORK.md`, Capítulo 6, já lista Knowledge Hub como uma das dez Fontes de Contexto, e diz que seu conteúdo é obtido "através de Retrieval" — sem nunca especificar o mecanismo. Este documento define esse mecanismo como RAG: o processo pelo qual uma consulta em linguagem natural é transformada em Embedding, comparada contra um Vector Index de conteúdo já indexado do Knowledge Hub, e o conteúdo mais relevante recuperado é entregue ao Context Manager como mais uma camada de contexto — exatamente no ponto em que `AI_HUB.md`, Capítulo 12, já descreve o Knowledge Connector consultando e entregando material relevante, mas sem especificar como esse material é encontrado.

```
        RAG PIPELINE (novo — insere-se dentro do Knowledge Connector
                       já definido em AI_HUB.md, Capítulo 7)
   ┌───────────────────────────────────────────────────────────┐
   │  Consulta em linguagem natural                                 │
   │              │                                                 │
   │              ▼                                                 │
   │  Embedding Generator ──► Embedding (vetor numérico)                │
   │              │                                                 │
   │              ▼                                                 │
   │  Vector Index (busca por similaridade)                              │
   │              │                                                 │
   │              ▼                                                 │
   │  Documento(s) mais relevante(s) do Knowledge Hub                      │
   │              │                                                 │
   │              ▼                                                 │
   │  Context Manager (AI_HUB.md, Capítulo 10) — camada de contexto        │
   └───────────────────────────────────────────────────────────┘
```

**Limites do domínio.** RAG nunca armazena ou organiza conhecimento — essa responsabilidade permanece integralmente do Knowledge Hub, conforme `DOMAIN_OWNERSHIP_MATRIX.md`, ADR-010. RAG é, estritamente, o mecanismo de busca sobre um conteúdo já organizado por outro proprietário.

---

## 22. Embeddings — Entidade Nova

Um Embedding é a representação vetorial numérica de um conteúdo — um Documento do Knowledge Hub, um trecho de conversa, um Prompt Template — produzida pelo Embedding Generator para permitir busca por similaridade semântica, em vez de correspondência exata de texto.

**Ciclo de vida.** Gerado quando um conteúdo indexável é criado ou atualizado no Knowledge Hub, disparando `EmbeddingGenerated`; armazenado no Vector Index (Capítulo 23); regenerado quando o conteúdo de origem muda, ou quando a plataforma migra para um modelo de embedding mais capaz — decisão de implementação, deliberadamente não especificada por este documento, conforme `AI_ARCHITECTURE.md`, ADR-010.

**Ownership.** Embedding pertence ao AI Hub como artefato técnico derivado — nunca ao Knowledge Hub, que permanece proprietário exclusivo do conteúdo original a partir do qual o Embedding é derivado, preservando a distinção já estabelecida por `DOMAIN_OWNERSHIP_MATRIX.md` entre um dado primário e uma projeção derivada dele.

---

## 23. Vector Search e Vector Index — Entidades Novas

**Vector Index.** A estrutura que armazena Embeddings de forma otimizada para busca por similaridade, particionada por Tenant com o mesmo rigor de isolamento já exigido em `AI_HUB.md`, Capítulo 20 — nenhuma busca vetorial de uma Empresa jamais retorna, nem parcialmente, conteúdo indexado de outra.

**Vector Search.** A operação de consulta sobre o Vector Index, retornando os Embeddings mais próximos de um Embedding de consulta segundo uma métrica de similaridade — a operação central que o RAG Pipeline do Capítulo 21 invoca.

**Limites do domínio.** Vector Index nunca é a fonte de verdade de nenhum conteúdo — é sempre um índice derivado, reconstruível a partir do Knowledge Hub, nunca uma cópia divergente tratada como autoritativa, aplicação direta do princípio No Duplicate Models já estabelecido em `DOMAIN_OWNERSHIP_MATRIX.md`.

---

## 24. Knowledge Base

Já integralmente definida e possuída pelo Knowledge Hub (`KNOWLEDGE_HUB.md`, Official), conforme `DOMAIN_OWNERSHIP_MATRIX.md`. Este documento não redefine Knowledge Base ou Knowledge Source — RAG, Embedding e Vector Index, descritos nos Capítulos 21 a 23, operam inteiramente como mecanismo de acesso a esse conteúdo já possuído por outro Hub, nunca como um proprietário concorrente.

---

## 25. AI Memory

Já coberta, de forma consistente ainda que não centralizada, por `AI_HUB.md` Capítulo 11 (Memory Engine — curta/longa duração × empresa/usuário/IA), `AI_ARCHITECTURE.md` Capítulo 11 (cinco categorias), `AI_ORCHESTRATOR.md` (Memory Manager) e `AGENT_FRAMEWORK.md` Capítulo 9. Como já registrado na Nota de Posicionamento Documental, o documento técnico dedicado `MEMORY_OS.md` permanece uma pendência formalmente assumida pelo próprio Volume II — este documento não a preenche, por não ser de sua alçada.

---

## 26. Context Management

Já integralmente definido em `CONTEXT_FRAMEWORK.md` (Official) — Context OS, nove camadas hierárquicas, treze passos de ciclo de vida, dez atributos de qualidade. A única extensão real deste documento a essa área é o mecanismo de RAG do Capítulo 21, que operacionaliza a "Retrieval" já mencionada, mas nunca especificada, como uma das dez Fontes de Contexto daquele documento.

---

## 27. AI Workflows — Agent Workflow como Entidade Nova

`AI_ORCHESTRATOR.md` já descreve o Planning Engine decompondo uma solicitação em subtarefas, e `07_PLANNING_ENGINE.md` reorganiza essa mesma descrição — mas ambos tratam esse plano como efêmero, associado a uma única requisição em andamento, nunca como uma entidade persistida e reexecutável. `AUTOMATION_ENGINE.md`, por sua vez, já possui Workflow como conceito, mas estritamente determinístico — condição e ação fixas, nunca decisão de um Agent.

Este documento formaliza **Agent Workflow** como a terceira categoria, distinta de ambas: uma sequência multi-etapas, definida e persistida, na qual um ou mais Agents executam passos que podem envolver raciocínio não inteiramente determinístico — por exemplo, "qualificar um Lead, decidir a próxima ação, e escalar para um humano se a confiança for baixa" — diferente de um Plano efêmero de uma única requisição, e diferente de um Workflow do Automation Engine, cuja Condition é sempre uma regra fixa, nunca uma inferência de um Agent.

**Limites do domínio.** Um Agent Workflow nunca executa um Command de negócio diretamente — cada etapa que produz efeito de escrita invoca o Command formal já exposto pelo Hub proprietário, sob a mesma Execution Policy já definida em `AI_ARCHITECTURE.md`, Capítulo 10, incluindo Human Approval quando aplicável. Um Agent Workflow nunca substitui o Automation Engine para lógica puramente determinística — quando nenhuma etapa exige raciocínio de Agent, o Workflow correto continua sendo o do Automation Engine, conforme `DOMAIN_OWNERSHIP_MATRIX.md`.

---

## 28. AI Observability

Já integralmente definida em `AI_OBSERVABILITY.md` (Official) — ObservabilityRecord, hierarquia Correlation/Trace/Span, Cadeia de Execução distinta de Cadeia de Decisão, SLI/SLO/SLA. Toda nova entidade deste documento — Tool, MCP Server, RAG Pipeline, Agent Workflow — produz Trace e Span sob esse mesmo esquema já existente, sem nenhuma estrutura de observabilidade paralela.

---

## 29. AI Governance

Já integralmente definida em `AI_GOVERNANCE.md` (Official) — Policy, ciclo de vida de nove estágios, RiskTier, Exception, Audit Trail, GOV-01 a GOV-20. Toda nova capacidade deste documento é regida pelas Policies já existentes — em particular GOV-10, que já rege versionamento de Prompt, diretamente operacionalizada pelo sistema do Capítulo 13.

---

## 30. AI Safety

Já coberta por `AI_MANIFESTO.md` Capítulo 3, `AI_ARCHITECTURE.md` Capítulo 10 (Execution Policy Layer) e `AI_GOVERNANCE.md` Capítulos 16-17. Aplicada às novas entidades: toda Tool invocada através de MCP passa pela mesma Execution Policy já existente antes de qualquer efeito, e toda resposta enriquecida por RAG passa pela mesma Safety Layer já definida em `AI_HUB.md`, Capítulo 7, antes de alcançar o usuário.

---

## 31. Guardrails

Já cobertos por `AI_HUB.md` Capítulo 7 (Guardrails, Safety Layer, Moderation) e por `AI_GOVERNANCE.md` Capítulo 17 (Controles Preventivos, Detectivos, Corretivos). Um guardrail específico introduzido conceitualmente por este documento, mas implementado inteiramente pelos componentes já existentes: nenhuma Tool invocada via MCP pode contornar o Policy Engine já existente, mesmo quando o MCP Server é operado por um terceiro — o Tool Adapter, descrito no Capítulo 19, é o ponto obrigatório de aplicação dessa regra.

---

## 32. Human-in-the-Loop

Já integralmente coberto por `AI_ARCHITECTURE.md` Capítulo 10 (Human Approval) e `AI_GOVERNANCE.md` Capítulos 6-13. Todo Agent Workflow, definido no Capítulo 27, herda essa mesma exigência sem exceção — nenhuma etapa de alto impacto de um Agent Workflow é executada sem a mesma confirmação humana já exigida de qualquer Command de alto impacto na plataforma.

---

## 33. IA Aplicada aos Demais Hubs

Content Hub, Conversation Hub, CRM Hub, Marketing Hub, Commerce Hub, Business Structure Hub, Finance Hub, Analytics Hub e Integration Hub consomem toda capacidade de IA — incluindo as novas descritas neste documento — exatamente pelo mesmo contrato já estabelecido em `AI_HUB.md`, Capítulo 4: solicitam uma capacidade em linguagem de negócio, nunca implementam lógica própria de IA. A única extensão relevante trazida por este documento é que, a partir de agora, essa capacidade solicitada pode, internamente, envolver um Agent Workflow multi-etapas, uma consulta RAG ao Knowledge Hub, ou uma chamada de Tool via MCP a um sistema externo — tudo isso permanece invisível ao Hub consumidor, que continua a ver apenas uma resposta, exatamente como já garantido pelo princípio Model Independence de `AI_HUB.md`, Capítulo 5.

---

## 34. Eventos do Domínio

| Evento | Produtor | Consumidor | Objetivo | Impacto |
|---|---|---|---|---|
| `ModelVersionRegistered` | AI Hub (Model Registry) | Provider Manager | Nova versão de Model disponível | Roteamento pode considerar nova versão |
| `ModelVersionDeprecated` | AI Hub | Provider Manager | Versão de Model descontinuada pelo provedor | Roteamento migra tráfego automaticamente |
| `PromptTemplateCreated` | AI Hub (Prompt Management) | Prompt Library | Novo Template registrado | Disponível para composição futura |
| `PromptVersionPublished` | AI Hub | Prompt Engine, Audit | Nova versão de Prompt ativada | Composições futuras usam a nova versão |
| `AgentRegistered` | AI Hub (Agent Registry) | Analytics, Governance | Agent disponível para descoberta | Consultável fora do caminho de requisição |
| `ToolRegistered` | AI Hub (Tool Registry) | Capability Selector | Nova Tool disponível | Agents podem passar a invocá-la |
| `MCPServerConnected` | AI Hub (MCP Integration) | Tool Registry | Conexão com servidor MCP estabelecida | Tools daquele servidor tornam-se descobríveis |
| `MCPServerDisconnected` | AI Hub | Tool Registry, Observability | Conexão perdida ou encerrada | Tools daquele servidor tornam-se indisponíveis |
| `EmbeddingGenerated` | AI Hub (Embedding Generator) | Vector Index | Novo Embedding produzido | Disponível para Vector Search |
| `VectorIndexed` | AI Hub (Vector Index) | RAG Pipeline | Embedding incorporado ao índice | Consultável em buscas futuras |
| `AgentWorkflowStarted` | AI Hub (Orchestrator) | Observability, Governance | Processo multi-etapas iniciado | Rastreável de ponta a ponta |
| `AgentWorkflowStepCompleted` | AI Hub | Observability | Etapa individual concluída | Progresso auditável |
| `AgentWorkflowCompleted` | AI Hub | Hub consumidor, Analytics | Processo multi-etapas encerrado | Resultado disponível ao solicitante |
| `AgentWorkflowEscalated` | AI Hub | Identity Hub, Notification Engine | Confiança insuficiente exigiu humano | Human Approval acionado |
| `ToolInvoked` | AI Hub (Tool Adapter) | Observability, Audit | Registro de toda chamada de Tool | Rastreabilidade completa |
| `ToolInvocationFailed` | AI Hub | Retry Manager, Observability | Falha em chamada de Tool | Aciona Graceful Degradation |

Eventos já Frozen ou Official — `ModelRegistered`, `ModelActivated`, `AgentStarted`, `AgentCompleted`, `KnowledgeUpdated`, `ContextCreated`, `MemoryStored`, `AIExecutionCompleted` — pertencem integralmente a `AI_HUB.md` e ao Volume II, e não são redefinidos aqui.

---

## 35. Integração com os demais Hubs

CRM, Communication, Finance, Growth e Analytics recebem capacidade de IA — incluindo Tool Calling, RAG e Agent Workflow — através do mesmo AI Gateway já existente, sem integração direta com nenhum componente novo deste documento. Identity Hub autentica toda chamada de MCP Integration exatamente como já autentica toda chamada ao AI Gateway, conforme `IDENTITY_HUB.md`, Capítulo 14. Integration Hub permanece o único canal de integração externa de negócio que não envolve IA — MCP nunca o substitui, apenas coexiste com ele para o caso específico de acesso de Agent a ferramenta. Knowledge Hub fornece o conteúdo indexado que o RAG Pipeline consulta, sem nunca perder ownership sobre esse conteúdo. Business Structure Hub (`BUSINESS_STRUCTURE_HUB_ARCHITECTURE.md`) fornece Business Unit e Branch como atributo de contexto adicional, quando relevante a um Agent Workflow escopado a uma unidade específica.

---

## 36. Segurança

Toda a segurança já estabelecida em `AI_HUB.md`, Capítulo 17, se aplica integralmente às novas capacidades. Este documento acrescenta dois riscos específicos. Tool Injection — uma variação de Prompt Injection em que um conteúdo malicioso tenta induzir um Agent a invocar uma Tool fora do escopo pretendido — é mitigada pela mesma separação de camadas do Prompt Engine, combinada com a exigência de que toda Tool declare, no Tool Registry, o escopo exato de Hub e de Command que está autorizada a invocar, nunca um acesso genérico. Confiança em MCP Server de terceiro — um MCP Server operado fora da plataforma nunca é tratado como confiável por padrão; toda chamada passa pelo mesmo Policy Engine e pelos mesmos Guardrails já aplicados a qualquer Tool interna, sem exceção por se tratar de uma integração externa.

---

## 37. Auditoria

Já integralmente coberta pelo Audit Trail de `AI_GOVERNANCE.md` e pela Auditoria Técnica/Funcional de `AI_OBSERVABILITY.md`. Toda invocação de Tool, toda consulta RAG e toda etapa de Agent Workflow produz registro imutável sob esse mesmo esquema já existente — nenhuma trilha de auditoria paralela é criada por este documento.

---

## 38. Multi-Tenant

Já integralmente coberto por `AI_HUB.md`, Capítulo 20. Vector Index, explicitamente, herda essa mesma segregação absoluta — nenhuma Vector Search de uma Empresa pode, em qualquer circunstância, retornar Embedding indexado em nome de outra, mesmo quando ambas compartilham a mesma infraestrutura de índice.

---

## 39. Escalabilidade

Tool Registry, MCP Integration e Agent Registry seguem o mesmo princípio de escalabilidade horizontal já estabelecido em `AI_HUB.md`, Capítulo 19, sendo consultas de baixo custo relativo. Vector Search é o componente novo com maior exigência de escala entre os descritos neste documento — decisão de tecnologia de índice (particionamento, réplicas) é deliberadamente de implementação, fora do escopo arquitetural, conforme já registrado no Capítulo 5.

---

## 40. Diagramas ASCII

Ver Capítulo 7 (Arquitetura Geral) e Capítulo 21 (RAG Pipeline) para os dois diagramas centrais deste documento.

---

## 41. Tabelas Arquiteturais — Ownership

| Entidade | Owner Real | Status do Owner | Contribuição deste Documento |
|---|---|---|---|
| AI Provider / Model | AI_HUB.md | Frozen | Citação apenas |
| Model Version | AI_HUB.md (extensão) | Frozen (base) / Draft (extensão) | Definição plena — Capítulo 12 |
| Prompt / Prompt Template / Prompt Version | AI_HUB.md (regra) + este documento (sistema) | Frozen (regra) / Draft (sistema) | Definição plena do sistema — Capítulo 13 |
| Agent / Agent Capability | AGENT_FRAMEWORK.md | Official | Citação apenas |
| Agent Registry | AI_ORCHESTRATOR.md (como Agent Coordinator) + este documento | Official (base) / Draft (extensão) | Reconciliação + entidade real — Capítulo 18 |
| Agent Workflow | Este documento | Draft (novo) | Definição plena — Capítulo 27 |
| Tool / Tool Registry | Este documento | Draft (novo) | Definição plena — Capítulo 19 |
| MCP Server / MCP Integration | Este documento | Draft (novo) | Definição plena — Capítulo 20 |
| RAG | Este documento | Draft (novo) | Definição plena — Capítulo 21 |
| Embedding | Este documento | Draft (novo) | Definição plena — Capítulo 22 |
| Vector Index / Vector Search | Este documento | Draft (novo) | Definição plena — Capítulo 23 |
| Knowledge Base / Knowledge Source | KNOWLEDGE_HUB.md | Official | Citação apenas |
| Context Session / Context | CONTEXT_FRAMEWORK.md | Official | Citação apenas |
| Memory | AI_HUB.md + AI_ARCHITECTURE.md + AI_ORCHESTRATOR.md + AGENT_FRAMEWORK.md | Frozen/Official (dispersa) | Citação apenas — MEMORY_OS.md permanece pendência do Volume II |
| AI Execution | AI_OBSERVABILITY.md (Trace/Span) | Official | Citação apenas |
| AI Audit Log | AI_GOVERNANCE.md (Audit Trail) | Official | Citação apenas |

Este documento é Owner formal de apenas seis linhas desta tabela — Tool/Tool Registry, MCP Server/MCP Integration, RAG, Embedding, Vector Index/Vector Search, e o sistema de Prompt Template/Prompt Version — mais duas extensões pontuais (Model Version, Agent Registry como entidade real) sobre Owners já existentes. Para todas as demais, este documento é citador, nunca proprietário.

---

## 42. Roadmap Evolutivo

No curto prazo, a prioridade é Tool e Tool Registry operando com um número reduzido de Tools internas, cada uma mapeada a um Command ou Query já existente de um Hub de domínio, sem MCP ainda envolvido. No médio prazo, a prioridade é MCP Integration conectando o primeiro MCP Server, interno ou de terceiro, e o sistema de Prompt Template/Prompt Version substituindo qualquer composição ad hoc ainda em uso. No longo prazo, a prioridade é RAG operando sobre o Knowledge Hub em produção, Agent Workflow suportando processos multi-etapas reais de qualificação e atendimento, e a reconciliação formal, via Review e Approval, das três definições divergentes de Agent e da pendência de `MEMORY_OS.md`, ambas fora da alçada deste documento mas registradas para acompanhamento.

---

## 43. Regras Arquiteturais — Architecture Decision Records

**ADR-AH-001 — Este documento não redefine nenhum componente já Frozen ou Official de `AI_HUB.md` ou do Volume II.** Toda menção a AI Gateway, Provider Manager, Model Registry, Context Manager, Memory Engine, Agent, Orchestrator, Governança ou Observabilidade é citação, nunca definição. Contexto: aplicação da Decisão 007 de `VOLUME_II_FOUNDATIONAL_DECISIONS.md`.

**ADR-AH-002 — Tool nunca acessa dado de negócio diretamente.** Toda Tool invoca exclusivamente o Command ou a Query já formalmente exposta pelo Hub proprietário do conceito. Contexto: preservar `DOMAIN_OWNERSHIP_MATRIX.md` sem exceção, mesmo para acesso mediado por IA.

**ADR-AH-003 — MCP nunca substitui o Integration Hub para integração de negócio que não envolve IA.** MCP é o protocolo de descoberta e invocação de Tool por um Agent; toda integração externa que não passa por um Agent continua exclusiva do Integration Hub. Contexto: preservar ADR-012 de `DOMAIN_OWNERSHIP_MATRIX.md`.

**ADR-AH-004 — Vector Index é sempre derivado, nunca fonte de verdade.** Todo Embedding e todo Vector Index são reconstruíveis a partir do Knowledge Hub; nenhuma escrita de negócio jamais ocorre diretamente sobre o Vector Index. Contexto: aplicação do princípio No Duplicate Models.

**ADR-AH-005 — Prompt Template e Prompt Version seguem a mesma disciplina de código-fonte já exigida por `AI_HUB.md`, ADR-010.** Nenhuma edição direta em produção; toda mudança é uma nova versão, revisável e reversível. Contexto: operacionalizar uma regra já Frozen que carecia de sistema.

**ADR-AH-006 — Agent Registry é um catálogo consultável, nunca o mecanismo de decisão de roteamento.** A decisão de qual Agent invocar em uma requisição específica permanece exclusivamente do Agent Coordinator, dentro do Orchestrator. Contexto: evitar a criação de dois pontos de decisão concorrentes sobre a mesma pergunta.

**ADR-AH-007 — Agent Workflow nunca é confundido com Workflow do Automation Engine.** Um Agent Workflow envolve raciocínio não inteiramente determinístico de ao menos um Agent; quando toda a lógica é regra fixa, o Workflow correto é do Automation Engine. Contexto: preservar a distinção já exigida por `DOMAIN_OWNERSHIP_MATRIX.md`, ADR-008 (Automation Never Owns Business Data), estendida aqui à distinção de motor de execução.

**ADR-AH-008 — `MEMORY_OS.md` não é preenchido por este documento.** A lacuna de Memória é pendência formalmente assumida pelo próprio Volume II, per Decisão 008; este documento de Volume I não a assume por não ser de sua alçada. Contexto: respeitar a fronteira de governança entre Volumes registrada na Nota de Posicionamento Documental.

---

## 44. Conclusão

Este documento não projetou "completamente" um AI Hub do zero, porque um AI Hub completo já existe — `AI_HUB.md`, Frozen, e um Volume II inteiro, já Official em seis de seus documentos mais centrais. O que ele fez foi mais estreito e, por isso, mais confiável: verificar, ponto a ponto contra 23 documentos de dois Volumes, exatamente onde essa arquitetura já construída parava de responder às perguntas desta Sprint, e especificar, com o mesmo rigor de todo o resto da série, apenas essas seis áreas genuinamente vazias — Tool e Tool Registry, MCP Server e MCP Integration, RAG, Embedding, Vector Index, e o sistema de Prompt Template e Prompt Version —, mais duas extensões pontuais sobre entidades já existentes — Model Version e Agent Registry como catálogo real.

Duas pendências permanecem registradas, mas deliberadamente não resolvidas por este documento: a reconciliação formal das três definições divergentes de Agent, e a lacuna, já assumida pelo próprio Volume II, de `MEMORY_OS.md`. Ambas aguardam Review e Approval pelos canais já estabelecidos em `DOCUMENTATION_CONSTITUTION.md`, nunca decisão unilateral de um documento que, por desenho, tem escopo mais estreito do que elas.
