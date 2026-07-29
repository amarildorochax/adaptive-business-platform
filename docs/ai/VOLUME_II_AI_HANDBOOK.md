# Volume II — AI Handbook (Index)

**Adaptive Business Platform · Documento Técnico Oficial**

Status: Draft
Category: AI Documentation
Governed by: `DOCUMENTATION_CONSTITUTION.md` (Official · Version 1.1)

*Este documento é um índice de navegação para o Volume II — Intelligent Agent Architecture. Ele não restabelece, não redefine, não substitui e não contradiz nenhum princípio, camada, componente ou regra já fixado em qualquer documento do AI Handbook. Ele não implementa nenhum Agente, não cria código, e não modifica nenhuma arquitetura existente. Onde este índice e qualquer documento subjacente parecerem divergir, o documento subjacente governa — exatamente a mesma regra que `DOCUMENTATION_INDEX.md`, Seção 2, já aplica à Documentação como um todo.*

---

## 1. Purpose

Este documento existe para responder, em poucos minutos, três perguntas sobre o Volume II: *o que já está definido, onde está definido, e o que ainda falta ser escrito.* Ele não é o documento fundador do Volume II — esse papel já pertence a `AI_MANIFESTO.md`, Status Frozen, designado como Main Document do Volume II em `DOCUMENTATION_INDEX.md`, Seção 6. Este documento não disputa, não duplica e não substitui esse papel; ele existe abaixo dele, como mapa de navegação do que o Volume II já contém.

A necessidade deste índice é estrutural: o Volume II já acumulou oito documentos técnicos extensos (`AI_MANIFESTO.md`, `AI_ARCHITECTURE.md`, `AI_ORCHESTRATOR.md`, `AGENT_FRAMEWORK.md`, `CONTEXT_FRAMEWORK.md`, `AI_GOVERNANCE.md`, `AI_OBSERVABILITY.md`, `AI_IMPLEMENTATION.md`), sem que existisse, até aqui, um único ponto de entrada que orientasse um leitor novo sobre qual documento consultar para qual assunto — o mesmo problema que `DOCUMENTATION_INDEX.md` já resolve para a Documentação como um todo, aqui resolvido com o nível de detalhe que apenas um índice dedicado ao Volume II permite.

---

## 2. How to Read This Volume

Antes de tratar qualquer afirmação abaixo como autoridade, verifique o status do documento de origem (Constitution §8): **Frozen** e **Official** podem ser tratados como autoridade corrente; **Draft** descreve direção em curso, não fato assentado. A tabela da Seção 17 lista o status atual de cada documento do Volume II.

Cada seção abaixo aponta para o(s) documento(s) que efetivamente define(m) aquele assunto, com um resumo estritamente informativo — nunca uma redefinição. Para qualquer decisão de implementação, o documento de origem é sempre a referência vinculante, nunca o resumo aqui presente.

---

## 3. AI Vision

A visão estratégica completa da IA na Adaptive Business Platform é definida por `AI_MANIFESTO.md`, Capítulo 2 ("Missão da IA") e Capítulo 4 ("O Papel da IA"): a IA existe como camada transversal de raciocínio que analisa contexto, sugere ação e apoia decisão humana dentro de um domínio de negócio já governado — nunca como módulo isolado, nunca como substituto de autoridade arquitetural, nunca como automação disfarçada (distinção formalizada em `AUTOMATION_ENGINE.md`, ADR-003).

Ver: `AI_MANIFESTO.md`, Capítulos 2 e 4.

---

## 4. AI Principles

Os princípios que regem todos os Agentes desta plataforma já estão integralmente fixados em `AI_MANIFESTO.md`, Capítulo 3 ("Filosofia") — trinta princípios filosóficos, incluindo Modularidade, Especialização, Governança, Observabilidade, Segurança, Explicabilidade, Escalabilidade e Reutilização entre outros — e operacionalizados como vinte regras de governança formal em `AI_GOVERNANCE.md`, Capítulo 3 ("Filosofia e Princípios Fundamentais"). Nenhum princípio novo é introduzido por este índice.

