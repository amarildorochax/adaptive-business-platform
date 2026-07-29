// lineChart.mock.ts
//
// Responsabilidade:
// Dado simulado do widget "Gráfico de Linha".

export interface LineChartPoint {
  label: string;
  value: number;
}

export function generateLineChartSeries(): LineChartPoint[] {
  return [
    { label: '01', value: 8200 },
    { label: '05', value: 9100 },
    { label: '10', value: 8700 },
    { label: '15', value: 10400 },
    { label: '20', value: 11200 },
    { label: '25', value: 10800 },
    { label: '30', value: 12600 },
  ];
}
