// ThemeProvider.tsx
//
// Responsabilidade:
// Provider React que resolve o Theme ativo (light/dark/custom) e o
// projeta no DOM como custom properties CSS, sob o prefixo exclusivo
// `--ads-*`.
//
// Nota (namespacing): `src/styles/globals.css` (UI legada do
// "escritório" Phaser/Pixi) já define suas próprias custom properties
// no `:root` (`--bg-primary`, `--text-primary`, `--border`, etc.). Para
// não colidir com elas — e para manter o Adaptive Design System
// inteiramente independente da UI legada, conforme exigido pela
// Sprint 26 — toda custom property escrita por este Provider usa o
// prefixo `--ads-`, nunca os nomes já usados por `globals.css`.

import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { ThemeContext } from './ThemeContext';
import { lightTheme, darkTheme } from './themes';
import { solidBackgroundFor, SOLID_ON_COLOR } from './branding/solidVariant';
import { duration, easing, radius, shadow } from '../tokens';
import type { ComponentVariant } from '../types/component';
import type { Theme, ThemeMode } from '../types/theme';

const ALL_VARIANTS: ComponentVariant[] = ['primary', 'secondary', 'success', 'warning', 'danger', 'info', 'neutral'];

function applyThemeToDom(theme: Theme): void {
  const root = document.documentElement.style;

  root.setProperty('--ads-color-primary', theme.colors.primary);
  root.setProperty('--ads-color-primary-hover', theme.colors.primaryHover);
  root.setProperty('--ads-color-secondary', theme.colors.secondary);
  root.setProperty('--ads-color-success', theme.colors.success);
  root.setProperty('--ads-color-warning', theme.colors.warning);
  root.setProperty('--ads-color-danger', theme.colors.danger);
  root.setProperty('--ads-color-info', theme.colors.info);
  root.setProperty('--ads-color-neutral', theme.colors.neutral);
  root.setProperty('--ads-color-surface', theme.colors.surface);
  root.setProperty('--ads-color-hover', theme.colors.hover);
  root.setProperty('--ads-color-background', theme.colors.background);
  root.setProperty('--ads-color-chrome', theme.colors.chrome);
  root.setProperty('--ads-color-sidebar', theme.colors.sidebar);
  root.setProperty('--ads-color-border', theme.colors.border);
  root.setProperty('--ads-color-divider', theme.colors.divider);
  root.setProperty('--ads-color-text-primary', theme.colors.text.primary);
  root.setProperty('--ads-color-text-secondary', theme.colors.text.secondary);
  root.setProperty('--ads-color-text-auxiliary', theme.colors.text.auxiliary);
  root.setProperty('--ads-color-text-disabled', theme.colors.text.disabled);
  root.setProperty('--ads-color-text-inverse', theme.colors.text.inverse);

  // Fundo/texto "sólido" (Sprint 29 — Branding): mesmo valor nos dois
  // temas, verificado para atender contraste WCAG AA (ver solidVariant.ts).
  ALL_VARIANTS.forEach((variant) => {
    root.setProperty(`--ads-color-solid-${variant}`, solidBackgroundFor(variant));
  });
  root.setProperty('--ads-color-on-solid', SOLID_ON_COLOR);
}

/**
 * Tokens que NÃO variam entre temas (motion/radius/shadow) — projetados
 * uma única vez no DOM, para que CSS de microinterações/motion
 * (`foundations/branding/*.css`) consuma exclusivamente `var(--ads-*)`,
 * nunca valores mágicos duplicados.
 */
function applyStaticTokensToDom(): void {
  const root = document.documentElement.style;

  Object.entries(duration).forEach(([key, value]) => root.setProperty(`--ads-duration-${key}`, value));
  Object.entries(easing).forEach(([key, value]) => root.setProperty(`--ads-easing-${key}`, value));
  Object.entries(radius).forEach(([key, value]) => root.setProperty(`--ads-radius-${key}`, value));
  Object.entries(shadow).forEach(([key, value]) => root.setProperty(`--ads-shadow-${key}`, value));

  // Scrim de overlay (Modal/Drawer) — preto translúcido universal, igual
  // nos dois temas (não é uma cor de marca). Sprint 31D: elimina o
  // último hex fixo dentro de um componente (`Modal.tsx`).
  root.setProperty('--ads-color-scrim', 'rgba(0, 0, 0, 0.4)');
}

export interface ThemeProviderProps {
  children: ReactNode;
  /** Modo inicial. Padrão: "light". */
  defaultMode?: ThemeMode;
  /** Theme customizado — usado quando `defaultMode`/`setMode` recebem "custom". */
  customTheme?: Theme;
}

/** Provider de tema do Adaptive Design System — resolve light/dark/custom e projeta as cores no DOM via custom properties `--ads-*`. */
export function ThemeProvider(props: ThemeProviderProps) {
  const { children, defaultMode = 'light', customTheme } = props;
  const [mode, setMode] = useState<ThemeMode>(defaultMode);

  const theme = useMemo<Theme>(() => {
    if (mode === 'custom' && customTheme) return customTheme;
    return mode === 'dark' ? darkTheme : lightTheme;
  }, [mode, customTheme]);

  useEffect(() => {
    applyThemeToDom(theme);
  }, [theme]);

  useEffect(() => {
    applyStaticTokensToDom();
  }, []);

  const value = useMemo(() => ({ theme, mode, setMode }), [theme, mode]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
