// contrast.ts
//
// Responsabilidade:
// Cálculo de contraste WCAG entre duas cores hexadecimais — preparação
// de acessibilidade (verificação de contraste) exigida pela Sprint 26.

function relativeLuminance(hex: string): number {
  const value = hex.replace('#', '');
  const r = parseInt(value.substring(0, 2), 16) / 255;
  const g = parseInt(value.substring(2, 4), 16) / 255;
  const b = parseInt(value.substring(4, 6), 16) / 255;

  const channel = (c: number) => (c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4));

  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

/** Razão de contraste WCAG entre duas cores hexadecimais (`#rrggbb`). */
export function contrastRatio(hexA: string, hexB: string): number {
  const luminanceA = relativeLuminance(hexA) + 0.05;
  const luminanceB = relativeLuminance(hexB) + 0.05;
  return luminanceA > luminanceB ? luminanceA / luminanceB : luminanceB / luminanceA;
}

/** `true` se o par de cores atender ao mínimo AA (4.5:1) do WCAG para texto normal. */
export function meetsContrastAA(foreground: string, background: string): boolean {
  return contrastRatio(foreground, background) >= 4.5;
}

/** `true` se o par de cores atender ao mínimo AAA (7:1) do WCAG para texto normal. */
export function meetsContrastAAA(foreground: string, background: string): boolean {
  return contrastRatio(foreground, background) >= 7;
}
