// KnowledgeAdapter.ts
//
// Responsabilidade:
// Adapter preparado para o módulo Knowledge (`@/core/knowledge`).
// Nenhuma chamada real ao Core ainda.

import { NotImplementedCoreModuleAdapter } from './NotImplementedCoreModuleAdapter';
import type { CoreModuleId } from '../../types/ModuleId';

export class KnowledgeAdapter extends NotImplementedCoreModuleAdapter {
  readonly moduleId: CoreModuleId = 'knowledge';
}

export const knowledgeAdapter = new KnowledgeAdapter();
