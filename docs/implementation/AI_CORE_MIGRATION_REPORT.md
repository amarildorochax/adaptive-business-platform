# AI Core Migration Report

**Adaptive Business Platform · Documento de Implementação**

Status: Approved · Sprint: IMP-010 — AI Hub Migration (Core)

---

## Nota de Posicionamento Documental

Como em toda Sprint desta série, o contexto e o texto da própria Sprint divergem do estado real do repositório em pontos que precisam ser registrados antes de qualquer decisão técnica — e esta Sprint revela a sobreposição documental mais extensa de toda a série.

**Dois documentos, não um, definem o AI Hub — e um deles já registra, ele mesmo, a existência de um Volume II inteiro.** `AI_HUB.md` ("Volume I", Frozen) define Gateway, Provider Layer, Prompt Engine, Context Manager, Memory Engine, Model Registry — exatamente o território que esta Sprint pediu para confirmar e preservar. `AI_HUB_ARCHITECTURE.md` é uma extensão posterior (Draft), cuja própria Nota de Posicionamento revela que "quase todo esse território já está integralmente construído — não em um lugar, mas em dois", citando um Volume II inteiro (`docs/ai/`, fundado por `AI_MANIFESTO.md`, com seis documentos já Official: `AI_ARCHITECTURE.md`, `AGENT_FRAMEWORK.md`, `AI_ORCHESTRATOR.md`, `CONTEXT_FRAMEWORK.md`, `AI_GOVERNANCE.md`, `AI_OBSERVABILITY.md`). A relação entre os dois Volumes já está formalmente decidida (`VOLUME_II_FOUNDATIONAL_DECISIONS.md`, Decisão 007): "`AI_HUB.md` possui o contrato externo... o Volume II possui o funcionamento interno... um conflito entre ambos resolve-se sempre a favor de `AI_HUB.md`". Esta Sprint herda essa relação sem alterá-la — implementa exclusivamente o território de `AI_HUB.md` (Volume I), o mesmo pedido pela Etapa "Regra Arquitetural Fundamental" desta Sprint.

**`platform/packages/ai/` já existia com 96 arquivos — mas nenhum deles é Gateway, Provider, Prompt, ou Model Registry.** O pacote inteiro, confirmado por leitura de todo o seu `index.ts` antes desta Sprint, já cobria integralmente o Volume II (Agent Framework, Orchestrator, Context, Governança, Observabilidade, Multi-Agent, Skill, Tool) — nenhum arquivo chamado `Prompt*`, `Gateway*`, `Provider*`, `AIRequest`, `AIResponse` ou `ModelRegistry` existia. Esta é uma situação nova nesta série: o pacote existe e é extenso, mas o vocabulário específico que esta Sprint pediu para confirmar/preservar nunca havia sido scaffoldado nele — mais próximo da situação de Content/Commerce Hub (construir do zero) do que da situação de Finance/Analytics/Automation Hub (executar sobre contrato já rico), mas dentro de um pacote já denso de outro material.

**Uma exceção importante confirma a regra: `MemoryEntry` (Volume II) já é, ele mesmo, a estrutura aprovada para o Memory Engine que esta Sprint pediu para preservar.** `MemoryEntry.ts`/`MemoryType.ts`/`MemoryOwnership.ts` (já existentes) citam `MEMORY_CONCRETE_STRUCTURE.md` como fonte, e `MemoryType` (`"ShortDuration"|"LongDuration"`) e `MemoryOwnership` (`"Empresa"|"Usuário"|"IA"`) reproduzem, literalmente, as "seis combinações" do Memory Engine já descritas em `AI_HUB.md`, Capítulo 11 — mesmo o próprio `MEMORY_OS.md` (o documento técnico dedicado de memória) permanecendo pendência formalmente registrada (`VOLUME_II_FOUNDATIONAL_DECISIONS.md`, Decisão 008). Esta Sprint reutiliza `MemoryEntry` integralmente, nunca cria uma Entidade paralela — mesma disciplina de "nunca duplicar o que já existe" já aplicada em toda Sprint anterior.

