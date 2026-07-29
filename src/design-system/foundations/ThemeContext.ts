// ThemeContext.ts
//
// Responsabilidade:
// Contexto React que carrega o Theme ativo do Adaptive Design System.
// Consumido exclusivamente via o hook `hooks/useTheme` — nunca
// diretamente por componentes de produto.

import { createContext } from 'react';
import type { Theme, ThemeMode } from '../types/theme';

export interface ThemeContextValue {
  theme: Theme;
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
}

export const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);
