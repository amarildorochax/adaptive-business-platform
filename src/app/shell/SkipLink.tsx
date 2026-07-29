// SkipLink.tsx
//
// Responsabilidade:
// Skip link de acessibilidade — link visualmente oculto até receber
// foco, que pula direto para `#main-content` (`ContentArea`),
// permitindo que usuários de teclado/leitor de tela evitem repetir a
// navegação da Sidebar/Header a cada página.

import { zIndex } from '@/design-system/tokens';

export function SkipLink() {
  return (
    <a
      href="#main-content"
      style={{
        position: 'absolute',
        left: '-9999px',
        top: 'auto',
        zIndex: zIndex.tooltip,
      }}
      onFocus={(event) => {
        event.currentTarget.style.left = '8px';
        event.currentTarget.style.top = '8px';
      }}
      onBlur={(event) => {
        event.currentTarget.style.left = '-9999px';
      }}
    >
      Pular para o conteúdo principal
    </a>
  );
}
