# AI Core Integration Architecture

**Adaptive Business Platform · Documento Técnico Oficial**

Status: Draft
Category: Architecture Documentation
Governed by: `DOCUMENTATION_CONSTITUTION.md` (Official · Version 1.1)

*Este documento define, em nível exclusivamente arquitetural, como os onze componentes já implementados e aprovados da Sprint 4 — AI Core (Phase 4) colaboram de forma coordenada. Ele não é uma nova Fase do roadmap — `GATE_G2_IMPLEMENTATION_ROADMAP.md`, Seção 6, já define Phase 5 como Business Hubs, e este documento não a redefine, não a substitui, e não a antecipa. Este documento permanece inteiramente dentro do escopo já aprovado de Phase 4 — AI Core, formalizando a coordenação interna entre seus componentes já concluídos (`SPRINT_04_FINAL_APPROVAL.md`). Nenhum código é criado, nenhum componente existente é alterado, e nenhum contrato público é modificado.*

---

## 1. Objetivo

Definir como Context, Memory, Orchestrator, Agent Framework, Reasoning, Planning, Skill Runtime, Tool Runtime, Multi-Agent System, AI Governance e AI Observability — os onze componentes já implementados na Sprint 4 — colaboram de forma coordenada para sustentar uma solicitação de Inteligência Artificial de ponta a ponta, preservando integralmente a independência de código já estabelecida entre eles.

---

## 2. Escopo

**Dentro do escopo**: objetivos da integração; princípios arquiteturais; fronteira entre AI Core e Business Hubs; papel do Orchestrator na coordenação; fluxo entre Context, Memory, Reasoning e Planning; integração conceitual de Skill Runtime e de Tool Runtime; modelo de colaboração Multi-Agent; aplicação de AI Governance; uso de AI Observability; fluxo de execução de alto nível; responsabilidades por camada; dependências permitidas e proibidas; estratégia de integração incremental; critérios de validação e de aprovação.

**Fora do escopo**: APIs, endpoints, protocolos, filas, banco de dados, infraestrutura, provedores de IA concretos, ferramentas concretas, automações, dashboards, interfaces gráficas, Agentes de negócio específicos, qualquer código.

---

## 3. Princípios Arquiteturais

Reafirmados, não redefinidos, dos documentos já aprovados:

- **Identity First / Authentication Before Authorization** (`IDENTITY_HUB.md`) — toda solicitação já chega ao AI Core com identidade resolvida pelo Identity Hub.
- **Provider Agnostic** (`AI_HUB.md`, ADR-005) — nenhuma integração pressupõe provedor de IA específico.
- **Tenant Isolation is Absolute** (`AI_HUB.md`, ADR-008) — todo artefato que carrega `tenantId` (`Context`, `MemoryEntry`) preserva isolamento em toda a cadeia de coordenação.
- **Agents Never Coordinate Themselves** (`AGENT_FRAMEWORK.md`, Capítulo 4) — toda coordenação entre Agentes passa exclusivamente pelo Orchestrator.
- **Segregation Is Structural, Not Optional** (`AI_GOVERNANCE.md`, Capítulo 3) — papéis de Governança nunca acumulados.
- **Compliance Is Continuous** (`AI_GOVERNANCE.md`, Capítulo 3) — Política avaliada a cada etapa relevante, não apenas na criação.
- **Observability First** (`NON_FUNCTIONAL_REQUIREMENTS.md`, Capítulo 3) — todo componente produz sinal observável desde sua concepção.
- **Independência de código entre componentes** (já demonstrada em `SPRINT_04_ARCHITECTURAL_AUDIT.md`) — coordenação é sempre de fluxo conceitual e de identificador opaco, nunca de importação de tipo.

---

## 4. Componentes Participantes

Os onze componentes já aprovados na Sprint 4 (`SPRINT_04_FINAL_APPROVAL.md`): Context (15), Memory (16), Orchestrator (17), Agent Framework (18), Reasoning (19), Planning (20), Skill Runtime (21), Tool Runtime (22), Multi-Agent System (23), AI Governance (24), AI Observability (25). Nenhum componente adicional é introduzido por este documento.

---

## 5. Modelo de Integração

A coordenação entre os onze componentes é inteiramente **mediada pelo Orchestrator**, nunca por acoplamento direto de código entre dois componentes periféricos — mesmo princípio de mediação central já aplicado a Agentes (`AGENT_FRAMEWORK.md`, Capítulo 15) e a Políticas (`AI_GOVERNANCE.md`).

