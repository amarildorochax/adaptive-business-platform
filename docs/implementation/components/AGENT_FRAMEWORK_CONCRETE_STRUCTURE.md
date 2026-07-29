# Component 18 — Agent Framework — Concrete Structure Proposal

**Adaptive Business Platform · Documento Técnico Oficial**

Status: Proposed
Category: Implementation Documentation
Governed by: `DOCUMENTATION_CONSTITUTION.md` (Official · Version 1.1)

*Este documento materializa documentalmente a estrutura concreta dos três artefatos de Agent Framework. Nenhuma tecnologia nova — mesma convenção já em vigor (TypeScript, pnpm), no pacote `platform/packages/ai/` já criado pelos Components 15–17.*

---

## Agent Component

`AgentComponent` (union de 7 literais): `"Identity"`, `"Reasoning Engine"`, `"Planning Component"`, `"Capability Consumer"`, `"Skill Invocation"`, `"Tool Adapter"`, `"Structured Response"` — Capítulo 6.

## Agent Lifecycle State

`AgentLifecycleStage` (union de 9 literais): `"Criação"`, `"Registro"`, `"Inicialização"`, `"Execução"`, `"Pausa"`, `"Retomada"`, `"Atualização"`, `"Desativação"`, `"Aposentadoria"` — Capítulo 7.

| Propriedade | Descrição | Fonte |
|---|---|---|
| `agentId` | Agente ao qual este estado se refere | Capítulo 7 |
| `stage` | Estágio atual (`AgentLifecycleStage`) | Capítulo 7 |
| `enteredAt` | Momento em que o Agente entrou neste estágio | Capítulo 7 |

## Agent Contract

| Propriedade | Descrição | Fonte |
|---|---|---|
| `agentId` | Identificador único do Agente (Identity) | Capítulo 5 |
| `name` | Nome único e descrição formal (Identity) | Capítulo 5 |
| `mission` | Propósito específico do Agente (Mission) | Capítulo 5 |
| `responsibilities` | Fronteiras exatas do que o Agente processa (Responsibilities) | Capítulo 5 |
| `capabilityIds` | Capabilities que o Agente está autorizado a apoiar (Capabilities) | Capítulo 5 |
| `permissionScope` | Escopo de acesso a dado de negócio, herdado do Usuário (Permissions) | Capítulo 5 |
| `executionPolicies` | Políticas de execução aplicáveis às ações propostas (Execution Policies) | Capítulo 5 |
| `memoryAccessScopes` | Categorias de memória que o Agente pode consultar/persistir (Memory Access) | Capítulo 5 |
| `contextAccessSources` | Fontes de contexto que o Agente pode consumir (Context Access) | Capítulo 5 |
| `planningInterfaceDeclared` | Se o Agente declara Planning Interface (Component 20, referência opaca) | Capítulo 5 |
| `reasoningInterfaceDeclared` | Se o Agente declara Reasoning Interface (Component 19, referência opaca) | Capítulo 5 |
| `skillInvocationDeclared` | Se o Agente declara Skill Invocation (Component 21, referência opaca) | Capítulo 5 |
| `toolAccessScope` | Escopo de recurso externo acessível por Skills invocadas (Component 22, referência opaca) | Capítulo 5 |
| `observabilitySignals` | Sinais que o Agente produz obrigatoriamente (Observability) | Capítulo 5 |
| `responseContractFormat` | Formato estrutural de retorno ao Orchestrator (Response Contract) | Capítulo 5 |
| `version` | Identificador de versão de comportamento (Version) | Capítulo 5 |
| `governanceReference` | Referência às regras de `AI_MANIFESTO.md` respeitadas (Governance) | Capítulo 5 |

**Nota**: o décimo sétimo elemento do Agent Contract, Lifecycle, é satisfeito pelo artefato `AgentLifecycleState` (acima), referenciado pelo mesmo `agentId`, nunca duplicado como campo dentro de `AgentContract`.

---

## Convenções

**Nomenclatura**: `AgentComponent`, `AgentLifecycleState` (com `AgentLifecycleStage`), `AgentContract`.

**Localização**: `platform/packages/ai/src/AgentComponent.ts`, `AgentLifecycleState.ts`, `AgentContract.ts` — mesmo pacote `@abp/ai` já criado para Context, Memory e Orchestrator (Components 15–17).

**Versionamento**: mesma disciplina de Backward Compatibility já aplicada aos demais artefatos.

**Compatibilidade**: nenhum vocabulário novo além do já citado em `AGENT_FRAMEWORK.md`; nenhuma duplicação de `Event`, `PlatformError`, ou de qualquer artefato já implementado em Context, Memory, ou Orchestrator; nenhuma importação cruzada de tipo — toda referência é feita por identificador ou flag opaca.

---

## Validação

✓ Compatível com `AGENT_FRAMEWORK_SPECIFICATION.md`, `AGENT_FRAMEWORK.md`, `platform/PACKAGE_STRUCTURE_MANIFEST.md`.
✓ Nenhuma tecnologia nova. ✓ Nenhuma expansão de escopo. ✓ Nenhuma duplicação de artefato já existente.

---

## Traceability

| Seção | Fonte |
|---|---|
| Todos os artefatos | `COMPONENT_18_AGENT_FRAMEWORK_ARTIFACT_IDENTIFICATION.md`; `AGENT_FRAMEWORK.md` |

---

## Approval

| Campo | Valor |
|---|---|
| Status | STRUCTURE APPROVED |
| Version | 1.0 |
| Author | Claude |
