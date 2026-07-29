// WidgetController.tsx
//
// Responsabilidade:
// Camada de orquestração entre `DashboardGrid` e o componente de
// conteúdo de um widget (`WidgetFrame` + `WidgetContent`, ambos
// internos a cada `*Widget.tsx` da Sprint 28 — nenhum deles é alterado
// por esta Sprint). Fluxo: `DashboardGrid → WidgetController →
// WidgetFrame → WidgetContent`.
//
// Centraliza, via `useWidgetController`: derivação do estado
// padronizado de 7 valores, contagem de retry e os pontos de extensão
// (ainda não implementados) de permissão e telemetria. Cache
// (`controllers/cache`) e Feature Flags além do `enabled/hidden` básico
// ainda não têm um ponto de injeção aqui — são apenas contrato,
// prontos para quando uma Sprint futura precisar deles.
//
// Nenhum Widget conhece este arquivo, `DashboardMockService`, cache,
// permissões ou telemetria — o contrato de props que cada `*Widget.tsx`
// já expunha desde a Sprint 28 (`{ state, onRefresh }`) permanece
// idêntico.

import type { ComponentType } from 'react';
import { EmptyState } from '@/design-system/components';
import { emptyStatePresets } from '@/design-system/foundations';
import { useWidgetController } from '../hooks/useWidgetController';
import type { WidgetRendererProps } from '../widgets';
import type { WidgetDefinition, WidgetState } from '../types';

export interface WidgetControllerProps {
  definition: WidgetDefinition;
  state: WidgetState;
  onRefresh: () => void;
  Component: ComponentType<WidgetRendererProps>;
}

export function WidgetController(props: WidgetControllerProps) {
  const { definition, state, onRefresh, Component } = props;
  const controller = useWidgetController({ definition, state, onRefresh });

  if (!controller.canView) {
    return <EmptyState {...emptyStatePresets.permissionDenied} />;
  }

  if (controller.status === 'disabled') {
    return null;
  }

  return <Component state={controller.state} onRefresh={controller.refresh} />;
}
