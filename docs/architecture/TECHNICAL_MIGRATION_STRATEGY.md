# Technical Migration Strategy

**Adaptive Business Platform · Documento de Arquitetura (Draft)**

---

## Nota de Posicionamento Documental

Este documento não nasce em um vácuo de governança — ele preenche uma lacuna já nomeada e deliberadamente deixada em aberto por uma decisão anterior. `docs/implementation/REPOSITORY_DECISIONS.md`, Decisão 003 ("Legacy Application Strategy", Approved, 2026-07-22), já decidiu que `platform/` é o destino arquitetural oficial de todo novo desenvolvimento e que `src/` permanece como aplicação legada até uma "migração incremental — fora do escopo deste Repository Cleanup." Aquela mesma Decisão registra, textualmente: "o planejamento da migração incremental de `src/` para `platform/` é matéria de um documento de implementação futuro." Este é esse documento.

A leitura obrigatória desta Sprint, cruzada com uma auditoria direta do código real (não apenas da documentação), revelou um quadro mais complexo do que qualquer Sprint anterior havia registrado, e três achados precisam ser ditos antes de qualquer inventário técnico.

**Primeiro achado — a premissa numérica da Decisão 003 já está desatualizada.** Aquela decisão comparou 184 arquivos em `src/` contra 5 em `platform/apps/web/src/` para concluir que `platform/` não tinha maturidade suficiente para receber migração imediata — uma conclusão correta no momento em que foi tomada. Desde então, no entanto, a Sprint 32/33/33A adicionou uma aplicação de CRM inteira, um design-system próprio e um Dashboard funcional inteiramente dentro de `src/app/`, exatamente a árvore que a Decisão 003 já havia declarado "sem receber novo desenvolvimento." A assimetria entre as duas árvores não diminuiu desde a Decisão 003 — **aumentou**. Este é o risco arquitetural mais importante que este documento registra, e é tratado com profundidade no Capítulo 12.

**Segundo achado — existem três vocabulários de CRM coexistindo, não dois.** Toda Sprint anterior desta série (`CRM_HUB_ARCHITECTURE.md`, `ARCHITECTURE_RECONCILIATION_AND_GOVERNANCE.md`) registrou uma divergência de dois nomes — Blueprint Frozen (`Organization`/`Opportunity`/`Timeline Event`) versus implementação real (`Company`/`Deal`/`HistoryEntry`). A auditoria de código desta Sprint encontrou uma terceira árvore, `src/core/crm/`, remanescente da aplicação legada "Andreia AI Platform", com uma terceira nomenclatura ainda (`Customer`/`Interaction`/`Opportunity`) — e uma quarta referência, `platform/packages/crm-hub/`, já com esqueletos de tipo que usam exatamente o vocabulário do Blueprint (`Organization.ts`, `Opportunity.ts`, `TimelineEvent.ts`), mas sem nenhuma implementação de runtime por trás. Isso muda a tabela de renomeação do Capítulo 18 de um mapeamento de dois lados para um de quatro.

**Terceiro achado — existe um segundo sistema de IA legado, tão maduro quanto o de CRM, e igualmente desconectado da arquitetura documentada.** `src/core/ai/`, `src/core/prompt/`, `src/core/memory/`, `src/core/knowledge/`, `src/core/orchestrator/` e `src/providers/` já implementam, em código real, um AI Gateway multi-provedor, um sistema de Prompt versionado, memória e embeddings — um paralelo funcional não trivial ao que `AI_HUB.md` (Frozen) e `AI_HUB_ARCHITECTURE.md` (Draft) descrevem, com vocabulário e fronteiras de pacote completamente diferentes, e sem nenhuma importação cruzada com o que já está documentado. Este documento trata essa descoberta como um segundo domínio de migração, de mesma prioridade que o CRM, não como um detalhe secundário.

Nenhum código foi alterado para produzir este documento. Nenhuma arquitetura foi redefinida. Nenhum ownership foi alterado. Toda estratégia aqui descrita respeita integralmente `ARCHITECTURE_RECONCILIATION_AND_GOVERNANCE.md` e `IMPLEMENTATION_ROADMAP_MASTER.md`, e não propõe nenhum novo Hub além dos doze já sequenciados.

---

## 1. Introdução

