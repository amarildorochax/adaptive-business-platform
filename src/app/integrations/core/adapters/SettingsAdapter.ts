// SettingsAdapter.ts
//
// Responsabilidade:
// Adapter preparado para a feature Settings (`@/app/features/settings`
// — ainda sem módulo correspondente em `@/core`, ver README dessa
// feature). Reservado aqui para manter os 13 Adapters simétricos aos
// 13 diretórios de `features/`; nenhuma chamada real ao Core ainda.

import { NotImplementedCoreModuleAdapter } from './NotImplementedCoreModuleAdapter';
import type { CoreModuleId } from '../../types/ModuleId';

export class SettingsAdapter extends NotImplementedCoreModuleAdapter {
  readonly moduleId: CoreModuleId = 'settings';
}

export const settingsAdapter = new SettingsAdapter();
