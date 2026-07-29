// theme.ts
//
// Responsabilidade:
// Contrato de tipos de um Theme do Adaptive Design System — cores
// semânticas resolvidas para o modo ativo (light/dark/custom). Os
// valores concretos vivem em `foundations/themes/*`, nunca aqui.
//
// Sprint 31D (Adaptive Blue Design System): nenhum componente pode
// depender de um código hex fixo — todo valor de cor usado por
// qualquer painel/widget deve ter um slot aqui, projetado como
// `--ads-color-*` por `ThemeProvider`. `chrome` (fundo do Header,
// distinto de `background`) e `text.auxiliary` (4ª camada de texto)
// foram adicionados nesta Sprint para eliminar os últimos hex literais
// que viviam em `DashboardHeader`/`DashboardSidebar`.
//
// Sprint 31E (Adaptive Blue Refinement): `sidebar` adicionado — na nova
// paleta a Sidebar voltou a ter um tom próprio, distinto de
// `background` e de `chrome` (Header).

export type ThemeMode = 'light' | 'dark' | 'custom';

export interface ThemeTextColors {
  primary: string;
  secondary: string;
  /** Camada de texto entre `secondary` e `disabled` — rótulos de categoria, legendas discretas (Sprint 31D). */
  auxiliary: string;
  disabled: string;
  inverse: string;
}

export interface ThemeColors {
  primary: string;
  primaryHover: string;
  secondary: string;
  success: string;
  warning: string;
  danger: string;
  info: string;
  neutral: string;
  surface: string;
  /** Fundo de hover para superfícies interativas (linha de tabela, item de menu, card) — distinto de `surface` (Sprint 31B). */
  hover: string;
  background: string;
  /** Fundo do Header — distinto de `background` (Sprint 31D). */
  chrome: string;
  /** Fundo da Sidebar — distinto de `background`/`chrome` (Sprint 31E). */
  sidebar: string;
  border: string;
  /** Cor de separadores (`Divider`) — mais sutil que `border` (Sprint 31D). */
  divider: string;
  text: ThemeTextColors;
}

export interface Theme {
  mode: ThemeMode;
  colors: ThemeColors;
}
