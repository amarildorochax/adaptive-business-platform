# Marketing Core Migration Report

**Adaptive Business Platform · Documento de Implementação**

Status: Approved · Sprint: IMP-005 — Marketing Hub Migration (Fase 1 — Marketing Core)

---

## Nota de Posicionamento Documental

Como já ocorreu em toda Sprint desta série a partir de IMP-002, o contexto e o texto da própria Sprint divergem do estado real do repositório em pontos que precisam ser registrados antes de qualquer decisão técnica.

**"Marketing Hub" e "Growth Hub" são o mesmo Bounded Context.** `platform/packages/marketing-hub/` não existe — o pacote real, já confirmado em BP-005/BP-009 e reconfirmado nesta Sprint, é `platform/packages/growth-hub/`. Todo este relatório usa `growth-hub`, e o orquestrador desta Sprint chama-se `GrowthManager`, não `MarketingManager` — mesma decisão de nomenclatura já tomada em IMP-003 para `CommunicationManager` (não `ConversationManager`), pelo mesmo motivo: o catálogo de componentes já aprovado (`GrowthHubComponent.ts`) cataloga o orquestrador como "Growth Manager", nunca como "Marketing Manager".

**O texto de exemplo desta Sprint diverge do vocabulário já aprovado em `Campaign.ts`/`Audience.ts`/`AudienceSegment.ts`/`LeadSource.ts`/`ConversionEvent.ts`/`ConversionGoal.ts` (Etapa 2, `GROWTH_DOMAIN_BLUEPRINT.md`).** "MarketingAsset" não existe em lugar nenhum do catálogo de 35 arquivos de `growth-hub`. "LandingPage" e "Form" existem, mas pertencem ao Content Hub (`CONTENT_HUB_ARCHITECTURE.md`, Fase 2 — Landing Page Builder), já implementado, ainda que fora de escopo, em IMP-004 — não portados nesta Sprint por não pertencerem a este domínio. "CampaignMetrics" não corresponde a nenhuma Entidade própria — a analítica derivada mais próxima no catálogo (`GrowthMetric`/`GrowthKPI`) é genérica e explicitamente de Analytics, fora do escopo desta Sprint ("Analytics" na lista "Fora do Escopo"). "Conversion" corresponde a duas Entidades distintas já aprovadas — `ConversionGoal` (o que caracteriza sucesso) e `ConversionEvent` (o registro imutável de que o sucesso ocorreu) — tratadas separadamente, nunca fundidas em uma única "Conversion". Tratado, como nas Sprints anteriores, como ilustrativo, não normativo.

**Um segundo módulo legado, não mencionado no contexto da Sprint, mostrou-se mais relevante que o módulo esperado.** A leitura obrigatória apontava para `src/core/marketing/` como a origem legada principal; a investigação (Etapa 1) confirmou que esse módulo é inteiramente **analítica derivada** (`CampaignAnalyzer`, `AudienceAnalyzer`, `CustomerSegmentation` — conversão, ROI, breakdown de audiência, seis segmentos fixos, todos recalculados sob demanda, nada persistido como Entidade de ciclo de vida). Quem de fato modela o ciclo de vida de Campaign — criar, atualizar, remover, iniciar, encerrar, definir público-alvo, registrar resultado — é um terceiro módulo, `src/core/campaign/` (`CampaignRecord`, `CampaignAudience`, `CampaignExecution`, `CampaignResult`, `CampaignManager`, `CampaignService`), não citado na leitura obrigatória desta Sprint e localizado apenas durante a Etapa 1 por investigação direta do código, per a própria regra desta Sprint ("nunca assumir legado — verificar"). É esse módulo, não `src/core/marketing/`, que efetivamente fundamenta a Extração desta Sprint.

---

## Resumo Executivo