Ver: `AI_MANIFESTO.md`, Capítulo 3; `AI_GOVERNANCE.md`, Capítulo 3.

---

## 5. AI Architecture

A arquitetura de referência completa — doze camadas, seus objetivos e seus fluxos — está definida em `AI_ARCHITECTURE.md`, Capítulos 3 a 4. A visão simplificada abaixo é apenas uma orientação de leitura para quem chega ao Volume II pela primeira vez; ela não é a topologia autoritativa, que permanece exclusivamente em `AI_ARCHITECTURE.md`:

```
User
  ↓
Dashboard
  ↓
AI Orchestrator
  ↓
Specialized Agents
  ↓
Business Hubs
  ↓
Services
  ↓
Data Sources
```

Este fluxo simplificado corresponde, na topologia real de doze camadas de `AI_ARCHITECTURE.md`, Capítulo 4, a um recorte de leitura através da Experience Layer, da Orchestration Layer, da Agent Layer, e das camadas de integração com o Architecture Handbook (Volume I) — nunca uma camada nova ou uma substituição da topologia já fixada.

Ver: `AI_ARCHITECTURE.md`, Capítulos 3, 4 e 15 (Fluxos Arquiteturais).

---

## 6. AI Orchestrator

As responsabilidades do Orchestrator — ponto único de coordenação de toda solicitação de IA, mediador entre Capability, Agent, Skill, Tool e Execution Policy — estão definidas estruturalmente em `AI_ARCHITECTURE.md`, Capítulo 5, e detalhadas integralmente, componente a componente e etapa a etapa do pipeline de decisão, em `AI_ORCHESTRATOR.md` (documento inteiro, 21 capítulos). Nenhuma responsabilidade nova é atribuída ao Orchestrator por este índice, e nenhuma implementação é proposta aqui.

Ver: `AI_ARCHITECTURE.md`, Capítulo 5; `AI_ORCHESTRATOR.md` (documento completo).

---

## 7. Agent Lifecycle

O ciclo de vida completo de um Agente — da criação ao registro, operação, atualização e aposentadoria — está definido em `AGENT_FRAMEWORK.md`, Capítulo 7 ("Lifecycle"), com cada uma de suas etapas produzindo um registro auditável correspondente.

Ver: `AGENT_FRAMEWORK.md`, Capítulo 7.

---

## 8. Agent Communication

O modelo de comunicação entre Agentes está definido em `AGENT_FRAMEWORK.md`, Capítulo 15 ("Comunicação"), sob o princípio de mediação central já fixado em `AI_ARCHITECTURE.md`, Capítulo 5: nenhum Agente selecionado se comunica diretamente com outro Agente selecionado para a mesma solicitação — toda troca acontece através do Orchestrator (`AI_ORCHESTRATOR.md`, Capítulo 7, "Coordenação").

A colaboração aprofundada entre múltiplos Agentes — além do modelo básico de comunicação mediada já descrito — é objeto de um documento dedicado ainda não escrito, `MULTI_AGENT_SYSTEM.md`, já antecipado por nome em `AI_ORCHESTRATOR.md`, Capítulo 20, e posicionado na Ordem Oficial de Implementação em `AI_IMPLEMENTATION.md`, Capítulo 6. Ver Seção 17 deste índice.

Ver: `AGENT_FRAMEWORK.md`, Capítulo 15; `AI_ORCHESTRATOR.md`, Capítulo 7; `AI_ARCHITECTURE.md`, Capítulo 14.

---

## 9. Agent Registry

A plataforma não nomeia este conceito "Agent Registry" — o componente que cumpre esse papel já está definido como **Agent Coordinator**, um dos componentes internos do Orchestrator (`AI_ORCHESTRATOR.md`, Capítulo 5, "Componentes Internos", e Capítulo 12, "Seleção de Agentes"). O processo pelo qual um Agente recém-criado se torna descoberto pelo Agent Coordinator é a etapa "Registro" do ciclo de vida, já definida em `AGENT_FRAMEWORK.md`, Capítulo 7.

