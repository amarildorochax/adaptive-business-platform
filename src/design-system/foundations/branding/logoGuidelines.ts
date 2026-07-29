// logoGuidelines.ts
//
// Responsabilidade:
// Regras de uso do `Logo` — área de proteção (espaço mínimo livre ao
// redor) e tamanho mínimo, ambos derivados dos tokens de espaçamento do
// Design System (nunca um valor mágico). Ver Brand Guide para a
// explicação completa com exemplos.

import { spacing } from '../../tokens/spacing';

/** Espaço mínimo livre ao redor do `Logo`, em qualquer direção. */
export const LOGO_CLEAR_SPACE = spacing[16];

/** Altura mínima recomendada do símbolo (`Logo` `size` prop), abaixo da qual a versão "reduced" deve ser usada. */
export const LOGO_MIN_SIZE_PX = 16;
