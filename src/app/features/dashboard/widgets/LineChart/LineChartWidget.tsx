// LineChartWidget.tsx
//
// Responsabilidade:
// Widget mock "Gráfico de Linha" (Sprint 31) — renderizado com SVG puro
// (sem biblioteca de gráficos, mesma decisão do Performance widget da
// Sprint 28). Dado 100% simulado; nenhum acesso ao Core.
//
// Sprint 31B (Premium Dark Theme & UI Polish): grid horizontal discreto
// (3 linhas em `--ads-color-border` a 40% de opacidade), área sob a
// linha com gradiente suave e um `<title>` nativo por ponto — um
// tooltip elegante sem JavaScript adicional nem biblioteca de gráficos.
//
// Sprint 31D (Adaptive Visual Identity — versão definitiva): linha/área
// trocadas de `--ads-color-primary` (agora roxo, reservado a botões e
// ao item ativo da Sidebar) para `--ads-color-info` (azul) — "Gráficos:
// Linha Azul, Área Azul translúcido" do ESCOPO.

import { WidgetFrame } from '../../components';
import type { WidgetDefinition, WidgetState } from '../../types';
import type { LineChartPoint } from '../../mocks';

export const lineChartDefinition: WidgetDefinition = {
  id: 'line-chart',
  title: 'Receita Diária',
  description: 'Tendência de receita nos últimos 30 dias (simulado).',
  icon: 'chevron-up',
  size: 'lg',
  position: { x: 0, y: 0, w: 6, h: 2 },
  permissions: {},
  refreshPolicy: { mode: 'interval', intervalMs: 60000 },
};

export interface LineChartWidgetProps {
  state: WidgetState<LineChartPoint[]>;
  onRefresh: () => void;
}

const WIDTH = 280;
const HEIGHT = 90;
const GRID_LINES = 3;

interface PlottedPoint extends LineChartPoint {
  x: number;
  y: number;
}

function plotPoints(points: LineChartPoint[]): PlottedPoint[] {
  if (points.length === 0) return [];
  const max = Math.max(...points.map((point) => point.value));
  const min = Math.min(...points.map((point) => point.value));
  const range = max - min || 1;
  const step = WIDTH / Math.max(1, points.length - 1);

  return points.map((point, index) => ({
    ...point,
    x: index * step,
    y: HEIGHT - ((point.value - min) / range) * HEIGHT,
  }));
}

export function LineChartWidget(props: LineChartWidgetProps) {
  const { state, onRefresh } = props;
  const plotted = plotPoints(state.data ?? []);
  const linePoints = plotted.map((point) => `${point.x},${point.y}`).join(' ');
  const areaPoints = plotted.length > 0 ? `0,${HEIGHT} ${linePoints} ${WIDTH},${HEIGHT}` : '';

  return (
    <WidgetFrame definition={lineChartDefinition} state={state} onRefresh={onRefresh}>
      <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} width="100%" height={HEIGHT} role="img" aria-label="Gráfico de linha de receita diária">
        <defs>
          <linearGradient id="line-chart-area" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--ads-color-info)" stopOpacity={0.25} />
            <stop offset="100%" stopColor="var(--ads-color-info)" stopOpacity={0} />
          </linearGradient>
        </defs>

        {Array.from({ length: GRID_LINES }, (_, index) => {
          const y = (HEIGHT / (GRID_LINES + 1)) * (index + 1);
          return (
            <line
              key={y}
              x1={0}
              y1={y}
              x2={WIDTH}
              y2={y}
              stroke="var(--ads-color-border)"
              strokeOpacity={0.4}
              strokeWidth={1}
            />
          );
        })}

        {areaPoints && <polygon points={areaPoints} fill="url(#line-chart-area)" stroke="none" />}

        <polyline
          points={linePoints}
          fill="none"
          stroke="var(--ads-color-info)"
          strokeWidth={2}
          strokeLinejoin="round"
          strokeLinecap="round"
        />

        {plotted.map((point) => (
          <circle key={point.label} cx={point.x} cy={point.y} r={2.5} fill="var(--ads-color-info)">
            <title>{`${point.label}: ${point.value}`}</title>
          </circle>
        ))}
      </svg>
    </WidgetFrame>
  );
}
