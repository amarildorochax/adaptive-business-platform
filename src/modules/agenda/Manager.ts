// Manager.ts
//
// Responsabilidade:
// Ponto de entrada para a lógica futura do módulo agenda — Agenda (compromissos e disponibilidade).
// Implementa IModule como contrato comum exigido pelo futuro
// ModuleRegistry; sem lógica de negócio nesta etapa.

import type { IModule } from '@/shared/interfaces';

export class AgendaManager implements IModule {
  readonly id = 'agenda';

  readonly name = 'Agenda';

  init(): void {}

  start(): void {}

  stop(): void {}
}
