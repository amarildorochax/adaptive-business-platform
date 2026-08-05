# IMP-014 — AI Agents Core — Relatório de Migração

**Status:** Concluída. **Pacote:** `@abp/ai-agents` (`platform/packages/ai-agents`). **Padrão:** Extrair → Adaptar → Portar.

---

## 1. Nota de Posicionamento Documental

Fonte de verdade única: `docs/implementation/AI_AGENTS_ARCHITECTURE_DEFINITION.md` (Status: "AI AGENTS
ARCHITECTURE DEFINED"), com apoio de validação de `AI_AGENTS_READINESS_ASSESSMENT.md` ("READY WITH
OBSERVATIONS"), `AI_AGENTS_IMPLEMENTATION_BACKLOG.md` ("AI AGENTS IMPLEMENTATION BACKLOG APPROVED"),
`SPRINT_8_1_CORE_DELEGATION_IMPLEMENTATION.md`, `SPRINT_8_2_HUMAN_OVERSIGHT_IMPLEMENTATION.md`, e
`AI_AGENTS_FINAL_VALIDATION.md` ("APPROVED WITH OBSERVATIONS"). Nenhum conflito entre estes
documentos foi encontrado — nenhuma decisão desta Sprint precisou recorrer à regra de desempate
"a definição arquitetural prevalece".

**A decisão de design mais importante do próprio Blueprint (Seção 0.2), preservada integralmente por
esta Sprint:** AI Agents nunca redefine, duplica, ou substitui o Agent Framework (Component 18),
Reasoning (Component 19), Planning (Component 20), Memory (Component 16), ou Multi-Agent System
(Component 23) — todos já implementados em `@abp/ai`. AI Agents é, por desenho, exclusivamente a
**camada de consumo externo**: como Runtime, Automation Engine, e Business Hubs solicitam uma
capacidade apoiada por Agente, e como o resultado é representado do lado de fora do AI Core. Cada
Seção do Blueprint que trata de "ciclo de vida do agente", "planejamento", "raciocínio", "memória", ou
"coordenação entre agentes" responde onde aquele conceito já vive (sempre `@abp/ai`) e o que este
pacote acrescenta (sempre uma representação externa opaca, nunca uma segunda implementação) — esta
Sprint seguiu essa disciplina em cada Service implementado, nunca acessando um tipo de `@abp/ai`.

## 2. Auditoria de Legado (`src/`)

Busca exaustiva pelas doze palavras-chave desta Sprint (ai-agents, agent, delegation, capability,
task, planner, oversight, orchestration, execution, supervision, coordinator, routing). Resultado:
**nenhum legado extraível** — terceira Sprint consecutiva (após IMP-012 e IMP-013) com esse
resultado. `delegation`, `oversight`, `coordinator` e `routing` têm **zero ocorrências** em todo
`src/` — confirmando que os quatro conceitos centrais desta Sprint (Delegation Coordinator, Agent
Delegation Record, Oversight Gate, Oversight Checkpoint) nunca tiveram precedente algum no legado, nem
mesmo como esboço.

### 2.1 Falso amigo confirmado: `src/core/catalog/AgentCapability.ts` / `AgentCapabilityRegistry.ts`

Colisão de nome direta com o termo central desta Sprint ("Capability"), mas conceito completamente
distinto: `AgentCapability{agentId, skills, taskTypes, limitations, priority}` modela **o que um
Agent já sabe fazer** — exatamente o `AgentContract` que `AI_AGENTS_ARCHITECTURE_DEFINITION.md`,
Seção 2, já classifica como "Não pertence a AI Agents, e permanece exclusivamente do AI Core". O
conceito desta Sprint, `AgentCapabilityRequest`, é o oposto: um domínio consumidor *pedindo* uma
capacidade, nunca um Agent *declarando* uma. Mesmo padrão de colisão de nome puro já visto entre o
`ExecutionContext` do Runtime (IMP-013) e o `ExecutionContext` do Integration Pipeline legado.

### 2.2 Falso amigo confirmado: pipeline de execução de Agentes de IA (`orchestrator`/`dispatcher`/`queue`/`execution-engine`)

`src/core/orchestrator/AgentOrchestrator.ts` (consome `AgentSelector`, `ExecutionPlanner`,
`AgentDispatcher`, `BlogAgentExecutor` — a fachada pública do pipeline `plan → dispatch → execute`),
já identificado nas auditorias de IMP-009 e IMP-013 como pertencente à execução interna de Agentes de
IA — exatamente o território que `AI_AGENTS_ARCHITECTURE_DEFINITION.md` exclui explicitamente (Seção
0.2, Seção 2): Reasoning, Planning, e a coordenação entre Agentes já vivem inteiramente dentro do AI
Core, mediados pelo próprio Orchestrator interno de `@abp/ai`, nunca por este pacote.

### 2.3 Ausência confirmada

Zero ocorrências para `delegation`, `oversight`, `coordinator`, `routing` em todo `src/`. Nenhum
diretório trata de delegação de tarefa a um Agente já definido, nem de checkpoint de confirmação
humana sobre um resultado de IA, como conceito de domínio autônomo — apenas `*AIAssistSuggestion.confirmed`,
já implementado individualmente em cada Business Hub (Seção 3 do Blueprint cita esse precedente
diretamente), nunca um mecanismo central e reutilizável como o Oversight Gate agora implementado.

**Conclusão da auditoria:** nenhuma linha de lógica de negócio foi portada de `src/legado` — o único
uso do legado nesta Sprint foi negativo: confirmar, por auditoria direta, que `AgentCapability`
(catálogo de habilidades) e o pipeline `Orchestrator/Dispatcher/ExecutionPlanner` não são o mesmo
conceito que `AgentCapabilityRequest`/`DelegationCoordinatorService`, prevenindo uma confusão de nome
que teria violado a Seção 0.2 do Blueprint.

## 3. Contratos Reutilizados (Foundation, IMP-001)

Os quatro contratos já existentes desde a IMP-001 foram confirmados, lidos por completo, e
**reutilizados sem nenhuma alteração de campo, sem estreitamento de tipo público**:

| Contrato | Campos | Situação |
|---|---|---|
| `AgentCapabilityRequest` | `agentCapabilityRequestId`, `requesterKind: DelegationRequesterKind`, `purposeDescription`, `requestedAt` | Reaproveitado sem alteração |
| `AgentDelegationRecord` | `agentDelegationRecordId`, `agentCapabilityRequestId`, `correlationId?`, `status: AgentDelegationStatus`, `delegatedAt` | Reaproveitado sem alteração |
| `AgentTaskResult` | `agentTaskResultId`, `agentDelegationRecordId`, `resultDescription`, `confidence`, `producedAt` | Reaproveitado sem alteração |
| `OversightCheckpoint` | `oversightCheckpointId`, `agentTaskResultId`, `status: OversightStatus`, `resolvedByIdentityId?`, `requestedAt`, `resolvedAt?` | Reaproveitado sem alteração |

Mais os dois catálogos fechados já existentes (`AIAgentsCoreDelegationComponent`, três valores da
Sprint 8.1; `AIAgentsHumanOversightComponent`, um valor da Sprint 8.2 — juntos, os quatro Componentes
Internos completos da Seção 4), também reaproveitados sem alteração.

**Nenhuma Entity nova foi criada nesta Sprint** — mesmo padrão já estabelecido pela IMP-013 (Runtime).

## 4. Componentes Implementados

### 4.1 Repository Interfaces (4)

`AgentCapabilityRequestRepository`, `AgentDelegationRecordRepository`, `AgentTaskResultRepository`,
`OversightCheckpointRepository`. `AgentCapabilityRequest` e `AgentTaskResult` são fatos imutáveis —
**sem `update` nem `remove`**. `AgentDelegationRecord` e `OversightCheckpoint` têm `update`, porque
ambos evoluem por um ciclo de vida com estágios nomeados pelo próprio Blueprint (Seção 6: delegação;
Seção 17: checkpoint) — nenhum dos dois nunca tem `remove`.

### 4.2 Services (4) — um por Componente Interno já catalogado na Seção 4

| Service | Componente implementado |
|---|---|
| `AgentCapabilityRequestService` | Suporte de registro do Agent Capability Manager (ver Seção 5 sobre por que este componente é, ele mesmo, o Manager) |
| `DelegationCoordinatorService` | Delegation Coordinator |
| `TaskResultHandlerService` | Task Result Handler |
| `OversightGateService` | Oversight Gate |

`DelegationCoordinatorService` aplica a sequência exata da Seção 6 (`Requested → Delegated →
InProgress → Completed | Failed`) como máquina de estados com transições permitidas explícitas —
nunca pula nem reordena um estágio, mesma disciplina já usada em `ExecutionLifecycleService`
(Runtime, IMP-013). `Completed` e `Failed` são terminais; `Failed` é alcançável tanto de `Delegated`
quanto de `InProgress`, espelhando a mesma dualidade de ponto de falha já modelada no Runtime.

`OversightGateService.evaluate` é a única regra de negócio real desta Sprint: cria um
`OversightCheckpoint{status:"Pending"}` apenas quando `requiresConfirmation` é verdadeiro, devolvendo
`undefined` (liberação imediata, sem retenção) caso contrário — nunca decide, ele mesmo, se uma
finalidade é de alto impacto. **Decisão arquitetural registrada:** o Blueprint (Seção 17) nunca
enumera um catálogo fechado do que conta como "financeiro, jurídico, reputacional, ou qualquer outra
categoria já definida pela política da plataforma" — apenas referencia essa política como já definida
em outro lugar, nunca a lista. Implementar essa classificação dentro deste Service exigiria inventar
uma regra ausente do Blueprint; por isso `requiresConfirmation: boolean` é sempre recebido já
resolvido pelo chamador, mesma disciplina já aplicada a `DispatcherService.dispatch(succeeded)` no
Runtime (IMP-013), onde a tecnologia/decisão concreta também foi deixada para fora do escopo desta
série de Sprints.

### 4.3 AIAgentsManager

Implementa o "Agent Capability Manager" (Seção 4): "Ponto de entrada único de toda solicitação de
capacidade apoiada por Agente... não contém lógica de negócio, de automação, ou de inteligência."
Aplica literalmente o fluxo da Seção 12: **Agent Capability Request → Delegation Coordinator →
contrato externo do AI Hub → Task Result Handler → Oversight Gate (quando aplicável) → Agent Task
Result devolvido ao solicitante.**

**Decisão arquitetural registrada:** embora "Agent Capability Manager" seja, por nome, o próprio
Manager, um `AgentCapabilityRequestService` dedicado foi criado mesmo assim — para que toda
construção de Entity permaneça em um Service, nunca inline no Manager, cumprindo à risca a instrução
desta Sprint ("Toda lógica deve permanecer nos Services") e preservando a mesma simetria estrutural
já aplicada em todo domínio anterior desta série.

`delegate()`/`markInProgress()`/`completeDelegation()`/`failDelegation()` nunca decidem, por conta
própria, se um encaminhamento ao AI Hub teve sucesso — cada transição é explicitamente solicitada
pelo chamador, nunca inferida ou automatizada por este Manager, mesma disciplina já aplicada a
`RuntimeManager.dispatch()` (IMP-013).

## 5. Separação entre AI Agents e AI Core / Automation Engine / Runtime / Business Hubs

Verificada em quatro frentes, todas confirmadas sem exceção:

1. **Nenhum import de `@abp/ai`** — nenhum arquivo desta Sprint referencia `AgentContract`,
   `AgentLifecycleState`, `ReasoningConclusion`, `PlanningState`, `MemoryEntry`, ou
   `MultiAgentRelationship`. Toda comunicação com o AI Core permanece, por desenho, fora do escopo
   de implementação desta Sprint (o próprio Blueprint, Seção 13, descreve apenas o contrato — a
   chamada real ao AI Hub é, como o transporte do Runtime, uma tecnologia concreta nunca decidida por
   nenhuma destas Sprints de arquitetura).
2. **Nenhum import de `@abp/automation-engine`** além do identificador opaco — `requesterKind:
   "AutomationEngine"` nunca referencia `Workflow`/`Trigger`/`Action` por tipo importado.
3. **Nenhum import de `@abp/runtime`** além do identificador opaco — `requesterKind: "Runtime"` nunca
   referencia `ExecutionContext`/`DispatchTarget` por tipo importado; `correlationId` é sempre
   `string` opcional, nunca o tipo `CorrelationId` de `@abp/runtime` ou de `@abp/infrastructure`.
4. **Nenhum import de pacote de Business Hub** (`@abp/crm-hub`, `@abp/communication-hub`,
   `@abp/finance-hub`, `@abp/analytics-hub`, `@abp/growth-hub`) — `requesterKind: "BusinessHub"`
   segue a mesma disciplina de opacidade.

A auditoria de legado (Seção 2) confirma a mesma separação do lado oposto: todo código de execução
interna de Agentes de IA (`AgentOrchestrator`, `AgentSelector`, `ExecutionPlanner`, `AgentDispatcher`,
`AgentCapabilityRegistry`) foi identificado e mantido fora do escopo — nunca absorvido por este
pacote.

## 6. Commands e Events

**Nenhum catálogo de Commands nem de Events existe para este domínio** — `AI_AGENTS_ARCHITECTURE_DEFINITION.md`
nunca cataloga nenhum dos dois; toda referência a Evento no documento é sempre a um Evento já
publicado por outro domínio (Runtime, Automation Engine, ou um Business Hub), nunca um catálogo de
propriedade de AI Agents. Quinto domínio consecutivo com esta ausência, após AI Hub (IMP-010), IAM
(IMP-011), Observability (IMP-012) e Runtime (IMP-013).

`AIAgentsOperationResult<TEntity> = { result: TEntity }` — mesma forma mínima já usada nas quatro
Sprints anteriores, pela mesma ausência de catálogo aprovado.

## 7. Fora de Escopo — Registrado Explicitamente (fases posteriores do roadmap)

Nenhum dos itens abaixo foi implementado, alterado, ou antecipado por esta Sprint. Todos são citados
pelo próprio `AI_AGENTS_ARCHITECTURE_DEFINITION.md` como pertencentes a outra camada ou a outra fase:

- **MCP, Tool Registry, RAG, Embeddings, Vector Search** — nunca mencionados por
  `AI_AGENTS_ARCHITECTURE_DEFINITION.md`; pertencem a `AI_HUB_ARCHITECTURE.md` (Linhagem BP-series),
  documento distinto e ainda não migrado por nenhuma Sprint IMP (ver `PRE_IMP_014_ROADMAP_AUDIT.md`,
  Seção 3).
- **Multi-Agent Collaboration avançada** — o Blueprint (Seção 10) é explícito: "AI Agents nunca
  coordena Agente algum... **nada**" é acrescentado ao Multi-Agent System (Component 23) já existente
  em `@abp/ai`. Nenhuma coordenação entre Agentes foi implementada aqui, por desenho.
- **Knowledge Hub, Integração externa, Model Providers** — nenhum dos três é citado por este
  Blueprint como pertencente a AI Agents; permanecem gaps já registrados em
  `PRE_IMP_014_ROADMAP_AUDIT.md`, Seção 4/7, não deste relatório.
- **Dashboard** — Phase 7 original de `GATE_G2_IMPLEMENTATION_ROADMAP.md`, nunca mencionada por
  `AI_AGENTS_ARCHITECTURE_DEFINITION.md`.
- **Protocolo de comunicação concreto entre Agentes** — explicitamente proibido pela Seção 18
  ("AI Agents nunca define protocolo de comunicação concreto entre Agentes") e pela Seção 23
  (Dependências Proibidas); confirmado como não implementado.
- **Extensão de `DispatchTargetKind` (`@abp/runtime`)** — o Blueprint (Seção 15) já esclarece que
  nenhuma extensão é necessária ("uma solicitação a AI Agents é, do ponto de vista do Runtime, uma
  solicitação à categoria já existente `'AIHub'`"); `@abp/runtime` permanece intocado por esta Sprint,
  consistente com a regra "Nunca alterar implementações aprovadas."

## 8. Validação

```
pnpm typecheck   → 17/17 pacotes, sucesso
pnpm build       → 17/17 pacotes + apps/web (vite build), sucesso
pnpm lint        → sucesso
pnpm test        → 242/242 testes, 69/69 arquivos de teste (suíte inteira do monorepo)
```

**Testes desta Sprint:** 17 testes em 5 arquivos (`AgentCapabilityRequestService`,
`DelegationCoordinatorService`, `TaskResultHandlerService`, `OversightGateService`,
`AIAgentsManager`), cobrindo: opacidade de `requesterKind`/`purposeDescription`, sequência literal do
ciclo de vida da delegação (inclusive rejeição de estágio pulado e de transição a partir de estágio
terminal), persistência de `resultDescription`/`confidence` sem reinterpretação, liberação imediata
versus retenção condicionada por `requiresConfirmation`, rejeição de resolução dupla de um
Checkpoint já resolvido, e ausência de `command`/`events` no resultado do Manager — além do fluxo
completo sem exigência de confirmação e do fluxo completo com Oversight Gate retendo e depois
liberando um resultado.

## 9. Resumo

| Item | Contagem |
|---|---|
| Entities novas | 0 (todas as quatro já existiam desde a IMP-001) |
| Entities reaproveitadas sem alteração | 4 (`AgentCapabilityRequest`, `AgentDelegationRecord`, `AgentTaskResult`, `OversightCheckpoint`) |
| Catálogos fechados reaproveitados | 2 (`AIAgentsCoreDelegationComponent`, `AIAgentsHumanOversightComponent`) |
| Repository interfaces | 4 |
| Services | 4 |
| Manager | 1 (`AIAgentsManager`) |
| Commands | 0 (nenhum catálogo aprovado) |
| Events | 0 (nenhum catálogo aprovado) |
| Testes novos | 17 |
| Arquivos de legado (`src/`) extraídos | 0 (todo legado é falso amigo de nome ou ausência confirmada) |