**Legado real e diretamente portável foi encontrado em quatro módulos simultâneos, formando uma cadeia funcional completa e coerente.** `src/core/ai/` (AIGateway, AIRouter, AIProviderFactory, AIProvider, BaseAIProvider), `src/providers/{mock,openai,claude,gemini}/` (os quatro Provider concretos), `src/core/prompt/` (PromptManager, PromptRegistry, PromptBuilder, PromptTemplate) e `src/core/memory/` (MemoryManager, ContextBuilder) formam, juntos, uma implementação real e funcional de praticamente toda a "espinha dorsal de curto prazo" que `AI_HUB.md`, Capítulo 25 (Roadmap), já havia antecipado como prioridade desta fase — confirmado, com evidência direta de código, que `OpenAIProvider`/`ClaudeProvider`/`GeminiProvider` nunca fazem chamada de rede real, delegando inteiramente a `MockAIProvider` (ver Inventário).

---

## Resumo Executivo

Esta Sprint estendeu `platform/packages/ai` com a camada Gateway/Provider/Prompt/Memory/Knowledge já definida em `AI_HUB.md` (Volume I) — distinta, e nunca sobreposta, ao Agent Framework/Orchestrator/Context/Governança/Observabilidade (Volume II) já existente no mesmo pacote desde a IMP-001. Oito Entidades novas (`AIRequest`, `AIResponse`, `AITokenUsage`, `AIModelDescriptor`, `ProviderCapabilities`, `PromptTemplate`, `PromptVersion`, `PromptExecution`) mais a extensão aditiva de `MemoryEntry` (já existente, Volume II) compõem o núcleo. O `AIGateway` real, o `ProviderRouter`/`ProviderFactory`/`ProviderRegistry`, e os quatro `AIProvider` concretos (`MockAIProvider` real; `OpenAIProvider`/`ClaudeProvider`/`GeminiProvider`, todos delegando ao Mock) foram portados quase literalmente do legado. `pnpm typecheck`, `pnpm build`, `pnpm lint` e `pnpm test` completam sem erro em todo o workspace (18 projetos), com 26 testes novos (164 no total).

---

## Inventário e Classificação

