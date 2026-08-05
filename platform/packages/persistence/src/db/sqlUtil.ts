/** Conversões compartilhadas entre `Date`/`undefined` (forma das Entities) e o par `number`/`null` (forma que `node:sqlite` aceita para bind). */

export function toMs(date: Date): number {
  return date.getTime();
}

export function toMsOrNull(date: Date | undefined): number | null {
  return date === undefined ? null : date.getTime();
}

export function fromMs(value: number): Date {
  return new Date(value);
}

export function fromMsOrUndefined(value: number | null): Date | undefined {
  return value === null ? undefined : new Date(value);
}

export function orNull<T>(value: T | undefined): T | null {
  return value === undefined ? null : value;
}

export function orUndefined<T>(value: T | null): T | undefined {
  return value === null ? undefined : value;
}

/** `node:sqlite` não possui tipo boolean nativo — armazenado como INTEGER (0/1), mesma convenção de todo driver SQLite. Introduzido pela IMP-302 para `ReorderRule.active`. */
export function toBoolInt(value: boolean): number {
  return value ? 1 : 0;
}

export function fromBoolInt(value: number): boolean {
  return value === 1;
}
