// createMediaQuery.ts
//
// Responsabilidade:
// Constrói uma media query `min-width` a partir de um breakpoint
// nomeado dos tokens — usado por `hooks/useBreakpoint`.

import { breakpoints, type BreakpointName } from '../tokens/breakpoints';

export function createMediaQuery(breakpoint: BreakpointName): string {
  return `(min-width: ${breakpoints[breakpoint]})`;
}
