# FUN-101 — Business Profile Experience — Relatório

**Status:** Concluída. **Natureza:** sétima Sprint funcional — nenhuma arquitetura, ADR, Manager, Repository Interface, Service, Command, Event ou Entity foi alterada. Todo trabalho aconteceu exclusivamente em `apps/web`, consumindo somente endpoints já existentes de `apps/api` (FUN-004/005).

---

## 1. Leitura Obrigatória — Achado Central Antes de Qualquer Código

A leitura integral de `docs/architecture/BUSINESS_PROFILE_ENGINE.md` (a arquitetura de referência, 24 capítulos, dezenove Componentes Internos) contra `docs/implementation/BUSINESS_PROFILE_ENGINE_CORE_MIGRATION_REPORT.md` (IMP-018, o que foi de fato implementado) revela uma distância enorme e deliberada entre visão e implementação curto-prazo — o mesmo padrão já visto em toda Sprint desta série (IAM Core vs. `IDENTITY_HUB.md`, FUN-100).

**O `BusinessProfileManager` real expõe exatamente sete métodos:** `createBusinessProfile`, `findProfile`, `validateProfile`, `finalizeInitialProfile`, `currentClassification`, `currentMaturity`, `currentStage`. **Não existe nenhum método de atualização** — nem mesmo para Segmento/Subsegmento/Maturidade, definidos uma única vez em `createBusinessProfile` e nunca mais alteráveis por nenhuma rota. A Entity `BusinessProfile` tem apenas `profileId`/`tenantId`/`createdAt`. Nenhum dos elementos citados no Capítulo 8 do Blueprint além de Segmento/Subsegmento/Maturidade — Porte, Localização, Idioma, Moeda, Objetivos, Produtos e Serviços, Canais, Mercado, Volume operacional, Preferências, Capacidades, Desafios — foi implementado (`BUSINESS_PROFILE_ENGINE_CORE_MIGRATION_REPORT.md`, Seção 8, "Fora de Escopo", registrado explicitamente).

Isso significa que **quase todos os campos pedidos pela estrutura de nove abas desta Sprint (Empresa, Mercado além de Segmento, Clientes, Produtos, Posicionamento, Objetivos, Estratégia, parte de Configurações) não têm nenhum endpoint correspondente** — nem em `BusinessProfileManager`, nem em nenhum outro Manager já conectado. A própria Sprint já antecipa esse cenário exato: *"Caso algum dado ainda não exista na API: documentar claramente; utilizar placeholders visuais; nunca inventar endpoints."* Esta é, portanto, uma Sprint deliberadamente híbrida — dado real onde existe, rascunho local visual e claramente identificado onde não existe — nunca um meio-termo que confunda os dois.

---

## 2. Endpoints Utilizados (Nenhum Novo, Nenhum Contrato Alterado)

| Endpoint | Já existia desde | Consumido por |
|---|---|---|
| `POST /business-profiles` | FUN-004 | `seedDemoData` (inalterado) |
| `GET /business-profiles/by-tenant/:tenantId` | FUN-004 | **Novo uso nesta Sprint** — `useBusinessProfile` (hook novo, endpoint já existente) |
| `POST /business-profiles/:id/validate` | FUN-004 | `seedDemoData` (inalterado) |
| `POST /business-profiles/:id/finalize` | FUN-004 | `seedDemoData` (inalterado) |
| `GET /business-profiles/:id/classification` | FUN-004 | `useBusinessProfileSummary` (já existente, FUN-005) |
| `GET /business-profiles/:id/maturity` | FUN-004 | `useBusinessProfileSummary` (já existente, FUN-005) |
| `GET /business-profiles/:id/stage` | FUN-004 | `useBusinessProfileSummary` (já existente, FUN-005) |

`useBusinessProfile` (novo) é o único hook adicionado nesta Sprint — consome `GET /business-profiles/by-tenant/:tenantId`, endpoint já existente desde a FUN-004 mas nunca antes envolto num hook próprio (`seedDemoData` só usava seu retorno para extrair `profileId`, descartando `createdAt`). Nenhuma rota nova foi criada em `apps/api`; nenhum DTO foi alterado.

---

## 3. Achado Real Durante a Implementação — Lacuna de Cobertura de Teste Pré-existente

Ao escrever os testes desta Sprint, descobri que `createDemoApiFetchMock` (o roteador de mock de `fetch` compartilhado desde a FUN-005) **nunca mockou `GET /business-profiles/by-tenant/:tenantId`, `GET /business-profiles/:id/classification` nem `GET /business-profiles/:id/maturity`** — apenas `create`/`validate`/`finalize`/`stage`. Isso nunca quebrou nenhum teste anterior porque nenhum teste existente afirmava sobre o conteúdo real desses dados (`DashboardPage.test.tsx` só verificava o título estático do `WidgetCard` "Perfil Empresarial", nunca o Segmento/Maturidade de fato exibidos). `OverviewSection` (Seção 4) foi o primeiro consumidor a de fato asserir sobre esse dado em teste, expondo a lacuna. Corrigido adicionando as três rotas faltantes ao mock compartilhado — benefício retroativo para qualquer teste futuro que também precise desse dado real.

