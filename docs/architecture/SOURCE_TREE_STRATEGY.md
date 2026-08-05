# Source Tree Strategy — src/ → platform/

**Adaptive Business Platform · Documento de Arquitetura (Draft)**

---

## Nota de Posicionamento Documental

Este documento decide o papel de duas árvores de código que já foram objeto de decisão anterior — `REPOSITORY_DECISIONS.md`, Decisão 003 — e de auditoria anterior — `TECHNICAL_MIGRATION_STRATEGY.md`, Capítulo 12. Nenhuma das duas está errada; ambas descreveram corretamente o que viram no momento em que foram escritas. O que esta Sprint acrescenta é uma auditoria de conteúdo, não apenas de nome de arquivo ou de contagem de arquivo — leitura real de amostras de código de ambas as árvores e de uma amostra representativa dos mais de 270 documentos de `docs/implementation/` — e essa auditoria revela um quadro mais preciso e, em um ponto central, diferente do que a Decisão 003 e o `TECHNICAL_MIGRATION_STRATEGY.md` presumiam.

**Primeiro achado — `src/core/` não é uma pilha legada uniforme.** A ST-001/BP-011 já haviam registrado a existência de um "sistema de IA legado" funcional dentro de `src/core/ai`, `prompt`, `memory`, `orchestrator`. A auditoria desta Sprint confirma isso e o estende: de 28 subdiretórios em `src/core/`, ao menos 21 (`agents`, `ai`, `analytics`, `automations` no plural, `business-intelligence`, `campaign`, `catalog`, `crm`, `dashboard`, `execution`, `execution-engine`, `execution-scheduling`, `finance`, `knowledge`, `marketing`, `memory`, `notifications`, `orchestrator`, `pipeline`, `prompt`, `workflow`) contêm lógica real e funcional — Managers com corpo de método real, emissão de evento, tratamento de erro — não apenas contrato. Apenas quatro (`automation` no singular, `platform`, `connectors`, `bootstrap`) são scaffolding de marcador vazio, com comentário explícito "sem implementação nesta etapa." Isto muda a natureza da decisão: `src/core` não é lixo a descartar, é um sistema funcional a avaliar linha a linha para reaproveitamento.

**Segundo achado — `platform/packages/*` é, hoje, 100% contrato de tipo, com uma única exceção trivial.** Uma varredura completa por classe, função e componente React em toda a árvore `platform/packages/` encontrou zero classes, zero componentes React, e exatamente uma função executável (`isDefined`, um type guard de uma linha) em 405 arquivos de código-fonte. Isto confirma, com evidência direta e quantificada, o que `TECHNICAL_MIGRATION_STRATEGY.md` já suspeitava por amostragem.

**Terceiro achado — o mais relevante para a governança desta decisão.** Toda a árvore `platform/` e todo o corpo de mais de 270 documentos em `docs/implementation/` entraram no histórico deste repositório em um único commit (`a52573f`, o commit de segurança da ST-001) — não existe, neste repositório, nenhum histórico incremental mostrando `platform/` sendo construído Sprint a Sprint, apesar de a documentação interna narrar exatamente essa progressão ("Sprint 1", "Sprint 5.1", Gates G0-G2). Em contraste, `src/` tem um histórico real, ainda que enxuto, de commits de trabalho genuíno, com arquivos modificados ao longo de várias semanas, incluindo depois da própria Decisão 003 que deveria ter interrompido esse desenvolvimento. Este documento não questiona a validade do conteúdo de `docs/implementation/` — a amostra lida é honesta e tecnicamente precisa sobre seus próprios limites (mais adiante, Capítulo 4) — mas trata a ausência de histórico incremental como um fato relevante para calibrar a confiança que se deposita na maturidade declarada de `platform/`.

Nenhum arquivo foi movido, renomeado, copiado ou apagado para produzir este documento. Nenhuma arquitetura, Blueprint, Hub, ou ownership foi alterado.

---

## 1. Introdução

Este documento é a Estratégia Oficial de Organização das Árvores de Código da Adaptive Business Platform. Ele decide, com base em auditoria de conteúdo real e não apenas de estrutura declarada, o papel presente e futuro de `src/` e de `platform/`, os critérios que determinam quando um domínio pode migrar de uma para a outra, e o que precisa acontecer antes que essa migração comece.

---

## 2. Objetivos

Substituir a presunção da Decisão 003 — de que `platform/` já era o destino natural por ser mais alinhado à arquitetura — por uma avaliação baseada em evidência de conteúdo real. Determinar, para cada domínio de negócio, se o caminho correto é migrar lógica já existente de `src/core` para `platform/packages/*`, ou implementar do zero diretamente em `platform/`. Estabelecer o gatilho concreto que autoriza o início da migração física de código, ainda não executada por nenhuma Sprint até agora.

