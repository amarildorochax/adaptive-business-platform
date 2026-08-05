# IMP-018 — Business Profile Engine Core — Relatório de Migração

**Status:** Concluída. **Pacote:** `@abp/business-profile` (novo — `platform/packages/business-profile`). **Padrão:** Extrair → Adaptar → Portar.

---

## 1. Fonte de Verdade e Cadeia de Aprovação

Documento arquitetural oficial: `docs/architecture/BUSINESS_PROFILE_ENGINE.md` ("Business Profile
Engine — Arquitetura de Referência", **Documento Técnico Oficial** — mesmo status de `IDENTITY_HUB.md`,
`KNOWLEDGE_HUB.md`, `INTEGRATION_HUB.md`, todos já migrados). Documentação complementar consultada:
`COMMAND_CATALOG.md` (seção "Business Profile Engine"), `EVENT_CATALOG.md` (seção "Business Profile
Engine"), `DOMAIN_OWNERSHIP_MATRIX.md` (linhas 228–231, ADR-013), `SYSTEM_BLUEPRINT.md` (categoria
"Adaptive Intelligence"), e `POST_IMPLEMENTATION_ARCHITECTURE_AUDIT.md` (auditoria que identificou
este domínio como a próxima Sprint legítima).

**Nenhum Concrete Structure Component (padrão "Component N") existe para este domínio** — diferente de
Identity (Component 12), Knowledge (Component 13) e Integration (Component 14), o Business Profile
Engine nunca recebeu scaffolding raso durante a IMP-001. Esta ausência já era esperada: o próprio
`POST_IMPLEMENTATION_ARCHITECTURE_AUDIT.md` já havia confirmado "zero código" para este domínio antes
do início desta Sprint — confirmação repetida e reafirmada pela auditoria de legado desta Sprint
(Seção 2).

**Nenhum conflito documental foi encontrado** entre `BUSINESS_PROFILE_ENGINE.md` e os catálogos
complementares — a regra "a arquitetura oficial prevalece" nunca precisou ser invocada.

## 2. Auditoria de Legado (`src/`) — Confirmação da Ausência Total

Busca exaustiva pelas oito palavras-chave desta Sprint (business profile, profile engine, organization
profile, company profile, business identity, business metadata, profile manager, profile repository).
**Resultado: zero ocorrências para todas as oito.** Esta é a confirmação documental explicitamente
exigida pela Sprint antes de qualquer implementação — "espera-se encontrar ausência total de
implementação. Confirmar documentalmente antes de iniciar" — confirmado.

Nenhum outro arquivo de `src/` foi identificado como falso amigo relevante a este domínio (diferente
de Sprints anteriores, que sistematicamente encontravam colisão de nome com o pipeline de orquestração
de Agentes de IA — aqui, nenhuma colisão existe, porque o vocabulário "Business Profile"/"Segment"/
"Maturity" nunca foi usado por nenhuma parte do legado).

## 3. Componentes Implementados

### 3.1 Entidades e Value Objects (todos novos — pacote construído do zero)

| Contrato | Tipo | Fundamentação |
|---|---|---|
| `BusinessProfile` | Entity | Identidade do Perfil (`profileId`, `tenantId`, `createdAt`) — ADR-001 |
| `Segment` | Value Object (`string`) | Deliberadamente opaco — ADR-007: "Nenhum Segmento é implementado como versão de código separada" |
| `Maturity` | Value Object (`string`) | Deliberadamente opaco — nenhum enum fechado é dado pelo Blueprint |
| `BusinessClassification` | Value Object | `{segment, subsegment?}` — quarto conceito da Ownership Matrix ("Business Classification") |
| `BusinessClassificationRecord` | Entity (versionada) | Business Classifier + Segment Engine, ADR-009 |
| `MaturityRecord` | Entity (versionada) | Business Maturity Engine, ADR-006/ADR-009 |
| `BusinessProfileLifecycleState` | Entity (imutável, append-only) | Jornada de Construção do Perfil, Capítulo 9 |

