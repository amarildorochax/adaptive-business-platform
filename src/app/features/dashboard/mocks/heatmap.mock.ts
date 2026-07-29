// heatmap.mock.ts
//
// Responsabilidade:
// Dado simulado do widget "Heatmap" — intensidade de uso por dia da
// semana x faixa horária. Gerado de forma determinística (sem
// `Math.random()`), para que o mock seja estável entre renders/testes.

export interface HeatmapCell {
  day: string;
  hourRange: string;
  intensity: number;
}

const DAYS = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];
const HOUR_RANGES = ['00-06', '06-12', '12-18', '18-24'];

function deterministicIntensity(dayIndex: number, hourIndex: number): number {
  const seed = (dayIndex + 1) * (hourIndex + 2);
  return (seed * 37) % 100;
}

export function generateHeatmap(): HeatmapCell[] {
  const cells: HeatmapCell[] = [];

  DAYS.forEach((day, dayIndex) => {
    HOUR_RANGES.forEach((hourRange, hourIndex) => {
      cells.push({ day, hourRange, intensity: deterministicIntensity(dayIndex, hourIndex) });
    });
  });

  return cells;
}

export { DAYS as HEATMAP_DAYS, HOUR_RANGES as HEATMAP_HOUR_RANGES };