```
                         Orchestrator
              (DecisionPipelineState — Component 17)
                              │
        ┌──────────┬──────────┼──────────┬──────────┐
        ▼          ▼          ▼          ▼          ▼
    Context     Memory   Agent Framework  Skill/Tool  Multi-Agent
    (15)        (16)         (18)         Runtime      System
                              │           (21, 22)       (23)
                              ▼
                      Reasoning ∥ Planning
                        (19)      (20)

  Toda etapa acima é observada por AI Observability (25) e
  avaliada contra AI Governance (24), nunca redefinindo o
  substrato de nenhum dos onze componentes.
```

Cada seta representa uma relação **conceitual de fluxo**, já registrada nos artefatos existentes através de identificadores opacos (`requestId`, `contextId`, `memoryId`, `agentId`, `skillId`, `toolId`, `groupId`, `policyId`, `eventId`) — nunca uma importação de código nova. Este documento não introduz nenhum acoplamento além do já existente; apenas nomeia, de forma consolidada, o fluxo que os artefatos já implicam individualmente.

---

## 6. Fluxo Arquitetural

Reproduzido, sem alteração, do Pipeline de Decisão já fixado em `AI_ORCHESTRATOR.md`, Capítulo 6, anotado com o componente que sustenta cada etapa:

| Etapa do Pipeline | Componente que sustenta |
|---|---|
| Request | Orchestrator (`DecisionPipelineState`) |
| Intent Analysis | Orchestrator |
| Context Assembly | **Context** (15) |
| Memory Retrieval | **Memory** (16) |
| Capability Resolution | Orchestrator (`CapabilitySelection`) |
| Planning | **Planning** (20) |
| Execution Policy | Orchestrator (`ExecutionPolicy`) — avaliado contra **AI Governance** (24) |
| Agent Delegation | Orchestrator (`AgentSelection`) → **Agent Framework** (18) |
| Execution | **Agent Framework** (18) → **Reasoning** (19) → **Skill Runtime** (21) → **Tool Runtime** (22), e quando múltiplos Agentes colaboram, **Multi-Agent System** (23) |
| Consolidation | Orchestrator (`ConsolidationResult`) |
| Human Approval | Orchestrator, condicionado por `ExecutionPolicy` |
| Response | Orchestrator |

Todo o fluxo acima produz sinal consultável através de **AI Observability** (25) em cada etapa relevante, sem que nenhuma etapa dependa da observação para prosseguir (emissão sempre assíncrona, `AI_OBSERVABILITY.md`, Capítulo 7).

---

## 7. Responsabilidades

| Componente | Responsabilidade nesta coordenação |
|---|---|
| Context | Fornecer o Contexto já qualificado e priorizado à etapa de Context Assembly |
| Memory | Fornecer memória relevante já persistida à etapa de Memory Retrieval |
| Orchestrator | Orquestrar todas as demais etapas, único ponto de coordenação |
| Agent Framework | Definir o contrato e o ciclo de vida do Agente já delegado |
| Reasoning | Aplicar o ciclo de cinco etapas sobre o Contexto e a Memória já disponibilizados |
| Planning | Fornecer a decomposição em etapas já planejadas |
| Skill Runtime | Declarar as Skills disponíveis à especialização do Agente |
| Tool Runtime | Declarar as Ferramentas mediadas disponíveis às Skills |
| Multi-Agent System | Declarar o grupo e o canal mediado quando mais de um Agente colabora |
| AI Governance | Avaliar toda etapa relevante contra Política já registrada |
| AI Observability | Registrar sinal consultável de toda etapa, sem interferir em seu processamento |

---

## 8. Dependências Permitidas

- Sequenciamento de Fase já fixado em `AI_CORE_ARCHITECTURA_DEFINITION.md`, Seção 8 — Context/Memory → Orchestrator → Agent Framework → Reasoning/Planning → Skill Runtime → Tool Runtime → Multi-Agent System → AI Governance → AI Observability.
- Referência por identificador opaco entre qualquer par de componentes, quando o fluxo conceitual da Seção 6 o exigir.
- Dependência de pacote de `@abp/core`, `@abp/shared`, e `@abp/platform-services`, já autorizada por `platform/ai/README.md`, ainda que nenhum dos 88 arquivos já implementados a exerça de fato.

---

## 9. Dependências Proibidas