**Decisão arquitetural — Classificação e Maturidade nunca compartilham o mesmo registro versionado.**
ADR-006 (Composable Profile): "Uma mudança em Objetivos não exige recalcular Segmento, Maturidade ou
Capacidades do zero." Um único `BusinessProfileVersion` combinando os dois violaria esse princípio
literalmente — a primeira versão de projeto desta Sprint considerou essa forma combinada e foi
descartada em favor de `BusinessClassificationRecord`/`MaturityRecord` como dois Repositórios
independentes, cada um evoluindo em seu próprio ritmo.

**Decisão arquitetural — `Segment`/`Maturity` nunca são uniões fechadas de literais.** Diferente de
`KnowledgeType` (IMP-015, união fechada de 12 literais, com precedente textual explícito no Blueprint),
o Business Profile Engine cataloga apenas *exemplos* de Segmento (Capítulo 10: Floricultura, Pet Shop,
Clínica, e outros oito) e afirma, via ADR-007, que a extensibilidade do catálogo "nunca [deve] exigir
alteração de componente já existente" — o oposto de uma união fechada de código. `Maturity` nunca
recebe sequer um exemplo enumerado, apenas qualificadores em prosa ("maturidade inicial baixa",
"maturidade elevada") — manter como `string` evita inventar um enum ausente do Blueprint.

### 3.2 Repository Interfaces (4)

`BusinessProfileRepository`, `BusinessClassificationRecordRepository`, `MaturityRecordRepository`,
`BusinessProfileLifecycleStateRepository`. Todos os quatro são fatos observacionais imutáveis — sem
`update` nem `remove` — "Nenhuma atualização de perfil sobrescreve o estado anterior sem preservar a
versão prévia" (ADR-009) aplicado estruturalmente, mesma disciplina já usada em toda Sprint anterior
desta série.

### 3.3 Services (4)

| Service | Componente Interno implementado (Capítulo 7) |
|---|---|
| `BusinessProfileService` | Fração de armazenamento do Profile Manager — aplica ADR-001 estruturalmente (nunca dois Perfis ativos por Tenant) |
| `BusinessClassificationService` | Business Classifier + Segment Engine |
| `BusinessMaturityService` | Business Maturity Engine |
| `BusinessProfileLifecycleService` | A Jornada de Construção do Perfil em si (Capítulo 9), restrita aos cinco estágios curto-prazo |

