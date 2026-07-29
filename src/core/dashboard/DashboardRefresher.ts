import type { DashboardWidget } from "./DashboardWidget";

/**
 * Responsável exclusivamente por reexecutar os construtores de widget já
 * fornecidos, produzindo uma lista atualizada de DashboardWidget
 * (Tarefa 09).
 *
 * Responsabilidade: único método público, `refresh()` — nenhuma
 * atualização automática (sem `setInterval`/polling) é implementada
 * nesta Sprint; cada chamada a `refresh()` é síncrona e sob demanda.
 *
 * Recebe os construtores de widget (`buildRuntimeWidget`,
 * `buildEventBusWidget`, ...) já resolvidos por DashboardManager — nunca
 * importa `businessMemory`/`workflowEngine`/etc. diretamente, mantendo
 * os widgets independentes entre si (cada um só conhece sua própria
 * fonte de dados).
 *
 * Dependências: DashboardWidget (tipo).
 *
 * Consumido exclusivamente por DashboardManager.
 */
export class DashboardRefresher {
  /** Reexecuta cada função de `builders`, na ordem informada, e retorna a lista resultante de DashboardWidget. */
  refresh(builders: Array<() => DashboardWidget>): DashboardWidget[] {
    return builders.map((build) => build());
  }
}
