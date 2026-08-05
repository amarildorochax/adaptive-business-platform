import type { HealthCheck } from "./HealthCheck.js";
import type { HealthCheckRepository } from "./HealthCheckRepository.js";

/**
 * Health Check Service — "a verificação periódica e automatizada de que uma instância de um
 * componente permanece funcional" (`NON_FUNCTIONAL_REQUIREMENTS.md`, Capítulo 5; NFR-020).
 */
export class HealthCheckService {
  constructor(private readonly repository: HealthCheckRepository) {}

  async record(component: string, healthy: boolean): Promise<HealthCheck> {
    const check: HealthCheck = { component, healthy, checkedAt: new Date() };
    return this.repository.create(check);
  }

  /**
   * Estado da verificação mais recente de um componente — sempre a última em ordem de inserção
   * retornada pelo Repository, nunca ordenada por `checkedAt` (mesma disciplina de
   * `CredentialService.matches`, IMP-011, para evitar desempate incorreto por resolução de
   * milissegundo). Retorna `undefined` quando nenhuma verificação ainda existe para o componente —
   * nunca assume um estado padrão não observado.
   */
  async isHealthy(component: string): Promise<boolean | undefined> {
    const checks = await this.repository.listByComponent(component);
    return checks[checks.length - 1]?.healthy;
  }
}
