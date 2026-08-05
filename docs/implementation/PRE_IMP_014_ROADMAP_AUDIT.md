# PRÉ-IMP-014 — Auditoria do Roadmap

**Adaptive Business Platform · Auditoria Arquitetural (não implementa código)**

*Este documento não cria nenhum contrato, não altera nenhum Blueprint, não implementa nenhum código. Sua única função é inventariar toda a documentação arquitetural da plataforma, cruzá-la contra o que já foi migrado pelas Sprints IMP-001 a IMP-013, e indicar qual é o próximo documento oficial do roadmap ainda não migrado.*

---

## 0. Achado Central

Existem **duas linhagens de roadmap paralelas e não reconciliadas** na documentação da plataforma. As Sprints IMP-001 a IMP-013 seguiram, de forma consistente e verificável, a **Linhagem GATE_G2** — não a Linhagem BP-series/`IMPLEMENTATION_ROADMAP_MASTER.md`. Esse fato precisa ser registrado antes de qualquer outra conclusão, porque as duas linhagens propõem ordens de implementação diferentes e, em alguns pontos, cobrem domínios que a outra não cobre.

O próximo documento oficial ainda não migrado, seguindo a mesma linhagem que todas as treze Sprints já executadas seguiram, é:

> ## `docs/implementation/AI_AGENTS_ARCHITECTURE_DEFINITION.md`

Este achado é detalhado nas Seções 4 a 6 abaixo, com toda a cadeia de evidência que sustenta a conclusão.

---

## 1. As Duas Linhagens de Roadmap

### 1.1 Linhagem GATE_G2 (a linhagem efetivamente seguida por IMP-001 → IMP-013)

Origem: `docs/implementation/GATE_G2_IMPLEMENTATION_ROADMAP.md` ("APPROVED FOR IMPLEMENTATION", v1.0), que define sete Fases:

```
Phase 1 Foundation → Phase 2 Infrastructure → Phase 3 Platform Services
→ Phase 4 AI Core → Phase 5 Business Hubs → Phase 6 Automation → Phase 7 Dashboard
```

Cada Fase tem um documento `*_ARCHITECTURE_DEFINITION.md` (ou `PHASE_N_*`) próprio em `docs/implementation/`, seguido por um `*_READINESS_ASSESSMENT.md`, um `*_IMPLEMENTATION_BACKLOG.md`, um ou mais `SPRINT_N_M_*_IMPLEMENTATION.md`, e um `*_FINAL_VALIDATION.md` de encerramento. Esse padrão de cinco documentos por Fase é idêntico em todas as sete Fases originais e nas duas Fases adicionadas depois (Runtime, AI Agents — ver 1.3).

**Evidência de que é esta a linhagem seguida:** todo Sprint prompt IMP-XXX já executado (IMP-007 a IMP-013, visíveis nesta sessão) cita exatamente os documentos desta linhagem como fonte — `FINANCE_HUB.md`/`FINANCE_DOMAIN_BLUEPRINT.md` (IMP-007), `AI_CORE_ARCHITECTURE_DEFINITION.md` (IMP-010), `IDENTITY_HUB.md` (IMP-011), `NON_FUNCTIONAL_REQUIREMENTS.md` (IMP-012), e `RUNTIME_ARCHITECTURE_DEFINITION.md` (IMP-013, citado explicitamente por nome no próprio Sprint prompt "IMP-013 — RUNTIME CORE MIGRATION").

### 1.2 Linhagem BP-series (não seguida por nenhuma Sprint IMP até o momento)

Origem: nove Sprints de documentação (BP-001 a BP-009) produziram `docs/architecture/ADAPTIVE_PLATFORM_MASTER_BLUEPRINT.md` e sete Blueprints de domínio (`CONTENT_HUB_ARCHITECTURE.md`, `CONVERSATION_HUB_ARCHITECTURE.md`, `CRM_HUB_ARCHITECTURE.md`, `MARKETING_HUB_ARCHITECTURE.md`, `COMMERCE_HUB_ARCHITECTURE.md`, `BUSINESS_STRUCTURE_HUB_ARCHITECTURE.md`, `AI_HUB_ARCHITECTURE.md`), consolidados por `docs/architecture/ARCHITECTURE_RECONCILIATION_AND_GOVERNANCE.md` e sequenciados por `docs/architecture/IMPLEMENTATION_ROADMAP_MASTER.md` em doze Fases:

