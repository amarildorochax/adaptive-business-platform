# INT-07 — Integração Agent Framework ↔ Skill Runtime

**Adaptive Business Platform · Documento Técnico Oficial**

Status: Draft
Category: Implementation Documentation
Governed by: `DOCUMENTATION_CONSTITUTION.md` (Official · Version 1.1)

*Este documento registra a implementação do item INT-07 de `AI_CORE_INTEGRATION_IMPLEMENTATION_BACKLOG.md`. Nenhum outro item do backlog é iniciado, alterado, ou antecipado por este documento.*

---

## 1. Objetivo

Implementar a integração declarativa entre o Agent Framework (Component 18) e o Skill Runtime (Component 21) durante a preparação da execução de uma subtarefa, incluindo a modelagem da associação entre Agente e Skills e a validação de pré-condições para sua utilização, sem redefinir nenhum contrato público já existente, e sem implementar execução, carregamento, ou plugin de Skill.

---

## 2. Base Utilizada

| Fonte | Uso |
|---|---|
| `AI_CORE_ARCHITECTURE_DEFINITION.md`, Seção 7.4 e 7.7 | Limites e dependências declaradas de Agent Framework e Skill Runtime |
| `AI_CORE_INTEGRATION_ARCHITECTURE.md`, Seção 6, 8, 9 | Etapa Execution — Agent Framework → Skill Runtime; dependências permitidas e proibidas |
| `AGENT_FRAMEWORK.md`, Capítulo 5 e 13 | Agent Contract (`skillInvocationDeclared`); descoberta e invocação de Skill pelo Agente |
| `docs/implementation/components/SKILL_RUNTIME_SPECIFICATION.md` | Especificação já aprovada do Component 21 — `SkillDefinition`, `SkillCapability`, `SkillRequirement`, `SkillState` |
| `SPRINT_04_FINAL_APPROVAL.md` | Confirmação de que os onze componentes permanecem aprovados e sem alteração |
| `AI_CORE_INTEGRATION_IMPLEMENTATION_BACKLOG.md`, item INT-07 | Objetivo, critérios de aceitação, e ordem obrigatória já fixados |

---

## 3. Achado Prévio — Nenhum Artefato de Skill Runtime Já Referencia `agentId`

Diferente de INT-05 (`AgentSelection`) e INT-06 (`ReasoningCycleState`), a inspeção de `SkillDefinition.ts`, `SkillState.ts`, `SkillRequirement.ts` e `SkillCapability.ts` confirma que nenhum deles referencia `agentId` — todos são identificados exclusivamente por `skillId` ou por `capabilityIds`. Não existe, portanto, nenhum vínculo pré-existente entre Agent Framework e Skill Runtime a ser reconhecido; ambos os itens do escopo desta Sprint (associação e validação de pré-condição) exigem artefato novo.

---

## 4. Decisão de Design

Dois artefatos distintos são necessários, mesma distinção conceitual já aplicada nas Sprints anteriores entre "vínculo" (INT-01 a INT-04, análogo a `CapabilitySelection`/`AgentSelection`) e "validação de pré-condição" (INT-05, INT-06, análogo a `ContextValidationResult`/`MemoryValidation`):

- **Associação**: um Agente pode utilizar mais de uma Skill na preparação de uma subtarefa — mesma pluralidade já modelada por `SkillCapability.capabilityIds` e por `CapabilitySelection.capabilityIds` — por isso `skillIds` é modelado como array, não como campo singular.
- **Validação de pré-condição**: `AGENT_FRAMEWORK.md`, Capítulo 5, já declara `skillInvocationDeclared` como o décimo terceiro elemento do Agent Contract — a mesma dimensão única e binária já usada em INT-06 para `reasoningInterfaceDeclared`, reaplicada aqui por analogia direta, sem inventar uma nova dimensão de qualidade.

Nenhum dos dois artefatos importa `AgentContract`, `SkillDefinition`, `SkillRequirement`, `SkillCapability`, ou qualquer outro tipo dos dois componentes — toda referência é por identificador opaco (`agentId`, `subtaskId`, `skillId`, `skillIds`) ou por valor booleano nomeado por analogia (`skillInvocationDeclared`), nunca por import de tipo.

---

## 5. Artefatos Criados

### `AgentSkillAssociation` (novo — integração Agent Framework (18) ↔ Skill Runtime (21))