**Decisão arquitetural — proporcionalidade de Componentes sem contrato próprio.** O Capítulo 7 nomeia
dezenove Componentes Internos — Profile Manager, Business Classifier, Segment Engine, Business
Maturity Engine, Goals Engine, Capabilities Engine, Channel Manager, Localization Engine, Preferences
Engine, Recommendation Engine, Adaptive Rules Engine, Configuration Generator, Template Selector, KPI
Selector, Automation Selector, AI Context Builder, Profile History, Profile Versioning, Profile
Validator, Explainability Engine, Feature Advisor, Configuration Advisor. Apenas quatro têm Entity ou
responsabilidade correspondente já em escopo curto-prazo (Capítulo 21): Profile Manager, Business
Classifier, Segment Engine (consolidado dentro de `BusinessClassificationService` — o próprio Blueprint
já descreve o Segment Engine como um catálogo consultado pelo Business Classifier, nunca ele mesmo uma
Entity separada: "é a fonte de conhecimento estrutural que o Business Classifier consulta... mas nunca
ele mesmo decide qual segmento se aplica"), e Business Maturity Engine. Profile Versioning e Profile
History são a própria responsabilidade dos Repositories versionados (Seção 3.2), sem Service
duplicado. Os quinze componentes restantes pertencem explicitamente a médio ou longo prazo — ver
Seção 5.

### 3.4 BusinessProfileManager

Implementa o "Profile Manager" (Capítulo 7): "o ponto de entrada e o orquestrador central do Engine...
coordena os demais componentes especializados e garante que o perfil resultante seja internamente
consistente... não classifica segmento, não calcula maturidade e não gera recomendação." Orquestra a
Jornada de Construção do Perfil (Capítulo 9), restrita ao escopo curto-prazo: `createBusinessProfile`
(Command catalogado) avança automaticamente Cadastro → Perguntas Iniciais → Classificação, registrando
a primeira Classificação e a primeira Maturidade — ambas produzidas pelo sistema, sem checkpoint
humano, exatamente como descrito na Jornada ("Business Classifier + Segment Engine produzem Segmento e
Subsegmento sugeridos; Business Maturity Engine estima maturidade inicial"). `validateProfile` e
`finalizeInitialProfile` expõem, cada um, exatamente a transição de estágio seguinte — Validação (o
gate humano explícito, "Owner confirma ou corrige a classificação sugerida") e Perfil Inicial — nunca
avançadas automaticamente por `createBusinessProfile`, preservando Human Validation (Capítulo 5) como
uma decisão sempre explícita do chamador, nunca do próprio Manager.

## 4. Commands e Events

`COMMAND_CATALOG.md`, seção "Business Profile Engine", cataloga três Commands: `CreateBusinessProfile`,
`EnableCapability`, `DisableCapability`. `EVENT_CATALOG.md` cataloga três Events correspondentes:
`BusinessProfileCreated`, `CapabilityEnabled`, `CapabilityDisabled`. `BusinessProfileCommand.ts` e
`BusinessProfileEvent.ts` declaram o **catálogo completo** dos três, mesma disciplina já aplicada por
`CommerceEvent.ts` (IMP-006) e `ContentEvent.ts` (IMP-004): declarar todos os tipos já aprovados, ainda
que apenas um subconjunto tenha produtor real nesta Sprint.

**Implementado nesta Sprint:** apenas `CreateBusinessProfile` → `BusinessProfileCreated`.

**Catalogado, mas não implementado — `EnableCapability`/`DisableCapability`.** Ambos dependem do
Capabilities Engine e, per sua própria descrição no catálogo ("habilitar capacidade específica para
uma Empresa... capacidade existente no catálogo da plataforma"), do Feature Advisor — nenhum dos dois
está listado no escopo curto-prazo do Roadmap deste Blueprint (Capítulo 21: "No curto prazo, a
prioridade é o Profile Manager, o Business Classifier e o Segment Engine"). Implementá-los exigiria
antecipar o Capabilities Engine e o Recommendation Engine, ambos explicitamente médio prazo — a lacuna
é registrada, nunca preenchida silenciosamente. `BusinessProfileCommand`/`BusinessProfileEvent`
declaram os tipos (já oficialmente aprovados), mas nenhum Service os produz.

**Citados apenas em prosa, nunca formalmente catalogados — `UpdateBusinessProfile`/
`BusinessAdaptationCompleted`.** `COMMAND_CATALOG.md` menciona `UpdateBusinessProfile` em um Caso de
Uso ("O Business Profile Engine, ao processar `UpdateBusinessProfile`..."); `EVENT_CATALOG.md` menciona
`BusinessAdaptationCompleted` da mesma forma. Nenhum dos dois recebe uma entrada formal de catálogo com
Objetivo/Pré-condições/Pós-condições/Payload conceitual, ao contrário dos três Commands/Events
formalmente listados — mesmo padrão de lacuna já registrado para `SemanticIndexUpdated` (Knowledge
Hub, IMP-015) e `APIRegistered` (Integration Hub, IMP-016). Não implementados; nunca incluídos nos
tipos `BusinessProfileCommandType`/`BusinessProfileEventType`.

`BusinessProfileOperationResult<TEntity> = { result, command?, events? }` — mesma forma opcional já
usada por Knowledge Hub e Integration Hub, presente exatamente na única operação com Command já
catalogado e implementado (`createBusinessProfile`); toda transição de estágio sem Command (
`validateProfile`, `finalizeInitialProfile`) retorna apenas `{ result }`.

## 5. Decisão Arquitetural Central — Pacote Próprio, Distinto de `@abp/platform-services`

`GATE_G2_IMPLEMENTATION_ROADMAP.md`, Seção 4, agrupa `BRANDING_HUB.md` e `BUSINESS_PROFILE_ENGINE.md`
sob a linha "Platform Services (adicionais)" — uma classificação imprecisa do próprio Roadmap, já
registrada como tal em `POST_IMPLEMENTATION_ARCHITECTURE_AUDIT.md`, Seção 2.2. A fonte mais precisa é
`DOMAIN_OWNERSHIP_MATRIX.md`, linha 276, que posiciona explicitamente **"Adaptive Intelligence: AI ·
Business Profile · Branding"** como uma categoria arquitetural própria, distinta tanto de "Business
Hubs" quanto de "Platform Services" — a mesma categoria à qual o AI Hub pertence, e o AI Hub já tem
pacote dedicado (`@abp/ai`), nunca compartilhado com `@abp/platform-services`.

Por essa razão, esta Sprint cria `platform/packages/business-profile` (`@abp/business-profile`) como
pacote novo — nunca estende `@abp/platform-services` — mesma disciplina de "construído do zero" já
demonstrada por Content Hub (IMP-004) e Commerce Hub (IMP-006), os dois únicos outros domínios desta
série sem nenhum scaffolding prévio da IMP-001.

**Decisão de convenção Command/Event.** `@abp/platform-services` estabeleceu, desde a IMP-001
(`KnowledgeUpdatedPayload.ts`), o uso do genérico `Command<TPayload>`/`Event<TPayload>` de `@abp/core`.
Como `@abp/business-profile` é um pacote novo, não uma extensão de `platform-services`, esta Sprint
segue a convenção majoritária já estabelecida pelos pacotes construídos do zero — CRM, Communication,
Finance, Growth, Content, Commerce, Automation — todos com wrapper local `{Domain}Command`/
`{Domain}Event` com `type` fechado, nunca o genérico de `@abp/core`. `BusinessProfileCommand`/
`BusinessProfileEvent` seguem exatamente essa convenção.

## 6. ACL

Nenhuma linha desta Sprint importa `@abp/crm-hub`, `@abp/communication-hub`, `@abp/content-hub`,
`@abp/growth-hub`, `@abp/commerce-hub`, `@abp/finance-hub`, `@abp/analytics-hub`,
`@abp/automation-engine`, `@abp/ai`, `@abp/ai-agents`, `@abp/runtime`, `@abp/platform-services`, ou
`@abp/infrastructure`. `tenantId`/`profileId` são sempre identificadores opacos. Nenhum campo de
`Identidade` (referência ao Branding Hub, Capítulo 8) é modelado nesta Sprint — ver Seção 7, "Pontos de
Integração Previstos para o Branding Hub".

## 7. Pontos de Integração Previstos para o Futuro Branding Hub

`BUSINESS_PROFILE_ENGINE.md`, Capítulo 14 ("Integração com Branding"), já formaliza a direção única
desta relação: *"o perfil de negócio informa o Branding Hub sobre o contexto de tom apropriado; o
Branding Hub nunca informa de volta o Segmento ou a Maturidade de uma empresa."* Esta Sprint já
estabelece a base necessária para essa futura integração, sem antecipar nenhuma parte da
implementação do Branding Hub em si:

- `BusinessClassificationService.current(profileId)` e `BusinessMaturityService.current(profileId)`
  (expostos publicamente pelo `BusinessProfileManager` via `currentClassification`/`currentMaturity`)
  são os dois métodos que uma futura IMP-019 (Branding Hub Core) deverá consumir, por identificador
  opaco (`profileId`/`tenantId`), nunca por import de tipo interno deste pacote além do já exportado
  pelo barrel.
- O Modelo de Perfil (Capítulo 8) já reserva o campo "Identidade" como "referência à identidade de
  marca gerida pelo Branding Hub — o Modelo de Perfil mantém a associação a essa identidade, sem
  duplicar sua gestão" — este campo **não foi implementado nesta Sprint** (fora do escopo curto-prazo,
  e sua própria existência depende do Branding Hub já existir para ter o que referenciar). Uma futura
  Sprint de Business Profile Engine (médio prazo, Capítulo 21) deverá adicionar essa referência apenas
  quando `IMP-019` já tiver definido o contrato de identidade a ser referenciado — nunca antes.
- Nenhum Event `ThemeUpdated`/`BrandAssetChanged`/`BrandPaletteUpdated` (Branding Hub) é consumido por
  este pacote — a integração declarada no Capítulo 14 é estritamente unidirecional, e o Business
  Profile Engine nunca reage a mudança de identidade visual.

## 8. Fora de Escopo — Registrado Explicitamente

Consistente com o Roadmap do próprio Blueprint (Capítulo 21):

- **Aprendizado Contínuo (Capítulo 12)** — médio prazo; nenhum dos quatro sinais (uso real,
  preferências ajustadas, novos Módulos, novos Objetivos) é observado ou processado nesta Sprint.
- **Recommendation Engine e suas sete categorias (Capítulo 16), Feature Advisor, Configuration
  Advisor** — médio prazo.
- **Capabilities Engine, Goals Engine, Channel Manager, Localization Engine, Preferences Engine** —
  nenhum listado no escopo curto-prazo; nenhum campo correspondente (`Objetivos`, `Canais`, `Idioma`,
  `Moeda`, `Preferências`, `Capacidades`, `Desafios`, `Porte`, `Localização`, `Produtos e Serviços`,
  `Volume operacional`) foi adicionado ao `BusinessProfile` desta Sprint — apenas Segmento/Subsegmento
  e Maturidade, os dois únicos elementos do Modelo de Perfil citados pelo Roadmap curto-prazo.
- **Adaptive Rules Engine, Configuration Generator, Template Selector, KPI Selector, Automation
  Selector, AI Context Builder** (o "Motor de Adaptação", Capítulo 11) — médio prazo; nenhuma
  configuração de Menu/Widget/KPI/Template/Relatório/Automação é resolvida por esta Sprint. O estágio
  "Configuração Automática" da Jornada do Capítulo 9 nunca foi adicionado a
  `BusinessProfileLifecycleStage` por essa razão.
- **Explainability Engine em forma madura, refinamento agregado e anonimizado do Segment Engine,
  extensão do catálogo de Segmentos além dos dez exemplos** — longo prazo.
- **Branding Hub, identidade visual, assets gráficos, temas, logos, gerenciamento de marca** —
  explicitamente fora de escopo por instrução direta desta Sprint; ver Seção 7 para os pontos de
  integração já preparados sem antecipar nenhuma parte de sua implementação.

## 9. Validação

```
pnpm typecheck   → 18/18 pacotes, sucesso (novo pacote @abp/business-profile registrado em platform/tsconfig.json)
pnpm build       → 18/18 pacotes + apps/web (vite build), sucesso
pnpm lint        → sucesso
pnpm test        → 288/288 testes, 86/86 arquivos de teste (suíte inteira do monorepo)
```

**Testes desta Sprint:** 15 testes em 5 arquivos (`BusinessProfileService`,
`BusinessClassificationService`, `BusinessMaturityService`, `BusinessProfileLifecycleService`,
`BusinessProfileManager`), cobrindo: aplicação estrutural de ADR-001 (nunca dois Perfis ativos por
Tenant), versionamento independente de Classificação e de Maturidade (ADR-006/ADR-009, inclusive
preservação de histórico completo), sequência literal dos cinco estágios curto-prazo da Jornada
(inclusive rejeição de estágio pulado e terminalidade de "Perfil Inicial"), e presença/ausência de
`command`/`events` no resultado do Manager exatamente na única operação com Command catalogado — além
do fluxo completo `createBusinessProfile → validateProfile → finalizeInitialProfile`.

## 10. Resumo

| Item | Contagem |
|---|---|
| Entities novas | 4 (`BusinessProfile`, `BusinessClassificationRecord`, `MaturityRecord`, `BusinessProfileLifecycleState`) |
| Value Objects novos | 3 (`Segment`, `Maturity`, `BusinessClassification`) |
| Repository interfaces | 4 |
| Services | 4 |
| Manager | 1 (`BusinessProfileManager`) |
| Commands implementados | 1 de 3 já catalogados (`CreateBusinessProfile`) |
| Events implementados | 1 de 3 já catalogados (`BusinessProfileCreated`) |
| Testes novos | 15 |
| Pacotes novos criados | 1 (`@abp/business-profile`) |
| Arquivos de legado (`src/`) extraídos | 0 (ausência total confirmada, per instrução explícita desta Sprint) |