---

## 3. Contexto Histórico

`REPOSITORY_DECISIONS.md`, Decisão 003 (Approved, 22/07), comparou 184 arquivos em `src/` contra 5 em `platform/apps/web/src/` para declarar `platform/` o destino oficial de todo novo desenvolvimento. `src/` tem hoje 949 arquivos — mais de cinco vezes o tamanho registrado na decisão — e a quase totalidade desse crescimento aconteceu exatamente nas áreas que a decisão determinou que não deveriam mais receber trabalho novo (`src/app`, `src/core`, `src/modules`, `src/providers`, `src/design-system`). `TECHNICAL_MIGRATION_STRATEGY.md` (BP-011) já havia identificado essa inversão como o maior risco de governança da plataforma. Esta Sprint confirma que a inversão continuou, e acrescenta a auditoria de conteúdo que faltava para decidir o que fazer a respeito, em vez de apenas registrar o problema outra vez.

---

## 4. Estado Atual

`src/` é a única árvore com aplicação real em execução — CRM e Dashboard funcionais, construídos sobre `src/app/`, mais um subsistema inteiro de IA, CRM, Finance, Marketing, Automação, Conhecimento, Memória e Prompt já funcionando dentro de `src/core/`, embora nunca ligado à documentação de arquitetura desta série. `platform/` é a árvore declarada oficial, com contratos de tipo extensos e bem alinhados a `DOMAIN_OWNERSHIP_MATRIX.md` e aos Blueprints — `platform/packages/crm-hub`, por exemplo, já nomeia `Organization`, `Opportunity` e `TimelineEvent` exatamente como o Blueprint Frozen exige — mas sem nenhuma linha de lógica de negócio executável. A documentação de `docs/implementation/` que acompanha `platform/` é volumosa, tecnicamente cuidadosa, e honesta sobre seus próprios limites — mas sua origem, neste repositório, é um único commit em massa, não uma progressão incremental verificável.

---

## 5. Inventário de src/

| Diretório | Arquivos | Classificação |
|---|---|---|
| `src/app/` | 376 | **Aderente à arquitetura** (CRM/Dashboard já documentados por `CRM_HUB_ARCHITECTURE.md`) — candidato à migração |
| `src/core/{agents,ai,analytics,automations,business-intelligence,campaign,catalog,crm,dashboard,execution*,finance,knowledge,marketing,memory,notifications,orchestrator,pipeline,prompt,workflow}` | ~300 | **Legado funcional, parcialmente aderente** — lógica real, vocabulário divergente do Blueprint (ver `TECHNICAL_MIGRATION_STRATEGY.md`, Capítulo 18) — candidato à migração de lógica, não descarte |
| `src/core/{automation (singular), platform, connectors, bootstrap}` | ~37 | **Scaffold nunca concluído** — marcadores vazios, nenhuma lógica — candidato à substituição direta, sem valor de reaproveitamento |
| `src/design-system/` | 86 | **Reutilizável**, ativamente consumido por `src/app` — candidato à migração como Frontend Foundation, per `FRONTEND_FOUNDATION.md` |
| `src/modules/` | 61 | **Stub puro** (`export {}`), doze pastas — candidato à substituição, sem valor de reaproveitamento |
| `src/providers/` | 9 | **Legado funcional** — implementações reais de OpenAI/Claude/Gemini/mock — candidato à migração para o pacote `ai` de `platform/` |
| `src/components/`, `src/game/` | 37 | **Experimental/produto**, sem Blueprint correspondente — decisão de produto pendente, não migração técnica |
| `src/shared/`, `src/layout/`, `src/config/`, `src/lib/`, `src/hooks/`, `src/pages/`, `src/plugin/`, `src/store/`, `src/styles/`, `src/types/` | ~19 | **Reutilizável ou thin**, majoritariamente infraestrutura de app — avaliar individualmente na migração de `src/app` |

---

## 6. Inventário de platform/

