/**
 * Health Check — "a verificação periódica e automatizada de que uma instância de um componente
 * permanece funcional, removendo-a do conjunto de instâncias ativas assim que uma falha é detectada"
 * (`NON_FUNCTIONAL_REQUIREMENTS.md`, Capítulo 5; NFR-020). Deliberadamente binário — o texto do
 * Blueprint nunca descreve um estado intermediário entre "funcional" e "falha detectada".
 * Estrutura ausente de `OBSERVABILITY_CONCRETE_STRUCTURE.md` — gap coberto nesta Sprint (IMP-012).
 */
export interface HealthCheck {
  readonly component: string;
  readonly healthy: boolean;
  readonly checkedAt: Date;
}