Ver: `AI_ORCHESTRATOR.md`, Capítulos 5 e 12; `AGENT_FRAMEWORK.md`, Capítulo 7.

---

## 10. Shared Memory

A gestão de Memória já está definida, em três níveis complementares: como camada estrutural em `AI_ARCHITECTURE.md`, Capítulo 11; como responsabilidade do Orchestrator em `AI_ORCHESTRATOR.md`, Capítulo 10 ("Gerenciamento de Memória"); e como componente interno do Agente em `AGENT_FRAMEWORK.md`, Capítulo 9. Um documento técnico dedicado e aprofundado — `MEMORY_OS.md` — é referenciado por nome em `AI_GOVERNANCE.md`, `AI_OBSERVABILITY.md` e `AI_IMPLEMENTATION.md` como parte da série, mas **ainda não foi escrito**. Ver Seção 17.

Ver: `AI_ARCHITECTURE.md`, Capítulo 11; `AI_ORCHESTRATOR.md`, Capítulo 10; `AGENT_FRAMEWORK.md`, Capítulo 9.

---

## 11. Tool System

A forma como ferramentas são disponibilizadas aos Agentes já está definida como camada estrutural — Tool Abstraction — em `AI_ARCHITECTURE.md`, Capítulo 9, e como componente do Agente em `AGENT_FRAMEWORK.md`, Capítulo 14 ("Ferramentas"). Um documento técnico dedicado — `TOOL_RUNTIME.md` — é referenciado por nome na mesma série, mas **ainda não foi escrito**. Ver Seção 17.

Ver: `AI_ARCHITECTURE.md`, Capítulo 9; `AGENT_FRAMEWORK.md`, Capítulo 14.

---

## 12. Prompt Governance

Este é o único assunto solicitado para o Volume II que **não possui, até o momento, um capítulo ou documento dedicado** — apenas referências fragmentárias e consistentes entre si: `AI_MANIFESTO.md`, Capítulo 11, e `AI_HUB.md` (Volume I), ADR-010, já estabelecem que toda Prompt utilizada em produção é versionada com o mesmo rigor de controle de mudança exigido de qualquer alteração de código; `AI_GOVERNANCE.md`, Capítulos 6 e 8, e sua regra GOV-10, formalizam essa obrigação como Política; `CONTEXT_FRAMEWORK.md`, Capítulo 2, distingue formalmente Prompt de Contexto ("Prompt é a instrução formulada; Contexto é a informação de fundo"). Nenhum desses documentos, porém, consolida Prompt Governance como tópico próprio, com sua própria estrutura de aprovação, versionamento e auditoria. Este é um item em aberto — ver Seção 17.

Ver: `AI_MANIFESTO.md`, Capítulo 11; `AI_GOVERNANCE.md`, Capítulos 6 e 8; `CONTEXT_FRAMEWORK.md`, Capítulo 2.

---

## 13. Human-in-the-Loop

As condições sob as quais uma decisão humana é obrigatória já estão definidas pela Execution Policy Layer, estabelecida em `AI_ARCHITECTURE.md`, Capítulo 10, com suas seis políticas nomeadas (Read Only, Recommendation Only, **Human Approval**, Automatic Execution, Simulation, Dry Run), e governadas formalmente — aprovação, exceção, delegação de autoridade — em `AI_GOVERNANCE.md`, Capítulos 6 a 13.

Ver: `AI_ARCHITECTURE.md`, Capítulo 10; `AI_GOVERNANCE.md`, Capítulos 6–13.

---

## 14. Security Model

Os princípios de segurança da camada de IA não residem em um único documento — são tratados, de forma consistente, dentro do escopo de cada componente: `AGENT_FRAMEWORK.md`, Capítulo 17; `AI_ORCHESTRATOR.md`, Capítulo 17; `CONTEXT_FRAMEWORK.md`, Capítulo 17; com a disciplina de Segurança, Privacidade e Ética consolidada em `AI_GOVERNANCE.md`, Capítulo 19, e Segurança e Data Retention em `AI_OBSERVABILITY.md`, Capítulo 19. Toda verificação de Permission já se apoia no Identity Hub, já estabelecido em `IDENTITY_HUB.md` (Volume I).