Esta Sprint portou o núcleo do domínio Marketing/Growth — Campaign, Campaign Goal, Audience, Audience Segment, Lead Source, Conversion Goal, Conversion Event — para `platform/packages/growth-hub`, um pacote que já chegava a esta Sprint com 35 arquivos de contrato de tipo (Commands, Events, Business Rules e 26 Entidades já declaradas, per IMP-001), mas nenhuma classe de execução. Diferente de Content Hub (IMP-004, catálogo de Commands inteiramente ausente), Growth Hub já chega com os dezesseis Commands e dezessete Events completos e Frozen em espírito — o `GrowthOperationResult<T>` desta Sprint replica, portanto, a forma `{result, command?, events}` já usada por `CRMOperationResult`/`CommOperationResult`, não a forma `{result, events}` de Content. `pnpm typecheck`, `pnpm build`, `pnpm lint` e `pnpm test` completam sem erro em todo o workspace (17 projetos), com 15 testes novos (65 no total).

---

## Inventário e Classificação

| Conceito legado | Origem | Classificação | Justificativa |
|---|---|---|---|
| `CampaignRecord` | `src/core/campaign/CampaignRecord.ts` | Adaptar | `name`, `description`, `startDate`, `endDate` portados como extensão aditiva de `Campaign.ts` (mesmo precedente de IMP-002); `status` (`draft`/`active`/`finished`, três valores) **não** portado — o Blueprint já define quatro (`Created`/`Running`/`Finished`/`Stopped`), Frozen, nunca alterado por esta Sprint |
| `CampaignAudience` | `src/core/campaign/CampaignAudience.ts` | Adaptar | `estimatedReach` portado como extensão aditiva de `Audience.ts`; `customerIds` **não** portado como está — já representado, de forma opaca e per ADR-002, por `memberReferenceIds`, que este módulo legado já respeitava em espírito ("não validado contra o CRM") |
| `CampaignManager` (`src/core/campaign`) | `src/core/campaign/CampaignManager.ts` | Adaptar | Padrão de orquestração (delegar a `CampaignService`, emitir Evento por transição de ciclo de vida, nunca conter regra de Marketing ou de CRM) preservado; nomenclatura e conjunto de Eventos convergidos ao vocabulário já aprovado (`GrowthCommand`/`GrowthEvent`, não `CAMPAIGN_CREATED`/`CAMPAIGN_UPDATED`/`CAMPAIGN_REMOVED`/`CAMPAIGN_STARTED`/`CAMPAIGN_FINISHED` do legado) |
| `CampaignExecution` | `src/core/campaign/CampaignExecution.ts` | Aposentar (sem Entidade equivalente aprovada) | Nenhuma Entidade do Blueprint corresponde a um registro de execução separado da própria Campaign; a informação relevante (início/fim) já é coberta por `Campaign.updatedAt` e pelos Events `CampaignStarted`/`CampaignFinished` — criar uma nova Entidade seria inventar vocabulário, vedado por esta Sprint |
| `CampaignResult`/`CampaignMetrics` | `src/core/campaign/{CampaignResult.ts, CampaignMetrics.ts}` | Aposentar nesta Sprint (fora de escopo) | Retrato agregado de desempenho (`delivered`/`opened`/`clicked`/`converted`/`revenue`) — granularidade e propósito de Analytics, explicitamente fora do escopo desta Sprint; mais próximo de `GrowthMetric`/`GrowthKPI` (Analytics-adjacent), não de Campaign CRUD |
| `CampaignAnalyzer`/`AudienceAnalyzer`/`CustomerSegmentation` | `src/core/marketing/*` | Aposentar nesta Sprint (fora de escopo) | Analítica derivada pontual (conversão, ROI, breakdown de audiência, seis segmentos fixos), sem persistência e sem vínculo com uma Audience Segment específica — conceito e granularidade diferentes do Audience Segment aprovado; mais próximo de Growth Insight/Recommendation, fora do escopo desta Sprint |
| `EmailProvider`/`WhatsAppProvider`/`SocialMediaProvider`/`MarketingAutomation` | `src/core/marketing/*` | Aposentar (fora de escopo, explícito) | Canais e automação — na lista "Fora do Escopo" da própria Sprint |
| `CampaignProvider` (Anti-Corruption Layer) | `src/core/campaign/CampaignProvider.ts`¹ | Reutilizar como precedente de padrão, não como código | Adapta `Customer`/`Interaction`/`Opportunity` do CRM legado para `MarketingCustomerRecord`/`MarketingCampaignRecord` sem que nenhum Analyzer importe CRM diretamente — precedente de arquitetura válido para a regra "Audience nunca é lista de Customer do CRM" (ADR-002), já estruturalmente garantida em `Audience.ts` por `memberReferenceIds: readonly string[]` opacos |
| `Campaign` (contrato) | `platform/packages/growth-hub/Campaign.ts` | Reutilizar e estender | Estrutura já Frozen em espírito; estendida com campos práticos, nunca redefinida |
| `Audience`/`AudienceSegment`/`LeadSource`/`ConversionGoal`/`ConversionEvent`/`CampaignGoal` (contratos) | `platform/packages/growth-hub/*` | Reutilizar integralmente | Nenhum precedente legado com granularidade equivalente foi encontrado para estas seis Entidades; contratos já suficientes, mesma situação de Conversation Hub em IMP-003 |
| `GrowthCommand`/`GrowthEvent` (16 Commands, 17 Events) | `platform/packages/growth-hub/*` | Reutilizar integralmente | Catálogo completo, Frozen em espírito; seis Commands e seis Events efetivamente exercidos nesta Sprint (Core), os dez/onze restantes pertencem a Journey/Experiment/Attribution/Referral/Growth Insight-Recommendation-Initiative/Opportunity, todos fora de escopo |
| `Funnel`, `Journey`, `Experiment`, `Variant`, `Attribution`, `AttributionModel`, `Cohort`, `EngagementScore`, `Referral`, `ReferralProgram`, `LifecycleStage`, `GrowthOpportunity`, `GrowthInitiative`, `GrowthInsight`, `GrowthRecommendation`, `AcquisitionChannel`, `ActivationStrategy`, `RetentionStrategy`, `ExpansionStrategy`, `GrowthAIAssist`, `GrowthAuthorizationCheck`, `GrowthValidationResult`, `Touchpoint` | `platform/packages/growth-hub/*` | Fora de escopo, não tocado | Journeys, Experiments, Attribution, Referral, Analytics e estratégias de crescimento — todos explicitamente listados como "Fora do Escopo" desta Sprint; contratos permanecem exatamente como chegaram da IMP-001 |

