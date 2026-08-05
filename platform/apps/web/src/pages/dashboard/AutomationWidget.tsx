import { WidgetCard } from "@shared/components/WidgetCard";
import { LiveIndicator } from "@shared/components/ui/LiveIndicator";
import { useRecentlyChanged } from "@shared/hooks/useRecentlyChanged";
import type { DemoSnapshot } from "@core/managers/seedDemoData";

/**
 * "Tarefas" do escopo desta Sprint é atendido pela Execução de Workflow mais recente — o
 * `AutomationManager` não cataloga uma Entidade "Task" própria; Execution é o dado real mais
 * próximo já disponível (ver relatório da Sprint, Seção "Pendências").
 *
 * `LiveIndicator` (UX-002, "Automações Integradas") acende quando `workflow.status`/
 * `execution.status` mudam de fato em relação ao render anterior — nunca um selo "ao vivo"
 * permanente e decorativo; per instrução explícita desta Sprint ("As automações devem aparecer
 * naturalmente dentro da operação... Sempre utilizando os eventos reais da plataforma"), o selo só
 * acende quando o próprio dado real do Automation Engine (`@abp/automation-engine`, em processo)
 * realmente mudar de valor entre duas leituras.
 */
export function AutomationWidget({ snapshot }: { readonly snapshot: DemoSnapshot }) {
  const justChanged = useRecentlyChanged(`${snapshot.workflow.status}:${snapshot.execution.status}`);

  return (
    <WidgetCard title="Automação — Execuções">
      <dl>
        <dt>Workflow</dt>
        <dd>
          {snapshot.workflow.name} ({snapshot.workflow.status})
        </dd>
        <dt>Última execução</dt>
        <dd>{snapshot.execution.status}</dd>
      </dl>
      {justChanged && <LiveIndicator label="Execução atualizada agora" />}
    </WidgetCard>
  );
}