- Importação de tipo entre dois dos onze componentes de AI Core (nenhuma existe hoje; nenhuma é introduzida por este documento).
- Importação de `@abp/infrastructure` — Infrastructure permanece substrato de implantação, nunca dependência de código (`platform/PACKAGE_STRUCTURE_MANIFEST.md`).
- AI Core chamando um Business Hub diretamente — toda interação futura com domínio de negócio deverá respeitar a mesma mediação já exigida de um Agente em `AGENT_FRAMEWORK.md`, Capítulo 15 (Query/Command catalogados, nunca acesso direto).
- AI Core iniciando Automation — a direção permanece sempre Automation → AI, nunca o inverso (`GATE_G2_IMPLEMENTATION_ROADMAP.md`, Seção 6).
- Qualquer tecnologia concreta de execução, comunicação, ou armazenamento.

---

## 10. Estratégia de Integração

A integração real (código que efetivamente conecta os onze componentes) é deliberadamente **incremental e futura**, nunca de "big bang": cada componente já implementado permanece estável e completo em si mesmo; uma futura Sprint de integração poderá introduzir o código de coordenação (por exemplo, o Orchestrator passando a resolver `contextId` em um `Context` real) sem exigir alteração de nenhum contrato já publicado, apenas a adição de um consumidor. Este documento não define quando essa Sprint futura ocorre, nem seu backlog — apenas confirma que a arquitetura já construída permite essa evolução sem retrabalho estrutural.

---

## 11. Critérios de Validação

✓ Nenhum componente já implementado foi alterado por este documento.
✓ Nenhum contrato público foi modificado.
✓ Nenhuma tecnologia concreta foi introduzida.
✓ Todo fluxo descrito já é rastreável aos artefatos e aos documentos-fonte já aprovados na Sprint 4.
✓ Nenhuma dependência proibida (Seção 9) foi introduzida.

---

## 12. Critérios de Aprovação

Este documento é aprovado quando: (a) consolida, sem contradição, o fluxo já implícito nos onze componentes já aprovados; (b) não introduz nenhum componente, artefato, ou tecnologia nova; (c) preserva integralmente `SCOPE_FREEZE_V1.md`; (d) não reutiliza nem redefine a numeração de Fase já fixada em `GATE_G2_IMPLEMENTATION_ROADMAP.md`.

---

## 13. Riscos Arquiteturais

| Risco | Severidade | Observação |
|---|---|---|
| Uma futura Sprint de integração real introduzir acoplamento além do estritamente necessário | Baixa | Mitigado pela disciplina já demonstrada de identificador opaco em todos os 88 arquivos existentes |
| Confusão de nomenclatura entre esta arquitetura de coordenação interna e a Phase 5 (Business Hubs) já oficial | Baixa | Mitigada pelo próprio nome deste documento e pela nota explícita na abertura |
| Cinco componentes com aprofundamento técnico ainda adiado (Decision 008) exigirem revisão do fluxo aqui descrito | Baixa | O fluxo descrito já opera no nível de estrutura mínima já aprovada; aprofundamento futuro tende a detalhar, não a contradizer |

Nenhum risco de severidade Alta ou Crítica identificado.

---

## 14. Decisões Arquiteturais (ADRs)

**ADR-INT-001 — A coordenação entre componentes de AI Core é sempre mediada pelo Orchestrator.** Nenhum componente periférico (Context, Memory, Reasoning, Planning, Skill Runtime, Tool Runtime, Multi-Agent System) coordena outro diretamente. Contexto: mesma disciplina de mediação central já aplicada a Agentes e a Políticas.

**ADR-INT-002 — Este documento não constitui uma nova Fase do roadmap.** Permanece integralmente dentro de Phase 4 — AI Core. Contexto: `GATE_G2_IMPLEMENTATION_ROADMAP.md`, Seção 6, já define Phase 5 como Business Hubs; nenhuma redefinição é feita aqui.

**ADR-INT-003 — Toda referência entre os onze componentes permanece por identificador opaco até uma Sprint de integração futura e explícita.** Contexto: preserva a independência de código já demonstrada e auditada em `SPRINT_04_ARCHITECTURAL_AUDIT.md`, evitando acoplamento prematuro.

---

## 15. Conclusão

Este documento consolida, sem inventar nenhum componente ou tecnologia nova, o fluxo de coordenação já implícito entre os onze componentes da Sprint 4 — AI Core, formalizando o papel do Orchestrator como único ponto de mediação. Ele permanece inteiramente dentro do escopo já aprovado de Phase 4, não substitui nem antecipa Phase 5 — Business Hubs, e não autoriza, por si só, nenhuma implementação de código de integração real — essa continua sendo uma decisão futura e distinta.

---

## Approval

| Campo | Valor |
|---|---|
| Status | AI CORE INTEGRATION ARCHITECTURE APPROVED |
| Version | 1.0 |
| Author | Claude |