¹ `CampaignProvider.ts`, apesar do nome, reside em `src/core/campaign/`, não em `src/core/marketing/` — atua como a camada de tradução que `src/core/marketing/CampaignAnalyzer.ts` consome, adaptando dados de `@/core/crm` e `@/core/campaign` para o vocabulário interno de Marketing sem expor Customer diretamente.

---

## Componentes Criados

**Entidades estendidas** (nunca redefinidas): `Campaign.ts` (`name`, `description?`, `startDate?`, `endDate?`, `updatedAt`, todos portados de `CampaignRecord`), `Audience.ts` (`estimatedReach?`, portado de `CampaignAudience`).

**Repositórios** (contratos apenas, per Etapa 7): `CampaignRepository.ts` (sem `remove` — nenhum Command/Event aprovado cobre remoção de Campaign), `CampaignGoalRepository.ts`, `AudienceRepository.ts` (sem `update` — uma nova composição é uma nova Audience), `AudienceSegmentRepository.ts` (com `update`, já que `SegmentUpdated` cobre tanto a primeira composição quanto todo recálculo), `LeadSourceRepository.ts`, `ConversionGoalRepository.ts`, `ConversionEventRepository.ts` (sem `update` nem `remove` — `ConversionsPreserveHistory`).

**Serviços**: `CampaignService.ts`, `CampaignGoalService.ts`, `AudienceService.ts`, `AudienceSegmentService.ts`, `LeadSourceService.ts`, `ConversionGoalService.ts`, `ConversionEventService.ts`.

