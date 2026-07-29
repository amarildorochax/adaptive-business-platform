// LifecycleManager.ts
//
// Responsabilidade:
// Representa a futura máquina de transição de estados do runtime
// (init -> start -> stop -> dispose). É o componente que, em uma etapa
// futura, deverá ler/escrever o RuntimeState do PlatformRuntime.
//
// Nota de projeto (Sprint 0A — Consolidação): este componente antes
// expunha `initialize()` em vez de `init()` e não implementava
// ILifecycle, sob a justificativa de que um quarto método `dispose()`
// não fazia parte do contrato. PlatformRuntime já demonstra que
// implementar ILifecycle (init/start/stop) não impede a existência de
// membros adicionais (o próprio PlatformRuntime já possui `dispose()`
// além dos três métodos do contrato) — o mesmo padrão é aplicado aqui,
// padronizando a nomenclatura sem introduzir nenhuma interface nova.
// LifecycleManager nunca foi referenciado por nenhum outro ponto do
// código além de sua instanciação em PlatformRuntime — nenhum de seus
// métodos era chamado, portanto esta renomeação não altera
// comportamento algum.
//
// Nenhum método altera RuntimeState nesta etapa — apenas a estrutura.

import type { ILifecycle } from '@/shared/interfaces';

export class LifecycleManager implements ILifecycle {
  init(): void {}

  start(): void {}

  stop(): void {}

  dispose(): void {}
}