| Conceito | Origem | Classificação | Evidência |
|---|---|---|---|
| `platform/packages/ai/` (96 arquivos, Volume II) | — | Já existente, intocado | Confirmado por leitura integral do `index.ts` antes desta Sprint — nenhum arquivo de Gateway/Provider/Prompt/Model Registry existia |
| `AIGateway`/`AIRouter`/`AIProviderFactory`/`AIProviderRegistry`/`AIProvider`/`BaseAIProvider` | `src/core/ai/` | Adaptar (quase literal) | Real e funcional; `AIGateway.generate()` → `AIRouter.resolve()` → `AIProviderFactory.create()` → `AIProvider.generate()` portado como `AIGateway`/`ProviderRouter`/`ProviderFactory`/`ProviderRegistry`/`AIProvider`/`BaseAIProvider`, sem EventBus (infraestrutura ausente nesta arquitetura, mesma lacuna já registrada em toda Sprint anterior) |
| `MockAIProvider` | `src/providers/mock/MockAIProvider.ts` | Adaptar (quase literal) | Real, zero chamada de rede, zero credencial — confirmado por leitura integral; portado sem o atraso artificial (`setTimeout`) do legado, uma simplificação não comportamental |
| `OpenAIProvider`/`ClaudeProvider`/`GeminiProvider` | `src/providers/{openai,claude,gemini}/` | Adaptar (quase literal) | Confirmado por leitura de `OpenAIProvider.ts`: `doGenerate()` delega inteiramente a `MockAIProvider`, "Nenhuma chamada de rede é feita; nenhuma credencial é lida" — mesmo padrão portado para os três |
| DeepSeek, Ollama, Azure OpenAI | — | **Inexistente, mesmo no legado** | `AI_HUB.md`, Capítulo 15, nomeia os seis; o legado só chegou a estubar três (OpenAI/Claude/Gemini); esta Sprint não adiciona os três restantes, mantendo a mesma proporção já validada em produção |
| `PromptManager`/`PromptRegistry`/`PromptBuilder`/`PromptTemplate`/`PromptRecord`/`PromptVariable` | `src/core/prompt/` | Adaptar | Real e funcional; CRUD+versionamento portado para `PromptTemplateService`/`PromptVersion`; composição de camada + substituição `{{key}}` portada quase literalmente para `PromptComposerService` |
| `MemoryManager`/`MemoryRecord`/`ContextBuilder` | `src/core/memory/` | Adaptar (parcial — dado, nunca a Entidade) | `MemoryRecord.title/content/tags` portados como extensão aditiva de `MemoryEntry` (Volume II, já aprovado); `ContextBuilder.generate()` ("consulta memória, prepende ao prompt original") portado quase literalmente para `AIManager.buildContextBlock()` |
| `KnowledgeProvider`/`KnowledgeManager`/`KnowledgeDocument` | `src/core/knowledge/` | Adaptar a intenção, nunca o armazenamento | O legado mantinha seu próprio `KnowledgeBase` interno — uma violação da fronteira já aprovada por `AI_HUB.md`, Capítulo 12 ("o AI Hub... não armazena conhecimento"); `KnowledgeConnectorService` desta Sprint consulta exclusivamente `KnowledgeAsset`, já contratado e possuído por `@abp/platform-services`, nunca uma cópia própria |
| `MemoryEntry`/`MemoryType`/`MemoryOwnership`/`MemoryScope`/`MemoryRetention` | `platform/packages/ai/*` (Volume II) | Já aprovado, reutilizado integralmente | Confirmado como a estrutura já aprovada do Memory Engine de `AI_HUB.md`, Capítulo 11 — nenhuma Entidade paralela criada |
| `KnowledgeAsset`/`KnowledgeType` | `platform/packages/platform-services/*` | Já aprovado, consumido por referência, nunca copiado | `KnowledgeConnectorService` depende de `@abp/platform-services` (já uma dependência declarada do pacote `ai` desde a IMP-001) |
| Commands do AI Hub | — | **Inexistente, confirmado em ambos os Volumes** | Nenhum capítulo equivalente a "Comandos" existe em `AI_HUB.md` (26 capítulos) nem em `AI_HUB_ARCHITECTURE.md` (30 capítulos) |
| Events do AI Hub | — | **Inexistente como catálogo próprio, e sem sequer um `AuditRecord` equivalente** | Diferente do Automation Engine (IMP-009), que ao menos tinha `AuditRecord.ts` já contratado; nenhum mecanismo equivalente existe para o AI Hub |
| Tool, Tool Registry, MCP Server, MCP Integration, RAG, Embedding, Vector Index | — | **Fora de escopo, confirmado por regra explícita e por `AI_HUB_ARCHITECTURE.md`** | Regra explícita desta Sprint; `AI_HUB_ARCHITECTURE.md` já os cataloga como "lacuna real e verificada", mas seu preenchimento pertence a aquele documento, não a esta Sprint de implementação |
| Context Manager pleno (9 camadas), Cost Manager, Policy Engine, Guardrails, Cache/Retry/Queue Manager | `AI_HUB.md`, Capítulo 7 | Adiado — "médio/longo prazo" no próprio Roadmap | `AI_HUB.md`, Capítulo 25: "médio prazo... o Context Manager operando com todas as suas camadas... Cost Manager com política de orçamento" — esta Sprint implementa apenas a espinha dorsal de curto prazo |
| CRM/Communication/Content/Growth/Commerce/Finance/Analytics/Automation Hub | `@abp/crm-hub` e demais | Nunca acessado, nem por referência de tipo | `businessContext`/`brandContext` em `AIManager.requestCompletion()` são sempre `string` opacos — nenhum tipo de nenhum outro Business Hub é importado por nenhum arquivo desta Sprint |

---

## Componentes Criados

**Entidades**: `AIRequest.ts` (`tenantId` adicionado como extensão prática ausente do legado pré-multiempresa), `AIResponse.ts`, `AITokenUsage.ts`, `AIModelDescriptor.ts`, `ProviderCapabilities.ts`, `PromptTemplate.ts`, `PromptVersion.ts`, `PromptExecution.ts` (com `PromptLayer`: `System`/`Business`/`Brand`/`User`, as quatro camadas já Frozen em `AI_HUB.md`, Capítulo 9). `MemoryEntry.ts` (Volume II, já existente) estendido com `title?`/`content?`/`tags?`, herdados de `MemoryRecord.ts` (legado).

**Repositórios** (contratos apenas): `PromptTemplateRepository`, `PromptVersionRepository` (sem `remove` — `update` existe apenas para marcar `supersededAt`), `PromptExecutionRepository` (sem `update`/`remove` — histórico imutável), `MemoryEntryRepository`.

