// PlatformModules.ts
//
// Responsabilidade:
// Ponto de referência para o conjunto de módulos de negócio disponíveis
// na plataforma (crm, business, agenda, marketing, etc). Futuramente
// coordenará o carregamento e ciclo de vida desses módulos.
// Implementa ILifecycle porque coordenar módulos implica iniciar/encerrar
// o conjunto deles; init/start/stop ainda não fazem nada.

import type { ILifecycle } from '@/shared/interfaces';

export class PlatformModules implements ILifecycle {
  init(): void {}

  start(): void {}

  stop(): void {}
}
