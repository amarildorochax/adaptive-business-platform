# INT-08 — Integração Skill Runtime ↔ Tool Runtime

**Adaptive Business Platform · Documento Técnico Oficial**

Status: Draft
Category: Implementation Documentation
Governed by: `DOCUMENTATION_CONSTITUTION.md` (Official · Version 1.1)

*Este documento registra a implementação do item INT-08 de `AI_CORE_INTEGRATION_IMPLEMENTATION_BACKLOG.md`. Nenhum outro item do backlog é iniciado, alterado, ou antecipado por este documento.*

---

## 1. Objetivo

Implementar a integração declarativa entre o Skill Runtime (Component 21) e o Tool Runtime (Component 22) durante a preparação da execução de uma Skill, incluindo a modelagem da associação entre Skills e Tools e a validação de pré-condições para sua utilização, sem redefinir nenhum contrato público já existente, e sem implementar execução, chamada externa, API, ou provedor de Tool.

---

## 2. Base Utilizada

| Fonte | Uso |
|---|---|
| `AI_CORE_ARCHITECTURE_DEFINITION.md`, Seção 7.7 e 7.8 | Limites e dependências declaradas de Skill Runtime e Tool Runtime |
| `AI_CORE_INTEGRATION_ARCHITECTURE.md`, Seção 6, 8, 9 | Etapa Execution — Skill Runtime → Tool Runtime; dependências permitidas e proibidas |
| `docs/implementation/components/SKILL_RUNTIME_SPECIFICATION.md` | Especificação já aprovada do Component 21 — `SkillDefinition`, `SkillCapability` |
| `docs/implementation/components/TOOL_RUNTIME_SPECIFICATION.md` | Especificação já aprovada do Component 22 — `ToolIdentity`, `ToolDefinition`, `ToolRequirement`, `ToolLifecycle` |
| `SPRINT_04_FINAL_APPROVAL.md` | Confirmação de que os onze componentes permanecem aprovados e sem alteração |
| `AI_CORE_INTEGRATION_IMPLEMENTATION_BACKLOG.md`, item INT-08 | Objetivo, critérios de aceitação, e ordem obrigatória já fixados |

---

## 3. Achado Prévio — Nenhum Artefato de Tool Runtime Já Referencia `skillId`

A inspeção de `ToolIdentity.ts`, `ToolDefinition.ts`, `ToolRequirement.ts`, `ToolCapability.ts` e `ToolLifecycle.ts` confirma que nenhum deles referencia `skillId` — todos são identificados exclusivamente por `toolId` ou por `capabilityIds`. Mesma situação já encontrada em INT-07 (Skill Runtime não referenciava `agentId`): nenhum vínculo pré-existente entre Skill Runtime e Tool Runtime a ser reconhecido; ambos os pontos do escopo exigem artefato novo.

---

## 4. Decisão de Design

Dois artefatos distintos, mesma distinção conceitual de "vínculo" e "validação de pré-condição" já aplicada desde INT-05:

- **Associação**: uma Skill pode utilizar mais de uma Ferramenta — mesma pluralidade já modelada por `SkillCapability.capabilityIds` e por `ToolCapability.capabilityIds` — modelada aqui como `SkillToolAssociation.toolIds`, forma direta de `SkillCapability` (Skill → Capabilities) reaplicada para Skill → Tools.

- **Validação de pré-condição**: diferente de INT-06 e INT-07, onde o Agent Contract já nomeava um único elemento binário (`reasoningInterfaceDeclared`, `skillInvocationDeclared`), o próprio item INT-08 de `AI_CORE_INTEGRATION_IMPLEMENTATION_BACKLOG.md` já nomeia explicitamente **duas** condições distintas como critério de aceitação: "nenhuma Tool acessada fora do `ToolLifecycleStage` 'Registered'" e "nenhum acesso além do `permissionScope` herdado". `SkillToolPrecondition` modela ambas como campos booleanos separados, fundamentado diretamente no texto já aprovado do backlog, sem inventar dimensão adicional além dessas duas.

Nenhum dos dois artefatos importa `SkillDefinition`, `SkillCapability`, `ToolIdentity`, `ToolDefinition`, `ToolRequirement`, `ToolLifecycle`, ou qualquer outro tipo dos dois componentes — toda referência é por identificador opaco (`skillId`, `toolId`, `toolIds`) ou por valor booleano nomeado por correspondência estrutural (`toolRegistered`, `permissionScopeRespected`), nunca por import de tipo.

---

## 5. Artefatos Criados

### `SkillToolAssociation` (novo — integração Skill Runtime (21) ↔ Tool Runtime (22))

