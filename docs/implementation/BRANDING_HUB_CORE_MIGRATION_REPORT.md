# IMP-019 — Branding Hub Core — Relatório de Migração

**Status:** Concluída. **Pacote:** `@abp/branding` (novo — `platform/packages/branding`). **Padrão:** Extrair → Adaptar → Portar.

---

## 1. Fonte de Verdade e Cadeia de Aprovação

Documento arquitetural oficial: `docs/architecture/BRANDING_HUB.md` ("Branding Hub — Arquitetura de
Referência", **Documento Técnico Oficial** — mesmo status de `IDENTITY_HUB.md`, `KNOWLEDGE_HUB.md`,
`INTEGRATION_HUB.md`, `BUSINESS_PROFILE_ENGINE.md`, todos já migrados). Documentação complementar
consultada: `COMMAND_CATALOG.md` (seção "Branding Hub"), `EVENT_CATALOG.md` (seção correspondente),
`DOMAIN_OWNERSHIP_MATRIX.md` (linha 276), `SYSTEM_BLUEPRINT.md` (categoria "Adaptive Intelligence"), e
`POST_IMPLEMENTATION_ARCHITECTURE_AUDIT.md` (auditoria que identificou este domínio como a segunda e
última Sprint Opção A pendente, junto de IMP-018).

**Nenhum Concrete Structure Component prévio existe para este domínio** — mesma ausência total já
confirmada para o Business Profile Engine (IMP-018), reafirmada pela auditoria de legado desta Sprint
(Seção 2).

**Nenhum conflito documental foi encontrado** entre `BRANDING_HUB.md` e os catálogos complementares.

## 2. Auditoria de Legado (`src/`) — Falso Amigo Confirmado, Zero Extração Real

Busca exaustiva pelo vocabulário desta Sprint (branding, brand, logo, theme, design token, color
palette, typography, brand identity, brand asset) localizou `src/design-system/foundations/branding/`
(`index.ts`, `logoGuidelines.ts`, `solidVariant.ts`, `aiAccent.ts`). Inspeção confirma que este
diretório é o **design system interno da própria Adaptive Business Platform** — auto-documentado como
"a identidade oficial da Adaptive Business Platform" — não um sistema de gestão de identidade *por
Tenant*. Mesmo padrão de falso-amigo já registrado para outros domínios nesta série; corresponde
exatamente à exclusão explícita desta Sprint ("design system de frontend"). **Nenhuma linha foi
extraída.**

Nenhum outro diretório de `src/` contém vocabulário relacionado a este domínio.

## 3. Componentes Implementados

### 3.1 Entidades e Value Objects (todos novos — pacote construído do zero)

| Contrato | Tipo | Fundamentação |
|---|---|---|
| `Logo` | Entity | Ativo de logo enviado por um Tenant (`logoId`, `tenantId`, `assetReference`, `uploadedAt`) — Logo Manager, Capítulo 7 |
| `TokenCategory` | Value Object (união fechada de 7 literais) | `"Cor" \| "Tipografia" \| "Espaçamento" \| "Borda" \| "Sombra" \| "Ícone" \| "Estado"` — Capítulo 9 enumera exatamente estas sete categorias em tabela formal |
| `DesignToken` | Entity | Unidade atômica de identidade (`tokenId`, `tenantId`, `themeId`, `category`, `name`, `value`) — Design Token Engine, Capítulo 9 |
| `BrandTheme` | Entity (versionada) | Composição completa de Tokens de um Tenant (`themeId`, `tenantId`, `version`, `generatedAt`) — Theme Generator, Capítulo 10 |