**Orquestrador**: `GrowthManager.ts` — expõe `createCampaign` (valida que a Audience referenciada já existe antes de permitir a criação), `startCampaign` (verifica `CampaignRequiresAudienceBeforeStart` consultando o `AudienceRepository`, nunca confiando apenas no tipo), `stopCampaign`, `createCampaignGoal`, `createAudience`, `updateSegment`, `createLeadSource`, `createConversionGoal`, `registerConversion` (exige um Conversion Goal já existente).

---

## Componentes Reutilizados

O padrão `{result, command?, events}` de retorno de operação, já em uso por `CRMManager`/`CommunicationManager`, foi reutilizado integralmente — Growth Hub, diferente de Content Hub, já chega com um catálogo de Commands completo. A disciplina de coleta de Domain Events (nenhum publicado em Event Bus real, todos retornados ao chamador) também se repete sem alteração.

O padrão de Anti-Corruption Layer já demonstrado por `src/core/campaign/CampaignProvider.ts` (nunca expor Customer/Opportunity do CRM diretamente a um Analyzer de Marketing) confirma, por precedente legado independente, a mesma regra já estruturalmente imposta por `Audience.memberReferenceIds: readonly string[]` (ADR-002) — nenhum código foi copiado, apenas o padrão foi reconhecido como já validado.

---

## Componentes Ausentes

Journey Engine (`Journey`, `JourneyStarted`/`JourneyCompleted`), Experiment Engine (`Experiment`, `Variant`, `ExperimentStarted`/`ExperimentFinished`/`VariantSelected`), Attribution (`Attribution`, `AttributionModel`, `CalculateAttribution`), Referral Program (`Referral`, `ReferralProgram`, `RegisterReferral`, `ReferralCreated`/`ReferralConverted`), Cohort e Lifecycle Stage, Engagement Score (`CalculateEngagementScore`), Growth Insight/Recommendation/Initiative/Opportunity (`GenerateGrowthInsight`, `GenerateRecommendation`, `CreateInitiative`, `CloseOpportunity`), estratégias de Acquisition/Activation/Retention/Expansion, `GrowthAIAssist`, `GrowthAuthorizationCheck`, `GrowthValidationResult` — todos já contratados em `growth-hub` desde a IMP-001, nenhum implementado nesta Sprint, todos explicitamente fora do escopo já definido pela própria Sprint (Automations, Journeys, AI, Lead Scoring, Pixel, Analytics, integrações externas, SEO, auto-publicação, Social Media, Remarketing, Workflows).

---

## Lacunas Arquiteturais

**`CampaignGoal`, `LeadSource` e `ConversionGoal` não têm nenhum Command nem Evento de domínio próprio** no catálogo já aprovado (16 Commands, 17 Events) — mesmo tratamento já dado a `Organization`/`Contact` em `CRMOperationResult` (IMP-002): `GrowthManager` reflete isso com precisão, retornando `command: undefined` e `events: []` para as três operações correspondentes, nunca inventando vocabulário.

**`CampaignFinished` (Event) não tem nenhum Command aprovado que o produza dentro do escopo desta Sprint.** O catálogo de dezesseis Commands inclui `StopCampaign`, não `FinishCampaign` — e `CampaignStatus` já distingue `"Finished"` de `"Stopped"` como dois estados terminais distintos. `GrowthManager.stopCampaign` transiciona para `"Stopped"` (fiel ao nome do Command aprovado) e não emite `CampaignFinished` para essa transição — reutilizar esse Evento para uma transição que o próprio tipo já rotula como `"Stopped"` seria uma reinterpretação silenciosa do vocabulário já aprovado, não uma omissão. A hipótese mais provável, não confirmada nesta Sprint, é que `"Finished"`/`CampaignFinished` correspondam a uma conclusão automática (por exemplo, ao atingir `endDate`), dependente de um agendador — infraestrutura explicitamente fora do escopo. Mesmo tratamento já dado a `ArticleFlaggedForUpdate` em `CONTENT_CORE_MIGRATION_REPORT.md` (IMP-04): Evento catalogado, sem produtor de Core ainda.

