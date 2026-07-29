// Platform.ts
//
// Responsabilidade:
// Representa a instância raiz da plataforma — o ponto de entrada oficial
// que amarra configuração, registro de módulos e ciclo de vida da
// aplicação. Implementa ILifecycle porque é a raiz do ciclo de vida da
// plataforma.
//
// Sprint 0B — Integração do Runtime: Platform passa a ser o único ponto
// de entrada real do bootstrap (ver startPlatform.ts) — `init()`/
// `start()`/`stop()` delegam integralmente a uma única PlatformRuntime
// interna, centralizando o ciclo de vida em vez de cada consumidor
// construir suas próprias peças manualmente (ex.: o antigo
// `startPlatform()`, que instanciava AgentSimulator diretamente).
// Platform não duplica nenhuma lógica de PlatformRuntime — apenas
// delega.

import type { ILifecycle } from '@/shared/interfaces';
import { PlatformRuntime } from './PlatformRuntime';

export class Platform implements ILifecycle {
  readonly runtime = new PlatformRuntime();

  init(): void {
    this.runtime.init();
  }

  start(): void {
    this.runtime.start();
  }

  stop(): void {
    this.runtime.stop();
  }
}
