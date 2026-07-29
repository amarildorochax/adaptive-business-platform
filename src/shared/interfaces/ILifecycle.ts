/**
 * Contrato comum para qualquer entidade da plataforma que possua um
 * ciclo de vida gerenciado (inicializar, iniciar, encerrar).
 *
 * Responsabilidade: definir apenas o formato — `init`/`start`/`stop` —
 * que Platform, Core, Managers e Engines devem seguir. Não define
 * comportamento.
 *
 * Objetivo: permitir composição/orquestração genérica de qualquer
 * entidade com ciclo de vida, sem que o orquestrador conheça sua lógica
 * interna.
 *
 * Dependências: nenhuma.
 *
 * Exemplo de uso:
 * ```ts
 * class MyManager implements ILifecycle {
 *   init(): void {}
 *   start(): void {}
 *   stop(): void {}
 * }
 * ```
 */
export interface ILifecycle {
  init(): void;
  start(): void;
  stop(): void;
}
