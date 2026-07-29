// solidVariant.ts
//
// Responsabilidade:
// Resolve o par fundo/texto de um elemento "sólido" (botão primário,
// badge preenchido, toast) para cada `ComponentVariant`, garantindo
// contraste WCAG AA (>= 4.5:1) com texto branco — independente do tema
// ativo (light/dark).
//
// Origem da correção (Sprint 29 — Branding): a Sprint 26 usava o tom
// 500 de cada escala primitiva como cor de fundo sólida com texto
// branco. Medido com `foundations/accessibility/contrastRatio`, todos
// os tons 500 falham AA com texto branco (ex.: branco sobre blue-500 =
// 3.68:1; branco sobre green-500 = 2.28:1) — só o tom 700 de cada
// escala passa com folga (>= 5:1 em todos os casos, ver Brand Guide).
// Por isso, todo fundo "sólido" usa o tom 700, nunca o 500, nos dois
// temas — a variação entre light/dark fica só nos tons de
// texto/borda/superfície (`foundations/themes/*`), não neste par.
//
// Sprint 31C (Visual Identity Refinement): `secondary` passou de
// violet-700 (roxo) para blue-900 (#1e3a8a, "azul escuro") — o ESCOPO
// daquela Sprint pedia explicitamente "Botão secundário: Azul escuro".
//
// Sprint 31D (Adaptive Visual Identity — versão definitiva): `primary`
// passou do azul-700 para o roxo oficial da referência (`#6D5DFB`,
// literal, igual ao `darkTheme.colors.primary`) — "Botão Principal:
// Roxo #6D5DFB" do ESCOPO. Branco sobre `#6D5DFB` mede 4.56:1 — passa
// AA (>= 4.5). `secondary` (azul escuro) permanece inalterado.

import { colorPrimitives } from '../../tokens/colors';
import type { ComponentVariant } from '../../types/component';

const SOLID_BACKGROUND_BY_VARIANT: Record<ComponentVariant, string> = {
  primary: '#6D5DFB',
  secondary: colorPrimitives.blue[900],
  success: colorPrimitives.green[700],
  warning: colorPrimitives.amber[700],
  danger: colorPrimitives.red[700],
  info: colorPrimitives.cyan[700],
  neutral: colorPrimitives.gray[700],
};

/** Cor de fundo sólida acessível (contraste >= 4.5:1 com texto branco) para a variante informada. */
export function solidBackgroundFor(variant: ComponentVariant): string {
  return SOLID_BACKGROUND_BY_VARIANT[variant];
}

/** Cor de texto a usar sobre `solidBackgroundFor(variant)` — sempre branco, pois todo fundo sólido já é escuro o suficiente. */
export const SOLID_ON_COLOR = '#ffffff';
