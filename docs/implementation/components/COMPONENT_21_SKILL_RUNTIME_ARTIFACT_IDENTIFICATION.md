# Component 21 — Skill Runtime — Artifact Identification

**Adaptive Business Platform · Documento Técnico Oficial**

Status: Draft
Category: Implementation Documentation
Governed by: `DOCUMENTATION_CONSTITUTION.md` (Official · Version 1.1)

*Este documento identifica, por citação direta de `AI_ARCHITECTURE.md`, Capítulo 8, e de `AGENT_FRAMEWORK.md`, Capítulo 13, os oito artefatos já nomeados pela tarefa que originou o componente Skill Runtime.*

---

## Método

| Responsabilidade (já listada pela tarefa) | Fonte | Elevado a artefato |
|---|---|---|
| Representar uma Skill | `AI_ARCHITECTURE.md`, Cap. 8 (Registro); `AGENT_FRAMEWORK.md`, Cap. 13 | **SkillDefinition** |
| Representar o estado de uma Skill | `AI_ARCHITECTURE.md`, Cap. 8 (ciclo de vida, restrito ao pré-execução) | **SkillState** |
| Representar metadados da Skill | Padrão estrutural já consolidado (Component 20) | **SkillMetadata** |
| Representar capacidades declaradas | `AGENT_FRAMEWORK.md`, Cap. 13 ("relevantes à Capability em curso") | **SkillCapability** |
| Representar requisitos de execução | `AI_ARCHITECTURE.md`, Cap. 8 (Autorização, Permission); `AGENT_FRAMEWORK.md`, Cap. 13 (Execution Policy) | **SkillRequirement** |
| Representar restrições arquiteturais | `AI_ARCHITECTURE.md`, Cap. 8 (Isolamento) | **SkillConstraint** |
| Representar versão; compatibilidade | `AI_ARCHITECTURE.md`, Cap. 8 (Versionamento) | **SkillCompatibility** |
| Representar resultado esperado | `AGENT_FRAMEWORK.md`, Cap. 13 ("resultado técnico... em formato estruturado e previsível") | **SkillResult** |

---

## Artefato 1 — Skill Definition

| Requisito | Fonte |
|---|---|
| "Registro é o processo formal pelo qual uma nova Skill se torna disponível para descoberta e para invocação." | `AI_ARCHITECTURE.md`, Capítulo 8 |
| "Skills são descobertas por um Agente através da Skill Runtime." | `AGENT_FRAMEWORK.md`, Capítulo 13 |

**Conclusão**: registro declarativo da identidade de uma Skill — identificador e nome — nenhuma lógica de registro real.

---

## Artefato 2 — Skill State

| Requisito | Fonte |
|---|---|
| "Skill implementada ──► Registro formal ──► Descoberta ──► Autorização verificada ──► Execução isolada ──► Resultado retornado." (diagrama) | `AI_ARCHITECTURE.md`, Capítulo 8 |

**Conclusão**: união literal das etapas pré-execução do ciclo já nomeado — `Implemented`, `Registered`, `Deprecated` (este último grounded em "Versionamento... preservando compatibilidade com Agentes que ainda dependam da versão anterior", implicando substituição controlada de versão). Descoberta, Autorização e Execução são deliberadamente excluídas, por serem mecanismos de runtime, explicitamente fora de escopo ("Não introduzir: execução... discovery").

---

## Artefato 3 — Skill Metadata

| Requisito | Fonte |
|---|---|
| Mesma disciplina de rastreabilidade já aplicada em `PlanningMetadata` (Component 20). | Padrão estrutural já consolidado |

**Conclusão**: registro declarativo de metadado estrutural de uma Skill — identificador, momento de criação, versão.

---

## Artefato 4 — Skill Capability

| Requisito | Fonte |
|---|---|
| "O Agente consulta o conjunto de Skills já registradas relevantes à Capability em curso." | `AGENT_FRAMEWORK.md`, Capítulo 13 |

**Conclusão**: registro declarativo das Capabilities às quais uma Skill está associada — nenhum catálogo de Capability concreta.

