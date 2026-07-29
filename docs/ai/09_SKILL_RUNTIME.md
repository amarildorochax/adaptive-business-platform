# 09 — Skill Runtime

**Adaptive Business Platform · AI Handbook · Documento Técnico Oficial**

Status: Draft
Category: AI Documentation
Governed by: `DOCUMENTATION_CONSTITUTION.md` (Official · Version 1.1)

*Este capítulo não implementa Skills, não define runtime, não cria SDK, não define API, e não especifica tecnologia. Ele descreve responsabilidades, limites arquiteturais e relações conceituais, organizando material já estabelecido em `AI_ARCHITECTURE.md` e em `AGENT_FRAMEWORK.md`. Onde necessário, referencia `AI_MANIFESTO.md`, `AI_GOVERNANCE.md`, `03_AI_ARCHITECTURE.md`, `04_AI_ORCHESTRATOR.md`, `05_AGENT_REGISTRY.md`, `06_SHARED_MEMORY.md`, `07_PLANNING_ENGINE.md` e `08_REASONING_ENGINE.md`.*

---

## 1. Purpose

Este capítulo existe para dar à execução controlada das Skills de um Agente um lugar próprio na estrutura modular do Volume II. A plataforma já descreve essa função como o **Skill Runtime**, conceituado estruturalmente em `AI_ARCHITECTURE.md`, Capítulo 8, e detalhado, do ponto de vista do Agente que a invoca, em `AGENT_FRAMEWORK.md`, Capítulo 13. Como `07_PLANNING_ENGINE.md` e `08_REASONING_ENGINE.md`, este era um dos seis documentos pendentes identificados em `VOLUME_II_CONSOLIDATION_REPORT.md`, Seção 6. Este capítulo preenche essa posição organizando o que já está descrito, sem introduzir runtime, SDK, API ou tecnologia nova.

---

## 2. Responsibilities

O Skill Runtime existe para:

- **Executar Skills já aprovadas** — processar a lógica interna de uma Skill já descoberta, já registrada e já autorizada, invocada por um Agente depois que seu Reasoning Engine conclui a necessidade de uma capacidade técnica (`08_REASONING_ENGINE.md`).
- **Isolar a execução** — garantir que a execução de uma Skill nunca produza efeito colateral não documentado sobre outra Skill ou sobre o próprio Agente invocador (`AI_ARCHITECTURE.md`, Cap. 8).
- **Controlar o ciclo de vida** — administrar Registro, Descoberta, Autorização, Execução e Retorno como uma sequência formal, aplicável a toda Skill sem exceção.
- **Retornar resultado estruturado** — devolver ao Agente invocador um resultado técnico em formato previsível, consumível por sua Síntese e sua Inferência subsequentes (`AGENT_FRAMEWORK.md`, Cap. 13).

O Skill Runtime nunca:

- **Raciocina** — ele executa capacidade técnica já decidida; a decisão de *se* e *quando* invocar uma Skill pertence exclusivamente ao Reasoning Engine do Agente.
- **Planeja** — ele nunca decompõe objetivo ou subtarefa; essa responsabilidade pertence ao Planning Engine (`07_PLANNING_ENGINE.md`).
- **Toma decisão de negócio** — nenhuma Regra, Entidade ou Command é processado por ele.
- **Acessa diretamente Business Hubs** — toda mudança de estado eventualmente necessária converge para o Command Bus já governado pelo Volume I, nunca por acesso direto de uma Skill a um Business Hub.

---

## 3. Skill Model

O ciclo de vida de uma Skill, já descrito em `AI_ARCHITECTURE.md`, Capítulo 8, e em `AGENT_FRAMEWORK.md`, Capítulo 13, permanece integralmente o mesmo aqui referenciado, nunca redefinido:

```
              CICLO DE VIDA DE UMA SKILL NO RUNTIME
   ┌───────────────────────────────────────────────────────────┐
   │  Skill implementada ──► Registro formal ──► Descoberta            │
   │  por Agente ──► Autorização verificada (Identity Hub e                    │
   │  Execution Policy) ──► Execução isolada ──► Resultado                            │
   │  retornado ao Agente solicitante                                                     │
   └───────────────────────────────────────────────────────────┘
```

Mapeado às cinco fases conceituais solicitadas: **Seleção** corresponde à Descoberta, quando o Agente identifica, dentro do conjunto de Skills já registradas, qual delas atende à necessidade técnica identificada por seu Reasoning Engine; **Preparação** corresponde à Autorização, verificando Permission suficiente junto ao Identity Hub e a Execution Policy aplicável antes de qualquer invocação efetiva; **Execução** é o processamento isolado da lógica interna da Skill; **Retorno** é a entrega do resultado técnico, sempre estruturado e previsível, ao Agente invocador; **Encerramento** é a conclusão da invocação, sem que nenhum estado da Skill persista além dela, salvo quando explicitamente promovido a memória através do Memory Manager (`06_SHARED_MEMORY.md`).

