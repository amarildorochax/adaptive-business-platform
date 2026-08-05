import { AlertTriangle, CheckCircle2, Circle } from "lucide-react";

export type ProcessFlowStepStatus = "completed" | "current" | "pending" | "blocked";

export interface ProcessFlowStep {
  readonly id: string;
  readonly label: string;
  readonly status: ProcessFlowStepStatus;
  /** Contagem/valor real opcional exibido sob o rótulo (ex.: "8 de 10") — nunca um texto fixo genérico. */
  readonly detail?: string;
}

export interface ProcessFlowProps {
  readonly label: string;
  readonly steps: readonly ProcessFlowStep[];
}

const ICON: Record<ProcessFlowStepStatus, typeof Circle> = { completed: CheckCircle2, current: Circle, pending: Circle, blocked: AlertTriangle };

/**
 * Fluxo visual de processo (UX-002) — uma cadeia horizontal e conectada de etapas reais, cada uma
 * com seu próprio estado (`completed`/`current`/`pending`/`blocked`), permitindo entender de
 * imediato onde uma operação real da Empresa se encontra — "Fluxos Visuais", Capítulo 1 desta
 * Sprint. Distinto, por desenho original (nunca inspirado em nenhuma interface de referência
 * específica), de `Timeline` (lista vertical de estágios sequenciais de uma única jornada, UX-001)
 * e de `KanbanColumn` (quadro de arraste entre Stage de um Pipeline, FUN-103) — `ProcessFlow` é
 * para o caso em que múltiplas etapas de naturezas distintas (não necessariamente do mesmo domínio)
 * formam uma cadeia operacional única, o "Lead → CRM → Produto → Estoque" citado como exemplo por
 * esta Sprint.
 *
 * Todo `step` é responsabilidade exclusiva de quem chama — este componente nunca decide o quê é
 * "completo" ou "atual"; apenas apresenta o que já foi calculado a partir de dado real (nunca
 * fabricado), per instrução explícita ("Tudo utilizando dados reais. Nunca gerar dados fictícios").
 */
export function ProcessFlow({ label, steps }: ProcessFlowProps) {
  return (
    <ol className="process-flow" aria-label={label}>
      {steps.map((step, index) => {
        const Icon = ICON[step.status];
        return (
          <li key={step.id} className={`process-flow__step process-flow__step--${step.status}`}>
            <div className="process-flow__node">
              <Icon size={18} aria-hidden="true" />
            </div>
            <div className="process-flow__body">
              <span className="process-flow__label">{step.label}</span>
              {step.detail && <span className="process-flow__detail">{step.detail}</span>}
            </div>
            {index < steps.length - 1 && <span className="process-flow__connector" aria-hidden="true" />}
          </li>
        );
      })}
    </ol>
  );
}
