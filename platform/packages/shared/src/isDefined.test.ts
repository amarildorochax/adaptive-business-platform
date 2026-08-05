import { describe, expect, it } from 'vitest';
import { isDefined } from './isDefined';

/**
 * Teste de fundação (IMP-001) — cobre a única lógica de execução real
 * hoje existente em platform/packages/*, provando que a infraestrutura
 * de teste (vitest) está corretamente configurada e executável.
 */
describe('isDefined', () => {
  it('retorna true para valores definidos', () => {
    expect(isDefined(0)).toBe(true);
    expect(isDefined('')).toBe(true);
    expect(isDefined(false)).toBe(true);
    expect(isDefined({})).toBe(true);
  });

  it('retorna false para null e undefined', () => {
    expect(isDefined(null)).toBe(false);
    expect(isDefined(undefined)).toBe(false);
  });
});