| Pacote | Arquivos | Existe apenas estrutura? | Existe implementação? | Existe contrato? | Existe domínio? | Scaffold puro? |
|---|---|---|---|---|---|---|
| `core` | 7 | Sim | Não | Sim (Command/Event/Query/Ownership) | Não (transversal) | Sim |
| `shared` | 8 | Sim | 1 função trivial | Sim (Logger/Configuration) | Não (transversal) | Quase |
| `platform-services` | 22 | Sim | Não | Sim | Não (transversal) | Sim |
| `ai` | 104 (maior pacote) | Sim | Não | Sim (Agent/Context/Governance/Memory/MultiAgent/Observability/Planning/Reasoning/Skill/Tool) | Sim (vocabulário do Volume II) | Sim |
| `ai-agents` | 8 | Sim | Não | Sim | Sim | Sim |
| `crm-hub` | 31 | Sim | Não | Sim (nomenclatura já convergente com o Blueprint Frozen) | Sim | Sim |
| `communication-hub` | 27 | Sim | Não | Sim | Sim | Sim |
| `finance-hub` | 34 | Sim | Não | Sim | Sim | Sim |
| `growth-hub` | 39 | Sim | Não | Sim | Sim | Sim |
| `analytics-hub` | 36 | Sim | Não | Sim | Sim | Sim |
| `automation-engine` | 36 | Sim | Não | Sim | Sim | Sim |
| `infrastructure` | 16 | Sim | Não | Sim | Não (transversal) | Sim |
| `runtime` | 11 | Sim | Não | Sim | Não (transversal) | Sim |
| `apps/web` | 9 | Sim | Não (placeholder) | — | — | Sim |

Nenhum pacote de `platform/packages/*` contém implementação de runtime. Todos têm contrato de tipo bem definido e, para os cinco Business Hubs, nomenclatura já convergente com os Blueprints Draft/Frozen desta série — um ativo real, mesmo sem código executável por trás.

---

## 7. Comparação entre Árvores

**Duplicado entre as duas árvores:** CRM (real em `src/core/crm` e em `src/app/features/crm`; contrato em `platform/packages/crm-hub`), IA/Agente (real em `src/core/{ai,agents,orchestrator,prompt,memory}` e em `src/providers`; contrato em `platform/packages/ai` e `ai-agents`), Finance, Marketing/Growth, Automação — todos existem como lógica real em `src/core` e como contrato puro em `platform/packages/*`.

**Existe apenas em `src/`:** a aplicação funcional inteira (Dashboard, CRM operacional), o design-system, a simulação Phaser, os provedores de IA reais conectados a API externa.

**Existe apenas em `platform/`:** nada de funcional — apenas o contrato de tipo já alinhado ao vocabulário correto do Blueprint, que `src/core` não possui (`src/core/crm` usa `Customer`/`Interaction`/`Opportunity`, divergente tanto do Blueprint quanto de `src/app/features/crm`, per `TECHNICAL_MIGRATION_STRATEGY.md`, Capítulo 18).

**Deverão coexistir durante a migração:** ambas, por tempo determinado pelos critérios do Capítulo 11.

**Deverão desaparecer futuramente:** `src/core/{automation singular, platform, connectors, bootstrap}` (scaffold vazio, sem lógica a preservar), `src/modules/*` (stub puro), e, uma vez migrada a lógica real de negócio para `platform/packages/*`, o restante de `src/core`.

---

## 8. Responsabilidades Oficiais

**`platform/` é, e permanece, o destino arquitetural oficial** — decisão da Decisão 003 que este documento não reverte. O que este documento acrescenta é que essa oficialidade hoje descreve apenas a camada de contrato, não a de implementação — `platform/` é o destino correto para onde a lógica de negócio de `src/core` deve migrar, não um substituto já pronto para ela.

**`src/` permanece a única aplicação operacional** durante todo o período de coexistência — nenhuma capacidade já funcional (Dashboard, CRM, o subsistema de IA de `src/core`) é descontinuada antes de seu equivalente em `platform/` estar implementado e validado.

**Nenhum diretório é fonte de verdade para nomenclatura** — per `TECHNICAL_MIGRATION_STRATEGY.md`, Capítulo 18, a nomenclatura definitiva é a que resultar do Amendment de `CRM_DOMAIN_BLUEPRINT.md` já recomendado por `ARCHITECTURE_RECONCILIATION_AND_GOVERNANCE.md`, aplicada tanto à lógica migrada de `src/core/crm` quanto ao contrato já existente em `platform/packages/crm-hub`.

---

## 9. Estratégia de Coexistência

Desenvolvimento permitido em `src/`: correção de defeito crítico em capacidade já em produção (Dashboard, CRM operacional); nenhuma nova funcionalidade. Desenvolvimento permitido em `platform/`: toda nova capacidade, toda implementação de lógica de negócio sobre os contratos já existentes, toda migração de lógica de `src/core`. Nenhum novo módulo nasce em `src/` a partir desta Sprint — regra já declarada pela Decisão 003, reafirmada aqui com a evidência de que sua violação já custou cinco vezes o tamanho original da árvore que deveria ter parado de crescer.