---

## Artefato 5 — Skill Requirement

| Requisito | Fonte |
|---|---|
| "Autorização é a verificação... de que o Agente solicitante possui Permission suficiente para invocá-la." | `AI_ARCHITECTURE.md`, Capítulo 8 |
| "Skills respeitam políticas de execução... a Execution Policy Layer já determina, antes da invocação efetiva, se essa Skill pode prosseguir automaticamente ou se exige confirmação humana." | `AGENT_FRAMEWORK.md`, Capítulo 13 |

**Conclusão**: registro declarativo dos requisitos que devem estar satisfeitos antes de uma Skill poder ser invocada — escopo de Permission exigido, e se uma Execution Policy é aplicável — nenhuma verificação real.

---

## Artefato 6 — Skill Constraint

| Requisito | Fonte |
|---|---|
| "Isolamento de toda Skill garante que sua execução nunca produza efeito colateral não documentado sobre outra Skill ou sobre o próprio Agente que a invoca." | `AI_ARCHITECTURE.md`, Capítulo 8 |

**Conclusão**: registro declarativo de uma restrição arquitetural aplicável a uma Skill — por exemplo, a própria garantia de Isolamento. Nenhum mecanismo de sandbox ou de isolamento real.

---

## Artefato 7 — Skill Compatibility

| Requisito | Fonte |
|---|---|
| "Versionamento de toda Skill... uma mudança de contrato de Skill exige nova versão, preservando compatibilidade com Agentes que ainda dependam da versão anterior." | `AI_ARCHITECTURE.md`, Capítulo 8 |

**Conclusão**: registro declarativo das versões com as quais uma Skill permanece compatível.

---

## Artefato 8 — Skill Result

| Requisito | Fonte |
|---|---|
| "Skills retornam resultados ao Agente que as invocou, sempre em formato estruturado e previsível." | `AGENT_FRAMEWORK.md`, Capítulo 13 |

**Conclusão**: registro declarativo do formato esperado do resultado de uma Skill — nenhum resultado real de invocação, já que nenhuma execução acontece neste componente.

---

## Elementos Explicitamente Não Elevados a Artefato

Descoberta, Autorização, Execução, Isolamento como mecanismo real (`AI_ARCHITECTURE.md`, Capítulo 8) — todos mecanismos de runtime, explicitamente fora de escopo. Orquestração, Planejamento, Raciocínio (Components 17, 20, 19) — já implementados separadamente. Tool Runtime, Multi-Agent System (Components 22, 23) — ainda não implementados. Qualquer plugin loader, reflection, dependency injection, service locator, workflow, scheduler, cache, ou mecanismo de IA — explicitamente fora do `SCOPE_FREEZE_V1.md`. Ausência registrada, não inventada.

---

## Conclusão

Oito artefatos identificados, todos rastreáveis a `AI_ARCHITECTURE.md`, Capítulo 8, e a `AGENT_FRAMEWORK.md`, Capítulo 13, conforme já nomeados pela tarefa que originou este componente.

---

## Traceability

| Artefato | Fonte |
|---|---|
| Skill Definition | `AI_ARCHITECTURE.md`, Capítulo 8; `AGENT_FRAMEWORK.md`, Capítulo 13 |
| Skill State | `AI_ARCHITECTURE.md`, Capítulo 8 |
| Skill Metadata | Padrão estrutural já consolidado |
| Skill Capability | `AGENT_FRAMEWORK.md`, Capítulo 13 |
| Skill Requirement | `AI_ARCHITECTURE.md`, Capítulo 8; `AGENT_FRAMEWORK.md`, Capítulo 13 |
| Skill Constraint | `AI_ARCHITECTURE.md`, Capítulo 8 |
| Skill Compatibility | `AI_ARCHITECTURE.md`, Capítulo 8 |
| Skill Result | `AGENT_FRAMEWORK.md`, Capítulo 13 |

---

## Approval

| Campo | Valor |
|---|---|
| Status | ARTIFACT IDENTIFICATION COMPLETED |
| Version | 1.0 |
| Author | Claude |
