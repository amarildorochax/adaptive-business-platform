// typography.ts
//
// Responsabilidade:
// Tokens tipográficos do Adaptive Design System — família de fonte,
// escala de tamanhos, pesos, altura de linha, espaçamento entre letras,
// e a composição desses tokens em estilos de texto nomeados (Display,
// Heading, Body, Caption, Label), conforme exigido pela Sprint 26.

export const fontFamily = {
  sans: '"Inter", "Segoe UI", system-ui, -apple-system, sans-serif',
  mono: '"JetBrains Mono", "Fira Code", ui-monospace, monospace',
} as const;

export const fontWeight = {
  regular: 400,
  medium: 500,
  semibold: 600,
  bold: 700,
} as const;

export const fontSize = {
  xs: '0.75rem',
  sm: '0.875rem',
  md: '1rem',
  lg: '1.125rem',
  xl: '1.25rem',
  '2xl': '1.5rem',
  '3xl': '1.875rem',
  '4xl': '2.25rem',
  '5xl': '3rem',
} as const;

export const lineHeight = {
  tight: 1.2,
  snug: 1.35,
  normal: 1.5,
  relaxed: 1.65,
} as const;

export const letterSpacing = {
  tight: '-0.02em',
  normal: '0',
  wide: '0.02em',
  wider: '0.04em',
} as const;

export interface TextStyle {
  fontFamily: string;
  fontSize: string;
  fontWeight: number;
  lineHeight: number;
  letterSpacing: string;
}

/** Escala tipográfica nomeada — composição dos tokens acima em estilos de texto prontos para uso pelos componentes. */
export const textStyles: Record<'display' | 'heading' | 'body' | 'caption' | 'label', TextStyle> = {
  display: {
    fontFamily: fontFamily.sans,
    fontSize: fontSize['5xl'],
    fontWeight: fontWeight.bold,
    lineHeight: lineHeight.tight,
    letterSpacing: letterSpacing.tight,
  },
  heading: {
    fontFamily: fontFamily.sans,
    fontSize: fontSize['3xl'],
    fontWeight: fontWeight.semibold,
    lineHeight: lineHeight.snug,
    letterSpacing: letterSpacing.normal,
  },
  body: {
    fontFamily: fontFamily.sans,
    fontSize: fontSize.md,
    fontWeight: fontWeight.regular,
    lineHeight: lineHeight.normal,
    letterSpacing: letterSpacing.normal,
  },
  caption: {
    fontFamily: fontFamily.sans,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.regular,
    lineHeight: lineHeight.normal,
    letterSpacing: letterSpacing.normal,
  },
  label: {
    fontFamily: fontFamily.sans,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.medium,
    lineHeight: lineHeight.tight,
    letterSpacing: letterSpacing.wide,
  },
};