---

## 10. Estratégia de Migração

Migração por domínio, não por arquivo — cada domínio (CRM, Finance, Marketing, IA) migra como unidade, seguindo a ordem já definida em `IMPLEMENTATION_ROADMAP_MASTER.md`. Para cada domínio, a lógica real já existente em `src/core/{domínio}` é lida, avaliada, e portada para `platform/packages/{domínio}-hub` como implementação sobre o contrato de tipo já existente — nunca reescrita do zero quando lógica funcional equivalente já existe, per o princípio de Reutilização já estabelecido em `SYSTEM_BLUEPRINT.md`, Capítulo 17. Nomenclatura é corrigida durante essa migração, nunca antes nem depois, seguindo a tabela de renomeação já proposta por `TECHNICAL_MIGRATION_STRATEGY.md`, Capítulo 18.

---

## 11. Critérios para Migração

Um domínio pode migrar quando: (1) seu Blueprint já existe, Draft ou superior; (2) o pacote de destino em `platform/packages/*` já tem contrato de tipo estável; (3) a lógica real equivalente em `src/core`, quando existente, já foi lida e mapeada para o novo contrato; (4) existe teste automatizado mínimo cobrindo o comportamento a ser preservado — lacuna já confirmada como zero por `TECHNICAL_MIGRATION_STRATEGY.md`, Capítulo 24, e portanto pré-requisito, não suposição, para a primeira migração de domínio.

---

## 12. Critérios para Encerramento de src/

`src/` é formalmente encerrado, domínio a domínio, quando: nenhuma rota ou componente de `src/app` ainda depende do equivalente em `src/core` ou `src/modules` para aquele domínio; o pacote correspondente em `platform/packages/*` está implementado, testado e validado em produção sob um subconjunto de Tenants; e a nomenclatura está integralmente convergente com a decisão de Amendment já recomendada. O encerramento total de `src/` — não apenas por domínio — acontece somente quando todos os doze Hubs de `IMPLEMENTATION_ROADMAP_MASTER.md` tiverem migrado, e é, nesse momento, um evento de depreciação formal, per `IMPLEMENTATION_GOVERNANCE.md`, Capítulo 19, nunca uma remoção abrupta.

---

## 13. Gestão de Riscos

| Risco | Impacto | Probabilidade | Mitigação | Contingência |
|---|---|---|---|---|
| Nova funcionalidade continuar nascendo em `src/`, repetindo o padrão já observado desde a Decisão 003 | Crítico | Alta, já em curso | Este documento formaliza `platform/` como único destino de código novo a partir de agora; `IMPLEMENTATION_GOVERNANCE.md` já trata isso como item de Débito Técnico monitorado | Reavaliação formal se o padrão persistir por mais um ciclo |
| Lógica real de `src/core` ser descartada em vez de migrada, por presunção de que "tudo em `src/` é legado" | Alto | Média — presunção já presente na Decisão 003 original | Este documento corrige essa presunção explicitamente (Nota de Posicionamento, Primeiro Achado) | Nenhuma — é o próprio objeto desta correção |
| Confiança excessiva na maturidade de `platform/` por causa do volume de documentação de `docs/implementation/`, sem histórico incremental verificável | Médio | Média | Tratar toda validação daquele corpo como validação de contrato, nunca de capacidade funcional, até que `platform/` produza seu próprio histórico incremental de implementação real | Auditoria de código, não apenas documental, antes de qualquer decisão de promoção de status |
| Três vocabulários de CRM (Blueprint, `src/app`, `src/core`) convergindo de forma inconsistente durante a migração | Alto | Média | Amendment de nomenclatura decidido antes da Fase 4 de `IMPLEMENTATION_ROADMAP_MASTER.md`, per `TECHNICAL_MIGRATION_STRATEGY.md` | Anti-Corruption Layer temporário |
| Ausência de teste automatizado tornando a equivalência funcional entre `src/core` e `platform/packages/*` não verificável | Alto | Alta, já confirmado | Framework de teste introduzido como parte da primeira migração de domínio, per `TECHNICAL_MIGRATION_STRATEGY.md`, Capítulo 24 | Validação manual documentada como paliativo temporário |

---

## 14. Matriz de Decisão

