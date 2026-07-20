// LifecycleManager.ts
//
// Responsabilidade:
// Representa a futura máquina de transição de estados do runtime
// (initialize -> start -> stop -> dispose). É o componente que, em uma
// etapa futura, deverá ler/escrever o RuntimeState do PlatformRuntime.
//
// Nota de projeto: os quatro métodos abaixo (initialize/start/stop/
// dispose) não implementam ILifecycle porque o formato pedido para este
// componente difere do contrato (nome "initialize" em vez de "init", e
// um quarto método "dispose" que ILifecycle não possui). Por instrução
// desta Sprint, nenhuma interface nova pode ser criada para cobrir essa
// diferença — então LifecycleManager permanece uma classe própria, sem
// implementar nenhuma interface, até que essa decisão seja revisitada.
//
// Nenhum método altera RuntimeState nesta etapa — apenas a estrutura.

export class LifecycleManager {
  initialize(): void {}

  start(): void {}

  stop(): void {}

  dispose(): void {}
}
