import type { DashboardWidgetType } from "./DashboardWidgetType";
import type { DashboardWidgetStatus } from "./DashboardWidgetStatus";

/**
 * Interface base de todo widget do Dashboard (Tarefa 04).
 *
 * `data` é deliberadamente `Record<string, unknown>` — cada widget
 * concreto (RuntimeWidget, EventBusWidget, ...) documenta e preenche seu
 * próprio formato específico, mas o Dashboard/DashboardManager tratam
 * todo widget de forma genérica através deste único contrato, nunca
 * precisando conhecer o formato interno de `data` de nenhum widget
 * específico — e nunca usando cast (`as`) para lê-lo, já que
 * `DashboardManager` nunca interpreta `data`, apenas o repassa.
 */
export interface DashboardWidget {
  id: string;

  title: string;

  type: DashboardWidgetType;

  status: DashboardWidgetStatus;

  data: Record<string, unknown>;

  updatedAt: Date;
}