Este documento é a Estratégia Oficial de Migração Técnica da Adaptive Business Platform — a resposta concreta a "como" a implementação real hoje existente evolui até a arquitetura consolidada por BP-001 a BP-010, preservando estabilidade, compatibilidade e continuidade operacional durante todo o percurso.

---

## 2. Objetivos da Migração

Preservar 100% da capacidade já operacional de Dashboard e CRM durante toda a migração. Eliminar a ambiguidade de nomenclatura de CRM, hoje espalhada em quatro vocabulários. Reconciliar o sistema de IA legado com a arquitetura documentada do AI Hub, sem perder a capacidade já funcional de multi-provedor já implementada. Estabelecer `platform/` como destino real, não apenas declarado, de todo novo desenvolvimento, revertendo a tendência observada no Primeiro Achado.

---

## 3. Princípios da Migração

Nenhuma migração de Big Bang — cada domínio migra de forma independente e reversível. Nenhuma capacidade já funcional é descontinuada antes de seu substituto estar operacional e validado. Toda nomenclatura nova segue o vocabulário já fixado pelos Blueprints (Draft) e, onde já reconciliado, pelas decisões de `ARCHITECTURE_RECONCILIATION_AND_GOVERNANCE.md`. Toda decisão de migração é registrada, nunca silenciosa, seguindo o mesmo padrão de `REPOSITORY_DECISIONS.md`.

---

## 4. Estado Atual da Implementação

Duas aplicações React coexistem na raiz do repositório: `src/` (legada, per Decisão 003, mas onde todo o desenvolvimento recente de fato aconteceu) e `platform/apps/web/` (destino oficial declarado, mas hoje um placeholder — seu `ApplicationRouter.tsx` renderiza literalmente `<div>Router</div>`). Dentro de `src/`, coexistem: `src/app/` (CRM e Dashboard funcionais, construídos nas Sprints 32/33/33A), `src/core/` (o runtime completo da "Andreia AI Platform" anterior — agentes, IA, automação, orquestrador, memória, prompt, CRM próprio), `src/modules/` (doze módulos de domínio, majoritariamente stubs vazios), `src/game/` (simulação Phaser 2D de escritório), e `src/design-system/` (biblioteca de componente própria, ativamente usada pelo CRM).

---

## 5. Estado Alvo

Doze Hubs operando sob `platform/`, cada um como pacote pnpm próprio (`platform/packages/{crm,communication,finance,growth,analytics}-hub`, mais os Platform Services e Adaptive Intelligence já esboçados), consumidos por `platform/apps/web`, com nomenclatura convergente com os Blueprints Draft desta série e sem nenhuma dependência cruzada entre pacotes de Business Hub, conforme já declarado em `platform/PACKAGE_STRUCTURE_MANIFEST.md`.

---

## 6. Inventário Técnico Atual

**Aplicação legada (`src/`).** React 19.1, react-router-dom 7.18, Zustand 5.0 (uso mínimo — apenas `src/store/useSquadStore.ts` e `src/core/store/AgentStore.ts`), Phaser 3.90 + Pixi.js 8 (exclusivo de `src/game/`), Vite 6.3, TypeScript 5.8 em modo strict. Nenhum framework de teste configurado — zero `vitest`/`jest`/`@testing-library`/Cypress/Playwright, zero arquivo `*.test.ts(x)` em todo o repositório.

**Workspace alvo (`platform/`).** Monorepo pnpm (`@abp/root`, `pnpm-workspace.yaml`), `platform/apps/web` (`@abp/web`) com React 19 + react-router-dom 7 apenas, e onze pacotes (`core`, `shared`, `platform-services`, `ai`, `ai-agents`, `automation-engine`, `crm-hub`, `communication-hub`, `finance-hub`, `growth-hub`, `analytics-hub`, `infrastructure`, `runtime`) contendo exclusivamente arquivos de tipo/interface — nenhuma lógica de negócio, nenhum componente React, nenhum runtime.

---

## 7. Inventário de Componentes

