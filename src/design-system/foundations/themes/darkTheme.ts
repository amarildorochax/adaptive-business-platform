// darkTheme.ts
//
// Responsabilidade:
// Resolução do Theme "dark" — mapeia as escalas primitivas de
// `tokens/colors` para os slots semânticos definidos por `Theme`.
//
// Sprint 31D (Adaptive Blue Design System): identidade "Adaptive Blue"
// original.
//
// Sprint 31E (Adaptive Blue Refinement): paleta escurecida/fechada a
// pedido do Product Owner — "o azul está muito claro", "aparência
// neon" — Background `#18283E`, Sidebar `#1D3049` (tom próprio,
// distinto de Background e Header), Header (`chrome`) `#20324D`,
// Cards/Widgets `#284564`, Hover `#33587D`. Item ativo/Botão principal
// mantidos em roxo (`#6D5DFB`, hover `#7C6BFF`). Bordas em branco
// translúcido a 8% (inalterado).
//
// `info` permanece azul (`#3B82F6`, gráficos); `secondary`/
// `AI_ACCENT_COLOR` permanecem violeta (`#8B5CF6`, acento de IA) —
// nenhum dos dois faz parte da paleta "neutra" revisada nesta Sprint.

import type { Theme } from '../../types/theme';

export const darkTheme: Theme = {
  mode: 'dark',
  colors: {
    primary: '#6D5DFB',
    primaryHover: '#7C6BFF',
    secondary: '#8B5CF6',
    success: '#22C55E',
    warning: '#F59E0B',
    danger: '#EF4444',
    info: '#3B82F6',
    neutral: '#94A3B8',
    surface: '#284564',
    hover: '#33587D',
    background: '#18283E',
    chrome: '#20324D',
    sidebar: '#1D3049',
    border: 'rgba(255, 255, 255, 0.08)',
    divider: 'rgba(255, 255, 255, 0.05)',
    text: {
      primary: '#FFFFFF',
      secondary: '#E6EEF8',
      auxiliary: '#D0DCEB',
      disabled: '#B4C4D8',
      inverse: '#18283E',
    },
  },
};