```
Foundation → Identity → Business (Structure) → CRM → Conversation → Content
→ Marketing → Commerce → Finance → AI → Analytics → Integration
```

Este roadmap parte de uma premissa de estado inicial diferente da que a série IMP encontrou — `IMPLEMENTATION_ROADMAP_MASTER.md`, Capítulo 5: "A implementação real hoje cobre apenas Dashboard e o módulo operacional de CRM" — e nunca é citado por nenhum Sprint prompt IMP-XXX já executado.

**Ponto de convergência real, não coincidência:** IMP-004 (Content) e IMP-006 (Commerce) migraram domínios que **não existem em nenhuma Fase da Linhagem GATE_G2** (cujo Phase 5 — Business Hubs cobre apenas CRM/Communication/Finance/Analytics/Growth — ver `PHASE_5_BUSINESS_HUBS_ARCHITECTURE_DEFINITION.md`). Content Hub e Commerce Hub só têm Blueprint na Linhagem BP-series (`CONTENT_HUB_ARCHITECTURE.md`, `COMMERCE_HUB_ARCHITECTURE.md`). Ou seja, a série IMP já cruzou para a Linhagem BP-series duas vezes, exclusivamente para preencher lacunas que a Linhagem GATE_G2 não cobre — nunca para o corpo principal do roadmap, que sempre seguiu GATE_G2.

### 1.3 Extensão pós-Phase-6 (dentro da Linhagem GATE_G2, mas fora das sete Fases originais)

`RUNTIME_ARCHITECTURE_DEFINITION.md`, Seção 0.1, e `AI_AGENTS_ARCHITECTURE_DEFINITION.md`, Seção 0.1, registram explicitamente que Runtime e AI Agents **não são a Phase 7** (`GATE_G2` já atribui Phase 7 a Dashboard) — são camadas inseridas depois da Phase 6, com numeração de Sprint própria (7.1/7.2 para Runtime, 8.1/8.2 para AI Agents), mas pertencentes à mesma linhagem documental e ao mesmo padrão de cinco documentos por Fase. `AI_AGENTS_ARCHITECTURE_DEFINITION.md`, Seção 22, torna a sequência completa explícita:

> "Sequenciamento: Foundation → Infrastructure → Platform Services → AI Core → Business Hubs → Automation Engine → Runtime → **AI Agents**"

E `RUNTIME_FINAL_VALIDATION.md`, Seção 9 (redigido ao final da aprovação documental de Runtime, antes de qualquer código de Runtime existir), confirma no presente:

> "A Phase 8 — AI Agents, mencionada apenas como referência externa e não integrante de `GATE_G2_IMPLEMENTATION_ROADMAP.md` em sua forma atual, não foi iniciada."

---

## 2. Inventário Completo — Linhagem GATE_G2

