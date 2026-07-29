// DashboardLayout.ts
//
// Responsabilidade:
// Contrato do layout do Dashboard — o conjunto de posições/tamanhos dos
// widgets ativos, e a forma serializável usada por
// `DashboardLayoutManager`. Persistência real (localStorage/API) é
// deliberadamente NÃO implementada nesta Sprint — apenas o contrato de
// serialização, para que uma Sprint futura possa persistir sem exigir
// nenhuma mudança de forma.

import type { WidgetPosition } from './Widget';

export interface DashboardLayoutEntry {
  widgetId: string;
  position: WidgetPosition;
  visible: boolean;
}

export interface DashboardLayoutSnapshot {
  version: number;
  entries: DashboardLayoutEntry[];
}