CRM (`src/app/features/crm/`): 9 entidades de tipo (`Company`, `Client`, `Deal`, `CrmPipelineStage`, `Activity`, `AgendaEvent`, `Tag`, `Note`, `HistoryEntry`), organizadas em `components/` (com subpastas `filters/`, `forms/`, `modals/`, `table/`), `contracts/` (`CrmAiAssist.ts`, `CrmAiExtensionPoints.ts`, `CrmFilters.ts`, `CrmKpis.ts`), `hooks/`, `mocks/`, `pages/`, `services/`, `types/`, `workspace/`. Dashboard (`src/app/features/dashboard/`): `panels/` (Header, Sidebar, Footer, `GlobalNavSidebar`, Content, Grid, Toolbar), `widgets/` (13 pastas, incluindo `AIInsights`, `Pipeline`, `Timeline`, `TopDealsTable`), `controllers/`, `hooks/`, `services/`, `types/`.

---

## 8. Inventário de Módulos

`src/modules/` contém doze pastas de domínio (`academy`, `agenda`, `analytics`, `business`, `communication`, `crm`, `documents`, `fiscal`, `hr`, `marketing`, `marketplace`, `projects`), cada uma com `Events.ts`/`Manager.ts`/`Models.ts`/`Types.ts`, majoritariamente stubs (`export {}` com comentário de placeholder, confirmado em `src/modules/crm/Types.ts`). `src/app/features/` contém, além de CRM e Dashboard, onze pastas de recurso apenas com `README.md` + `index.ts` (`analytics`, `automation`, `business-intelligence`, `campaign`, `execution`, `finance`, `knowledge`, `marketing`, `notifications`, `settings`, `workflow`) — nenhum componente implementado, apenas o esqueleto de rota reservado.

---

## 9. Inventário de Serviços

`CrmMockService` e `CrmKpiService` (CRM, mock local com `setTimeout`, sem chamada de rede real). `src/core/ai/AIGateway.ts`, `AIProviderFactory.ts`, `AIRouter.ts` (legado, funcional). `src/providers/{claude,gemini,openai,mock}/` (legado, implementações reais de provedor). `src/core/orchestrator/AgentOrchestrator.ts` (legado, funcional). Nenhum serviço de backend real foi encontrado em nenhuma das duas árvores — toda persistência hoje é local ou mock.

---

## 10. Inventário de Dependências

Ver Capítulo 6. Adicionalmente: `patch-package` com um patch já aplicado ao Phaser (WebGL RenderTarget, per commit `bd7f63d`). Três lockfiles coexistindo na raiz (`package-lock.json`, `package-lock 2.json`, `pnpm-lock.yaml`) — já endereçado por `REPOSITORY_DECISIONS.md`, Decisão 001 (pnpm adotado, remoção dos dois lockfiles npm pendente de execução).

---

## 11. Inventário de Código Legado

`src/core/*` (agentes, IA, automação, orquestrador, memória, prompt, conhecimento, CRM próprio, dashboard, dispatcher, execução, finanças, histórico, marketing, catálogo, campanha, simulação) — a totalidade da "Andreia AI Platform" anterior, tracked em git e atualmente com 53 arquivos modificados não commitados. `src/modules/*` — doze stubs de domínio, majoritariamente vazios. `src/game/*` e `src/components/scene/*` — simulação Phaser 2D, com dependência ativa em `package.json` (`phaser`, `@pixi/react`, `pixi.js`). Referências textuais ao nome de produto anterior ("Andreia") em `src/components/StatusBar.tsx`, `src/components/header/Header.tsx`, `src/core/agents/blog/BlogAgent.ts`, `src/core/prompt/PromptManager.ts`, `src/providers/mock/MockAIProvider.ts`.

---

## 12. Divergências entre Código e Arquitetura

**Divergência 1 — nomenclatura de CRM em quatro vocabulários.** Ver Capítulo 18.

**Divergência 2 — sistema de IA legado paralelo ao AI Hub documentado.** `src/core/ai/AIGateway.ts` já implementa um padrão de Gateway/Provider Factory/Router muito próximo, em espírito, ao que `AI_HUB.md` descreve — mas com nomes de classe, fronteiras de pacote e ausência total de Context Manager/Memory Engine formalizados conforme o documento Frozen. Nenhuma linha de `src/core/ai/*` foi escrita a partir de `AI_HUB.md` — são dois sistemas paralelos que descrevem uma ideia semelhante de forma independente.

**Divergência 3 — `platform/` é o destino declarado, mas não o destino real do esforço de engenharia.** Ver Nota de Posicionamento, Primeiro Achado, e Capítulo 25 (risco).

