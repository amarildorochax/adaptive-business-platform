// Core.ts
//
// Responsabilidade:
// Núcleo interno da plataforma. Concentrará a orquestração entre
// PlatformConfig, PlatformRegistry e PlatformModules. Não implementa
// regra de negócio nem integrações — apenas a espinha dorsal estrutural.
// Implementa ILifecycle porque é o motor interno acionado por Platform;
// init/start/stop ainda não fazem nada.

import type { ILifecycle } from '@/shared/interfaces';

export class Core implements ILifecycle {
  init(): void {}

  start(): void {}

  stop(): void {}
}
