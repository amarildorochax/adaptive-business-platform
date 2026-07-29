/**
 * Contrato de dependência entre etapas futuro (Tarefa 10 — não
 * implementado nesta Sprint). `ExecutionPlanner` hoje nunca considera
 * dependência — toda etapa roda, na ordem declarada, independentemente
 * do resultado das anteriores.
 *
 * Responsabilidade reservada: declarar que uma etapa só deve rodar
 * depois que outra(s) já tiverem concluído. Nenhum componente desta
 * Sprint cria, lê, ou aplica uma StepDependency.
 */
export interface StepDependency {
  stepOrder: number;
  dependsOnStepOrders: number[];
}