**`src/core/campaign/CampaignExecution.ts` e `CampaignResult.ts`/`CampaignMetrics.ts` não foram portados como novas Entidades.** Nenhuma delas corresponde a algo já aprovado no Blueprint — inventar `CampaignExecution` ou `CampaignMetrics` como Entidades novas do Growth Hub violaria a regra desta própria Sprint ("nunca criar Commands/Events/Entidades novos por iniciativa própria"). A informação operacional de `CampaignExecution` (início/fim) já é coberta pelos campos e Eventos existentes; a informação analítica de `CampaignResult` pertence a um domínio de Analytics explicitamente fora de escopo.

---

## Riscos

Mesmo risco estrutural já registrado pelos três relatórios anteriores: nenhum Event Bus real existe, então todo `GrowthEvent` retornado é coletado, nunca publicado — trabalho de uma Sprint de Infrastructure futura.

Risco específico desta Sprint: a existência de dois módulos legados com nomes semelhantes (`src/core/marketing/`, puramente analítico, e `src/core/campaign/`, o real Campaign Management) pode levar uma equipe futura a assumir que o primeiro é a origem do Growth Hub CRUD, quando na verdade é o segundo — este relatório existe, em parte, para prevenir essa confusão.

Risco secundário: a ausência de um Command/Event que produza a transição para `"Finished"` significa que, sem uma Sprint futura de agendamento (ou uma decisão explícita de arquitetura), campanhas no Growth Hub só podem terminar via `StopCampaign`/`"Stopped"` — nunca naturalmente via `"Finished"`. Isso é fiel ao catálogo já aprovado, mas deixa um estado (`"Finished"`) sem nenhum caminho de Core que o alcance.

---

## Recomendações

Ao planejar uma futura Sprint de Scheduler/Automation (já fora de escopo desta), resolver explicitamente a lacuna de `CampaignFinished`: decidir se essa transição depende de um agendador automático (per a hipótese registrada acima) ou se, alternativamente, `GROWTH_HUB.md` deveria adicionar um Command `FinishCampaign` simétrico a `StopCampaign` — qualquer uma das duas resoluções deve vir de uma revisão explícita do Blueprint (Change Request), nunca de uma decisão unilateral de implementação.

Priorizar Journey Engine e Experiment Engine como próximas extensões de Growth Core, já que ambos têm Commands/Events completos já aprovados e nenhuma dependência de integração externa real (mesmo padrão desta Sprint: Journey nunca envia mensagens diretamente, per `JourneyNeverSendsMessagesDirectly`, `GrowthBusinessRule.ts`).

Ao implementar uma futura Sprint de Analytics, revisitar `CampaignResult`/`CampaignMetrics` (`src/core/campaign`) e `CampaignAnalyzer`/`AudienceAnalyzer`/`CustomerSegmentation` (`src/core/marketing`) como origem legada de `GrowthMetric`/`GrowthKPI`/`GrowthInsight` — nenhum dos dois módulos foi descartado, apenas classificado como fora do escopo de CRUD desta Sprint.

---

## Conclusão

Esta Sprint confirmou, pela quarta vez consecutiva, que o par "ler antes de assumir" continua a revelar o mesmo tipo de surpresa: a leitura obrigatória apontava para um módulo (`src/core/marketing/`) que se mostrou puramente analítico, enquanto o real Campaign Management vivia em um módulo vizinho, não mencionado, e só encontrado por verificação direta do código. Diferente de Content Hub, que revelou a ausência total de um catálogo de Commands, Growth Hub revelou o problema oposto — um catálogo completo e cuidadosamente desenhado, mas com uma assimetria pontual entre Commands e Events (`StopCampaign` sem `CampaignStopped`, `CampaignFinished` sem Command correspondente) que nenhuma leitura superficial do Blueprint teria exposto. Documentar essa assimetria, em vez de resolvê-la por conta própria, é exatamente o tipo de disciplina que esta série de Sprints já vem demonstrando desde a IMP-002.
