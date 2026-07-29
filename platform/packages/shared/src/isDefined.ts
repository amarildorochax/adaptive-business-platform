/**
 * isDefined — verifica se um valor não é null nem undefined.
 * Estrutura, regras e invariantes definidas em UTILITIES_CONCRETE_STRUCTURE.md.
 */
export function isDefined<TValue>(value: TValue | null | undefined): value is TValue {
  return value !== null && value !== undefined;
}