---

## 4. Estrutura — Nove Seções, Navegação Contextual

`BusinessProfilePage` foi reconstruída como um módulo de nove seções (`profileSections.ts`, fonte única), navegáveis por uma **barra lateral contextual** (`ProfileSubNav`) — preferida a abas horizontais simples por escalar melhor a nove itens sem quebra de linha, um padrão comum de "settings sidebar" em SaaS premium (GitHub/Stripe — conceito de UX estudado, nunca visual copiado, per UX-001). A seção ativa é refletida em `?section=` via `useSearchParams` (deep-link/compartilhável), sem introduzir nenhuma sub-rota nova.

| Seção | Dado real | Fonte |
|---|---|---|
| Visão Geral | Sim, integralmente | `useBusinessProfileSummary` + `useBusinessProfile` |
| Mercado | Parcial (Segmento/Subsegmento, somente leitura) | `useBusinessProfileSummary` |
| Empresa | Não | Rascunho local |
| Clientes | Não | Rascunho local |
| Produtos | Não | Rascunho local |
| Posicionamento | Não | Rascunho local |
| Objetivos | Não | Rascunho local |
| Estratégia | Não | Rascunho local |
| Configurações | Parcial (tema claro/escuro, real) | `core/theme` (UX-001) + rascunho local |

Cada seção sem dado real exibe `NotConnectedNotice` (novo primitivo genérico, `shared/components/ui/`) nomeando exatamente quais campos não são suportados — nunca escondido, nunca um formulário que finge persistir.

---

## 5. Visão Geral — Inteiramente Real

Quatro `StatCard` (Segmento, Maturidade, Estágio, Data de criação), um "Resumo executivo" em prosa montado a partir dos mesmos campos reais, e uma `Timeline` (novo primitivo genérico) da Jornada de Construção do Perfil (`BUSINESS_PROFILE_ENGINE.md`, Capítulo 9: Cadastro → Perguntas Iniciais → Classificação → Validação → Perfil Inicial). A API nunca expôs um histórico de transições — apenas o estágio atual (`currentStage`) — então a Timeline é reconstruída posicionando esse único estágio real dentro da sequência fixa e já documentada de cinco estágios; nenhum histórico é inventado, apenas a posição relativa dentro de uma sequência que o próprio Blueprint já define como linear e conhecida.

---

## 6. Mercado — o Limite Exato do Editável

Segmento/Subsegmento são exibidos como campos **somente leitura, desabilitados** — não porque a Sprint pediu isso, mas porque `BusinessProfileManager` nunca expôs um método de reclassificação: `currentClassification` é a única leitura pública, definida uma única vez em `createBusinessProfile`. Apresentar esses dois campos como editáveis seria enganoso — o usuário digitaria uma mudança que nenhum clique em "salvar" jamais persistiria, porque não existe `PATCH`/`PUT` correspondente em nenhuma rota. Os demais seis campos pedidos (Nicho, Área de atuação, Região atendida, Modelo de negócio, Concorrentes, Diferenciais) são rascunho local.

---

## 7. Rascunho Local — Arquitetura e Decisão Técnica

`core/businessProfile/profileDraftStorage.ts` (`localStorage`, chaveado por `tenantId` + seção — Tenant Isolation aplicado a um dado puramente visual, mesmo princípio do ADR-008 de `BUSINESS_PROFILE_ENGINE.md`) + `useProfileDraft` (hook: valor, `updateField` com debounce de 600ms, `savedAt` para o indicador de autosave visual, `resetDraft`). Nunca uma chamada de rede — a única forma honesta de atender "cadastrar ou editar" campos sem endpoint, per a regra explícita desta Sprint.

**Achado real durante a escrita dos próprios testes desta Sprint**: o `useState` que inicializa o valor do rascunho lê `tenantId` (de `useAuth()`) uma única vez, na primeira renderização — se o hook fosse usado antes de `tenantId` estar disponível, ficaria preso lendo/gravando sob uma chave de Tenant vazia para sempre (o inicializador de `useState` não re-executa em renderizações seguintes). Na prática isso nunca acontece na página real (uma seção só é renderizada depois que `useDashboardBootstrap` resolve, o que já exige uma Session autenticada, `tenantId` já disponível) — mas corrigido de qualquer forma com um `useEffect` que recarrega o rascunho assim que `tenantId` chega, por robustez, e coberto por teste dedicado (`useProfileDraft.test.tsx`).

