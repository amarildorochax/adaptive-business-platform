// component.ts
//
// Responsabilidade:
// Vocabulário compartilhado de props entre os componentes base do
// Adaptive Design System — tamanho, variante semântica e estado visual.
// Cada componente em `components/*` referencia estes tipos em vez de
// redeclarar seu próprio conjunto de valores.

export type ComponentSize = 'sm' | 'md' | 'lg';

export type ComponentVariant =
  | 'primary'
  | 'secondary'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'
  | 'neutral';

export type ComponentState =
  | 'default'
  | 'hover'
  | 'focus'
  | 'active'
  | 'disabled'
  | 'loading'
  | 'error';