| Domínio | Estado Atual | Destino | Estratégia | Prioridade | Dependências |
|---|---|---|---|---|---|
| CRM | Real em `src/core/crm` e `src/app/features/crm`; contrato em `platform/packages/crm-hub` | `platform/packages/crm-hub` | Migrar lógica de `src/app/features/crm` (mais próxima do Blueprint) como base, reconciliar nomenclatura | Crítica | Amendment de nomenclatura (Fase 4) |
| IA/Provider | Real em `src/core/{ai,prompt,memory,orchestrator,agents}` e `src/providers` | `platform/packages/ai`, `ai-agents` | Migrar Provider Layer e Prompt Manager como base funcional; reconciliar com `AGENT_FRAMEWORK.md` | Alta | Reconciliação das três definições de Agent |
| Finance | Real em `src/core/finance` | `platform/packages/finance-hub` | Migrar lógica existente | Crítica (dependência de Commerce) | Fase Commerce concorrente |
| Marketing/Growth | Real em `src/core/marketing`, `campaign` | `platform/packages/growth-hub` | Migrar lógica existente | Média | Fase CRM e Conversation concluídas |
| Automação | Real em `src/core/automations` (plural); scaffold vazio em `automation` (singular) | `platform/packages/automation-engine` | Migrar apenas a versão real (plural); descartar o scaffold singular | Média | — |
| Comunicação | Não identificado como pasta própria em `src/core` — parcialmente coberto por `notifications` | `platform/packages/communication-hub` | Avaliar se `notifications` cobre parte do escopo antes de implementar do zero | Alta | Fase CRM |
| Analytics | Real em `src/core/analytics`, `business-intelligence` | `platform/packages/analytics-hub` | Migrar lógica existente | Alta | Todas as fases anteriores (parcial) |
| Business Structure | Não existe em nenhuma das duas árvores | `platform/` (pacote a criar) | Implementar do zero sobre `BUSINESS_STRUCTURE_HUB_ARCHITECTURE.md` | Alta | Identity |
| Content | Não existe em nenhuma das duas árvores | `platform/` (pacote a criar) | Implementar do zero | Média | Identity |
| Commerce | Não existe em nenhuma das duas árvores | `platform/` (pacote a criar) | Implementar do zero | Média | Finance |
| Design System | Real e maduro em `src/design-system` | `platform/` (Frontend Foundation) | Migrar integralmente, sem reescrita — já reutilizável | Alta | Nenhuma |
| Dashboard/App | Real e funcional em `src/app` | `platform/apps/web` | Migrar por último, quando os Hubs consumidos já estiverem em `platform/` | Crítica, mas sequenciada por último | Todos os Hubs consumidos |

---

## 15. Recomendações

**O projeto não deve continuar desenvolvendo novas funcionalidades em `src/`** — esta regra já existe desde a Decisão 003 e é reafirmada aqui com evidência quantificada de seu próprio descumprimento. **A migração física não deve começar imediatamente** — `platform/` carece de qualquer implementação de runtime, e migrar um domínio inteiro hoje significaria reescrever do zero o que já existe funcionalmente em `src/core`, desperdiçando um ativo real. **`platform/` não está madura para receber tráfego de produção** — está madura em contrato, não em capacidade. **É necessário fortalecer `platform/` antes da migração física**, mas "fortalecer" aqui significa portar a lógica real já existente em `src/core` para dentro dos contratos já bem desenhados de `platform/packages/*` — não escrever documentação adicional, da qual já existe volume mais do que suficiente, e não reescrever do zero o que a auditoria desta Sprint já confirma que funciona.

---

## 16. Próximos Passos

Aprovar este documento como estratégia oficial de árvore de código, substituindo a presunção original — não a decisão — da Decisão 003. Iniciar a migração de domínio pela Fase 4 (CRM) de `IMPLEMENTATION_ROADMAP_MASTER.md`, com a lógica real de `src/app/features/crm` como base funcional preferencial (mais próxima da nomenclatura do Blueprint que `src/core/crm`), sobre o contrato já existente em `platform/packages/crm-hub`. Introduzir o framework de teste antes dessa primeira migração, conforme já recomendado por `TECHNICAL_MIGRATION_STRATEGY.md`.

---

## 17. Conclusão

A pergunta que esta Sprint respondeu não era "`src/` ou `platform/`" — era o que cada uma realmente contém, e a resposta corrige uma presunção que vinha desde a primeira decisão sobre o assunto: `platform/` não é mais madura que `src/` porque tem mais documentação a seu favor; é menos madura, porque não tem nenhuma linha de lógica de negócio. E `src/`, mesmo tendo crescido em desobediência a uma decisão já aprovada, não é lixo a descartar — é, em sua maior parte, um sistema funcional real, com nomenclatura errada e sem teste, mas com lógica que resolve exatamente os problemas que `platform/packages/*` já sabe, em contrato, que precisa resolver. A estratégia correta não era migrar depressa nem continuar esperando — era, primeiro, saber com precisão o que já existe. É isso que este documento entrega.
