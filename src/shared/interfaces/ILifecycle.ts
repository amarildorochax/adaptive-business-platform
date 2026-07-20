// ILifecycle.ts
//
// Responsabilidade:
// Contrato comum para qualquer entidade da plataforma que possua um
// ciclo de vida gerenciado (inicializar, iniciar, encerrar). Não define
// comportamento — apenas o formato que Platform, Core, managers e
// engines devem seguir quando implementarem este contrato.

export interface ILifecycle {
  init(): void;
  start(): void;
  stop(): void;
}