Ver: `AGENT_FRAMEWORK.md` Cap. 17; `AI_ORCHESTRATOR.md` Cap. 17; `CONTEXT_FRAMEWORK.md` Cap. 17; `AI_GOVERNANCE.md` Cap. 19; `AI_OBSERVABILITY.md` Cap. 19; `IDENTITY_HUB.md` (Volume I).

---

## 15. Observability

Logs, auditoria, métricas, tracing e rastreabilidade completa de toda a camada de IA estão definidos, de forma consolidada e única, em `AI_OBSERVABILITY.md` (documento inteiro, 25 capítulos) — a autoridade que recebe e correlaciona o sinal que cada componente anterior (Orchestrator, Agent Framework, Context Framework, Governance) já promete produzir em seu próprio capítulo de observabilidade.

Ver: `AI_OBSERVABILITY.md` (documento completo).

---

## 16. Future Evolution

Como novos Agentes e novos componentes poderão ser adicionados já está definido, em plano executável, por `AI_IMPLEMENTATION.md` — particularmente seu Capítulo 6 ("Ordem Oficial de Implementação e Mapa de Dependências") e Capítulo 7 ("Matriz de Dependências"), que já estabelecem a sequência técnica obrigatória para tudo o que ainda falta construir, incluindo os seis documentos e componentes listados na Seção 17 abaixo.

Ver: `AI_IMPLEMENTATION.md`, Capítulos 6, 7 e 15 (Estratégia de Migração e Evolução).

---

## 17. Open Documentation Items (Known Gaps)

Esta seção existe porque um índice que aponta apenas para o que já está resolvido, sem também registrar o que está pendente, deixaria de cumprir seu propósito de mapa fiel do Volume II (Constitution, Princípio 6, "Silêncio não é Consistência"). Nenhum item abaixo é resolvido por este documento — cada um é um registro, não uma correção.

1. **Seis documentos do AI Handbook são citados por nome, com posição definida na Ordem Oficial de Implementação (`AI_IMPLEMENTATION.md`, Capítulos 6–7), mas ainda não existem como arquivo**: `MEMORY_OS.md`, `REASONING_ENGINE.md`, `PLANNING_ENGINE.md`, `SKILL_RUNTIME.md`, `TOOL_RUNTIME.md`, `MULTI_AGENT_SYSTEM.md`. A Matriz de Dependências de `AI_IMPLEMENTATION.md`, Capítulo 7, já define a ordem em que devem ser escritos: Context OS e Memory OS → AI Orchestrator (já escrito) → Agent Framework (já escrito) → Reasoning e Planning Engines → Skill Runtime → Tool Runtime → Multi-Agent System → AI Governance (já escrito) → AI Observability (já escrito).
2. **`docs/architecture/ai/AI_AGENT_ECOSYSTEM.md` se autodeclara "Founding document of Volume II"**, em contradição direta com a designação já vigente de `AI_MANIFESTO.md` (Frozen) como Main Document do Volume II em `DOCUMENTATION_INDEX.md`, Seção 6. Este conflito não foi resolvido por este índice e permanece como pendência de governança documental a ser tratada separadamente.
3. **Drift de nomenclatura entre `AI_IMPLEMENTATION.md` e o arquivo real**: a Matriz de Dependências (Capítulo 7) refere-se ao documento de Contexto como `CONTEXT_OS`, enquanto o arquivo publicado se chama `CONTEXT_FRAMEWORK.md`. Registrado aqui para futura correção editorial, sem impacto na autoridade técnica do documento.
4. **`docs/DOCUMENTATION_INDEX.md`, Seção 6, não lista este índice** (`VOLUME_II_AI_HANDBOOK.md`) como parte do Volume II — sua inclusão formal ali é trabalho de manutenção futuro, conforme a própria regra de manutenção do Index (Seção 12 daquele documento).

---

## 18. Approval

| Campo | Valor |
|---|---|
| Status | Draft |
| Version | 0.1 |
| Author | Claude |
