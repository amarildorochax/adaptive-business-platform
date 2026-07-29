// routeTypes.ts
//
// Responsabilidade:
// Extensão tipada de `RouteObject` (react-router-dom) que anexa
// `RouteMeta` via `handle` — o mecanismo nativo do react-router para
// metadados arbitrários por rota. Não introduz nenhum sistema de
// roteamento paralelo.

import type { RouteObject } from 'react-router-dom';
import type { RouteMeta } from '../shared';

export type AppRouteObject = RouteObject & { handle?: RouteMeta };