Nenhuma Skill pertence exclusivamente a um único Agente — a relação é sempre de muitos para muitos, preservando o princípio Reutilização (`AI_ARCHITECTURE.md`, Cap. 8), e toda evolução de contrato de uma Skill exige nova versão, preservando compatibilidade com Agentes que ainda dependam da versão anterior.

---

## 4. Interactions

Em nível estritamente conceitual — sem protocolo, sem contrato técnico, sem API:

| Interação | Natureza conceitual |
|---|---|
| **Reasoning Engine** | Decide *se* e *quando* uma Skill é necessária, com base em sua conclusão já validada; o Skill Runtime executa o que o Reasoning Engine já decidiu, nunca o contrário (`08_REASONING_ENGINE.md`, Seção 4). |
| **AI Orchestrator** | A Execution Policy aplicável a uma Skill que envolva potencial mudança de estado já foi anotada pelo Execution Policy Engine do Orchestrator antes da invocação efetiva (`04_AI_ORCHESTRATOR.md`); o Skill Runtime verifica essa política, nunca a define. |
| **Tool Runtime** | Quando uma Skill precisa de acesso a recurso externo, esse acesso é sempre mediado pela Tool Abstraction — o Skill Runtime nunca acessa recurso externo diretamente. |
| **Agentes** | O Agente é quem descobre e invoca a Skill; o Skill Runtime nunca invoca a si mesmo nem seleciona um Agente — essa iniciativa é sempre do Agente (`AGENT_FRAMEWORK.md`, Cap. 13). |

---

## 5. Execution Boundaries

- **Pertence ao Skill Runtime**: registro, descoberta, verificação de autorização, execução isolada, retorno estruturado, versionamento de Skill.
- **Pertence ao Reasoning Engine**: a decisão de que uma capacidade técnica é necessária, e a incorporação do resultado técnico à Síntese e à Inferência subsequentes.
- **Pertence ao Tool Runtime**: o acesso técnico a qualquer recurso externo que a Skill eventualmente requeira.
- **Pertence ao Orchestrator**: a anotação de qual Execution Policy se aplica a uma Skill potencialmente causadora de mudança de estado, e a decisão de exigir ou não confirmação humana antes de sua invocação.
- **Pertence aos Business Hubs**: toda Regra de negócio, todo estado, e todo Command eventualmente resultante — o Skill Runtime nunca os processa diretamente, apenas converge para o Command Bus já governado pelo Volume I quando aplicável.

---

## 6. Relationship with Volume I

O Skill Runtime nunca acessa um Business Hub diretamente e nunca altera estado de negócio por conta própria — quando a execução de uma Skill eventualmente resulta em mudança de estado, essa mudança converge, como qualquer outra, para o Command Bus já catalogado em `COMMAND_CATALOG.md`, respeitando integralmente a Execution Policy e a confirmação humana já exigidas por `03_AI_ARCHITECTURE.md`.

---

## 7. Relationship with AI_MANIFESTO

O isolamento e o versionamento obrigatórios de toda Skill aplicam diretamente `Skills own capabilities` (`02_AI_PRINCIPLES.md`, Seção 2) — uma capacidade técnica encapsulada, nunca uma lógica difusa espalhada pela implementação. A verificação de Execution Policy antes de qualquer invocação com potencial mudança de estado aplica `Safety before execution` (Seção 3). O princípio Reutilização, que impede duplicação de lógica entre Agentes distintos, é a aplicação técnica direta de `Trust is earned incrementally` e da disciplina de evolução controlada já central a todo Evento, Command e Query do Architecture Handbook.

---

## 8. Scope

Este capítulo cobre exclusivamente: o papel do Skill Runtime na execução controlada e isolada de Skills, seu ciclo de vida conceitual, suas interações, e suas fronteiras frente ao Reasoning Engine, ao Tool Runtime, ao Orchestrator e aos Business Hubs.

Este capítulo não cobre, e não tem autoridade para: definir SDK, API, ou interface técnica de Skill; especificar tecnologia de execução ou de isolamento; ou detalhar o acesso a recurso externo (matéria de `10_TOOL_RUNTIME.md`).

---

## 9. Future Evolution

Este componente é complementado pelos capítulos seguintes da estrutura modular, hoje todos já escritos: `10_TOOL_RUNTIME.md` detalha o acesso técnico a recurso externo que uma Skill eventualmente requer; e `11_MULTI_AGENT_SYSTEM.md` detalha como a invocação da mesma Skill por Agentes distintos, na mesma solicitação, é coordenada sem duplicação nem conflito.

---

## 10. Approval

| Campo | Valor |
|---|---|
| Status | Draft |
| Version | 0.1 |
| Author | Claude |