**Serviços**: `PromptTemplateService` (CRUD + versionamento, nova `PromptVersion` a cada edição, nunca sobrescreve o histórico), `PromptComposerService` (as quatro camadas, sempre na ordem System→Business→Brand→User, substituição `{{key}}` sem escaping), `PromptExecutionService`, `MemoryEntryService` (segregado por `tenantId`, isolamento absoluto), `KnowledgeConnectorService` (consulta apenas, nunca armazena).

**Provider Layer**: `AIProvider` (interface), `BaseAIProvider` (classe base, mede `latencyMs`), `MockAIProvider` (única implementação real), `OpenAIProvider`/`ClaudeProvider`/`GeminiProvider` (todos delegando a `MockAIProvider`), `ProviderRegistry`, `ProviderFactory` (seed: mock, openai, claude, gemini), `ProviderRouter` (prioridade a `request.providerId`, senão `"mock"`).

**Gateway e Orquestrador**: `AIGateway` (único ponto de entrada, validação estrutural mínima — `prompt` e `tenantId` não vazios — nunca decide Provider), `AIManager` (compõe Prompt Template → Memory → Knowledge → Prompt Composer → Prompt Execution → AI Gateway; expõe `requestCompletion`, `createPromptTemplate`/`updatePromptTemplate`, `remember`).

## Componentes Reutilizados

`MemoryEntry`/`MemoryType`/`MemoryOwnership` (Volume II) foram reutilizados integralmente como a estrutura já aprovada do Memory Engine — nenhuma Entidade paralela foi criada, mesmo padrão de "nunca duplicar o que já existe" já demonstrado por `AnalyticsEventIngestion` reutilizando o padrão de referência opaca. `KnowledgeAsset` (`@abp/platform-services`) foi consumido por referência através de `KnowledgeConnectorService`, nunca copiado — respeitando literalmente `AI_HUB.md`, Capítulo 12.

`AIOperationResult<T> = {result}` — sem `command`, sem `events` — é a forma mais simples de toda a série: nem mesmo o mecanismo de `AuditRecord` já usado pelo Automation Engine (IMP-009) existe, pronto, para este Hub. Diferente de toda Sprint anterior, esta não substitui Command/Event por nenhum mecanismo alternativo — porque nenhum candidato razoável foi encontrado em nenhum dos dois Volumes consultados.

## Componentes Ausentes

Tool, Tool Registry, MCP Server, MCP Integration, RAG, Embedding, Vector Index — todos explicitamente fora de escopo por regra desta Sprint, e já catalogados como lacuna genuína (não implementação) por `AI_HUB_ARCHITECTURE.md`. Context Manager pleno (nove camadas: usuário, empresa, módulo, conversa, histórico, Business Profile, Branding), Policy Engine, Guardrails, Safety Layer, Moderation, Cache/Retry/Queue Manager, Token/Cost Manager, Model Registry como Entidade explícita de versão, Observabilidade plena (Logging/Tracing/Metrics estruturados) — todos "médio/longo prazo" per `AI_HUB.md`, Capítulo 25, nenhum implementado nesta Sprint. Agent Registry, Agent Workflow, Model Version — as lacunas genuínas já identificadas por `AI_HUB_ARCHITECTURE.md` — também fora de escopo, pertencentes àquele documento de extensão, não a esta Sprint de implementação.

---

## Lacunas Arquiteturais

**Nenhum Command foi ou pôde ser portado — nem `AI_HUB.md` nem `AI_HUB_ARCHITECTURE.md` os catalogam, para nenhuma Entidade.** Mesma ausência já confirmada para o Automation Engine (IMP-009), mas mais severa: o Automation Engine ao menos tinha `AuditRecord` como mecanismo substituto já contratado; nenhum equivalente existe para o AI Hub.

**A recuperação de Memória e de Conhecimento é sempre combinada em um único bloco de contexto, prependido ao User Prompt — nunca uma quinta camada de Prompt inventada.** As quatro camadas já Frozen (`AI_HUB.md`, Capítulo 9) são System/Business/Brand/User; Memória e Conhecimento, descritos no Capítulo 10 como "camadas de contexto" consumidas pelo Context Manager, não têm um nome de camada de Prompt próprio — esta Sprint resolve essa ambiguidade seguindo o precedente exato já validado pelo `ContextBuilder.ts` legado (prepender ao prompt, nunca inventar uma camada nova).