**Divergência 4 — roteamento aponta para um conjunto de páginas diferente do que a feature de CRM expõe.** `src/app/router/routes.tsx` importa páginas de `src/app/pages/Crm*Page.tsx`, não de `src/app/features/crm/pages/*Page.tsx` — um segundo conjunto de arquivos com nomes semelhantes existe na feature, cuja relação com o que está de fato roteado não foi determinada por esta auditoria e precisa de investigação dedicada antes de qualquer migração de rota, per Capítulo 20.

**Divergência 5 — uma camada de adapter paralela ao Event/Command Bus já existe, mas está inerte.** `src/app/integrations/` já define uma camada de contratos, middlewares, pipeline e adapters por módulo (`CrmAdapter`, `FinanceAdapter`, `MarketingAdapter`, etc.), todos estendendo `NotImplementedCoreModuleAdapter` — nenhum chama algo real hoje. Essa camada se sobrepõe, conceitualmente, ao que o Command/Query/Event Bus de `SYSTEM_BLUEPRINT.md` deveria formalizar — candidata a reconciliação, não a duplicação futura.

**Divergência 6 — acoplamento direto entre CRM e Dashboard.** `CrmHome.tsx` importa diretamente `DashboardHeader` e `GlobalNavSidebar` de `@/app/features/dashboard`, violando, em espírito, a regra "nenhum Business Hub depende de outro Business Hub" já declarada em `platform/PACKAGE_STRUCTURE_MANIFEST.md`. Esse chrome compartilhado precisa de uma camada de Shell/Frontend Foundation própria, nunca de uma dependência direta entre dois Hubs de domínio.

Nenhuma dessas seis divergências é corrigida por este documento — todas são registradas para tratamento nas fases correspondentes do Capítulo 33.

---

## 13. Estratégia Geral de Migração

Migração por domínio, seguindo exatamente a mesma ordem de doze fases já definida em `IMPLEMENTATION_ROADMAP_MASTER.md`, com uma adição: cada fase de domínio agora inclui explicitamente um passo de "reconciliação de nomenclatura e de pacote" antes do passo de "nova capacidade", porque a auditoria desta Sprint mostrou que pelo menos dois domínios (CRM e AI) já têm implementação legada divergente a reconciliar, não apenas capacidade nova a construir.

---

## 14. Estratégia Incremental

Toda migração de domínio segue quatro passos, nunca pulados: (1) criar o pacote alvo em `platform/packages/{hub}` com a implementação real, ao lado do esqueleto de tipo já existente; (2) expor o pacote através de um Anti-Corruption Layer consumido por `platform/apps/web`; (3) migrar o tráfego real gradualmente, por Tenant, atrás de Feature Flag; (4) descontinuar o caminho legado somente depois de validação completa em produção.

---

## 15. Estratégia de Compatibilidade

Nenhuma migração de domínio quebra uma capacidade já em uso sem um substituto operacional equivalente já disponível. Especificamente para CRM: nenhum dos quatro vocabulários é removido até que o pacote `platform/packages/crm-hub` tenha implementação de runtime completa e validada, não apenas os esqueletos de tipo já existentes.

---

## 16. Estratégia para Componentes Legados

`src/game/` (Phaser) e a narrativa de "escritório" 2D não têm equivalente em nenhum Blueprint desta série — não há Hub, em nenhum dos doze documentados, que descreva uma simulação visual de agentes como capacidade de negócio. Este documento não recomenda migração desse componente — recomenda decisão explícita de produto sobre se ele permanece como recurso visual do Dashboard ou é descontinuado, fora do escopo arquitetural deste documento. `src/modules/*`, sendo majoritariamente stubs vazios, são candidatos a remoção direta, sem necessidade de migração — não contêm capacidade a preservar.

---

## 17. Estratégia para Refatoração

A única refatoração necessária hoje, fora de nomenclatura, é a resolução da Divergência 4 (duplicação de páginas de CRM) e da Divergência 6 (acoplamento CRM↔Dashboard) — ambas antes do início da migração formal do domínio de CRM para `platform/`, para que o pacote alvo não herde nem a duplicação nem o acoplamento indevido.

---

## 18. Estratégia para Renomeações

