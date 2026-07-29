// cx.ts
//
// Responsabilidade:
// Utilitário de composição de nomes de classe CSS — usado pelos
// componentes base do Adaptive Design System, sem dependência externa
// (não instala `clsx`/`classnames`).

export function cx(...values: Array<string | false | null | undefined>): string {
  return values.filter(Boolean).join(' ');
}