```ts
export interface AgentSkillAssociation {
  readonly agentId: string;
  readonly subtaskId: string;
  readonly skillIds: readonly string[];
  readonly associatedAt: Date;
}
```

| Campo | Papel |
|---|---|
| `agentId` | Agente que se associa às Skills |
| `subtaskId` | Subtarefa cuja preparação de execução motivou a associação |
| `skillIds` | Skills associadas — identificadores opacos, plural, sem redefinir `SkillDefinition` (Component 21) |
| `associatedAt` | Momento da associação |

### `AgentSkillPrecondition` (novo — integração Agent Framework (18) ↔ Skill Runtime (21))

```ts
export interface AgentSkillPrecondition {
  readonly agentId: string;
  readonly skillId: string;
  readonly skillInvocationDeclared: boolean;
  readonly validatedAt: Date;
}
```

| Campo | Papel |
|---|---|
| `agentId` | Agente que pretende utilizar a Skill |
| `skillId` | Skill cuja utilização está sendo validada — identificador opaco, sem redefinir `SkillDefinition` (Component 21) |
| `skillInvocationDeclared` | Se o Agente declara contrato de descoberta e invocação de Skill — mesmo nome de campo de `AgentContract.skillInvocationDeclared`, reutilizado apenas como valor, nunca como import de tipo |
| `validatedAt` | Momento em que a verificação foi concluída |

Deliberadamente **não incluído** em ambos: qualquer campo que redefina `SkillRequirement.permissionScope`, `SkillState.stage`, ou `AgentContract`; qualquer lógica de carregamento, descoberta, ou execução de Skill; qualquer mecanismo de plugin.

---

## 6. Estrutura Concreta

| Elemento | Decisão |
|---|---|
| Arquivos | `platform/packages/ai/src/AgentSkillAssociation.ts`, `platform/packages/ai/src/AgentSkillPrecondition.ts` |
| Pacote | `@abp/ai` — mesmo pacote de todos os onze componentes, nenhum pacote novo criado |
| Import | Nenhum em nenhum dos dois arquivos — nem de `AgentContract.ts`, `SkillDefinition.ts`, `SkillCapability.ts`, `SkillRequirement.ts`, `SkillState.ts`, nem de nenhum outro componente |
| Export | Um único tipo por arquivo, seguindo o mesmo padrão declarativo já usado por `AgentDelegationValidation.ts` (INT-05) e `AgentReasoningPrecondition.ts` (INT-06) |

---

## 7. Validação Arquitetural

| Verificação | Resultado |
|---|---|
| `AgentContract.ts`, `SkillDefinition.ts`, `SkillState.ts`, `SkillRequirement.ts`, `SkillCapability.ts`, ou qualquer outro artefato já aprovado, modificado? | Não |
| Import de tipo entre Agent Framework (18) e Skill Runtime (21)? | Não — vínculo exclusivamente por `agentId`/`subtaskId`/`skillId`/`skillIds: string` opacos |
| Import de `@abp/infrastructure`, `@abp/platform-services`, `@abp/core`, ou `@abp/shared`? | Não |
| Dependência estrutural nova entre Agent Framework e Skill Runtime? | Não — apenas identificador opaco, mesmo padrão de INT-01 a INT-06 |
| Novo componente introduzido além dos onze já aprovados? | Não |
| Execução, carregamento, ou plugin de Skill implementado? | Não — artefatos puramente declarativos, sem função ou lógica de runtime |
| IA concreta implementada? | Não |
| Isolamento entre os componentes preservado? | Sim — nenhuma referência de código em nenhum sentido entre os arquivos de Agent Framework e de Skill Runtime; os novos artefatos apenas referenciam ambos por identificador |
| Outro item do backlog (INT-01 a INT-06 reabertos, INT-08 a INT-10) iniciado? | Não |

---

## 8. Critérios de Aceitação (herdados de INT-07)

✓ Comunicação exclusivamente por identificadores opacos e contratos declarativos.
✓ Nenhuma dependência estrutural criada entre Agent Framework e Skill Runtime.
✓ Nenhum artefato já aprovado modificado.
✓ Modelagem da associação entre Agente e Skills concluída (`AgentSkillAssociation`).
✓ Validação de pré-condições para utilização de uma Skill pelo Agente concluída (`AgentSkillPrecondition`).

---

## Approval

| Campo | Valor |
|---|---|
| Status | INT-07 IMPLEMENTED |
| Version | 1.0 |
| Author | Claude |