| Conceito | Blueprint (Draft/Frozen) | `src/app/features/crm` (real, ativo) | `src/core/crm` (legado, "Andreia") | `platform/packages/crm-hub` (esqueleto, inerte) | Impacto | Prioridade | Estratégia |
|---|---|---|---|---|---|---|---|
| Entidade coletiva | `Organization` | `Company` | `Customer` (com `CustomerService`/`CustomerStore`) | `Organization.ts` | Alto — nome já em URL (`/crm/empresas`), tipo, e três implementações distintas | Crítica | Migrar para `Organization` no pacote alvo, mantendo `Company` como alias de leitura no Anti-Corruption Layer durante a transição |
| Possibilidade de negócio | `Opportunity` | `Deal` | `Opportunity` (já convergente) | `Opportunity.ts` | Alto — legado já usa o nome do Blueprint, app-feature diverge | Crítica | Migrar `Deal` para `Opportunity`; nome do legado já não exige mudança |
| Unidade de linha do tempo | `Timeline Event` | `HistoryEntry` | Não modelado como Entidade própria | `TimelineEvent.ts` | Médio — apenas dois vocabulários reais em conflito | Alta | Migrar `HistoryEntry` para `TimelineEvent` |
| Contato/Cliente | `Contact` (implícito em `Customer`) | `Client` (dual-purpose via `status`) | `Customer` | Não presente nos arquivos auditados | Médio — `Client` cobre dois conceitos que o Blueprint trata como distintos (Contact vs. Customer/Lead) | Alta | Decisão de produto necessária: dividir `Client` em `Contact` + papel de Customer/Lead, ou manter fusão deliberada — não decidido por este documento |
| Etapa de Pipeline | `Stage` | `CrmPipelineStage` (prefixo deliberado) | Não encontrado | `Stage.ts` | Baixo — já isolado deliberadamente do conceito visual `PipelineWidget` do Dashboard | Baixa | Manter `CrmPipelineStage` como nome de implementação; `Stage` permanece o nome conceitual do Blueprint |
| Anotação qualitativa | "Customer Notes"/`Note` | `Note` (já convergente) | Não encontrado | Não presente | Nenhum | — | Nenhuma ação necessária |

Este documento não decide, por si só, qual dos quatro nomes prevalece definitivamente para Organization/Opportunity/Timeline Event — essa decisão permanece o Amendment já recomendado por `ARCHITECTURE_RECONCILIATION_AND_GOVERNANCE.md`, Capítulo 23. O que este documento acrescenta é que a migração técnica para `platform/` é o momento operacionalmente correto para executá-la, porque o pacote alvo (`crm-hub`) ainda não tem runtime — ou seja, nenhum código de produção precisa ser reescrito para adotar o nome certo desde o primeiro commit.

---

## 19. Estratégia para Depreciação

`src/core/crm/`, `src/modules/crm/` e o conjunto de páginas de CRM não referenciado por `routes.tsx` (parte da Divergência 4) são candidatos a depreciação formal — nunca remoção imediata — assim que `platform/packages/crm-hub` estiver operacional e validado em produção, seguindo o mesmo princípio de retenção de `DOCUMENTATION_CONSTITUTION.md`, §8.4, aplicado aqui a código em vez de documento.

---

## 20. Estratégia para Remoção Segura

Nenhum arquivo é removido sem antes: (1) confirmar que nenhuma rota ou componente ativo o importa (repetir a verificação já feita nesta auditoria para `src/modules/crm/`, mas para cada candidato); (2) confirmar que o Git preserva o histórico do arquivo antes da remoção, exatamente como já demonstrado pela metodologia de `REPOSITORY_DECISIONS.md`, Decisão 002, para `backups/`; (3) executar a remoção como commit isolado e dedicado, nunca misturado a uma mudança funcional.

---

## 21. Estratégia para Feature Flags

Toda nova capacidade migrada para `platform/` é lançada atrás de uma Feature Flag por Tenant, mesmo mecanismo nativo já descrito em `SAAS_ARCHITECTURE.md`, Capítulo 10 — nenhuma migração de domínio troca o caminho de produção para 100% dos Tenants antes de validação em um subconjunto reduzido.

---

## 22. Estratégia de Rollback