**Decisão arquitetural — `TokenCategory` é união fechada, ao contrário de `Segment`/`Maturity`
(IMP-018).** Diferente do catálogo aberto de Segmentos do Business Profile Engine (ADR-007, "nenhum
Segmento é implementado como versão de código separada"), a tabela do Capítulo 9 enumera formalmente
sete categorias de Token como uma taxonomia fechada e estrutural — mesmo padrão já usado por
`KnowledgeType` (IMP-015, união fechada de 12 literais, com precedente textual explícito).

**Decisão arquitetural — nomes de Token seguem literalmente os exemplos do Blueprint.**
`cor-destaque-primaria` e `fonte-titulo`/`fonte-corpo` são citados verbatim na tabela do Capítulo 9;
`cor-texto-primaria` (o Token de cor ajustado para uso em texto) é derivado diretamente da descrição do
Caso de Uso 1 e do Capítulo 14 ("ajusta uma variação levemente mais escura da cor primária para uso em
texto, preservando a identidade de cor original para uso em elemento de destaque visual").

### 3.2 Repository Interfaces (3)

`LogoRepository`, `DesignTokenRepository`, `BrandThemeRepository`. Todos os três são fatos
observacionais imutáveis — sem `update` nem `remove` — aplicando estruturalmente ADR-004 ("Toda mudança
de identidade é versionada, nunca sobrescrita silenciosamente") e ADR-012 ("Regeneração de Theme é
sempre completa, nunca incremental").

### 3.3 Services (4)

| Service | Componente Interno implementado (Capítulo 7) |
|---|---|
| `LogoService` | Logo Manager — restrito ao envio e à referência do ativo; nenhuma geração de variação (clara/escura/ícone/horizontal/vertical) |
| `AccessibilityValidatorService` | Accessibility Validator — cálculo de contraste WCAG 2.x real (razão de luminância relativa), ajuste de luminosidade preservando matiz/saturação (ADR-008) |
| `DesignTokenService` | Color Engine + Typography Engine + Design Token Engine, consolidados |
| `BrandThemeService` | Theme Generator — versão sempre calculada a partir do próprio histórico (ADR-012) |

**Decisão arquitetural — consolidação de Color Engine, Typography Engine e Design Token Engine em um
único Service.** O próprio Capítulo 7 já descreve a relação de dependência entre os três: "o Design
Token Engine converte as decisões produzidas pelo Color Engine, pelo Typography Engine... em Design
Tokens estruturados e nomeados" — nenhum dos dois primeiros produz uma Entity própria, apenas uma
decisão consumida pelo terceiro. Mesma disciplina de consolidação já aplicada ao Segment Engine dentro
de `BusinessClassificationService` (IMP-018).

**Decisão arquitetural — Accessibility Validator sempre executado antes de qualquer Token de cor de
texto ser produzido.** Capítulo 14: "nenhuma paleta é distribuída a um Theme sem que essa verificação
tenha sido aplicada e aprovada." `DesignTokenService.generateColorTokens` chama
`AccessibilityValidatorService.ensureAccessible` internamente — nunca opcional, nunca contornável pelo
chamador — aplicando ADR-003 estruturalmente.

**Decisão de proporcionalidade — apenas quatro Services correspondem a componentes já em escopo
curto-prazo.** O Capítulo 7 nomeia dezenove Componentes Internos (Brand Manager, Logo Manager, Color
Engine, Typography Engine, Iconography Manager, Illustration Manager, Asset Library, Design Token
Engine, Theme Generator, Theme Manager, Layout Engine, Template Manager, Document Branding, Dashboard
Styling, Email Branding, Landing Page Branding, AI Brand Context, Brand Validator, Accessibility
Validator, Brand Versioning, Brand History, Brand Preview, Brand Export). O Roadmap (Capítulo 20) nomeia
explicitamente, para o curto prazo, apenas quatro: "Logo Manager, Color Engine, Typography Engine e
Design Token Engine operando de ponta a ponta, produzindo um Theme válido e acessível a partir de uma
logo enviada." O Theme Generator é implicitamente necessário para "produzir um Theme válido" (sem ele,
os Tokens nunca se tornam consumíveis), e o Accessibility Validator é implicitamente necessário para
"acessível" — por isso ambos foram implementados apesar de não nomeados literalmente na frase do
Roadmap. Os quatorze componentes restantes pertencem a médio prazo (Email Branding, Landing Page
Branding, AI Brand Context pleno, Brand Preview), a longo prazo (refinamento de Brand Validator/
Accessibility Validator, Brand Export maduro), ou a nenhuma camada do Roadmap — ver Seção 5 para o caso
específico e relevante da Asset Library.

### 3.4 BrandingManager

Implementa o "Brand Manager" (Capítulo 7): "o ponto de entrada e o orquestrador central do Branding
Hub... coordena os demais componentes especializados e garante consistência antes de qualquer
distribuição... não extrai cor de uma logo nem decide tipografia — orquestração e consistência são sua
responsabilidade." Orquestra dois fluxos distintos de geração de Theme (Seção 4) e expõe
`businessContext`, a integração de leitura com o Business Profile Engine (Seção 6).

## 4. Commands e Events

`COMMAND_CATALOG.md`, seção "Branding Hub", cataloga três Commands: `UpdateTheme`, `PublishBrandAssets`,
`UpdatePalette`. `EVENT_CATALOG.md` cataloga os três Events correspondentes: `ThemeUpdated`,
`BrandAssetChanged`, `BrandPaletteUpdated`. `BrandingCommand.ts`/`BrandingEvent.ts` declaram o
**catálogo completo** dos três, mesma disciplina já aplicada por `ContentEvent.ts` (IMP-004),
`CommerceEvent.ts` (IMP-006) e `BusinessProfileEvent.ts` (IMP-018).

**Implementado nesta Sprint:** `UpdateTheme` → `ThemeUpdated`, `UpdatePalette` → `BrandPaletteUpdated`.

**Decisão arquitetural central — nenhum dos dois Commands cobre a primeira geração de identidade.**
`UpdateTheme` tem precondição catalogada "Theme existente"; `UpdatePalette` tem precondição catalogada
"paleta anterior existente" (`COMMAND_CATALOG.md`). Nenhum dos dois se aplica, por definição, à primeira
vez que um Tenant gera sua identidade — e nenhum terceiro Command cobre esse caso no catálogo oficial.
`BrandingManager.generateInitialBrandIdentity` implementa essa primeira geração inteiramente na camada
de Service (`{result}`, sem Command), verificando explicitamente que nenhum Theme prévio existe antes
de prosseguir (lança erro caso contrário, direcionando para `regenerateTheme`). `regenerateTheme`
(`UpdateTheme`) e `updatePalette` (`UpdatePalette`) verificam, cada um, sua própria precondição
("Theme existente"/"paleta anterior existente") antes de produzir Command e Event — nenhuma
implementação artificial preenche a lacuna da primeira geração; a lacuna é estrutural ao próprio
catálogo, não desta Sprint, e está registrada aqui exatamente como a Sprint exigiu ("registrar essa
limitação sem criar implementações artificiais").

**Catalogado, mas não implementado — `PublishBrandAssets`/`BrandAssetChanged`.** Ver Seção 5.

`BrandingOperationResult<TEntity> = { result, command?, events? }` — mesma forma opcional já usada por
Knowledge Hub, Integration Hub e Business Profile Engine, presente exatamente em `regenerateTheme` e em
`updatePalette`; `generateInitialBrandIdentity`, `submitLogo`, `currentLogo`, `currentTheme` e
`businessContext` retornam apenas `{ result }` (ou, no caso de `businessContext`, uma leitura direta sem
envelope, por não representar uma operação própria deste domínio — ver Seção 6).

## 5. Decisão Arquitetural — Asset Library Excluída desta Sprint

Ao contrário do Logo Manager, do Color Engine, do Typography Engine e do Design Token Engine — os
quatro componentes literalmente nomeados no Roadmap de curto prazo (Capítulo 20) — a **Asset Library**
não é citada em **nenhuma** das três camadas do Roadmap (curto, médio ou longo prazo), apesar de ter
Command formalmente catalogado (`PublishBrandAssets` → `BrandAssetChanged`).

Uma primeira versão desta Sprint implementou `BrandAsset`/`BrandAssetRepository`/`BrandAssetService` e
conectou `publishBrandAssets` ao `BrandingManager`. Essa implementação foi revertida ao se confirmar,
por releitura do Capítulo 20, que a Asset Library nunca recebeu prioridade de nenhuma camada do
Roadmap — diferente do padrão usado para justificar a inclusão do Theme Generator e do Accessibility
Validator (Seção 3.3), que são estritamente necessários para cumprir o objetivo textual do curto prazo
("produzindo um Theme válido e acessível"). A Asset Library não é necessária para esse objetivo — é uma
responsabilidade paralela e independente (repositório central de ativos visuais reutilizáveis:
ícones, ilustrações, imagens de referência).

Esta decisão segue a mesma disciplina já aplicada a `EnableCapability`/`DisableCapability` (IMP-018):
Command catalogado, mas sem componente correspondente em escopo curto-prazo — não implementado, gap
registrado explicitamente, nenhum substituto inventado. `BrandingCommand`/`BrandingEvent` continuam
declarando `PublishBrandAssets`/`BrandAssetChanged` (catálogo completo, per o padrão já estabelecido),
mas nenhum Service os produz nesta Sprint.

**Também não implementados — Brand Validator, Theme Manager, Iconography Manager, Illustration
Manager.** Mesma ausência de menção em qualquer camada do Roadmap. O pipeline de geração descrito no
Capítulo 10 ("Brand Validator + Accessibility Validator" antes do Theme Generator) usa apenas a
verificação de acessibilidade nesta Sprint — a verificação de coesão visual entre paleta e tipografia
(Brand Validator) não foi implementada, pela mesma razão.

## 6. Integração com Business Profile Engine

`BRANDING_HUB.md`, Capítulo 12: "o Business Profile Engine informa o Branding Hub sobre contexto de
tom apropriado; o Branding Hub nunca informa de volta o Segmento ou a Maturidade de uma empresa" —
integração estritamente unidirecional, já preparada do lado do Business Profile Engine desde a IMP-018
(`BusinessProfileManager.currentClassification`/`currentMaturity`, Seção 7 daquele relatório).

`BrandingManager.businessContext(profileId)` é o único ponto de integração implementado: uma leitura
somente-consulta que invoca exclusivamente os dois métodos públicos citados acima, retornando
`{classification, maturity}`. Nenhum repositório, entidade interna ou Service de `@abp/business-profile`
é importado — apenas os tipos e a classe `BusinessProfileManager` exportados pelo barrel público do
pacote (`Logo`, `DesignToken` e `BrandTheme` deste pacote, por sua vez, nunca são importados de volta
por `@abp/business-profile`, preservando a direção única e evitando qualquer dependência circular).

**Deliberadamente não implementado nesta Sprint:** nenhuma lógica de *calibração* de Tom de voz a
partir do Segmento/Maturidade (Capítulo 12: "um Segmento como Advocacia... orienta o Branding Hub a
sugerir um registro mais formal por padrão") — essa é uma decisão de negócio (Recommendation Engine
equivalente) sem Entity, Command ou Service correspondente já aprovado nesta Sprint; implementá-la
exigiria inventar uma regra de mapeamento Segmento→Tom não descrita com precisão suficiente pelo
Blueprint para ser codificada sem inferência. `businessContext` disponibiliza o dado necessário; a
calibração em si permanece um gap documentado, consistente com a mesma disciplina de "nunca preencher
lacuna silenciosamente."

## 7. ACL

Nenhuma linha desta Sprint importa `@abp/crm-hub`, `@abp/communication-hub`, `@abp/content-hub`,
`@abp/growth-hub`, `@abp/commerce-hub`, `@abp/finance-hub`, `@abp/analytics-hub`,
`@abp/automation-engine`, `@abp/ai`, `@abp/ai-agents`, `@abp/runtime`, `@abp/platform-services`, ou
`@abp/infrastructure`. A única dependência de pacote de domínio é `@abp/business-profile`, consumida
exclusivamente através de seu barrel público (Seção 6) — nenhuma dependência circular: `@abp/branding`
depende de `@abp/business-profile`; o inverso nunca ocorre (`BUSINESS_PROFILE_ENGINE_CORE_MIGRATION_REPORT.md`,
Seção 7, já confirma que nenhum Event de Branding é consumido por aquele pacote).

## 8. Fora de Escopo — Registrado Explicitamente

Consistente com o Roadmap do próprio Blueprint (Capítulo 20) e com as exclusões explícitas desta
Sprint:

- **Geração automática de logo, geração de imagem por IA, edição gráfica** — nunca mencionadas como
  responsabilidade de nenhum componente deste Blueprint; fora de escopo por instrução direta.
- **Design system de frontend, componentes visuais de UI, temas visuais de interface renderizados** —
  confirmado como o falso-amigo do legado (Seção 2); nunca implementado.
- **Asset Library (`PublishBrandAssets`/`BrandAssetChanged`), Brand Validator, Theme Manager,
  Iconography Manager, Illustration Manager** — Seção 5.
- **Email Branding, Landing Page Branding, integração plena com AI Brand Context, Brand Preview** —
  médio prazo (Capítulo 20).
- **Refinamento contínuo de Brand Validator/Accessibility Validator com base em padrão observado,
  Brand Export maduro, extensão a novo tipo de superfície** — longo prazo (Capítulo 20).
- **Layout Engine, Template Manager, Document Branding, Dashboard Styling** (as superfícies
  consumidoras do Theme, Capítulo 11) — nenhuma delas tem Entity ou Command próprio catalogado; a
  responsabilidade desta Sprint termina na produção do Theme consumível, nunca em sua aplicação a uma
  superfície concreta.
- **Calibração automática de Tom de voz a partir de Segmento/Maturidade** — Seção 6.
- **Recommendation Engine, Feature Advisor, Configuration Advisor equivalentes ao Branding** — nunca
  mencionados neste Blueprint; não aplicável.
- **Enterprise features, funcionalidades comerciais, backlog oculto** — nenhuma suposição feita.

## 9. Validação

```
pnpm typecheck   → 19/19 pacotes, sucesso (novo pacote @abp/branding registrado em platform/tsconfig.json)
pnpm build       → 19/19 pacotes + apps/web (vite build), sucesso
pnpm lint        → sucesso
pnpm test        → 313/313 testes, 91/91 arquivos de teste (suíte inteira do monorepo)
```

**Testes desta Sprint:** 25 testes em 6 arquivos (`LogoService`, `AccessibilityValidatorService`,
`DesignTokenService`, `BrandThemeService`, `BrandingManager`), cobrindo: envio e recuperação do Logo
vigente (última inserção, nunca por timestamp), cálculo de contraste WCAG e ajuste de luminosidade
preservando matiz/saturação, geração de Tokens de cor (destaque preservado + texto ajustado) e de
tipografia, versionamento incremental de Theme a partir do próprio histórico, e — no `BrandingManager`
— a distinção estrutural entre primeira geração (sem Command) e regeneração/atualização de paleta (com
Command e precondição verificada, inclusive rejeição explícita de cada precondição não satisfeita),
ausência de Command em `submitLogo`/`currentLogo` (fora do catálogo), e leitura de `businessContext` a
partir de um `BusinessProfileManager` real construído inteiramente por contratos públicos de
`@abp/business-profile`.

## 10. Resumo

| Item | Contagem |
|---|---|
| Entities novas | 3 (`Logo`, `DesignToken`, `BrandTheme`) |
| Value Objects novos | 1 (`TokenCategory`, união fechada de 7 literais) |
| Repository interfaces | 3 |
| Services | 4 |
| Manager | 1 (`BrandingManager`) |
| Commands implementados | 2 de 3 já catalogados (`UpdateTheme`, `UpdatePalette`) |
| Events implementados | 2 de 3 já catalogados (`ThemeUpdated`, `BrandPaletteUpdated`) |
| Testes novos | 25 |
| Pacotes novos criados | 1 (`@abp/branding`) |
| Arquivos de legado (`src/`) extraídos | 0 (falso-amigo confirmado, nenhuma extração real) |

---

## 11. Nota para a Próxima Auditoria de Roadmap

`POST_IMPLEMENTATION_ARCHITECTURE_AUDIT.md`, Seção 9, já recomendava uma auditoria equivalente após a
conclusão de IMP-019, para verificar se a Opção B (arquitetura completa, transição para evolução
funcional) passa a se aplicar — Business Profile Engine e Branding Hub eram os dois únicos domínios
Opção A identificados por aquela auditoria, e ambos estão agora concluídos. Esta Sprint não conduz essa
auditoria — apenas confirma que a condição para conduzi-la, descrita naquele relatório, foi atingida.
