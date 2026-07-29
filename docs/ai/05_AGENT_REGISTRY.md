# 05 — Agent Registry

**Adaptive Business Platform · AI Handbook · Documento Técnico Oficial**

Status: Draft
Category: AI Documentation
Governed by: `DOCUMENTATION_CONSTITUTION.md` (Official · Version 1.1)

*Este capítulo não implementa o Agent Registry, não define API, não cria banco de dados, e não especifica tecnologia. Ele descreve responsabilidades, metadados conceituais e relações arquiteturais, organizando material já estabelecido em `AI_ORCHESTRATOR.md` e em `AGENT_FRAMEWORK.md`. Onde necessário, referencia `AI_MANIFESTO.md`, `AI_GOVERNANCE.md`, `AI_AGENT_ECOSYSTEM.md`, `03_AI_ARCHITECTURE.md`, `04_AI_ORCHESTRATOR.md` e `AI_ARCHITECTURE.md` (Official).*

---

## 1. Purpose

Este capítulo existe para dar ao conceito de "Agent Registry" — registro, descoberta e resolução dos Agentes disponíveis — um lugar próprio na estrutura modular do Volume II, sem introduzir um componente novo. A plataforma já nomeia essa função **Agent Coordinator**, componente interno do Orchestrator descrito em `AI_ORCHESTRATOR.md`, Capítulos 5 e 12, operando em conjunto com a etapa "Registro" do ciclo de vida de um Agente, já descrita em `AGENT_FRAMEWORK.md`, Capítulo 7. Este capítulo organiza esse material já existente sob o nome "Agent Registry" solicitado pela estrutura modular, sem redefinir nenhum dos dois.

---

## 2. Responsibilities

O Agent Registry (Agent Coordinator) existe para:

- **Descoberta** — tornar um Agente já criado conhecido e localizável, através da etapa "Registro" do Lifecycle (`AGENT_FRAMEWORK.md`, Cap. 7), análoga ao registro de Skill já descrito em `AI_ARCHITECTURE.md`, Capítulo 8.
- **Resolução** — identificar, para uma subtarefa específica já planejada, qual Agente disponível possui especialização declarada correspondente (`AI_ORCHESTRATOR.md`, Cap. 12).
- **Catalogação** — manter representada a existência e a especialização de cada Agente válido, cuja conformidade ao Agent Contract completo (dezessete elementos, `AGENT_FRAMEWORK.md`, Cap. 5) é pré-condição para o registro.
- **Exposição de capacidades** — tornar consultável, para fins de resolução, a Capability que cada Agente está autorizado a apoiar (elemento `Capabilities` do Agent Contract).

O Agent Registry nunca:

- **Executa Agentes** — ele delega e acompanha; o raciocínio pertence exclusivamente ao Agente já selecionado (`AI_ORCHESTRATOR.md`, Cap. 5, "Agent Coordinator").
- **Toma decisão de negócio** — nenhuma Regra, nenhuma Entidade e nenhum estado de domínio são processados por ele.
- **Armazena contexto operacional** — essa responsabilidade pertence exclusivamente ao Memory Manager (`06_SHARED_MEMORY.md`), nunca ao Registry.

---

## 3. Registry Model

O Agent Registry não define uma estrutura de dado — ele representa, conceitualmente, um subconjunto do Agent Contract completo já fixado em `AGENT_FRAMEWORK.md`, Capítulo 5, especificamente o subconjunto relevante à descoberta e à resolução, nunca o contrato inteiro:

- **Identidade** — o elemento `Identity` do Agent Contract: nome único e descrição formal que distingue um Agente de qualquer outro já registrado.
- **Capacidades** — o elemento `Capabilities`: a lista de Capabilities que aquele Agente está autorizado a apoiar, base da resolução descrita na Seção 5.
- **Domínio** — o elemento `Responsibilities`: a fronteira exata do que aquele Agente processa, documentada de forma estrita o suficiente para nunca se sobrepor à de outro Agente já registrado.
- **Estado lógico** — o elemento `Lifecycle`: em qual dos estados formais do ciclo de vida (`AGENT_FRAMEWORK.md`, Cap. 7) aquele Agente se encontra no momento da consulta.
- **Dependências conceituais** — o elemento `Version`: o identificador de versão de comportamento, permitindo que uma resolução seja rastreável até a versão específica do Agente que a atendeu.

Os demais doze elementos do Agent Contract (`Mission`, `Permissions`, `Execution Policies`, `Memory Access`, `Context Access`, `Planning Interface`, `Reasoning Interface`, `Skill Invocation`, `Tool Access`, `Observability`, `Response Contract`, `Governance`) não pertencem ao Registry Model — permanecem parte do contrato completo do Agente, consultado por outros componentes em outros momentos do pipeline, nunca pelo Registry para fins de descoberta.

---

## 4. Interactions

Em nível estritamente conceitual — sem protocolo, sem contrato técnico, sem API:

| Interação | Natureza conceitual |
|---|---|
| **AI Orchestrator** | O Registry não é externo ao Orchestrator — é seu componente interno Agent Coordinator (`04_AI_ORCHESTRATOR.md`, Seção 4). A relação é de composição, não de troca entre sistemas distintos. |
| **Agentes** | Cada Agente se torna conhecido ao Registry através da etapa "Registro" de seu próprio Lifecycle (`AGENT_FRAMEWORK.md`, Cap. 7) — a iniciativa de tornar-se descoberto pertence ao processo de criação do Agente, nunca a uma busca ativa do Registry por Agentes não anunciados. |
| **Shared Memory** | Nenhuma interação direta — o Registry nunca armazena nem consulta contexto operacional; essa fronteira é deliberada (Seção 2). |
| **Planning Engine** | O Planning Engine decompõe uma Capability em subtarefas *antes* de o Registry resolver qual Agente atende cada uma (`AI_ORCHESTRATOR.md`, Cap. 5) — o Registry consome a saída do Planning Engine, nunca o contrário. |
| **Reasoning Engine** | Nenhuma interação direta — o papel do Registry termina no momento em que a resolução (Seção 5) identifica o Agente correto; o raciocínio subsequente pertence inteiramente ao Agente resolvido. |
| **Business Hubs** | Nenhuma interação — o Registry cataloga apenas metadado de Agente, nunca dado de negócio de nenhum Business Hub. |

---

## 5. Resolution Rules

A resolução de qual Agente atende a uma subtarefa segue, conceitualmente, a disciplina já fixada em `AI_ORCHESTRATOR.md`, Capítulo 12 — nenhum algoritmo é definido aqui, apenas o comportamento esperado:

- **Correspondência estrita** — a especialização declarada de um Agente é considerada de forma estrita; um Agente cuja especialização não corresponda exatamente à subtarefa nunca é selecionado, mesmo que esteja disponível.
- **Ausência de forçamento** — quando o Agente correto está temporariamente indisponível, a subtarefa aguarda disponibilidade ou é escalada para atenção humana; ela nunca é redirecionada a um Agente de especialização incompatível para evitar atraso.
- **Ausência de correspondência é um sinal, não um erro oculto** — quando nenhum Agente disponível possui especialização suficientemente próxima, essa lacuna é comunicada explicitamente e registrada como sinal relevante para o desenvolvimento futuro de um Agente mais apropriado, nunca preenchida por uma resolução aproximada e não anunciada.
- **Colaboração mediada** — quando mais de um Agente é resolvido para a mesma solicitação, nenhum deles se comunica diretamente com outro; toda troca acontece através do Orchestrator (`AI_ORCHESTRATOR.md`, Cap. 12; `AI_AGENT_ECOSYSTEM.md`, §7, reafirma a mesma regra como princípio arquitetural do Ecossistema).

---

## 6. Relationship with Volume I

O Agent Registry nunca cataloga dado de negócio — apenas metadado de Agente (Identidade, Capacidade, Domínio declarado, Estado, Versão). A disciplina de que a `Responsibilities` de um Agente nunca se sobreponha à de outro já registrado é análoga, em espírito, à mesma disciplina de não sobreposição de fronteira já exigida entre Business Hubs por `DOMAIN_OWNERSHIP_MATRIX.md` — mas o Registry nunca decide, ele mesmo, nenhuma fronteira de domínio de negócio; ele apenas reflete a fronteira de especialização já declarada no Agent Contract de cada Agente.

---

## 7. Relationship with AI_MANIFESTO

O modelo de resolução estrita (Seção 5) é aplicação direta de `Agents own reasoning` e de `Trust is earned incrementally` (`02_AI_PRINCIPLES.md`, Seções 2 e 4) — um Agente só é confiável para uma subtarefa na exata medida de sua especialização já verificada e registrada, nunca por aproximação de conveniência. A exigência de Identidade e Versão rastreáveis no Registry Model (Seção 3) é aplicação direta de `Every suggestion has an owner` (`02_AI_PRINCIPLES.md`, Seção 4) — toda resolução do Registry garante que qualquer sugestão subsequente seja rastreável até um Agente e uma versão especificamente identificados.

---

## 8. Scope

Este capítulo cobre exclusivamente: o papel do Agent Registry na descoberta, resolução e catalogação conceitual de Agentes, o subconjunto do Agent Contract relevante a essa função, suas interações conceituais, e as regras de resolução já estabelecidas.

Este capítulo não cobre, e não tem autoridade para: especificar o Agent Contract completo ou o ciclo de vida integral de um Agente (matéria de `AGENT_FRAMEWORK.md`); especificar os demais componentes internos do Orchestrator (matéria de `AI_ORCHESTRATOR.md`); definir estrutura de banco de dados, API, ou algoritmo de correspondência; ou especificar tecnologia.

---

## 9. Future Evolution

Este componente é complementado pelos capítulos seguintes da estrutura modular, hoje todos já escritos: `06_SHARED_MEMORY.md` fornece o contexto e a memória que o Agente já resolvido consome (aprofundamento técnico dedicado ainda pendente em `MEMORY_OS.md`); `07_PLANNING_ENGINE.md` detalha a decomposição que precede a resolução; `08_REASONING_ENGINE.md` detalha o raciocínio que sucede a resolução; `09_SKILL_RUNTIME.md` e `10_TOOL_RUNTIME.md` detalham a execução técnica subsequente; e `11_MULTI_AGENT_SYSTEM.md` detalha a colaboração mediada quando mais de um Agente é resolvido simultaneamente.

---

## 10. Approval

| Campo | Valor |
|---|---|
| Status | Draft |
| Version | 0.1 |
| Author | Claude |