| # | Fase / Camada | Documento de Arquitetura | Localização | Domínio (classificação do prompt) | Status de Migração (IMP) |
|---|---|---|---|---|---|
| 1 | Phase 1 — Foundation | `SPRINT_01_CORE_FOUNDATION_PLAN.md` + `EVENT_CATALOG.md`/`COMMAND_CATALOG.md`/`QUERY_CATALOG.md`/`DOMAIN_OWNERSHIP_MATRIX.md` | `docs/implementation/`, `docs/architecture/` | Core Foundation | ✅ **IMP-001** |
| 2 | Phase 2 — Infrastructure | `INFRASTRUCTURE_ARCHITECTURE_DEFINITION.md` | `docs/implementation/` | Infrastructure | ✅ **IMP-012** (Observability & Platform Operations — a fração de Infrastructure coberta por `NON_FUNCTIONAL_REQUIREMENTS.md` Ch5/9/13; ver Seção 7 para o que não foi coberto) |
| 3 | Phase 3 — Platform Services | `PLATFORM_SERVICES_ARCHITECTURE_DEFINITION.md` | `docs/implementation/` | Platform Services (Identity, Knowledge, Integration) | ⚠️ **Parcial** — apenas Identity migrado (IMP-011, `platform-services`); **Knowledge e Integration nunca migrados, nem sequer scaffolded** — ver Seção 7 |
| 4 | Phase 4 — AI Core | `AI_CORE_ARCHITECTURE_DEFINITION.md` | `docs/implementation/` | AI | ✅ **IMP-010** (`ai`) |
| 4b | AI Core — Integração interna | `AI_CORE_INTEGRATION_ARCHITECTURE.md` + INT-01 a INT-10 | `docs/implementation/` | AI (auditoria de consistência interna, não uma Fase de código nova) | ✅ Encerrado — `AI_CORE_INTEGRATION_FINAL_APPROVAL.md`: "Status: AI CORE INTEGRATION APPROVED... Nenhuma nova Sprint de integração do AI Core poderá ser iniciada a partir deste ponto sob o mesmo backlog" |
| 5 | Phase 5 — Business Hubs | `PHASE_5_BUSINESS_HUBS_ARCHITECTURE_DEFINITION.md` + SPRINT_5_1 a 5_5 | `docs/implementation/` | Business Hub (CRM, Communication, Finance, Analytics, Growth) | ✅ **IMP-002** (CRM), **IMP-003** (Communication), **IMP-007** (Finance), **IMP-008** (Analytics), **IMP-005** (Growth) — todos os cinco |
| 6 | Phase 6 — Automation | `PHASE_6_AUTOMATION_ENGINE_ARCHITECTURE_DEFINITION.md` + SPRINT_6_1 a 6_5 | `docs/implementation/` | Automation (transversal, "sistema nervoso motor") | ✅ **IMP-009** (`automation-engine`) |
| 7 | Runtime (inserida, Sprint 7.1/7.2) | `RUNTIME_ARCHITECTURE_DEFINITION.md` | `docs/implementation/` | Runtime | ✅ **IMP-013** (`runtime`) |
| 8 | AI Agents (inserida, Sprint 8.1/8.2) | `AI_AGENTS_ARCHITECTURE_DEFINITION.md` | `docs/implementation/` | Agent Framework (camada de consumo externo, nunca reimplementa o Agent Framework do AI Core) | ❌ **NÃO MIGRADO — candidato a IMP-014** |
| 9 | Phase 7 — Dashboard (original) | Sem `*_ARCHITECTURE_DEFINITION.md` próprio — per `GATE_G2`, Seção 4: "Sem Hub ou Blueprint próprio no Documentation System; corresponde à Experience Layer/Presentation Layer já definida em `AI_ARCHITECTURE.md`" | — | Dashboard/Experience Layer | ❌ **Não migrado** — `apps/web` existe apenas como shell Vite mínimo, nunca uma Core migration; posição relativa a Runtime/AI Agents nunca formalmente decidida por nenhum documento (ver Seção 7) |

**Observabilidade documental desta tabela:** todo documento de Fase segue o mesmo padrão de cinco artefatos (`*_ARCHITECTURE_DEFINITION`/`PHASE_N_*` → `*_READINESS_ASSESSMENT` → `*_IMPLEMENTATION_BACKLOG` → `SPRINT_N_M_*` → `*_FINAL_VALIDATION`), todos já presentes e com `Status: APPROVED` (ou `APPROVED WITH OBSERVATIONS`) para AI Agents especificamente — confirmando que a etapa documental está pronta e só falta a etapa de código.

---

## 3. Inventário Completo — Linhagem BP-series / `IMPLEMENTATION_ROADMAP_MASTER.md`

| Documento | Localização | Domínio | Status de Migração |
|---|---|---|---|
| `ADAPTIVE_PLATFORM_MASTER_BLUEPRINT.md` | `docs/architecture/` | Meta-Blueprint (modelo de 8 Hubs) | Não migrado como unidade própria — nunca teve Sprint IMP dedicada |
| `CONTENT_HUB_ARCHITECTURE.md` | `docs/architecture/` | Business Hub | ✅ **IMP-004** (`content-hub`) |
| `COMMERCE_HUB_ARCHITECTURE.md` | `docs/architecture/` | Business Hub | ✅ **IMP-006** (`commerce-hub`) |
| `CONVERSATION_HUB_ARCHITECTURE.md` | `docs/architecture/` | Business Hub (extensão de Communication) | ✅ Coberto por **IMP-003**, que já tratou "Conversation Core" como o mesmo Bounded Context de Communication |
| `MARKETING_HUB_ARCHITECTURE.md` | `docs/architecture/` | Business Hub (extensão de Growth) | ✅ Coberto por **IMP-005**, que já tratou "Marketing Core" como o mesmo Bounded Context de Growth |
| `CRM_HUB_ARCHITECTURE.md` | `docs/architecture/` | Business Hub (extensão de CRM Frozen) | ✅ Coberto por **IMP-002**, sujeito à mesma reconciliação de nomenclatura já registrada no relatório daquela Sprint |
| `BUSINESS_STRUCTURE_HUB_ARCHITECTURE.md` | `docs/architecture/` | Business Hub (Business Unit, Branch) | ❌ **Não migrado, nenhum pacote existe** |
| `AI_HUB_ARCHITECTURE.md` | `docs/architecture/` | AI (extensão: Tool, MCP, RAG, Vector, Prompt System) | ❌ **Não migrado** — não confundir com `AI_CORE_ARCHITECTURE_DEFINITION.md` (Linhagem GATE_G2, já migrado por IMP-010); este é um documento diferente, cobrindo capacidades que IMP-010 não tratou (Tool Registry externo, MCP Server, RAG/Embedding/Vector Index) |

