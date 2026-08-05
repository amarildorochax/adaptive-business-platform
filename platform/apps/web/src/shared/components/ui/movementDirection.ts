export type MovementDirection = "in" | "out" | "unknown";

/** Deriva a direção de uma movimentação a partir do sinal real do `delta` já conhecido no momento da mutação — nunca reconstruído retroativamente. Compartilhado por `MovementCard`. */
export function movementDirection(delta: number | undefined): MovementDirection {
  if (delta === undefined) return "unknown";
  return delta >= 0 ? "in" : "out";
}