```ts
export interface SkillToolAssociation {
  readonly skillId: string;
  readonly toolIds: readonly string[];
  readonly associatedAt: Date;
}
```

| Campo | Papel |
|---|---|
| `skillId` | Skill que se associa às Ferramentas |
| `toolIds` | Ferramentas associadas — identificadores opacos, plural, sem redefinir `ToolIdentity`/`ToolDefinition` (Component 22) |
| `associatedAt` | Momento da associação |

### `SkillToolPrecondition` (novo — integração Skill Runtime (21) ↔ Tool Runtime (22))

```ts
export interface SkillToolPrecondition {
  readonly skillId: string;
  readonly toolId: string;
  readonly toolRegistered: boolean;
  readonly permissionScopeRespected: boolean;
  readonly validatedAt: Date;
}
```

| Campo | Papel |
|---|---|
| `skillId` | Skill que pretende utilizar a Ferramenta |
| `toolId` | Ferramenta cuja utilização está sendo validada — identificador opaco, sem redefinir `ToolIdentity` (Component 22) |
| `toolRegistered` | Se a Ferramenta está no estágio "Registered" de seu ciclo de vida |
| `permissionScopeRespected` | Se o escopo de Permission herdado da solicitação original é respeitado |
| `validatedAt` | Momento em que a verificação foi concluída |

Deliberadamente **não incluído** em ambos: qualquer campo que redefina `ToolRequirement.permissionScope`, `ToolLifecycleStage`, ou `SkillDefinition`; qualquer lógica de chamada externa, API, provedor, ou execução real de Ferramenta.

---

## 6. Estrutura Concreta

| Elemento | Decisão |
|---|---|
| Arquivos | `platform/packages/ai/src/SkillToolAssociation.ts`, `platform/packages/ai/src/SkillToolPrecondition.ts` |
| Pacote | `@abp/ai` — mesmo pacote de todos os onze componentes, nenhum pacote novo criado |
| Import | Nenhum em nenhum dos dois arquivos — nem de `SkillDefinition.ts`, `SkillCapability.ts`, `ToolIdentity.ts`, `ToolDefinition.ts`, `ToolRequirement.ts`, `ToolLifecycle.ts`, nem de nenhum outro componente |
| Export | Um único tipo por arquivo, seguindo o mesmo padrão declarativo já usado por `AgentSkillAssociation.ts` e `AgentSkillPrecondition.ts` (INT-07) |

---

## 7. Validação Arquitetural

| Verificação | Resultado |
|---|---|
| `SkillDefinition.ts`, `SkillCapability.ts`, `ToolIdentity.ts`, `ToolDefinition.ts`, `ToolRequirement.ts`, `ToolLifecycle.ts`, ou qualquer outro artefato já aprovado, modificado? | Não |
| Import de tipo entre Skill Runtime (21) e Tool Runtime (22)? | Não — vínculo exclusivamente por `skillId`/`toolId`/`toolIds: string` opacos |
| Import de `@abp/infrastructure`, `@abp/platform-services`, `@abp/core`, ou `@abp/shared`? | Não |
| Dependência estrutural nova entre Skill Runtime e Tool Runtime? | Não — apenas identificador opaco, mesmo padrão de INT-01 a INT-07 |
| Novo componente introduzido além dos onze já aprovados? | Não |
| Execução de Tool, chamada externa, API, ou provedor implementado? | Não — artefatos puramente declarativos, sem função ou lógica de runtime |
| IA concreta implementada? | Não |
| Isolamento entre os componentes preservado? | Sim — nenhuma referência de código em nenhum sentido entre os arquivos de Skill Runtime e de Tool Runtime; os novos artefatos apenas referenciam ambos por identificador |
| Outro item do backlog (INT-01 a INT-07 reabertos, INT-09/INT-10) iniciado? | Não |

---

## 8. Critérios de Aceitação (herdados de INT-08)

✓ Comunicação exclusivamente por identificadores opacos e contratos declarativos.
✓ Nenhuma dependência estrutural criada entre Skill Runtime e Tool Runtime.
✓ Nenhum artefato já aprovado modificado.
✓ Modelagem da associação entre Skills e Tools concluída (`SkillToolAssociation`).
✓ Validação de pré-condições para utilização de uma Tool por uma Skill concluída (`SkillToolPrecondition`), cobrindo `ToolLifecycleStage "Registered"` e `permissionScope` herdado, exatamente como já nomeado em `AI_CORE_INTEGRATION_IMPLEMENTATION_BACKLOG.md`, item INT-08.

---

## Approval

| Campo | Valor |
|---|---|
| Status | INT-08 IMPLEMENTED |
| Version | 1.0 |
| Author | Claude |
