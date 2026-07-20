// Manager.ts
//
// Responsabilidade:
// Ponto de entrada para a lógica futura do módulo communication — Comunicação (mensagens e canais).
// Implementa IModule como contrato comum exigido pelo futuro
// ModuleRegistry; sem lógica de negócio nesta etapa.

import type { IModule } from '@/shared/interfaces';

export class CommunicationManager implements IModule {
  readonly id = 'communication';

  readonly name = 'Communication';

  init(): void {}

  start(): void {}

  stop(): void {}
}
