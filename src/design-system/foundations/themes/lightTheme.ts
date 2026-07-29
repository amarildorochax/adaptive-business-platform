// lightTheme.ts
//
// Responsabilidade:
// Resolução do Theme "light" — mapeia as escalas primitivas de
// `tokens/colors` para os slots semânticos definidos por `Theme`.

import { colorPrimitives } from '../../tokens/colors';
import type { Theme } from '../../types/theme';

export const lightTheme: Theme = {
  mode: 'light',
  colors: {
    primary: colorPrimitives.blue[500],
    primaryHover: colorPrimitives.blue[700],
    secondary: colorPrimitives.violet[500],
    success: colorPrimitives.green[500],
    warning: colorPrimitives.amber[500],
    danger: colorPrimitives.red[500],
    info: colorPrimitives.cyan[500],
    neutral: colorPrimitives.gray[500],
    surface: colorPrimitives.gray[50],
    hover: colorPrimitives.gray[100],
    background: '#ffffff',
    chrome: colorPrimitives.gray[50],
    sidebar: colorPrimitives.gray[50],
    border: colorPrimitives.gray[200],
    divider: colorPrimitives.gray[100],
    text: {
      primary: colorPrimitives.gray[900],
      secondary: colorPrimitives.gray[600],
      auxiliary: colorPrimitives.gray[500],
      disabled: colorPrimitives.gray[400],
      inverse: '#ffffff',
    },
  },
};
