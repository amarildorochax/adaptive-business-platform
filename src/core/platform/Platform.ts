// Platform.ts
//
// Responsabilidade:
// Representa a instância raiz da nova plataforma. Será o ponto de entrada
// que amarra configuração, registro de módulos e ciclo de vida da aplicação.
// Implementa ILifecycle porque é a raiz do ciclo de vida da plataforma —
// init/start/stop ainda não fazem nada (sem lógica de negócio).

import type { ILifecycle } from '@/shared/interfaces';

export class Platform implements ILifecycle {
  init(): void {}

  start(): void {}

  stop(): void {}
}
