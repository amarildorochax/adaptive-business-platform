/**
 * Memory Lifecycle — o momento de escrita, de último acesso e de expiração de uma entrada de memória,
 * nunca uma persistência permanente e irrevogável sem critério explícito de relevância decrescente.
 * Estrutura definida em MEMORY_CONCRETE_STRUCTURE.md.
 */
export interface MemoryLifecycle {
  /** Entrada à qual este estado se refere. */
  readonly memoryId: string;

  /** Momento da Escrita autorizada. */
  readonly writtenAt: Date;

  /** Momento do último acesso de Leitura, quando já consultada. */
  readonly lastAccessedAt?: Date;

  /** Momento de expiração, quando aplicável. */
  readonly expiresAt?: Date;
}
