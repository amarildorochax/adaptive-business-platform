# CRM — Adaptive CRM Foundation (Sprint 32) + Adaptive CRM Workspace (Sprint 33)

Fundação arquitetural do módulo de CRM da plataforma: não apenas uma
lista de clientes, mas a estrutura completa (Empresas, Clientes/
Contatos, Negócios, Pipeline, Atividades, Agenda, Etiquetas,
Observações, Histórico) preparada para crescer com módulos futuros
(Agentes de IA, WhatsApp, E-mail, Automação, Marketing, Análises,
Financeiro).

## Estado atual: 100% mock

Assim como o Dashboard (Sprint 28), esta Sprint constrói a feature
inteiramente sobre dados simulados (`services/CrmMockService.ts`) —
**nenhum import de `@/core`**. Quando uma Sprint futura conectar o CRM
ao Core, o ponto de entrada será o `CrmAdapter` já existente em
`@/app/integrations/core/adapters/CrmAdapter.ts` (Sprint 30/31A,
atualmente "não implementado" por design) — os tipos em `types/*`
já descrevem o shape de ViewModel que um mapper deverá produzir a
partir do Core.

## Estrutura

```
crm/
├── types/        # 9 entidades (protegido, intocado na Sprint 33)
├── contracts/     # CrmFilters, CrmKpis, CrmAiExtensionPoints (Sprint 32)
│                    + CrmAiAssist (Sprint 33 — só interfaces)
├── mocks/         # Geradores de dados simulados realistas (protegido)
├── services/      # CrmMockService, CrmKpiService (protegido)
├── hooks/         # Um hook de leitura por entidade + useCrmKpis (protegido)
├── workspace/     # Sprint 33 — CRUD local em memória (useLocalCollection),
│                    busca/ordenação/paginação (useTableState), generateId
├── components/    # Sprint 32: CRMCard, ClientCard, CompanyCard, DealCard,
│                    Timeline, PipelineColumn/PipelineCard, ActivityItem,
│                    Tag, StatusBadge, CrmSidebar
│                  # Sprint 33: PriorityBadge, table/ (DataTable,
│                    SearchInput, Pagination), filters/ (SelectFilter,
│                    StatusFilter, OwnerFilter, CompanyFilter, TagsFilter,
│                    PeriodFilter, FilterBar), forms/ (FormField,
│                    ClientForm, CompanyForm, DealForm, ActivityForm,
│                    AgendaForm), modals/ (NewClientModal, NewCompanyModal,
│                    NewDealModal, NewActivityModal, NewAgendaModal,
│                    DealDetailModal)
├── pages/         # OverviewPage (Painel), CompaniesPage + CompanyDetailPage,
│                    ClientsPage + ClientDetailPage, DealsPage (workspace com
│                    4 visualizações), PipelinePage (Kanban com Drag and
│                    Drop), ActivitiesPage, AgendaPage
└── CrmHome.tsx    # Composição principal (análoga a DashboardHome)
```

## Navegação

`CrmHome` possui sua própria navegação interna (`CrmSidebar`,
7 seções), controlada por estado local — o mesmo padrão do Dashboard
(sem rota aninhada). A rota `/crm` (registrada em
`@/app/router/routes.tsx` via `CrmPage`) é o único ponto de entrada;
o link global para `/crm` no Shell/`DashboardSidebar` é trabalho de uma
Sprint futura (esta Sprint não altera nenhum desses arquivos, por
estarem protegidos).

## Modelagem: "Clientes" e "Contatos"

O ESCOPO lista "Clientes" e "Contatos" como subdivisões separadas, mas
sem campos próprios para "Contato". Decisão de modelagem: uma única
entidade `Client` cobre ambos os papéis, diferenciados pelo campo
`status` (`lead`/`prospect`/`customer`/`inactive`) — o mesmo padrão
usado por CRMs de referência. Ver comentário em `types/Client.ts`.

## Preparação para IA

`contracts/CrmAiExtensionPoints.ts` (Sprint 32) reserva 7 pontos de
extensão por módulo/canal (`ai-agents`, `whatsapp`, `email`,
`automation`, `marketing`, `analytics`, `finance`), todos com
`connected: false`.

`contracts/CrmAiAssist.ts` (Sprint 33) é mais granular: modela o
formato exato de entrada/saída de 3 capacidades pedidas pelo ESCOPO —
sugestão automática de próximo contato (`NextContactSuggestion`),
resumo automático do cliente (`ClientAutoSummary`) e pontuação de leads
(`LeadScore`), reunidas em `CrmAiAssistProvider`. Nenhuma classe
implementa esse contrato nesta Sprint — é puramente a interface que uma
Sprint futura preencherá (ex.: consumindo `@/core/ai`).

## CRUD local (Sprint 33) — "sem persistência externa"

Todo cadastro/edição/conclusão (Cliente, Empresa, Negócio, Atividade,
Agenda, movimentação no Pipeline) acontece inteiramente em memória via
`workspace/useLocalCollection.ts`, que mescla os dados somente-leitura
de `hooks/` (protegidos, intocados) com mutações da sessão atual. Ao
recarregar a página, as mutações são perdidas — não existe backend
nesta Sprint, exatamente como pedido pelo ESCOPO. Cada criação/edição
relevante também gera uma entrada de `HistoryEntry` local, para que a
Timeline de Cliente/Empresa/Negócio reflita as operações da sessão.

## Pipeline: Kanban vs. Workspace de Negócios

O Drag and Drop interativo entre etapas vive exclusivamente na seção
"Pipeline" (`PipelinePage.tsx`) para evitar duas fontes de verdade
divergentes sobre o estágio de um negócio na mesma sessão. A aba
"Kanban" dentro do Workspace de Negócios (`DealsPage.tsx`) é uma
prévia somente-leitura agrupada por etapa; a aba "Pipeline" ali é um
funil somente-leitura (contagem e valor total por etapa).