Toda fase de migração mantém o caminho legado (`src/`) intacto e operacional até que o caminho novo (`platform/`) tenha sido validado — reversão significa apenas desativar a Feature Flag, nunca reverter um commit de exclusão de código ainda em uso. Nenhuma remoção física de código legado (Capítulo 20) acontece antes dessa validação.

---

## 23. Estratégia de Versionamento

Todo pacote de `platform/packages/*` adota versionamento semântico próprio desde o primeiro release funcional, e todo Command/Query/Event que cruza a fronteira de pacote é versionado com a mesma disciplina já exigida por `AI_HUB.md`, ADR-010, e por `BUSINESS_HUB_ARCHITECTURE.md`, princípio Backward Compatibility.

---

## 24. Estratégia de Testes

**Estado real, não presumido**: esta auditoria confirma zero framework de teste configurado e zero arquivo de teste em todo o repositório, em ambas as árvores. Isso significa que a estratégia de testes não é "manter cobertura existente" — é estabelecer uma linha de base pela primeira vez. Recomenda-se que a primeira migração de domínio (CRM, per `IMPLEMENTATION_ROADMAP_MASTER.md`, Fase 4) inclua a introdução do framework de teste escolhido como parte de seu próprio escopo, nunca como um item adiado para depois — nenhuma outra fase deveria repetir a decisão de ferramenta de teste individualmente.

---

## 25. Estratégia de Validação

Todo domínio migrado é validado contra o Blueprint correspondente antes de qualquer rollout — em particular, contra a tabela de renomeação (Capítulo 18) para CRM, e contra os ADRs de `AI_HUB_ARCHITECTURE.md` (em especial ADR-AH-002, Tool nunca acessa dado de negócio diretamente) para o domínio de IA, já que o sistema legado (`src/core/ai/*`) hoje não segue esse contrato por não ter sido escrito a partir dele.

---

## 26. Estratégia de Observabilidade

Nenhuma observabilidade automatizada foi encontrada em nenhuma das duas árvores além de comentários de código. Toda nova capacidade migrada para `platform/` adota, desde o primeiro commit, o esquema de Logging/Tracing/Metrics já descrito em `SYSTEM_BLUEPRINT.md`, e, para o domínio de IA especificamente, o esquema de Trace/Span já Official de `AI_OBSERVABILITY.md` (Volume II) — nunca o padrão de log ad hoc hoje presente no sistema de IA legado.

---

## 27. Estratégia para Dados

Toda persistência hoje é mock ou local (React state/local collection) — não existe schema de banco de dados real a migrar. Isso reduz drasticamente o risco de migração de dado desta Sprint em comparação com uma plataforma já em produção com dado real: a "migração de dado" de CRM, nesta fase, é uma migração de forma (nome de campo, nome de tipo), nunca de conteúdo já persistido.

---

## 28. Estratégia para APIs

Nenhuma API HTTP real foi encontrada em nenhuma das duas árvores — toda comunicação hoje é local ao processo (mock services, hooks). A migração para `platform/` é o primeiro momento em que uma fronteira de API real entre pacotes precisa ser desenhada, e deve seguir exatamente o contrato de Command/Query já formalizado em cada Blueprint, nunca uma REST API ad hoc definida durante a própria migração.

---

## 29. Estratégia para Eventos

O `EventBus`/`EventTypes` já existente em `src/core/events/` é o único barramento de evento real encontrado no repositório hoje — mas pertence à árvore legada e não é consumido por `src/app/features/crm`. A migração para `platform/` deve decidir explicitamente se esse Event Bus legado é promovido, estendido, ou substituído por uma nova implementação alinhada a `SYSTEM_BLUEPRINT.md` — decisão de implementação, fora do escopo arquitetural deste documento, mas registrada aqui como necessária antes do início da Fase 1 de `IMPLEMENTATION_ROADMAP_MASTER.md`.

---

## 30. Estratégia de Deploy

Nenhuma mudança de infraestrutura de deploy é proposta por este documento. Recomenda-se que `platform/apps/web` receba seu próprio pipeline de build e deploy independente de `src/`, para que a validação incremental de cada domínio migrado (Capítulo 14) não dependa do build da aplicação legada.

---

## 31. Gestão de Riscos