**Segundo achado, desta vez um bug no próprio teste, não no código**: a primeira versão do teste de autosave usava os textos "não salvo"/"salvo" para o indicador visual — como `toHaveTextContent("salvo")` faz correspondência por substring, "não salvo" já "continha" a palavra procurada, e o teste passava instantaneamente, sem nunca de fato esperar os 600ms de debounce. Corrigido trocando para dois textos mutuamente exclusivos ("sem alterações"/"salvo agora").

---

## 8. Componentes Criados (Reutilizáveis, Design System UX-001)

| Componente | Escopo |
|---|---|
| `NotConnectedNotice` | Genérico — qualquer seção futura de qualquer domínio no mesmo cenário (dado real ainda não exposto) |
| `Timeline` | Genérico — qualquer sequência de estágios fixa e conhecida |
| `ProfileSubNav` | Específico deste módulo — navegação contextual de nove seções |
| `DraftSavedIndicator` | Específico deste módulo — indicador de autosave + ação de limpar rascunho (usa `Toast`, já existente) |

Nenhum componente duplicado — `Field`/`Select`/`Button`/`Badge`/`Alert`/`StatCard`/`WidgetCard`/`AsyncState`/`Toast` são exatamente os mesmos primitivos já criados na UX-001, reutilizados em todas as nove seções sem reimplementação.

---

## 9. Validação

Todos os formulários usam validação nativa do navegador (`required`, `type="email"/"tel"/"url"`, `pattern` no CNPJ) — nenhum campo pode quebrar a aplicação porque nenhum é submetido a lugar nenhum; o pior caso possível é um valor de rascunho local mal formatado, sem nenhuma consequência para o restante do sistema. Estados de erro seguem o padrão já estabelecido (`AsyncState`/`Alert`) para as seções com dado real.

```
pnpm typecheck   → 22/22 pacotes + apps, sucesso
pnpm build       → sucesso (apps/web: BusinessProfilePage agora seu próprio chunk, 21.9 kB/6.2 kB gzip)
pnpm lint        → sucesso, zero warning
pnpm test        → 500/500 testes, 138/138 arquivos (489/135 antes desta Sprint + 11 novos: BusinessProfilePage.test.tsx, useProfileDraft.test.tsx, Timeline.test.tsx)
```

---

## 10. Limitações

- **Oito das nove seções não têm nenhum dado persistido no servidor** — consequência direta e documentada da distância entre `BUSINESS_PROFILE_ENGINE.md` (visão completa) e o escopo curto-prazo já implementado (IMP-018). Nomeado explicitamente em cada seção via `NotConnectedNotice`, nunca escondido.
- **Segmento/Subsegmento não são editáveis** — `BusinessProfileManager` nunca expôs um método de reclassificação após a criação inicial.
- **Nenhum histórico real de transição de estágio** — a Timeline é reconstruída a partir do único estágio atual, posicionado numa sequência fixa já documentada; não reflete quando cada transição de fato ocorreu (a API nunca expôs isso — `currentStage` devolve apenas o estágio, sem `enteredAt` no DTO correspondente).
- **Rascunho local não é sincronizado entre dispositivos/navegadores** — `localStorage` é, por definição, por navegador; nenhum backup em nuvem existe para esse dado até que uma Sprint futura estenda a API.
- **Nenhuma validação visual em navegador real** — mesma limitação já registrada na UX-001 (nenhuma ferramenta de automação de navegador disponível neste ambiente); validação limitada a build bem-sucedido e à suíte de testes (`@testing-library/react` + jsdom).

## 11. Pendências Futuras

- Uma Sprint de domínio (fora do escopo desta, que é puramente Web/API) estendendo `@abp/business-profile` com Entities/Repository Interfaces/Services reais para Empresa (identificação legal/contato), Clientes (persona), Produtos, Posicionamento, Objetivos, Estratégia (canais) e Configurações (Localization/Preferences Engines) — só então as oito seções hoje em rascunho local poderiam ganhar endpoints reais, seguindo o Roadmap de médio prazo já traçado pelo próprio `BUSINESS_PROFILE_ENGINE.md`, Capítulo 21.
- Um método de reclassificação (`updateClassification`) em `BusinessProfileManager`, permitindo editar Segmento/Subsegmento após a criação — exige alterar um Manager já aprovado, fora do escopo de qualquer Sprint Web/API.
- Um endpoint de histórico de estágio (`GET /business-profiles/:id/history`) para uma Timeline com datas reais de transição, não apenas posição na sequência fixa.
- Migrar o rascunho local para a API assim que ela existir — `useProfileDraft` já isola completamente essa decisão num único hook, facilitando a troca futura de `localStorage` por uma chamada HTTP real sem tocar nenhum componente de seção.
