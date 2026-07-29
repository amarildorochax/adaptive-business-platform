/**
 * Contrato futuro (Tarefa 10) — apenas interface, nunca implementado
 * nesta Sprint. Reserva o formato de uma configuração de layout
 * (posição/tamanho de cada widget) persistível por usuário.
 *
 * Nota: distinto de `src/layout/DashboardLayout.tsx` (componente React
 * pré-existente do "escritório" Phaser/legacy) — arquivos, extensões e
 * responsabilidades diferentes; nenhuma colisão de import (caminhos
 * `@/core/dashboard/DashboardLayout` vs `@/layout/DashboardLayout`), e o
 * componente `.tsx` permanece inalterado.
 */
export interface DashboardLayout {
  widgetId: string;
  x: number;
  y: number;
  width: number;
  height: number;
}
