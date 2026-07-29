# 02 — AI Principles

**Adaptive Business Platform · AI Handbook · Documento Técnico Oficial**

Status: Draft
Category: AI Documentation
Governed by: `DOCUMENTATION_CONSTITUTION.md` (Official · Version 1.1)

*Este capítulo não cria nenhum princípio novo de governança. Ele organiza e contextualiza, para uso arquitetural, os princípios já estabelecidos em `AI_MANIFESTO.md` e em `AI_GOVERNANCE.md` — e, de forma subordinada, em `AI_AGENT_ECOSYSTEM.md`, conforme sua posição já formalizada em `VOLUME_II_FOUNDATIONAL_DECISIONS.md`, Decision 004. Todo princípio citado abaixo é referenciado ao seu capítulo de origem, nunca reescrito com significado próprio.*

---

## 1. Purpose

Os princípios que regem a Inteligência Artificial desta plataforma já existem, de forma completa e vinculante, em `AI_MANIFESTO.md` (trinta princípios filosóficos, Capítulo 3, e vinte regras de governança, Capítulo 11) e em `AI_GOVERNANCE.md` (dezoito princípios de governança, Capítulo 3). O que não existia, até este capítulo, era uma organização desses princípios pela pergunta arquitetural que cada um responde — qual princípio orienta a estrutura de um componente, qual orienta sua operação do dia a dia, qual orienta o desenho de algo novo, e qual orienta uma decisão específica de raciocínio.

Este capítulo existe exclusivamente para prover essa organização, servindo `01_AI_VISION.md` e todo capítulo seguinte do Volume II como um único ponto de consulta contextualizada — nunca como uma segunda fonte de autoridade normativa sobre o que esses princípios significam.

---

## 2. Architectural Principles

Princípios que definem fronteira de responsabilidade e a estrutura de comunicação entre componentes — a pergunta "quem é dono de quê" e "como a informação flui":

- **Business owns truth**, **AI owns intelligence**, **Automation owns execution**, **Knowledge owns context**, **Skills own capabilities**, **Agents own reasoning**, **Domains own business rules** — `AI_MANIFESTO.md`, Capítulo 3, primeiro agrupamento.
- **Commands change state**, **Events describe facts**, **Queries answer questions**, **The platform remains deterministic** — `AI_MANIFESTO.md`, Capítulo 3, segundo agrupamento; reafirmação da disciplina de CQRS e Event-Driven Architecture já central ao Architecture Handbook.
- **Architecture before AI** — `AI_MANIFESTO.md`, Capítulo 3: nenhuma capacidade de IA é adicionada antes que a arquitetura de domínio subjacente já esteja plenamente estabelecida.

Estes princípios são a base sobre a qual `03_AI_ARCHITECTURE.md` (capítulo seguinte deste Volume) estrutura suas camadas — este capítulo não antecipa nem redefine essa estrutura.

---

## 3. Operational Principles

Princípios que orientam a operação corrente de Agentes e da Governança já em funcionamento:

- **Context before reasoning**, **Memory before planning**, **Collaboration before specialization**, **Governance before autonomy**, **Observability before optimization**, **Cost is observable**, **Fail safe, not fail silent**, **Consistency over cleverness**, **Recommendations decay** — `AI_MANIFESTO.md`, Capítulo 3.
- **Policy Precedes Autonomy**, **Governance Never Executes**, **Audit Is Not Optional**, **Compliance Is Continuous, Not a Milestone** — `AI_GOVERNANCE.md`, Capítulo 3.

Estes princípios não são reinterpretados aqui — sua aplicação prática, incluindo o mecanismo formal de Política que os torna verificáveis, permanece integralmente descrita em `AI_GOVERNANCE.md`.

---

## 4. Design Principles

Princípios que devem orientar o desenho de qualquer componente ou Agente ainda não construído — os seis documentos pendentes já identificados em `VOLUME_II_CONSOLIDATION_REPORT.md`, Seção 6, devem ser escritos em conformidade com estes:

- **Provider independence**, **Data minimization by design**, **Every suggestion has an owner**, **Trust is earned incrementally** — `AI_MANIFESTO.md`, Capítulo 3.
- **No Policy Without Owner**, **Segregation Is Structural, Not Optional**, **Delegation Is Explicit, Never Implied** — `AI_GOVERNANCE.md`, Capítulo 3.
- **Composability Over Duplication**, **No Direct Agent-to-Agent Dependency**, **Extensibility Without Renegotiation** — `AI_AGENT_ECOSYSTEM.md`, §9 (documento de especificação subordinado ao Manifesto, conforme Decision 004; princípios válidos e aplicáveis dentro de seu escopo já delimitado).

---

## 5. Decision-Making Principles

Princípios que governam especificamente a produção e a validação de uma decisão ou sugestão de IA — o núcleo de explicabilidade, rastreabilidade e supervisão humana:

- **AI recommendations are explainable**, **Human oversight is preserved**, **Safety before execution**, **Explainability is mandatory, not optional**, **No silent override**, **Reasoning is auditable** — `AI_MANIFESTO.md`, Capítulo 3.
- **Restriction Wins Ties**, **Risk Is Classified Before It Is Accepted**, **Escalation Is Proportional to Impact**, **Human Oversight Is Preserved** (reafirmação direta) — `AI_GOVERNANCE.md`, Capítulo 3.

Nenhuma decisão futura de qualquer Agente, presente ou ainda não construído, é válida se produzida em desacordo com este grupo — é o grupo que `AI_MANIFESTO.md`, Capítulo 3, já identifica como a garantia de que "a capacidade crescente de raciocínio desta plataforma nunca se converta em risco não gerenciado".

---

## 6. Relationship with AI_MANIFESTO

Este capítulo deriva inteiramente de `AI_MANIFESTO.md` e não altera, em nenhum grau, sua autoridade como documento fundador do Volume II (`VOLUME_II_FOUNDATIONAL_DECISIONS.md`, Decision 004). Nenhum princípio listado nas Seções 2 a 5 recebe aqui uma definição própria — cada um mantém exclusivamente a definição já fixada em `AI_MANIFESTO.md`, Capítulo 3, ou Capítulo 11. Onde este capítulo e o Manifesto parecerem divergir em qualquer leitura futura, o Manifesto governa, sem exceção.

---

## 7. Relationship with AI_GOVERNANCE

Os princípios de `AI_GOVERNANCE.md`, Capítulo 3, já são, em suas próprias palavras, "uma extensão operacional de um princípio já fixado em `AI_MANIFESTO.md`, nunca uma filosofia nova e desconectada". Este capítulo preserva essa relação: todo princípio de Governança citado acima se traduz em prática verificável — Política registrada, versionada, auditada — exclusivamente através do mecanismo formal já descrito em `AI_GOVERNANCE.md`, Capítulos 6 a 13. Este capítulo não introduz nenhum mecanismo alternativo de aplicação desses princípios.

---

## 8. Scope

Este capítulo cobre exclusivamente a organização e a contextualização arquitetural dos princípios já existentes, segundo quatro lentes de uso: estrutural, operacional, de desenho, e de decisão.

Este capítulo não cobre, e não tem autoridade para: criar, alterar, remover ou redefinir qualquer princípio; estabelecer novo mecanismo de aplicação ou de auditoria (matéria de `AI_GOVERNANCE.md`); descrever camada técnica ou componente (matéria de `03_AI_ARCHITECTURE.md`); ou especificar qualquer Agente, Tool, API ou tecnologia.

---

## 9. Future Evolution

Todo documento futuro do Volume II — desde `03_AI_ARCHITECTURE.md` até os seis documentos ainda pendentes identificados em `VOLUME_II_CONSOLIDATION_REPORT.md` — deve poder ser verificado contra as quatro categorias aqui organizadas antes de sua aprovação: um componente novo é estruturalmente correto se respeita a Seção 2; operacionalmente correto se respeita a Seção 3; corretamente desenhado se respeita a Seção 4; e apto a decidir se respeita a Seção 5.

Se `AI_MANIFESTO.md` ou `AI_GOVERNANCE.md` forem alterados através de seus respectivos processos formais de mudança, este capítulo deve ser revisado em conformidade — nunca antecipando ou substituindo essa alteração por conta própria.

---

## 10. Approval

| Campo | Valor |
|---|---|
| Status | Draft |
| Version | 0.1 |
| Author | Claude |
