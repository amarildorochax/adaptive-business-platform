import type { Visualization } from './Visualization';

/** Contrato de persistência de Visualization — apenas o contrato. */
export interface VisualizationRepository {
  create(visualization: Visualization): Promise<Visualization>;
  get(visualizationId: string): Promise<Visualization | undefined>;
}
