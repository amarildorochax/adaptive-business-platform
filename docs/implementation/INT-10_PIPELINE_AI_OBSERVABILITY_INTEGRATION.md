# INT-10 — Integração Transversal Pipeline de Decisão ↔ AI Observability

**Adaptive Business Platform · Documento Técnico Oficial**

Status: Draft
Category: Implementation Documentation
Governed by: `DOCUMENTATION_CONSTITUTION.md` (Official · Version 1.1)

*Este documento registra a implementação do item INT-10 de `AI_CORE_INTEGRATION_IMPLEMENTATION_BACKLOG.md` — o último item do backlog. Nenhum outro trabalho é iniciado após este documento.*

---

## 1. Objetivo

Implementar a integração declarativa e transversal entre o Pipeline de Decisão do AI Core (Component 17) e o AI Observability (Component 25), representando exclusivamente a capacidade de correlacionar etapas do Pipeline a sinais observáveis e de validar a presença das informações mínimas exigidas, sem redefinir nenhum contrato público já existente, e sem implementar qualquer mecanismo real de coleta, logging, tracing, dashboard, alerta, ou monitoramento.

---

## 2. Base Utilizada

| Fonte | Uso |
|---|---|
| `AI_CORE_ARCHITECTURE_DEFINITION.md`, Seção 7.3 e 7.11 | Limites e dependências declaradas de Orchestrator e AI Observability |
| `AI_CORE_INTEGRATION_ARCHITECTURE.md`, Seção 6 e 9.3 | "Todo o fluxo acima produz sinal consultável através de AI Observability (25) em cada etapa relevante, sem que nenhuma etapa dependa da observação para prosseguir" |
| `docs/implementation/components/AI_OBSERVABILITY_SPECIFICATION.md` | Especificação já aprovada do Component 25 — `ObservabilityContext`, `ObservabilityEvent`, `ObservabilityMetric` |
| `AI_ORCHESTRATOR.md`, Capítulo 6 | As doze etapas do Pipeline de Decisão |
| `SPRINT_04_FINAL_APPROVAL.md` | Confirmação de que os onze componentes permanecem aprovados e sem alteração |
| `AI_CORE_INTEGRATION_IMPLEMENTATION_BACKLOG.md`, item INT-10 | Objetivo, critérios de aceitação, e ordem obrigatória já fixados — último item, dependente de INT-01 a INT-09 |

---

## 3. Achado Prévio

`ObservabilityContext` (Component 25) já é declarativamente genérico — `correlationId`, `traceId?`, `spanId?`, `componentType` — sem qualquer campo específico de Pipeline. Nenhum artefato já aprovado, de nenhum dos onze componentes, vincula uma etapa do Pipeline de Decisão (`DecisionPipelineStage`) a um sinal de observabilidade. Diferente de INT-05/INT-06, esta é uma lacuna real e nova, coerente com a natureza transversal deste item — ele não se conecta a apenas um outro componente, mas à cadeia inteira já formada pelos nove itens anteriores.

---

## 4. Decisão de Design

Dois artefatos, mesma distinção de "vínculo" e "validação" já aplicada desde INT-05:

- **Correlação**: `PipelineObservabilityCorrelation` vincula `requestId` (Orchestrator) e `stage` (a etapa do Pipeline) ao `correlationId` já definido por `ObservabilityContext`. A etapa é representada por `stage: string` — nunca pelo tipo `DecisionPipelineStage` — preservando a mesma disciplina de identificador opaco.

- **Validação de informações mínimas**: `ObservabilityContext` declara apenas dois campos não opcionais — `correlationId` e `componentType` (`traceId` e `spanId` são opcionais). `PipelineObservabilityValidation` verifica exatamente esses dois, nenhum a mais, fundamentado diretamente na própria estrutura já aprovada de `ObservabilityContext`, sem inventar critério adicional.

Nenhum dos dois artefatos importa `ObservabilityContext`, `ObservabilityEvent`, `DecisionPipelineState`, ou qualquer outro tipo de qualquer um dos onze componentes — toda referência é por identificador opaco ou por valor booleano nomeado por correspondência estrutural direta aos dois campos obrigatórios já existentes.

Este item preserva integralmente o princípio já fixado em `AI_CORE_INTEGRATION_ARCHITECTURE.md`: a emissão/correlação de sinal de observabilidade nunca é condição para o prosseguimento de nenhuma etapa do Pipeline — os dois artefatos aqui criados são puramente declarativos e não implicam nenhuma dependência de execução.

---

## 5. Artefatos Criados

### `PipelineObservabilityCorrelation` (novo — integração Orchestrator (17) ↔ AI Observability (25))

