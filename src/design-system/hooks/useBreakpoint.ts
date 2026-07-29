// useBreakpoint.ts
//
// Responsabilidade:
// Hook React que informa se o viewport atual atende a um breakpoint
// nomeado (`mobile`/`tablet`/`desktop`/`wide`/`ultrawide`).

import { useMediaQuery } from './useMediaQuery';
import { createMediaQuery } from '../utils/createMediaQuery';
import type { BreakpointName } from '../tokens/breakpoints';

export function useBreakpoint(breakpoint: BreakpointName): boolean {
  return useMediaQuery(createMediaQuery(breakpoint));
}
