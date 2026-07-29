# Phase 6 — Automation Engine Implementation Backlog

**Adaptive Business Platform · Documento Técnico Oficial**

Status: Draft
Category: Implementation Documentation
Governed by: `DOCUMENTATION_CONSTITUTION.md` (Official · Version 1.1)

*Este documento decompõe `PHASE_6_AUTOMATION_ENGINE_ARCHITECTURE_DEFINITION.md`, já aprovada por `PHASE_6_READINESS_ASSESSMENT.md` (READY), em um backlog rastreável de cinco Sprints de implementação, seguindo a mesma metodologia já usada em `PHASE_5_IMPLEMENTATION_BACKLOG.md`. Nenhum código foi criado. Nenhum contrato TypeScript foi criado. Nenhuma tecnologia foi definida. Nenhuma Sprint foi iniciada por este documento.*

---

## 0. Nota de Correção Herdada

`PHASE_6_READINESS_ASSESSMENT.md`, Seção 3, já registra a correção de uma não conformidade encontrada durante a elaboração deste backlog: `PHASE_6_AUTOMATION_ENGINE_ARCHITECTURE_DEFINITION.md` originalmente citava "vinte e dois componentes"; a contagem correta, por enumeração direta de `AUTOMATION_ENGINE.md`, Capítulo 7, é **vinte e cinco**. Este backlog usa a contagem já corrigida — as vinte e cinco Sprints de componente estão distribuídas em cinco Sprints de agrupamento, detalhadas na Seção 2.

---

## 1. Ordem Oficial de Implementação

A ordem segue a mesma sequência lógica já esboçada em `AUTOMATION_ENGINE.md`, Capítulo 20 (Roadmap) — curto, médio e longo prazo — decomposta aqui em cinco Sprints agrupadas por camada funcional, nunca por Hub (o Automation Engine é um único domínio coeso, diferente da Phase 5):

| Ordem | Sprint | Camada | Componentes | Prioridade (Blueprint, Capítulo 20) |
|---|---|---|---|---|
| 1 | Sprint 6.1 | Orquestração Central | 6 | Curto prazo |
| 2 | Sprint 6.2 | Trigger e Condition | 3 | Curto prazo |
| 3 | Sprint 6.3 | Action e Execution | 5 | Curto prazo (núcleo) / Médio prazo (Retry maduro) |
| 4 | Sprint 6.4 | Governança e Aprovação | 4 | Médio prazo |
| 5 | Sprint 6.5 | Integração e Suporte Avançado | 7 | Médio a Longo prazo |

Total: 6 + 3 + 5 + 4 + 7 = 25 componentes, consistente com a contagem corrigida na Seção 0.

---

## 2. Backlog Completo

### AUTO-01 — Sprint 6.1: Orquestração Central

- **Objetivo**: tornar operante o núcleo de orquestração do Automation Engine — o ponto de entrada de todo Command e Query, e o catálogo de Workflow disponível na plataforma.
- **Componentes**: Automation Manager, Workflow Engine, Workflow Builder, Workflow Validator, Workflow Versioning, Workflow Library.
- **Dependências**: AI Core (Phase 4) e os cinco Business Hubs (Phase 5) já aprovados — `AI_CORE_INTEGRATION_FINAL_APPROVAL.md`, `PHASE_5_FINAL_VALIDATION.md`. Nenhuma dependência de outra Sprint desta Phase — é o primeiro grupo, correspondente à prioridade de curto prazo já fixada em `AUTOMATION_ENGINE.md`, Capítulo 20 ("Automation Manager, o Workflow Engine... operando de ponta a ponta").
- **Critérios de entrada**: `AUTOMATION_ENGINE.md` permanece Official e sem pendência de nomenclatura; `PHASE_6_AUTOMATION_ENGINE_ARCHITECTURE_DEFINITION.md` aprovada.
- **Critérios de saída**: ver Seção 7 (Definition of Done), aplicada a esta Sprint.
- **Riscos**: nenhum específico além dos já registrados em `PHASE_6_READINESS_ASSESSMENT.md`, Seção 4.
- **Estimativa**: Grande — primeiro grupo, estabelece o padrão estrutural de referência para os quatro seguintes.
- **Ordem obrigatória**: 1.

### AUTO-02 — Sprint 6.2: Trigger e Condition

