// index.ts
//
// Responsabilidade:
// Ponto único de exportação da feature CRM (Sprint 32 — Adaptive CRM
// Foundation) — `CrmHome` (composição principal), pages, components,
// hooks, services, types, contracts e mocks. Consome exclusivamente
// `@/design-system` e `@/app` (shell/primitives) — zero import de
// `@/core`. Todos os dados são simulados via `CrmMockService`; a
// integração real com o Core (`CrmAdapter`, já existente em
// `@/app/integrations`) é trabalho de uma Sprint futura.
//
// Resoluções explícitas de ambiguidade de nome neste barrel:
// - `Tag` existe como entidade (`types/Tag.ts`) e como componente
//   (`components/Tag.tsx`) — o componente vence o nome curto `Tag`
//   (consistente com o uso mais comum em UI); a entidade é reexportada
//   como `TagEntity` (mesma convenção já usada internamente por
//   `hooks/useTags.ts`).
// - `ActivityItem` (componente) e `AgendaEvent` (entidade) colidem com
//   nomes já exportados pela feature Dashboard no barrel compartilhado
//   `@/app/features` (`mocks/recentActivities.mock.ts` e
//   `mocks/agenda.mock.ts`, Sprint 28) — reexportados aqui com o
//   prefixo `Crm` para evitar TS2308 nesse barrel superior.

export * from './CrmHome';
export * from './pages';

export {
  CRMCard,
  StatusBadge,
  Tag,
  CompanyCard,
  ClientCard,
  DealCard,
  Timeline,
  PipelineCard,
  PipelineColumn,
  CrmSidebar,
} from './components';
export { ActivityItem as CrmActivityItem } from './components';
export type { CrmSection } from './components';

export * from './hooks';
export * from './services';

export type {
  CrmEntityType,
  CrmRecordStatus,
  Company,
  CompanySize,
  Client,
  ClientStatus,
  CrmPipelineStage,
  Deal,
  Activity,
  ActivityType,
  ActivityStatus,
  AgendaEventType,
  Note,
  HistoryEntry,
} from './types';
export type { Tag as TagEntity } from './types';
export type { AgendaEvent as CrmAgendaEvent } from './types';

export * from './contracts';
export * from './mocks';
