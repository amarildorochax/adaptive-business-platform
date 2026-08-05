import type { Visualization } from './Visualization';
import type { VisualizationRepository } from './VisualizationRepository';

/** VisualizationService — nenhum precedente legado equivalente foi encontrado. Nenhuma emissão de Evento aqui — responsabilidade exclusiva de AnalyticsManager. */
export class VisualizationService {
  constructor(private readonly repository: VisualizationRepository) {}

  async publish(sourceId: string): Promise<Visualization> {
    const visualization: Visualization = { visualizationId: crypto.randomUUID(), sourceId, publishedAt: new Date() };
    return this.repository.create(visualization);
  }

  async get(visualizationId: string): Promise<Visualization | undefined> {
    return this.repository.get(visualizationId);
  }
}
