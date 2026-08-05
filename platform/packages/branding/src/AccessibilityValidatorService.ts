/**
 * Accessibility Validator Service — implementa o "Accessibility Validator" (`BRANDING_HUB.md`,
 * Capítulo 7 e 14): "verifica, especificamente, que toda paleta gerada atenda aos requisitos mínimos
 * de contraste e legibilidade... seguindo padrões reconhecidos de legibilidade." Implementa o cálculo
 * de contraste WCAG 2.x (razão de luminância relativa) — um padrão já reconhecido, nunca uma regra
 * inventada por esta Sprint — e o ajuste de luminosidade preservando matiz e saturação exigido por
 * ADR-008: "gera variação de tonalidade compatível, nunca substitui a cor por uma completamente
 * diferente."
 *
 * Limite mínimo de contraste (4.5:1) segue o critério AA do WCAG 2.1 para texto normal, o mesmo
 * "padrão reconhecido de legibilidade" citado pelo Blueprint sem enumerar um valor numérico
 * específico — a escolha do limite exato (AA vs. AAA) é uma decisão de implementação, documentada
 * aqui, nunca uma invenção de regra de negócio ausente do Blueprint.
 */
const MINIMUM_CONTRAST_RATIO = 4.5;

interface Rgb {
  readonly r: number;
  readonly g: number;
  readonly b: number;
}

interface Hsl {
  readonly h: number;
  readonly s: number;
  readonly l: number;
}

function hexToRgb(hex: string): Rgb {
  const normalized = hex.replace("#", "");
  const value = parseInt(normalized, 16);
  return { r: (value >> 16) & 255, g: (value >> 8) & 255, b: value & 255 };
}

function rgbToHex({ r, g, b }: Rgb): string {
  const toHex = (channel: number) => Math.round(Math.min(255, Math.max(0, channel))).toString(16).padStart(2, "0");
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

function rgbToHsl({ r, g, b }: Rgb): Hsl {
  const rNorm = r / 255;
  const gNorm = g / 255;
  const bNorm = b / 255;
  const max = Math.max(rNorm, gNorm, bNorm);
  const min = Math.min(rNorm, gNorm, bNorm);
  const l = (max + min) / 2;

  if (max === min) {
    return { h: 0, s: 0, l };
  }

  const delta = max - min;
  const s = l > 0.5 ? delta / (2 - max - min) : delta / (max + min);

  let h: number;
  if (max === rNorm) {
    h = ((gNorm - bNorm) / delta + (gNorm < bNorm ? 6 : 0)) / 6;
  } else if (max === gNorm) {
    h = ((bNorm - rNorm) / delta + 2) / 6;
  } else {
    h = ((rNorm - gNorm) / delta + 4) / 6;
  }

  return { h, s, l };
}

function hslToRgb({ h, s, l }: Hsl): Rgb {
  if (s === 0) {
    const gray = l * 255;
    return { r: gray, g: gray, b: gray };
  }

  const hueToChannel = (p: number, q: number, t: number): number => {
    let tNorm = t;
    if (tNorm < 0) tNorm += 1;
    if (tNorm > 1) tNorm -= 1;
    if (tNorm < 1 / 6) return p + (q - p) * 6 * tNorm;
    if (tNorm < 1 / 2) return q;
    if (tNorm < 2 / 3) return p + (q - p) * (2 / 3 - tNorm) * 6;
    return p;
  };

  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;

  return {
    r: hueToChannel(p, q, h + 1 / 3) * 255,
    g: hueToChannel(p, q, h) * 255,
    b: hueToChannel(p, q, h - 1 / 3) * 255,
  };
}

function channelLuminance(channel: number): number {
  const normalized = channel / 255;
  return normalized <= 0.03928 ? normalized / 12.92 : Math.pow((normalized + 0.055) / 1.055, 2.4);
}

function relativeLuminance(rgb: Rgb): number {
  return 0.2126 * channelLuminance(rgb.r) + 0.7152 * channelLuminance(rgb.g) + 0.0722 * channelLuminance(rgb.b);
}

export class AccessibilityValidatorService {
  /** Razão de contraste WCAG entre duas cores hexadecimais. */
  contrastRatio(foregroundHex: string, backgroundHex: string): number {
    const lForeground = relativeLuminance(hexToRgb(foregroundHex));
    const lBackground = relativeLuminance(hexToRgb(backgroundHex));
    const lighter = Math.max(lForeground, lBackground);
    const darker = Math.min(lForeground, lBackground);
    return (lighter + 0.05) / (darker + 0.05);
  }

  meetsMinimumContrast(foregroundHex: string, backgroundHex: string): boolean {
    return this.contrastRatio(foregroundHex, backgroundHex) >= MINIMUM_CONTRAST_RATIO;
  }

  /**
   * Ajusta a luminosidade de `colorHex` até atender ao contraste mínimo contra `backgroundHex`,
   * preservando matiz e saturação originais (ADR-008). Retorna a cor original quando já atende, e a
   * cor ajustada quando não — `adjusted` sempre indica explicitamente se um ajuste ocorreu, nunca
   * aplicado de forma silenciosa (ADR-009, Explainable Adaptation).
   */
  ensureAccessible(colorHex: string, backgroundHex: string): { readonly value: string; readonly adjusted: boolean } {
    if (this.meetsMinimumContrast(colorHex, backgroundHex)) {
      return { value: colorHex, adjusted: false };
    }

    const hsl = rgbToHsl(hexToRgb(colorHex));
    const backgroundIsLight = relativeLuminance(hexToRgb(backgroundHex)) > 0.5;

    for (let step = 1; step <= 20; step += 1) {
      const delta = step / 20;
      const candidateLightness = backgroundIsLight ? Math.max(0, hsl.l - delta) : Math.min(1, hsl.l + delta);
      const candidateHex = rgbToHex(hslToRgb({ h: hsl.h, s: hsl.s, l: candidateLightness }));

      if (this.meetsMinimumContrast(candidateHex, backgroundHex)) {
        return { value: candidateHex, adjusted: true };
      }
    }

    return { value: backgroundIsLight ? "#000000" : "#FFFFFF", adjusted: true };
  }
}