**`ProviderRouter` usa `"mock"` como Provider padrão, nunca uma variável de ambiente de configuração.** O legado (`AIRouter.ts`) consultava `env.aiProvider`; esta Sprint nunca introduz configuração externa (Configuration, "médio prazo" per o Roadmap) — o padrão fixo `"mock"` é uma simplificação deliberada, documentada, não uma omissão.

**`AIRequest`/`AIResponse` nunca são versionados por Evento — nenhum registro de auditoria de nível de plataforma (Logging/Tracing/Audit, `AI_HUB.md`, Capítulo 7) foi implementado.** `PromptExecution` é o único registro histórico produzido por esta Sprint, e cobre apenas a composição do prompt, nunca o ciclo completo Gateway→Provider→Resposta.

---

## Riscos

Mesmo risco estrutural já registrado por todo relatório anterior: nenhum Event Bus real existe nesta arquitetura, então nenhuma observabilidade de nível de Hub (Logging/Tracing/Metrics, todos "médio prazo") foi conectada — esta Sprint entrega apenas a espinha dorsal funcional, sem o eixo transversal de suporte e governança já descrito em `AI_HUB.md`, Capítulo 6 ("Cache Manager, Cost Manager, Policy Engine, Guardrails, Logging, Tracing, Metrics e Audit").

Risco específico desta Sprint: `platform/packages/ai/` agora contém, deliberadamente, dois corpos de contrato com propósitos genuinamente distintos (Volume I: Gateway/Provider/Prompt/Memory/Knowledge; Volume II: Agent Framework/Orchestrator/Context/Governança/Observabilidade/Multi-Agent/Skill/Tool) dentro do mesmo pacote físico. Isso é consistente com a decisão já formal (`VOLUME_II_FOUNDATIONAL_DECISIONS.md`, Decisão 007) de que os dois Volumes coexistem sem se substituir, mas exige que qualquer Sprint futura, ao adicionar a este pacote, confirme explicitamente a qual dos dois Volumes um novo conceito pertence antes de nomear ou implementar — o mesmo cuidado que esta Sprint já demonstrou ao reconhecer `MemoryEntry` como Volume II em vez de recriar uma Entidade paralela de Volume I.

---

## Resultados da Validação

`pnpm typecheck`, `pnpm build`, `pnpm lint` e `pnpm test` completam sem erro em todo o workspace (18 projetos), inclusive a dependência cross-package de `@abp/platform-services` consumida por `KnowledgeConnectorService`. 164 testes no total (138 antes desta Sprint, 26 novos): `MockAIProvider.test.ts`, `OpenAIProvider.test.ts` (confirma que os três Provider estubados sempre delegam ao Mock, identificando corretamente `providerId`), `AIGateway.test.ts` (validação estrutural, roteamento explícito, rejeição de Provider não registrado), `PromptComposerService.test.ts` (as quatro camadas, ordem de prioridade, substituição de variável), `PromptTemplateService.test.ts` (versionamento sem sobrescrita), `MemoryEntryService.test.ts` (isolamento absoluto entre Tenant), `KnowledgeConnectorService.test.ts`, e `AIManager.test.ts` (sete cenários, cobrindo o fluxo completo Prompt Template → Memory → Composição → Execução → Gateway, e a ausência de `command`/`events`).

---

## Conclusão

Esta Sprint confirmou, com a evidência mais direta já encontrada nesta série, que "confirmar e preservar a arquitetura já aprovada" (a instrução central desta Sprint) e "construir do zero" não são mutuamente exclusivos: a arquitetura já estava certa — Gateway único, Provider agnóstico, Prompt versionado, Memória segregada por Tenant, Conhecimento nunca duplicado —, mas nunca havia sido scaffoldada em `platform/packages/ai` na forma que `AI_HUB.md` já exigia desde antes da IMP-001. O legado real (`src/core/ai/`, `src/providers/*`, `src/core/prompt/`, `src/core/memory/`) já havia validado essa arquitetura em código funcional, inclusive confirmando, com evidência direta, que nenhum Provider jamais fez uma chamada de rede real — exatamente a garantia que esta Sprint foi encarregada de preservar. O AI Hub agora sabe compor um prompt em camadas, rotear entre Provider sem acoplamento, lembrar por Empresa/Usuário/IA com isolamento absoluto, e consultar conhecimento sem nunca armazená-lo — e continua, deliberadamente, sem RAG, sem Embeddings, sem Tool Calling, sem MCP, e sem qualquer credencial real, exatamente como esta Sprint exigiu.