```ts
export interface PipelineObservabilityCorrelation {
  readonly requestId: string;
  readonly stage: string;
  readonly correlationId: string;
  readonly correlatedAt: Date;
}
```

### `PipelineObservabilityValidation` (novo — integração Orchestrator (17) ↔ AI Observability (25))

```ts
export interface PipelineObservabilityValidation {
  readonly requestId: string;
  readonly stage: string;
  readonly correlationIdPresent: boolean;
  readonly componentTypePresent: boolean;
  readonly validatedAt: Date;
}
```

Deliberadamente **não incluído** em ambos: qualquer campo que redefina `ObservabilityContext`, `ObservabilityEvent`, `ObservabilityMetric`, ou `DecisionPipelineStage`; qualquer mecanismo de coleta de métrica, logging, tracing distribuído, dashboard, alerta, OpenTelemetry, Prometheus, ou monitoramento em tempo real.

---

## 6. Estrutura Concreta

| Elemento | Decisão |
|---|---|
| Arquivos | `platform/packages/ai/src/PipelineObservabilityCorrelation.ts`, `platform/packages/ai/src/PipelineObservabilityValidation.ts` |
| Pacote | `@abp/ai` — mesmo pacote de todos os onze componentes, nenhum pacote novo criado |
| Import | Nenhum em nenhum dos dois arquivos — nem de `ObservabilityContext.ts`, `ObservabilityEvent.ts`, `DecisionPipelineState.ts`, nem de nenhum outro componente |
| Export | Um único tipo por arquivo, seguindo o mesmo padrão declarativo já usado desde INT-01 |

---

## 7. Validação Arquitetural

| Verificação | Resultado |
|---|---|
| `ObservabilityContext.ts`, `ObservabilityEvent.ts`, `ObservabilityMetric.ts`, `DecisionPipelineState.ts`, ou qualquer outro artefato já aprovado, modificado? | Não |
| Import de tipo entre AI Observability (25) e qualquer outro componente? | Não — vínculo exclusivamente por `requestId`/`stage`/`correlationId: string` opacos |
| Dependência estrutural nova entre AI Observability e qualquer outro componente? | Não |
| Import de `@abp/infrastructure`, `@abp/platform-services`, `@abp/core`, ou `@abp/shared`? | Não |
| Novo componente introduzido além dos onze já aprovados? | Não |
| Coleta de métrica, logging, tracing distribuído, dashboard, alerta, OpenTelemetry, ou Prometheus implementado? | Não — artefatos puramente declarativos, sem função ou lógica de runtime |
| Monitoramento em tempo real ou IA concreta implementada? | Não |
| Isolamento entre AI Observability e os demais componentes preservado? | Sim — nenhuma referência de código em nenhum sentido; os novos artefatos apenas referenciam por identificador |
| Algum outro item do backlog (INT-01 a INT-09 reabertos) iniciado? | Não |
| Algum trabalho além do backlog (Business Hubs, Automation Engine, dashboards) iniciado? | Não |

---

## 8. Critérios de Aceitação (herdados de INT-10)

✓ Comunicação exclusivamente por identificadores opacos e contratos declarativos.
✓ Nenhuma dependência estrutural criada entre AI Observability e qualquer outro componente.
✓ Nenhum artefato já aprovado de AI Observability modificado.
✓ Modelagem da correlação entre etapas do Pipeline e eventos de observabilidade concluída (`PipelineObservabilityCorrelation`).
✓ Validação da presença das informações mínimas de observabilidade concluída (`PipelineObservabilityValidation`), fundamentada exatamente nos dois campos não opcionais já existentes em `ObservabilityContext`.

---

## 9. Encerramento do AI Core Integration Implementation Backlog

Com a conclusão de INT-10, os dez itens de `AI_CORE_INTEGRATION_IMPLEMENTATION_BACKLOG.md` (INT-01 a INT-10) foram implementados individualmente, cada um em sua própria Sprint, cada um limitado estritamente ao seu próprio relacionamento arquitetural, sem nenhum item antecipando outro. `AI_CORE_INTEGRATION_IMPLEMENTATION_BACKLOG.md` permanece intencionalmente não modificado por este documento — sua atualização de status, assim como já ocorreu com `SPRINT_04_IMPLEMENTATION_BACKLOG.md` em `SPRINT_04_FINAL_APPROVAL.md`, é uma ação de governança distinta, fora do escopo de qualquer item individual de implementação. Nenhum trabalho além dos dez itens do backlog — Business Hubs, Automation Engine, dashboards, ou qualquer nova Sprint — foi iniciado.

---

## Approval

| Campo | Valor |
|---|---|
| Status | INT-10 IMPLEMENTED |
| Version | 1.0 |
| Author | Claude |
