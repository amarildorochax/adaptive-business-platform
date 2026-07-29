// DashboardGrid.tsx
//
// Responsabilidade:
// Grid responsivo do Dashboard — resolve cada entrada visível do
// layout (`useDashboardLayout`) para sua `WidgetDefinition` e
// componente de conteúdo (`widgetComponentMap`), dimensionando cada
// widget por `columnSpanForSize` e distribuindo colunas conforme o
// breakpoint ativo do Design System.
//
// Drag & Drop / Resize: apenas a ESTRUTURA está preparada — `onDragStart`/
// `onResizeStart` são pontos de extensão reservados (não implementados
// nesta Sprint, conforme exigido pelo ESCOPO). Reordenação manual (via
// botões ↑/↓, `moveUp`/`moveDown` de `useDashboardLayout`) é real e
// funcional, como demonstração de que o contrato de reordenação
// funciona de ponta a ponta.
//
// Nota (Sprint 29A): cada widget agora é renderizado através de
// `WidgetController`, não mais diretamente — `Dashboard → DashboardGrid
// → WidgetController → WidgetFrame → WidgetContent`. `state`/`refresh`
// continuam vindo de `useDashboard` (Sprint 28), inalterado; o
// Controller apenas se interpõe entre este Grid e o componente de
// conteúdo do widget.

import { useBreakpoint } from '@/design-system/hooks';
import { Button } from '@/design-system/components';
import { widgetComponentMap } from '../widgets';
import { WidgetController } from '../controllers';
import { columnSpanForSize } from '../utils/widgetSize';
import { columnsForActiveBreakpoints } from '../utils/responsiveColumns';
import type { UseDashboardResult } from '../hooks';

export interface DashboardGridProps {
  dashboard: UseDashboardResult;
}

export function DashboardGrid(props: DashboardGridProps) {
  const { dashboard } = props;
  const { definitions, states, refresh, layout } = dashboard;

  const isTablet = useBreakpoint('tablet');
  const isDesktop = useBreakpoint('desktop');
  const isWide = useBreakpoint('wide');
  const isUltrawide = useBreakpoint('ultrawide');
  const totalColumns = columnsForActiveBreakpoints({ isTablet, isDesktop, isWide, isUltrawide });

  const definitionById = new Map(definitions.map((definition) => [definition.id, definition]));
  const visibleEntries = layout.snapshot.entries.filter((entry) => entry.visible);

  return (
    <div
      role="region"
      aria-label="Grade de widgets do Painel"
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${totalColumns}, 1fr)`,
        gap: 16,
      }}
    >
      {visibleEntries.map((entry, index) => {
        const definition = definitionById.get(entry.widgetId);
        const Widget = widgetComponentMap[entry.widgetId];
        if (!definition || !Widget) return null;

        const span = Math.min(columnSpanForSize(definition.size), totalColumns);

        return (
          <div key={entry.widgetId} style={{ gridColumn: `span ${span}` }}>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 4 }}>
              <Button
                variant="neutral"
                size="sm"
                disabled={index === 0}
                onClick={() => layout.moveUp(entry.widgetId)}
              >
                <span aria-label={`Mover ${definition.title} para cima`}>↑</span>
              </Button>
              <Button
                variant="neutral"
                size="sm"
                disabled={index === visibleEntries.length - 1}
                onClick={() => layout.moveDown(entry.widgetId)}
              >
                <span aria-label={`Mover ${definition.title} para baixo`}>↓</span>
              </Button>
            </div>
            <WidgetController
              definition={definition}
              state={states[entry.widgetId] ?? { status: 'idle', data: null, error: null, lastUpdatedAt: null }}
              onRefresh={() => refresh(entry.widgetId)}
              Component={Widget}
            />
          </div>
        );
      })}
    </div>
  );
}