| Risco | Categoria | Impacto | Probabilidade | Mitigação | Contingência |
|---|---|---|---|---|---|
| `platform/` continua recebendo zero desenvolvimento real, ampliando ainda mais a assimetria já observada | Governança/Arquitetural | Crítico | Alta — já em curso, per Primeiro Achado | Tratar este documento como mandato ativo, não apenas registro; primeira fase de código deve ir para `platform/`, não para `src/` | Reavaliação formal de Decisão 003 se a assimetria continuar crescendo por mais um ciclo de Sprints |
| Quatro vocabulários de CRM colidindo em uma futura API pública | Nomenclatura | Alto | Média | Amendment de nomenclatura decidido antes do início da migração de CRM (Capítulo 18) | Anti-Corruption Layer com alias temporário durante a transição |
| Sistema de IA legado nunca reconciliado, dois sistemas de IA mantidos indefinidamente | Arquitetural | Alto | Média | Tratar migração de IA como domínio de mesma prioridade que CRM, não como faseamento tardio | Descontinuação formal do legado após validação completa do novo AI Hub |
| Regressão de rota por causa da Divergência 4 (páginas duplicadas) | Técnico | Médio | Média | Investigação dedicada antes de qualquer migração de rota de CRM | Rollback de Feature Flag imediato se regressão for detectada |
| Nenhuma cobertura de teste para validar equivalência funcional durante a migração | Operacional | Alto | Alta — já confirmado, zero teste hoje | Introduzir framework de teste como parte da primeira fase de migração (Capítulo 24) | Validação manual documentada como paliativo temporário, nunca permanente |
| Três lockfiles ainda não limpos podem produzir instalação divergente durante a migração | Dependências | Médio | Baixa — decisão já tomada (Decisão 001), execução pendente | Executar a remoção dos dois lockfiles npm antes do início de qualquer nova Sprint técnica | Reinstalação limpa via pnpm se divergência for detectada |
| Trabalho não commitado (a maior parte de `src/app` e todo `platform/`) perdido antes da migração começar | Operacional | Crítico | Baixa, mas consequência irreversível se ocorrer | Commit de todo o trabalho untracked relevante antes de qualquer nova Sprint técnica | Nenhuma — perda de trabalho não commitado não é recuperável |
| Acoplamento CRM↔Dashboard (Divergência 6) migrado sem resolução, propagando a violação de isolamento de Hub para `platform/` | Arquitetural | Médio | Média | Resolver via camada de Shell/Frontend Foundation antes da migração de CRM | Aceitar a violação temporariamente, documentada como exceção registrada, nunca silenciosa |
| Documentação (`DOCUMENTATION_INDEX.md`) permanece desatualizada durante a execução da migração | Documental | Baixo | Alta — já confirmado por `ARCHITECTURE_RECONCILIATION_AND_GOVERNANCE.md` | Atualizar o Índice a cada fase de migração concluída | Auditoria documental periódica independente do ritmo de código |

---

## 32. Plano de Mitigação

Para o risco Crítico de maior probabilidade (assimetria `platform/`/`src/` crescente), a mitigação recomendada é imediata e não-técnica: toda próxima unidade de trabalho de implementação, sem exceção, deve começar em `platform/packages/*` ou `platform/apps/web`, nunca em `src/app/features/*`, revertendo o padrão observado desde a Decisão 003. Para o risco de perda de trabalho não commitado, a mitigação é um commit dedicado, antes de qualquer outra ação técnica desta migração, cobrindo `src/app/**`, `platform/**` e o restante do trabalho untracked relevante.

---

## 33. Roadmap de Migração

Segue integralmente a ordem de doze fases já definida em `IMPLEMENTATION_ROADMAP_MASTER.md`, com dois ajustes registrados por esta Sprint: a Fase 4 (CRM) agora inclui explicitamente a reconciliação dos quatro vocabulários (Capítulo 18) como pré-requisito de saída, não apenas dos dois já conhecidos; e a Fase 10 (AI) agora inclui explicitamente a reconciliação com o sistema de IA legado (`src/core/ai/*` e correlatos) como parte de seu escopo, um item que `IMPLEMENTATION_ROADMAP_MASTER.md` não conhecia no momento em que foi escrito, por não ter sido produto de auditoria de código.

---

## 34. Marcos Técnicos