- **Objetivo**: tornar operante a capacidade de iniciar e de avaliar um Workflow — os oito tipos de Trigger e o modelo completo de Condition já fixados em `AUTOMATION_ENGINE.md`, Capítulos 9 e 10.
- **Componentes**: Trigger Manager, Scheduler, Condition Engine.
- **Dependências**: AUTO-01 concluída, por ordem de governança — o Trigger Manager notifica o Workflow Engine já operante; consumo de Evento público dos cinco Business Hubs, sempre por identificador opaco, conforme `PHASE_6_AUTOMATION_ENGINE_ARCHITECTURE_DEFINITION.md`, Seção 6.
- **Critérios de entrada**: AUTO-01 já em Definition of Done.
- **Critérios de saída**: ver Seção 7.
- **Riscos**: Scheduler (Trigger de Tempo) introduz a única dependência temporal do grupo — mitigada por permanecer, nesta etapa, puramente um modelo arquitetural, sem mecanismo de agendamento real (`Não criar Schedulers`, restrição já herdada da Sprint de definição arquitetural).
- **Estimativa**: Média.
- **Ordem obrigatória**: 2.

### AUTO-03 — Sprint 6.3: Action e Execution

- **Objetivo**: tornar operante a capacidade de executar a etapa concreta de um Workflow e de preservar seu estado de progresso — Action, Execution, Retry, conforme `AUTOMATION_ENGINE.md`, Capítulos 5, 7 e 11.
- **Componentes**: Action Engine, Execution Engine, Execution History, Queue Manager, Retry Manager.
- **Dependências**: AUTO-01 e AUTO-02 concluídas — o Action Engine só executa uma etapa já aprovada pelo Condition Engine (AUTO-02); integração declarativa com AI Core (Action Executar IA, contrato externo apenas) e com Business Hubs (Command por identificador opaco), conforme `PHASE_6_AUTOMATION_ENGINE_ARCHITECTURE_DEFINITION.md`, Seções 7 e 8.
- **Critérios de entrada**: AUTO-01 e AUTO-02 já em Definition of Done.
- **Critérios de saída**: ver Seção 7.
- **Riscos**: risco mais sensível do backlog — a fronteira "Executar IA consome apenas o contrato externo do AI Hub, nunca os onze componentes internos" precisa de verificação arquitetural rigorosa nesta Sprint, mesmo padrão já exigido de cada Business Hub na Phase 5.
- **Estimativa**: Grande — núcleo funcional do Automation Engine.
- **Ordem obrigatória**: 3.

### AUTO-04 — Sprint 6.4: Governança e Aprovação

- **Objetivo**: tornar operante o checkpoint humano e a trilha de auditoria — Approval Engine, Notification Engine, Template Engine, Audit Engine, conforme `AUTOMATION_ENGINE.md`, Capítulo 7, e o princípio Human Approval When Needed (Capítulo 5).
- **Componentes**: Approval Engine, Notification Engine, Template Engine, Audit Engine.
- **Dependências**: AUTO-03 concluída — o Approval Engine pausa uma execução já em andamento no Execution Engine; integração declarativa com Identity Hub (autorização), Communication Hub e Branding Hub (Notification/Template), todas por identificador opaco.
- **Critérios de entrada**: AUTO-03 já em Definition of Done.
- **Critérios de saída**: ver Seção 7.
- **Riscos**: nenhum específico além dos já registrados.
- **Estimativa**: Média.
- **Ordem obrigatória**: 4.

### AUTO-05 — Sprint 6.5: Integração e Suporte Avançado

- **Objetivo**: tornar operante a integração com sistema externo e as capacidades de suporte avançado — Preview, Simulação, Reversão, e observabilidade agregada, conforme `AUTOMATION_ENGINE.md`, Capítulos 7, 17 e 18, correspondente à prioridade de médio e longo prazo já fixada no Capítulo 20.
- **Componentes**: Integration Connector, Metrics Engine, Automation Analytics, Automation Preview, Simulation Engine, Rollback Manager, Dead Letter Queue.
- **Dependências**: AUTO-01 a AUTO-04 concluídas — Automation Preview e Simulation Engine exigem que todo o pipeline de Trigger→Condition→Action já esteja operante para simular seu comportamento; Rollback Manager depende do Approval Engine (AUTO-04) para o cenário de aprovação revogada já descrito em `AUTOMATION_ENGINE.md`, Capítulo 7.
- **Critérios de entrada**: AUTO-01 a AUTO-04 já em Definition of Done.
- **Critérios de saída**: ver Seção 7.
- **Riscos**: Automation Analytics consumido pelo Analytics Hub (Phase 5) — mesma natureza de dependência de conteúdo já registrada para o próprio Analytics Hub na Phase 5 (validação de ponta a ponta depende de volume real de execução acumulado).
- **Estimativa**: Grande — último grupo, maior número de componentes.
- **Ordem obrigatória**: 5 (último).

---

## 3. Dependências entre Componentes

Mesma distinção já aplicada desde `INFRASTRUCTURE_ARCHITECTURE_DEFINITION.md` e reaplicada em toda Fase desta plataforma — sequenciamento de governança nunca deve ser confundido com dependência estrutural real:

```
AUTO-01 (Orquestração) → AUTO-02 (Trigger/Condition) → AUTO-03 (Action/Execution)
                                                              │
                                                              ▼
                                                    AUTO-04 (Governança)
                                                              │
                                                              ▼
                                              AUTO-05 (Integração/Suporte)
```

Diferente da Phase 5 — onde os cinco Business Hubs eram estruturalmente independentes entre si, apenas sequenciados por governança —, o Automation Engine é um único domínio coeso: a dependência entre AUTO-01 e AUTO-05 é, em grande parte, **real**, não apenas de governança, porque cada Sprint constrói sobre o componente já operante da Sprint anterior (o Condition Engine avalia um Workflow já resolvido pelo Workflow Engine; o Action Engine executa uma etapa já aprovada pelo Condition Engine). A única dependência puramente estrutural externa a esta Phase é o consumo de Evento e de Command dos cinco Business Hubs (Phase 5) e do contrato externo do AI Hub (Phase 4), ambos já aprovados.

---

## 4. Critérios de Entrada Gerais (Definition of Ready por Sprint)

Mesmos quatro critérios já fixados em `GATE_G2_IMPLEMENTATION_ROADMAP.md`, Seção 8, aplicados a cada uma das cinco Sprints, além da dependência específica já listada por item na Seção 2:

- Toda dependência declarada nesta Seção já está concluída e validada.
- A arquitetura correspondente ao escopo da Sprint já está aprovada — `AUTOMATION_ENGINE.md` (Official) e `PHASE_6_AUTOMATION_ENGINE_ARCHITECTURE_DEFINITION.md`.
- A documentação relevante já está sincronizada, sem referência quebrada ou pendência de nomenclatura conhecida.
- Todo Evento, Command, ou contrato de AI Hub relevante ao escopo já está formalmente catalogado, nunca inferido durante a própria Sprint.

---

## 5. Critérios de Aprovação

Todo item deste backlog só é aprovado quando:

- Demonstra conformidade integral com o componente correspondente já descrito em `AUTOMATION_ENGINE.md`, Capítulo 7 — nenhuma responsabilidade redefinida, nenhum componente novo introduzido.
- Não introduz nenhuma dependência proibida já listada em `PHASE_6_AUTOMATION_ENGINE_ARCHITECTURE_DEFINITION.md`, Seção 15 (import de componente interno do AI Core, import de pacote de Business Hub, regra de negócio de domínio, chamada síncrona direta, delegação de controle a Agente autônomo, tecnologia concreta).
- Preserva a Direção das Dependências já fixada naquele mesmo documento, Seção 14.
- Passa pelo mesmo fluxo de Implementation Governance já fixado em `GATE_G2_IMPLEMENTATION_ROADMAP.md`, Seção 10.

---

## 6. Estratégia de Auditoria

Mesma metodologia já aplicada em `SPRINT_04_ARCHITECTURAL_AUDIT.md` e em cada `SPRINT_5_X_..._IMPLEMENTATION.md`, reaplicada a cada Sprint desta Phase:

- **Auditoria de acoplamento**: inspeção direta de toda declaração `import` do código produzido, confirmando ausência de referência a componente interno do AI Core (`@abp/ai`) e a qualquer pacote de Business Hub (`@abp/crm-hub`, `@abp/communication-hub`, `@abp/finance-hub`, `@abp/analytics-hub`, `@abp/growth-hub`).
- **Auditoria de fronteira Automation ↔ AI**: confirmação de que toda invocação de inteligência passa exclusivamente pela Action Executar IA, e de que o resultado é tratado como dado estruturado, nunca reinterpretado por lógica própria (`AUTOMATION_ENGINE.md`, Capítulo 12).
- **Auditoria de fronteira Automation ↔ Business Hubs**: confirmação de que nenhuma regra de negócio de domínio foi absorvida por um Workflow, e de que todo Command invocado permanece por identificador opaco.
- **Auditoria de Human Oversight**: confirmação de que toda Action classificada como de alto impacto passa pelo Approval Engine antes de execução, sem exceção (ADR-005).
- **Auditoria documental**: confirmação de que nenhum documento já Official ou Frozen foi modificado, e de que a Sprint não avança além do escopo já aprovado por este backlog.

Cada Sprint produz seu próprio conjunto de documentos de auditoria — Architectural Audit, Validation Report, Readiness Assessment, Final Approval —, mesmo padrão de encerramento já usado em `SPRINT_04_FINAL_APPROVAL.md` e em cada `SPRINT_5_X_..._IMPLEMENTATION.md`.

---

