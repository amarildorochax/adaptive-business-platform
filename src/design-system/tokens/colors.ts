// colors.ts
//
// Responsabilidade:
// Escalas primitivas de cor do Adaptive Design System — valores brutos
// (hex), sem significado semântico. O significado semântico (primary,
// success, danger, background, text...) é responsabilidade exclusiva de
// `foundations/themes/*`, nunca deste arquivo.
//
// Nota: os valores abaixo são a paleta padrão da Fundação (Sprint 26).
// A Branding oficial da plataforma (Sprint 29, Fase 2) pode substituir
// estes valores sem alterar nenhuma outra camada do Design System, já
// que todo o restante do sistema referencia apenas os tokens semânticos
// derivados destas escalas — nunca hex literais.

export const colorPrimitives = {
  blue: {
    100: '#dbeafe',
    300: '#93c5fd',
    500: '#3b82f6',
    700: '#1d4ed8',
    900: '#1e3a8a',
  },
  violet: {
    100: '#ede9fe',
    300: '#c4b5fd',
    500: '#8b5cf6',
    700: '#6d28d9',
    900: '#4c1d95',
  },
  green: {
    100: '#dcfce7',
    300: '#86efac',
    500: '#22c55e',
    700: '#15803d',
    900: '#14532d',
  },
  amber: {
    100: '#fef3c7',
    300: '#fcd34d',
    500: '#f59e0b',
    700: '#b45309',
    900: '#78350f',
  },
  red: {
    100: '#fee2e2',
    300: '#fca5a5',
    500: '#ef4444',
    700: '#b91c1c',
    900: '#7f1d1d',
  },
  cyan: {
    100: '#cffafe',
    300: '#67e8f9',
    500: '#06b6d4',
    700: '#0e7490',
    900: '#164e63',
  },
  gray: {
    50: '#f8fafc',
    100: '#f1f5f9',
    200: '#e2e8f0',
    300: '#cbd5e1',
    400: '#94a3b8',
    500: '#64748b',
    600: '#475569',
    700: '#334155',
    800: '#1e293b',
    900: '#0f172a',
    950: '#020617',
  },
} as const;

export type ColorPrimitiveScale = keyof typeof colorPrimitives;
