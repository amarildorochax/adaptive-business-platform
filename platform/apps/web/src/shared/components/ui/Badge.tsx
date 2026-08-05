import type { ReactNode } from "react";

export type BadgeTone = "neutral" | "primary" | "success" | "warning" | "danger" | "info";

export interface BadgeProps {
  readonly tone?: BadgeTone;
  readonly children: ReactNode;
}

/** Rótulo de estado curto (ex.: outcome de Opportunity, status de Execution) — nunca uma cor livre fora da paleta semântica. */
export function Badge({ tone = "neutral", children }: BadgeProps) {
  return <span className={`badge badge--${tone}`}>{children}</span>;
}