Marco T1 — commit de segurança de todo trabalho não versionado (pré-condição de qualquer marco seguinte). Marco T2 — primeiro pacote `platform/packages/crm-hub` com runtime real, nomenclatura reconciliada, substituindo os quatro vocabulários por um só. Marco T3 — primeiro fluxo de CRM em produção servido inteiramente por `platform/`, com `src/app/features/crm` mantido apenas como fallback atrás de Feature Flag. Marco T4 — sistema de IA legado formalmente reconciliado ou depreciado em favor do AI Hub documentado. Marco T5 — `src/` formalmente descontinuado, com todo Tenant migrado para `platform/`.

---

## 35. Critérios de Migração

Um domínio só migra quando: seu Blueprint correspondente já existe (satisfeito para os doze Hubs, per `IMPLEMENTATION_ROADMAP_MASTER.md`); sua tabela de renomeação, quando aplicável, já foi decidida ou ao menos formalmente encaminhada; e o pacote alvo em `platform/` já tem, no mínimo, o esqueleto de tipo correspondente — já satisfeito para CRM e para os componentes de IA, per este documento, Capítulo 6.

---

## 36. Checklists

**Início da migração (geral).** Commit de segurança executado (Marco T1). Framework de teste escolhido. Lockfiles duplicados removidos (Decisão 001 executada). Decisão de nomenclatura relevante ao domínio ao menos formalmente encaminhada.

**Migração de um Hub.** Blueprint lido pela equipe. Pacote `platform/packages/{hub}` criado ou já existente confirmado. Anti-Corruption Layer definido. Feature Flag configurada. Testes de equivalência funcional escritos antes da virada de tráfego.

**Validação.** Toda Query/Command do Blueprint correspondente exercitada por teste automatizado. Toda nomenclatura em conformidade com a tabela de renomeação decidida. Nenhuma regressão detectada em fluxo já existente (ex.: rotas de CRM já em uso).

**Homologação.** Fluxo completo validado em subconjunto reduzido de Tenants. Observabilidade (Capítulo 26) confirmando latência e taxa de erro dentro do esperado.

**Rollout.** Feature Flag expandida gradualmente até 100% dos Tenants, nunca de uma vez. Nenhuma remoção de caminho legado antes deste passo estar completo.

**Encerramento.** Caminho legado depreciado formalmente (Capítulo 19), nunca removido no mesmo commit do rollout. Documentação de status atualizada.

**Descontinuação do legado.** Confirmação de que nenhuma rota, componente ou Tenant ainda depende do caminho legado. Remoção executada como commit isolado (Capítulo 20). Histórico preservado via Git, mesma metodologia já demonstrada por `REPOSITORY_DECISIONS.md`, Decisão 002.

---

## 37. Recomendações Técnicas

Executar o commit de segurança (Marco T1) antes de qualquer outra ação — é o único risco desta lista cuja consequência, se materializada, é irreversível. Tratar a reversão da tendência `src/`↔`platform/` (Capítulo 32) como prioridade de gestão de engenharia, não apenas de arquitetura — nenhuma quantidade de documentação impede que a próxima Sprint de código repita o mesmo padrão observado desde a Decisão 003 se isso não for ativamente monitorado. Investigar a Divergência 4 (páginas duplicadas de CRM) antes de qualquer trabalho de migração daquele domínio começar.

---

## 38. Próximos Passos

Aprovar este documento como estratégia de migração de referência. Executar o commit de segurança (Marco T1). Iniciar a Fase 1 de `IMPLEMENTATION_ROADMAP_MASTER.md` já dentro de `platform/`, nunca dentro de `src/`.

---

## 39. Conclusão

A arquitetura já estava pronta antes desta Sprint — nove documentos já a haviam definido, sequenciado e reconciliado. O que faltava, e o que a auditoria de código desta Sprint acrescentou, foi a verdade sobre onde a implementação real está hoje: mais distante do destino declarado do que a última decisão de governança presumia, com um terceiro e um quarto vocabulário de CRM que nenhum documento anterior sabia existir, e com um segundo sistema de IA inteiro, funcional e órfão, ao lado de uma arquitetura de IA já cuidadosamente documentada que ainda não tem uma linha de implementação real. Nenhum desses três fatos é motivo para recomeçar — são exatamente o tipo de descoberta que uma estratégia de migração honesta precisa fazer antes de propor uma data, e é isso, mais do que qualquer roadmap de fases, que este documento entrega.
