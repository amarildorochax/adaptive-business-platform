export type TimelineStepStatus = "completed" | "current" | "pending";

export interface TimelineStep {
  readonly id: string;
  readonly label: string;
  readonly status: TimelineStepStatus;
}

export interface TimelineProps {
  readonly steps: readonly TimelineStep[];
  readonly label: string;
}

/** Linha do tempo de estágios sequenciais — primeiro uso: a Jornada de Construção do Perfil (`BUSINESS_PROFILE_ENGINE.md`, Capítulo 9), reconstruída a partir do único estágio atual real já devolvido pela API (nenhuma listagem de histórico é inventada). */
export function Timeline({ steps, label }: TimelineProps) {
  return (
    <ol className="timeline" aria-label={label}>
      {steps.map((step) => (
        <li key={step.id} className={`timeline__step timeline__step--${step.status}`}>
          <span className="timeline__dot" aria-hidden="true" />
          <span className="timeline__label">{step.label}</span>
        </li>
      ))}
    </ol>
  );
}
