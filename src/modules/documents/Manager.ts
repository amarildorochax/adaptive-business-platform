// Manager.ts
//
// Responsabilidade:
// Ponto de entrada para a lógica futura do módulo documents — Documentos (armazenamento e organização).
// Implementa IModule como contrato comum exigido pelo futuro
// ModuleRegistry; sem lógica de negócio nesta etapa.

import type { IModule } from '@/shared/interfaces';

export class DocumentsManager implements IModule {
  readonly id = 'documents';

  readonly name = 'Documents';

  init(): void {}

  start(): void {}

  stop(): void {}
}