---

## 4. Documentos Volume I / Volume II Ainda Sem Sprint IMP Dedicada

Estes documentos são Official ou Frozen — arquitetura aprovada e pronta para implementação — mas nunca foram alvo de nenhuma Sprint IMP-XXX até o momento, nem estão scaffolded em nenhum pacote de `platform/packages/`:

| Documento | Localização | Domínio | Observação |
|---|---|---|---|
| `KNOWLEDGE_HUB.md` | `docs/architecture/` (Official) | Platform Service | Parte da mesma Phase 3 do IAM (IMP-011); nenhum pacote `knowledge-hub` existe |
| `INTEGRATION_HUB.md` | `docs/architecture/` (Official) | Integration | Parte da mesma Phase 3 do IAM (IMP-011); nenhum pacote `integration-hub` existe |
| `BRANDING_HUB.md` | `docs/architecture/` (Official) | Platform Service (adicional) | Nenhum pacote `branding-hub` existe |
| `BUSINESS_PROFILE_ENGINE.md` | `docs/architecture/` (Official) | Platform Service (adicional) | Nenhum pacote `business-profile` existe |

**Nota importante de governança, não de recomendação:** `GATE_G2_IMPLEMENTATION_ROADMAP.md`, Seção 12 ("Riscos técnicos"), já registrava o risco de que Identity/Knowledge/Integration fossem tratados como independentes quando deveriam ser "um único marco de saída de fase": *"tratar as três como um único marco de saída de fase, nunca declarar Phase 3 concluída com apenas uma ou duas prontas."* A série IMP prosseguiu para Phase 4, 5, 6, Runtime e AI Agents com Phase 3 apenas ⅓ concluída (somente Identity). Este documento **não decide** se isso deve ser corrigido antes de IMP-014 — apenas registra o fato, per a instrução de não assumir roadmap.

---

## 5. O Que Já Foi Completamente Implementado (IMP-001 → IMP-013)

| Sprint | Domínio | Pacote | Documento(s)-fonte |
|---|---|---|---|
| IMP-001 | Foundation | Todos (fundação do workspace) | `SPRINT_01_CORE_FOUNDATION_PLAN.md`, catálogos Volume I |
| IMP-002 | CRM | `crm-hub` | `CRM_DOMAIN_BLUEPRINT.md`/`CRM_HUB.md` (Frozen) + `CRM_HUB_ARCHITECTURE.md` (Draft) |
| IMP-003 | Communication/Conversation | `communication-hub` | `COMMUNICATION_DOMAIN_BLUEPRINT.md`/`COMMUNICATION_HUB.md` |
| IMP-004 | Content | `content-hub` | `CONTENT_HUB_ARCHITECTURE.md` |
| IMP-005 | Growth/Marketing | `growth-hub` | `GROWTH_DOMAIN_BLUEPRINT.md`/`GROWTH_HUB.md` |
| IMP-006 | Commerce | `commerce-hub` | `COMMERCE_HUB_ARCHITECTURE.md` |
| IMP-007 | Finance | `finance-hub` | `FINANCE_DOMAIN_BLUEPRINT.md`/`FINANCE_HUB.md` |
| IMP-008 | Analytics | `analytics-hub` | `ANALYTICS_DOMAIN_BLUEPRINT.md`/`ANALYTICS_HUB.md` |
| IMP-009 | Automation | `automation-engine` | `PHASE_6_AUTOMATION_ENGINE_ARCHITECTURE_DEFINITION.md`, `AUTOMATION_ENGINE.md` |
| IMP-010 | AI Core | `ai` | `AI_CORE_ARCHITECTURE_DEFINITION.md`, `AI_HUB.md` |
| IMP-011 | IAM/Identity | `platform-services` | `PLATFORM_SERVICES_ARCHITECTURE_DEFINITION.md`, `IDENTITY_HUB.md` |
| IMP-012 | Observability & Platform Operations | `infrastructure` | `INFRASTRUCTURE_ARCHITECTURE_DEFINITION.md` (parcial), `NON_FUNCTIONAL_REQUIREMENTS.md` |
| IMP-013 | Runtime | `runtime` | `RUNTIME_ARCHITECTURE_DEFINITION.md` |

