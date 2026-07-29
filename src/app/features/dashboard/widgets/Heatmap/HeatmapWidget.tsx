// HeatmapWidget.tsx
//
// Responsabilidade:
// Widget mock "Heatmap" — intensidade de uso por dia x faixa horária,
// renderizado como uma grade de células coloridas (CSS puro). Dado 100%
// simulado (gerado deterministicamente); nenhum acesso ao Core.

import { Fragment } from 'react';
import { WidgetFrame } from '../../components';
import type { WidgetDefinition, WidgetState } from '../../types';
import { HEATMAP_DAYS, HEATMAP_HOUR_RANGES, type HeatmapCell } from '../../mocks';

export const heatmapDefinition: WidgetDefinition = {
  id: 'heatmap',
  title: 'Mapa de Calor de Utilização',
  description: 'Intensidade de uso por dia e horário (simulado).',
  icon: 'chevron-down',
  size: 'xl',
  position: { x: 8, y: 2, w: 4, h: 4 },
  permissions: {},
  refreshPolicy: { mode: 'manual' },
};

export interface HeatmapWidgetProps {
  state: WidgetState<HeatmapCell[]>;
  onRefresh: () => void;
}

function colorForIntensity(intensity: number): string {
  const opacity = 0.15 + (intensity / 100) * 0.75;
  return `color-mix(in srgb, var(--ads-color-primary) ${Math.round(opacity * 100)}%, var(--ads-color-surface))`;
}

export function HeatmapWidget(props: HeatmapWidgetProps) {
  const { state, onRefresh } = props;
  const cellByKey = new Map((state.data ?? []).map((cell) => [`${cell.day}-${cell.hourRange}`, cell]));

  return (
    <WidgetFrame definition={heatmapDefinition} state={state} onRefresh={onRefresh}>
      <div
        role="img"
        aria-label="Heatmap de utilização por dia e horário"
        style={{
          display: 'grid',
          gridTemplateColumns: `48px repeat(${HEATMAP_HOUR_RANGES.length}, 1fr)`,
          gap: 4,
        }}
      >
        <span />
        {HEATMAP_HOUR_RANGES.map((hourRange) => (
          <span key={hourRange} style={{ fontSize: '0.65rem', textAlign: 'center', color: 'var(--ads-color-text-secondary)' }}>
            {hourRange}
          </span>
        ))}

        {HEATMAP_DAYS.map((day) => (
          <Fragment key={day}>
            <span style={{ fontSize: '0.7rem', color: 'var(--ads-color-text-secondary)' }}>{day}</span>
            {HEATMAP_HOUR_RANGES.map((hourRange) => {
              const cell = cellByKey.get(`${day}-${hourRange}`);
              return (
                <div
                  key={`${day}-${hourRange}`}
                  title={`${day} ${hourRange}: ${cell?.intensity ?? 0}%`}
                  style={{
                    height: 20,
                    borderRadius: 'var(--ads-radius-sm)',
                    backgroundColor: colorForIntensity(cell?.intensity ?? 0),
                  }}
                />
              );
            })}
          </Fragment>
        ))}
      </div>
    </WidgetFrame>
  );
}
