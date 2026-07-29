// miniCharts.mock.ts
//
// Responsabilidade:
// Dado simulado do widget "Mini Gráficos" — pequenos indicadores com
// tendência (sparkline).

export interface MiniChartMetric {
  id: string;
  label: string;
  value: string;
  trend: number[];
}

export function generateMiniCharts(): MiniChartMetric[] {
  return [
    { id: 'visits', label: 'Visitas', value: '24.1k', trend: [4, 6, 5, 8, 7, 9, 11] },
    { id: 'signups', label: 'Cadastros', value: '1.8k', trend: [2, 3, 3, 4, 6, 5, 7] },
    { id: 'engagement', label: 'Engajamento', value: '63%', trend: [9, 8, 8, 7, 8, 9, 10] },
  ];
}
