import type { ServiceLevelIndicator, ServiceLevelObjective } from "./ServiceLevel.js";
import type { ServiceLevelIndicatorRepository, ServiceLevelObjectiveRepository } from "./ServiceLevelRepository.js";

/**
 * Service Level Service — "SLIs... são as métricas específicas que quantificam a qualidade de um
 * serviço... SLOs... são os alvos de qualidade definidos para cada SLI" (`NON_FUNCTIONAL_REQUIREMENTS.md`,
 * Capítulo 9; NFR-035). Nunca avalia conformidade de uma Metric contra um SLO — o Blueprint nunca
 * declara a direção de comparação (crescente ou decrescente) de um SLI, ao contrário do AlertRule,
 * cujo texto ("ultrapassa um limite") é explícito; avaliar aqui exigiria inventar uma regra ausente
 * do Blueprint (ver "Lacunas Arquiteturais" no relatório desta Sprint).
 */
export class ServiceLevelService {
  constructor(
    private readonly indicators: ServiceLevelIndicatorRepository,
    private readonly objectives: ServiceLevelObjectiveRepository,
  ) {}

  async defineIndicator(name: string, metricName: string): Promise<ServiceLevelIndicator> {
    const indicator: ServiceLevelIndicator = { name, metricName };
    return this.indicators.create(indicator);
  }

  async defineObjective(indicatorName: string, target: number): Promise<ServiceLevelObjective> {
    const objective: ServiceLevelObjective = { indicator: indicatorName, target };
    return this.objectives.create(objective);
  }

  async listIndicators(): Promise<readonly ServiceLevelIndicator[]> {
    return this.indicators.list();
  }

  async listObjectivesFor(indicatorName: string): Promise<readonly ServiceLevelObjective[]> {
    return this.objectives.listByIndicator(indicatorName);
  }
}
