/**
 * Contrato futuro (Tarefa 08) — apenas interface, nunca implementado
 * nesta Sprint. Reserva o formato de uma previsão estatística real
 * sobre um indicador — fora do escopo desta Sprint (`Trend` aqui
 * apenas compara valores já observados, nunca projeta o futuro).
 */
export interface ForecastProvider {
  forecast(metricName: string): Promise<number>;
}
