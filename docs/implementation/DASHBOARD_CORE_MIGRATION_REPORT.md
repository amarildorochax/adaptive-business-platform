# IMP-017 — Dashboard Core — Relatório de Migração

**Status:** Concluída — **sem criação de código**. **Padrão:** Extrair → Adaptar → Portar, aplicado até sua conclusão lógica: nenhum componente foi inventado onde nenhum Blueprint aprovado existe.

---

## 1. Achado Central

Não existe, em nenhum documento do Documentation System da Adaptive Business Platform, um Blueprint
próprio que defina um domínio técnico "Dashboard Hub" distinto de Analytics Hub. A busca pela fonte de
verdade oficial — passo obrigatório desta Sprint antes de qualquer implementação — encontra três
confirmações independentes e convergentes desse fato, detalhadas nas Seções 2 a 4. Como consequência
direta das regras desta própria Sprint ("Nunca inventar entidades", "Nunca alterar implementações
aprovadas", "Nunca antecipar funcionalidades futuras"), **nenhuma Entity, Repository, Service, ou
DashboardManager foi criado**. Esta conclusão é, ela mesma, o resultado correto e completo desta
Sprint — não uma Sprint incompleta.

## 2. Confirmação 1 — `GATE_G2_IMPLEMENTATION_ROADMAP.md` já declara a ausência

O Architectural Inventory (Seção 4) desse Roadmap — a mesma linhagem documental que as IMP-001 a
IMP-016 seguiram integralmente (confirmado por `PRE_IMP_014_ROADMAP_AUDIT.md`) — já registra, em
texto explícito, a linha correspondente a Dashboard:

> "**Dashboard** | Sem Hub ou Blueprint próprio no Documentation System — corresponde à Experience
> Layer e à Presentation Layer já definidas em `AI_ARCHITECTURE.md`, Capítulos 3 e 4; a documentação
> de produto pré-existente (`docs/03-DASHBOARD_V2.md`, `docs/08-DASHBOARD.md`) permanece fora do
> Documentation System (`DOCUMENTATION_INDEX.md`, §10) e não é tratada aqui como arquitetura
> aprovada."

Esta é a mesma Fase 7 original de `GATE_G2_IMPLEMENTATION_ROADMAP.md` (Foundation → Infrastructure →
Platform Services → AI Core → Business Hubs → Automation → **Dashboard**) — nunca migrada por nenhuma
Sprint IMP até o momento, e já registrada como tal em `PRE_IMP_014_ROADMAP_AUDIT.md`, Seção 7, item 2.

## 3. Confirmação 2 — `AI_ARCHITECTURE.md` mostra que Experience/Presentation Layer já são domínio do AI Hub, sem Entity própria

Lido por completo `docs/ai/AI_ARCHITECTURE.md` (Capítulos 3 e 4, citados diretamente pelo Roadmap) e
`docs/ai/03_AI_ARCHITECTURE.md`. Confirmado: Experience Layer e Presentation Layer são duas das doze
camadas arquiteturais já formalizadas pela topologia do AI Hub — papéis funcionais dentro do funil de
solicitação/resposta de IA (`Usuário → Experience Layer → Orchestrator → ... → Query Layer →
Presentation Layer → de volta à Experience Layer`), já migrado integralmente pela IMP-010 (AI Core).
Nenhuma das duas camadas tem Entity, Repository, Command, ou Event próprio — são responsabilidades de
tradução de entrada/saída já absorvidas pelo AI Orchestrator, nunca um domínio de dado separado.
`03_AI_ARCHITECTURE.md`, Capítulo 4, cita "Dashboard" apenas em prosa, como sinônimo coloquial de
"tela do Usuário" ("nenhum resultado chega ao Dashboard sem já ter atravessado Evento e Query
determinísticos") — nunca como um Hub ou um Component nomeado.

## 4. Confirmação 3 — Dashboard e Widget já são Entities Frozen, já pertencem ao Analytics Hub, já estão implementados

`docs/architecture/DOMAIN_OWNERSHIP_MATRIX.md` (autoridade formal desta série) já atribui, sem
ambiguidade:

> `Dashboard | Analytics Hub | Todos | Superfície consolidada de leitura — ANALYTICS_DOMAIN_BLUEPRINT.md.`
> `Widget | Analytics Hub | — | Unidade visual de um Dashboard.`

E `platform/packages/analytics-hub/src/` já contém, desde a IMP-008 (Analytics Core), a implementação
completa: `Dashboard.ts`, `DashboardRepository.ts`, `DashboardService.ts`, `Widget.ts`,
`WidgetRepository.ts`, `WidgetService.ts` — incluindo o Command já catalogado `ArchiveDashboard`
(`AnalyticsCommand.ts`) e o princípio ADR-002 "Dashboards Are Read-Only" já aplicado em
`DashboardService`, mais a mesma disciplina de reaproveitamento de forma estrutural (nunca de dado)
já registrada naquele relatório: *"o conceito estrutural (container + Widget) tem precedente real em
`src/core/dashboard/Dashboard.ts`... mas o conteúdo daquele legado é observabilidade de plataforma
(Runtime/EventBus/Agent/Knowledge), nunca Metric/KPI de negócio."* Criar um `DashboardManager`
distinto nesta Sprint duplicaria, sob outro nome, uma Entity já Frozen e já implementada — violação
direta de "Nunca alterar implementações aprovadas" e do princípio Single Owner / No Duplicate Models
já estabelecido em `DOMAIN_OWNERSHIP_MATRIX.md`.

## 5. Auditoria de Legado (`src/`)

Busca completa pelas dez palavras-chave desta Sprint (dashboard, widget, panel, layout, visualization,
card, dashboard manager, dashboard configuration, view, workspace). Resultado: dois grupos, nenhum
extraível para um "Dashboard Core" de domínio.

- **`src/core/dashboard/`** — já auditado e já absorvido estruturalmente pela IMP-008 (Analytics
  Core); ver Seção 4. Não reauditado como se fosse legado novo — reconfirmar aqui seria duplicar
  trabalho já registrado e aprovado no relatório daquela Sprint.
- **`src/app/features/dashboard/`** (`components/`, `controllers/`, `hooks/` — incluindo
  `useDashboard.ts`, `useDashboardLayout.ts` —, `services/DashboardLayoutManager.ts`, `mocks/`) — este
  é código de **interface gráfica real** (componentes React, hooks de UI, gerenciador de layout
  visual) — exatamente o que a Seção "Limites de Escopo" desta Sprint proíbe explicitamente
  implementar ou mesmo consultar como precedente de domínio ("interface gráfica; componentes React/
  Vue/Angular; páginas HTML"). Nenhuma linha foi extraída.
- Zero ocorrências para "dashboard manager" e "dashboard configuration" como termos exatos — confirma
  que nenhum precedente de orquestração de domínio (distinto de UI) jamais existiu sob esses nomes.

## 6. `docs/03-DASHBOARD_V2.md` e `docs/08-DASHBOARD.md`

Lidos por completo. `docs/08-DASHBOARD.md` está vazio. `docs/03-DASHBOARD_V2.md` é, por sua própria
declaração inicial, "um documento de **visão**, não de implementação... não descreve componentes
React, não descreve cenas Phaser, não descreve código de nenhum tipo" — um documento de produto sob o
nome de plataforma anterior ("Andreia AI Platform"), marcado "⚪ Planejado por completo" (nunca
implementado), descrevendo Header/Sidebar/Área Central/Painel Direito/Barra Inferior/Janelas/
Personalização — todos conceitos de **interface visual** (arranjo de tela, temas claro/escuro,
densidade de layout), nunca um modelo de domínio técnico. Confirmado como já excluído do Documentation
System por `DOCUMENTATION_INDEX.md`, §10, e já assim classificado pelo próprio
`GATE_G2_IMPLEMENTATION_ROADMAP.md` (Seção 2). Nenhum conteúdo deste documento foi tratado como
arquitetura aprovada, consistente com a regra explícita desta Sprint.

## 7. Componentes — Reutilizados, Implementados, Inexistentes

| Categoria | Item |
|---|---|
| **Reutilizados** (já aprovados e implementados em outro domínio, não tocados aqui) | `Dashboard`, `Widget` (Analytics Hub, IMP-008) |
| **Implementados nesta Sprint** | Nenhum |
| **Inexistentes** (nenhum Blueprint aprovado os define) | Um domínio "Dashboard Hub" distinto; qualquer Entity/Repository/Service/Manager próprio de Dashboard fora de Analytics Hub |

## 8. Commands e Events

**Nenhum Command nem Event foi implementado, e nenhum precisava ser** — o único Command já catalogado
relacionado a este conceito, `ArchiveDashboard`, já pertence ao catálogo `AnalyticsCommand.ts`
(Analytics Hub, IMP-008) e já está fora do escopo de qualquer domínio "Dashboard" distinto que esta
Sprint poderia legitimamente reivindicar.

## 9. Decisões Arquiteturais Registradas

1. **Nenhuma Entity nova foi criada** — a única forma de "migrar Dashboard Core" sem violar "Nunca
   inventar entidades" seria reconhecer que a Entity já existe, em outro domínio, e não precisa (nem
   pode) ser recriada aqui.
2. **Nenhuma duplicação de `Dashboard`/`Widget` foi proposta** — mesmo sob um nome de arquivo ou de
   pacote diferente, isso constituiria uma segunda Entity para o mesmo conceito, violação direta do
   princípio Single Owner / No Duplicate Models.
3. **`docs/03-DASHBOARD_V2.md`/`docs/08-DASHBOARD.md` nunca foram tratados como arquitetura aprovada**
   — consistente com sua própria autodeclaração e com `GATE_G2_IMPLEMENTATION_ROADMAP.md`.
4. **Nenhum código de `src/app/features/dashboard/` foi extraído** — é interface gráfica real,
   explicitamente fora do escopo desta Sprint por instrução direta.
5. **Experience Layer/Presentation Layer não são um domínio de dado** — são papéis funcionais já
   absorvidos pela topologia de doze camadas do AI Hub, já migrada pela IMP-010; nenhuma Entity
   própria existe para eles, e nenhuma foi inventada aqui.

## 10. Fora de Escopo / Roadmap Futuro Identificado

Consistente com a Seção "Limites de Escopo" desta Sprint, os seguintes itens foram identificados na
documentação consultada e explicitamente registrados como não pertencentes a esta Sprint:

- **Toda a superfície de `docs/03-DASHBOARD_V2.md`** (Header, Sidebar, Área Central/Escritório
  Virtual, Painel Direito, Barra Inferior, Janelas, Personalização/temas) — interface gráfica de
  produto, "⚪ Planejado por completo", fora do Documentation System, nunca arquitetura aprovada.
- **Qualquer implementação de componente visual** (React, Vue, Angular, ou qualquer outro framework de
  UI) — explicitamente fora de escopo desta e de toda Sprint IMP até o momento.
- **Funcionalidades de Analytics/BI adicionais sobre Dashboard/Widget** — já pertencem integralmente
  ao escopo já concluído da IMP-008; qualquer extensão futura deveria ser uma Sprint de Analytics Hub,
  nunca desta.

## 11. Validação

```
pnpm typecheck   → 17/17 pacotes, sucesso (nenhuma alteração de código)
pnpm build       → 17/17 pacotes + apps/web (vite build), sucesso
pnpm lint        → sucesso
pnpm test        → 273/273 testes, 81/81 arquivos de teste (suíte inteira do monorepo, inalterada)
```

Nenhum teste novo foi criado — não há Entity, Service, ou Manager novo para testar. A suíte
pré-existente (incluindo os testes de `DashboardService`/`WidgetService` já cobertos pela IMP-008,
dentro de `analytics-hub`) permanece integralmente aprovada, confirmando que esta Sprint não alterou
nenhuma implementação já aprovada.

## 12. Resumo

| Item | Contagem |
|---|---|
| Entities novas | 0 (nenhum Blueprint aprovado define um domínio Dashboard distinto) |
| Entities já existentes reconhecidas como já pertencentes a outro domínio | 2 (`Dashboard`, `Widget` — Analytics Hub, IMP-008) |
| Repository interfaces | 0 |
| Services | 0 |
| Manager | 0 (nenhum `DashboardManager` criado) |
| Commands implementados | 0 (o único já catalogado, `ArchiveDashboard`, já pertence a Analytics Hub) |
| Events implementados | 0 |
| Testes novos | 0 |
| Arquivos de legado (`src/`) extraídos | 0 (já absorvidos pela IMP-008, ou interface gráfica explicitamente fora de escopo) |
| Documentos consultados sem status de arquitetura aprovada | 2 (`docs/03-DASHBOARD_V2.md`, `docs/08-DASHBOARD.md`) |

## 13. Conclusão

Esta Sprint cumpre integralmente seus Critérios de Aceite na única forma consistente com suas próprias
Regras: a auditoria completa foi realizada (Seções 2 a 6), toda decisão arquitetural foi registrada
(Seção 9), e nenhum componente foi inventado onde a arquitetura oficial da plataforma já demonstra,
por três fontes independentes, que nenhum Blueprint de "Dashboard Hub" existe — o conceito de negócio
já vive, integralmente aprovado e já implementado, dentro do Analytics Hub (IMP-008), e o conceito de
interface do usuário permanece, por desenho, fora do Documentation System e fora do escopo de toda
Sprint de arquitetura de domínio desta série. `pnpm typecheck/build/lint/test` permanecem aprovados
porque nenhuma implementação aprovada foi alterada — o resultado mais forte possível de "Nunca alterar
implementações aprovadas" é não haver, nesta Sprint, nada para alterar.
