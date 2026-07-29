// useTheme.ts
//
// Responsabilidade:
// Hook de acesso ao Theme ativo do Adaptive Design System. Único ponto
// de leitura de `ThemeContext` — componentes nunca importam o Context
// diretamente.

import { useContext } from 'react';
import { ThemeContext, type ThemeContextValue } from '../foundations/ThemeContext';

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error('useTheme deve ser usado dentro de um <ThemeProvider>.');
  }

  return context;
}
