// Logo.tsx
//
// Responsabilidade:
// Identidade oficial da Adaptive Business Platform — logotipo
// tipográfico (wordmark) + símbolo, nas versões Light/Dark/
// Monocromática/Reduzida. Não depende de nenhum asset de imagem
// (SVG/PNG): é composto inteiramente a partir dos tokens de tipografia
// e cor do Design System, consistente com a decisão da Sprint 26/27 de
// adiar assets reais de ícone/imagem para quando existirem.
//
// Ver `docs/design-system/BRAND_GUIDE.md` para a área de proteção,
// tamanho mínimo e regras completas de uso.

import { fontFamily, fontWeight } from '../../tokens/typography';

export type LogoVariant = 'light' | 'dark' | 'mono' | 'reduced';

export interface LogoProps {
  variant?: LogoVariant;
  /** Altura do símbolo, em px. O wordmark escala proporcionalmente. */
  size?: number;
}

const COLOR_BY_VARIANT: Record<LogoVariant, { symbol: string; wordmark: string }> = {
  light: { symbol: 'var(--ads-color-primary)', wordmark: 'var(--ads-color-text-primary)' },
  dark: { symbol: 'var(--ads-color-primary)', wordmark: '#ffffff' },
  mono: { symbol: 'currentColor', wordmark: 'currentColor' },
  reduced: { symbol: 'var(--ads-color-primary)', wordmark: 'var(--ads-color-text-primary)' },
};

/** Símbolo — um quadrado com cantos arredondados e um corte diagonal, representando adaptabilidade. Puramente CSS, sem asset externo. */
function Symbol(props: { size: number; color: string }) {
  const { size, color } = props;

  return (
    <span
      aria-hidden="true"
      style={{
        display: 'inline-block',
        width: size,
        height: size,
        borderRadius: size * 0.28,
        background: `linear-gradient(135deg, ${color} 55%, transparent 55.5%)`,
        flexShrink: 0,
      }}
    />
  );
}

/** Logotipo oficial da Adaptive Business Platform. Ver `LogoVariant` para as versões exigidas pela Sprint 29 (Light/Dark/Mono/Reduzida). */
export function Logo(props: LogoProps) {
  const { variant = 'light', size = 24 } = props;
  const colors = COLOR_BY_VARIANT[variant];

  return (
    <span
      role="img"
      aria-label="Adaptive Business Platform"
      style={{ display: 'inline-flex', alignItems: 'center', gap: size * 0.4 }}
    >
      <Symbol size={size} color={colors.symbol} />
      {variant !== 'reduced' && (
        <span
          style={{
            fontFamily: fontFamily.sans,
            fontWeight: fontWeight.bold,
            fontSize: size * 0.75,
            color: colors.wordmark,
            letterSpacing: '-0.01em',
          }}
        >
          Adaptive
        </span>
      )}
    </span>
  );
}
