// generateId.ts
//
// Responsabilidade:
// Gerador de identificador local (Sprint 33) — usado apenas por
// registros criados em memória nesta sessão (`useLocalCollection`).
// Nenhuma persistência externa; o formato não precisa coincidir com o
// de um futuro backend real.

export function generateId(prefix: string): string {
  const random = typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  return `${prefix}-${random}`;
}