Doze domínios, cada um com relatório em `docs/implementation/{DOMAIN}_CORE_MIGRATION_REPORT.md`, todos com `pnpm typecheck/build/lint/test` aprovados no momento de sua conclusão.

---

## 6. Próximo Documento Oficial do Roadmap — `AI_AGENTS_ARCHITECTURE_DEFINITION.md`

### 6.1 Por que este e não outro

- É o único documento cuja própria arquitetura (Seção 22) declara explicitamente sua posição imediatamente após Runtime na sequência: *"Foundation → Infrastructure → Platform Services → AI Core → Business Hubs → Automation Engine → Runtime → AI Agents."*
- `RUNTIME_FINAL_VALIDATION.md` — documento de encerramento da própria IMP-013 — já registrava, antes mesmo de Runtime ter código, que AI Agents era a fase seguinte "não iniciada".
- Toda a cadeia documental de cinco artefatos já está aprovada: `AI_AGENTS_ARCHITECTURE_DEFINITION.md` (Status: "AI AGENTS ARCHITECTURE DEFINED"), `AI_AGENTS_READINESS_ASSESSMENT.md` (Status: "READY WITH OBSERVATIONS"), `AI_AGENTS_IMPLEMENTATION_BACKLOG.md` (Status: "AI AGENTS IMPLEMENTATION BACKLOG APPROVED", conclui: *"serve como base para o início da Sprint 8.1 — Core Delegation"*), `SPRINT_8_1_CORE_DELEGATION_IMPLEMENTATION.md`, `SPRINT_8_2_HUMAN_OVERSIGHT_IMPLEMENTATION.md`, `AI_AGENTS_FINAL_VALIDATION.md` (Status: "APPROVED WITH OBSERVATIONS").
- `platform/packages/ai-agents/src/` já contém exatamente o mesmo tipo de scaffolding raso que `platform/packages/runtime/src/` continha antes da IMP-013 — seis arquivos: `AIAgentsCoreDelegationComponent.ts`, `AIAgentsHumanOversightComponent.ts`, `AgentCapabilityRequest.ts`, `AgentDelegationRecord.ts`, `AgentTaskResult.ts`, `OversightCheckpoint.ts`, mais `index.ts` — mesmo padrão de catálogo de componentes + contratos conceituais ainda sem Repository/Service/Manager.
- Não existe `AI_AGENTS_CORE_MIGRATION_REPORT.md` em `docs/implementation/` — confirmando que, ao contrário dos doze domínios da Seção 5, este nunca recebeu uma Sprint de Core migration.

### 6.2 Escopo já definido pelo próprio Blueprint (não uma proposta desta auditoria — apenas o que já está escrito)

Bounded Context (Seção 2 de `AI_AGENTS_ARCHITECTURE_DEFINITION.md`): **pertence** a AI Agents — Agent Capability Request, Agent Delegation Record, Agent Task Result, Agent Oversight Checkpoint (todos artefatos de representação externa). **Não pertence** — permanece exclusivo do AI Core: Agent (`AgentContract`, `AgentLifecycleState`), Reasoning, Planning, Memory, Multi-Agent System (`@abp/ai`, nunca importado além do contrato externo do AI Hub).

Quatro Componentes Internos já nomeados (Seção 4): Agent Capability Manager, Delegation Coordinator, Task Result Handler, Oversight Gate.

Quatro Contratos Públicos já descritos (Seção 5), todos ainda conceituais: Agent Capability Request, Agent Delegation Record, Agent Task Result, Agent Oversight Checkpoint — mesmo nome dos quatro arquivos já scaffolded em `platform/packages/ai-agents/src/`.

Nenhum Command nem Event catalogado — mesma ausência já confirmada em quatro Sprints seguidas (AI Hub, IAM, Observability, Runtime); `AI_AGENTS_ARCHITECTURE_DEFINITION.md` não menciona nenhum catálogo próprio.