## 7. Marcos de Validação e Definition of Done

Definition of Done, aplicado individualmente a cada uma das cinco Sprints, mesmos cinco critérios já fixados em `GATE_G2_IMPLEMENTATION_ROADMAP.md`, Seção 9:

- O build correspondente aos componentes da Sprint é aprovado.
- Os testes correspondentes são aprovados.
- A documentação é atualizada para refletir o que foi efetivamente construído, nunca deixada divergente do código.
- A revisão já exigida pelo fluxo de Implementation Governance (Seção 5 acima) é concluída.
- A arquitetura já aprovada — `AUTOMATION_ENGINE.md`, `PHASE_6_AUTOMATION_ENGINE_ARCHITECTURE_DEFINITION.md` — é preservada integralmente.

**Marco adicional — Phase 6 Final Validation**: ao final da quinta e última Sprint (AUTO-05), uma auditoria consolidada dos vinte e cinco componentes, mesmo padrão de encerramento já aplicado em `SPRINT_04_FINAL_APPROVAL.md`, em `AI_CORE_INTEGRATION_FINAL_APPROVAL.md`, e em `PHASE_5_FINAL_VALIDATION.md`, verificando especificamente:

- Ausência de import de `@abp/ai` (exceto contrato externo) e de qualquer pacote de Business Hub, em todo o código do Automation Engine.
- Preservação da fronteira Human Approval When Needed em toda Action de alto impacto.
- Preservação da direção de dependência Automation → AI, nunca o inverso, já fixada em `GATE_G2_IMPLEMENTATION_ROADMAP.md`.
- Conformidade com os vinte e cinco componentes já catalogados em `AUTOMATION_ENGINE.md`, Capítulo 7 — nenhum a mais, nenhum a menos.

Esta Phase 6 Final Validation autoriza, futuramente, a Readiness Assessment da Phase 7 — Dashboard, sujeita a seu próprio ciclo de avaliação.

---

## 8. Riscos Previstos (Nível de Phase)

| Risco | Severidade | Mitigação |
|---|---|---|
| Fronteira Automation ↔ AI Core sendo violada por conveniência de implementação (ex.: um Workflow importando `@abp/ai` diretamente para evitar a Action Executar IA) | Baixa, mitigada | Auditoria de acoplamento obrigatória em toda Sprint (Seção 6); mesmo padrão já usado com sucesso em cinco Sprints de Business Hub sem nenhuma violação registrada |
| Automation Engine absorvendo regra de negócio de um Business Hub dentro de um Workflow, por conveniência de não coordenar com o Hub proprietário | Baixa, mitigada | Auditoria de fronteira Automation ↔ Business Hubs obrigatória; princípio já fixado em `AUTOMATION_ENGINE.md`, Capítulo 3 ("Automação nunca pertence aos módulos") |
| Complexidade de composição entre AUTO-01 e AUTO-05 sendo subestimada, dado que — diferente da Phase 5 — as cinco Sprints desta Phase têm dependência real entre si, não apenas de governança | Baixa | Já registrado explicitamente na Seção 3; ordem obrigatória de implementação (Seção 1) reflete essa dependência real, não apenas preferência de maturidade documental |
| `GROWTH_HUB.md` permanecer Draft (pendência herdada da Phase 5) no momento em que uma Sprint desta Phase precisar de Evento do Growth Hub como Trigger | Baixa, não bloqueante | Já registrado em `PHASE_5_FINAL_VALIDATION.md` e em `PHASE_6_READINESS_ASSESSMENT.md`; não impede nenhuma das cinco Sprints, já que nenhuma delas depende exclusivamente do Growth Hub |

---

## 9. Confirmação Final

Nenhum código foi criado. Nenhum contrato TypeScript foi criado. Nenhuma tecnologia foi definida. Nenhum Runtime, fila, persistência, Dashboard, ou AI Agent foi criado. Nenhuma Sprint foi iniciada por este documento. `PHASE_6_AUTOMATION_ENGINE_ARCHITECTURE_DEFINITION.md`, `PHASE_6_READINESS_ASSESSMENT.md`, `AUTOMATION_ENGINE.md`, `AI_CORE_INTEGRATION_FINAL_APPROVAL.md`, e `PHASE_5_FINAL_VALIDATION.md` permanecem inalterados, exceto pela correção de contagem já registrada e transparente na Seção 0.

Este documento encerra o planejamento da Phase 6 e serve como base para o início da Sprint 6.1 — Orquestração Central, sujeita a sua própria abertura formal futura.

---

## Approval

| Campo | Valor |
|---|---|
| Status | PHASE 6 IMPLEMENTATION BACKLOG APPROVED |
| Version | 1.0 |
| Author | Claude |
