// NotificationsAdapter.ts
//
// Responsabilidade:
// Adapter preparado para o Notification Hub de negócio
// (`@/core/notifications`). Não confundir com
// `@/app/providers/NotificationProvider` (Sprint 27, estado de UI
// efêmero) — este Adapter é o único caminho arquitetural para o
// domínio de negócio, quando conectado. Nenhuma chamada real ao Core
// ainda.

import { NotImplementedCoreModuleAdapter } from './NotImplementedCoreModuleAdapter';
import type { CoreModuleId } from '../../types/ModuleId';

export class NotificationsAdapter extends NotImplementedCoreModuleAdapter {
  readonly moduleId: CoreModuleId = 'notifications';
}

export const notificationsAdapter = new NotificationsAdapter();