### 6.3 O que este documento explicitamente não é

Não é uma proposta de reimplementar Agent Framework, Reasoning, Planning, Memory, ou Multi-Agent System — o próprio Blueprint (Seção 0.2) é explícito: esses cinco já existem em `@abp/ai` (Componentes 16, 18, 19, 20, 23) e nunca são redefinidos aqui. AI Agents é, por desenho, "uma camada de representação externa, nunca um domínio de execução ou de inteligência próprio" (Seção 4).

---

## 7. Itens Registrados, Não Resolvidos (per instrução "não assumir roadmap")

Esta auditoria identifica, sem propor solução nem prioridade, os seguintes fatos que uma futura decisão de governança pode precisar considerar:

1. **Phase 3 (Platform Services) permanece ⅓ concluída** — Knowledge Hub e Integration Hub nunca migrados nem scaffolded, apesar de `GATE_G2_IMPLEMENTATION_ROADMAP.md` já alertar contra declarar essa Fase concluída parcialmente.
2. **Phase 7 original (Dashboard)** nunca recebeu Sprint IMP dedicada; sua posição relativa a Runtime/AI Agents (inseridas depois da Phase 6) nunca foi formalmente decidida por nenhum documento — nem `RUNTIME_ARCHITECTURE_DEFINITION.md` nem `AI_AGENTS_ARCHITECTURE_DEFINITION.md` a mencionam na própria cadeia de sequenciamento (Seção 22 deste último pula direto de Runtime para AI Agents, sem posicionar Dashboard entre os dois nem depois).
3. **Branding Hub e Business Profile Engine** (Platform Services adicionais, per `GATE_G2`, Seção 4) nunca migrados.
4. **A Linhagem BP-series** ainda tem dois documentos sem Sprint IMP correspondente: `BUSINESS_STRUCTURE_HUB_ARCHITECTURE.md` (Business Unit/Branch) e `AI_HUB_ARCHITECTURE.md` (Tool/MCP/RAG/Vector/Prompt System — distinto de `AI_CORE_ARCHITECTURE_DEFINITION.md`, já migrado).
5. As seis divergências de nomenclatura ainda pendentes per `ARCHITECTURE_RECONCILIATION_AND_GOVERNANCE.md`, Capítulo 11 (Organization/Company, Opportunity/Deal, Timeline Event/HistoryEntry, Conversation/Communication, Marketing/Growth, três definições de Agent) nunca foram formalmente resolvidas por Amendment/Change Request — nenhuma bloqueou nenhuma Sprint IMP até agora, mas nenhuma foi fechada.

Nenhum destes cinco itens é proposto como IMP-014 por esta auditoria — apenas registrado, per instrução explícita de não inferir ou assumir roadmap.

---

## 8. Proposta de IMP-014 (exclusivamente com base em `AI_AGENTS_ARCHITECTURE_DEFINITION.md`)

**IMP-014 — AI Agents Core Migration.**

- **Documento-fonte único:** `docs/implementation/AI_AGENTS_ARCHITECTURE_DEFINITION.md`, aprovado ("AI AGENTS ARCHITECTURE DEFINED"), com cadeia de Readiness/Backlog/Sprint 8.1–8.2/Final Validation já integralmente aprovada.
- **Pacote-alvo:** `platform/packages/ai-agents` (já existe, com seis arquivos de scaffolding raso, mesmo estado em que `platform/packages/runtime` se encontrava antes da IMP-013).
- **Padrão a seguir:** idêntico ao já aplicado em IMP-011/012/013 — auditar `src/` pelas palavras-chave próprias deste domínio (agent, delegation, capability, oversight, approval, task result, dispatch — a definir no próprio prompt da Sprint), construir Repository/Service/Manager sobre os quatro contratos já existentes, sem inventar Command/Event (nenhum catálogo existe), respeitando rigorosamente a Seção 18 (Limites Arquiteturais) e a Seção 23 (Dependências Proibidas) do próprio Blueprint — em particular, nunca importar `@abp/ai` além do contrato externo do AI Hub.
- **Relatório esperado:** `docs/implementation/AI_AGENTS_CORE_MIGRATION_REPORT.md`.

Esta proposta não inclui nenhum dos cinco itens da Seção 7 — eles permanecem registrados como gaps arquiteturais em aberto, não como parte do escopo de IMP-014.
