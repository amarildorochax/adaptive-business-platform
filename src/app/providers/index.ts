// index.ts
//
// Responsabilidade:
// Ponto único de exportação dos Providers globais do Frontend
// Foundation — Notification, Toast, Dialog, Modal, Shortcut, e a
// composição `AppProviders`. Também reexporta `ThemeProvider` do
// Adaptive Design System para conveniência de quem monta a árvore de
// Providers a partir deste único módulo.
//
// Nota: nenhum destes Providers importa `@/core` — todos são estado de
// UI (toast/modal/dialog/atalhos/notificações in-app), desacoplados do
// Core v1.0 certificado.

export { ThemeProvider } from '@/design-system/foundations';
export { useTheme } from '@/design-system/hooks';
export * from './NotificationProvider';
export * from './ToastProvider';
export * from './DialogProvider';
export * from './ModalProvider';
export * from './ShortcutProvider';
export * from './AppProviders';
