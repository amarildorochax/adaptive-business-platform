// Divider.tsx
//
// Responsabilidade:
// Primitivo de separador visual — linha horizontal ou vertical.
//
// Sprint 31D: usa `--ads-color-divider` (mais sutil que
// `--ads-color-border`, usado por bordas de card/input).

export interface DividerProps {
  orientation?: 'horizontal' | 'vertical';
}

export function Divider(props: DividerProps) {
  const { orientation = 'horizontal' } = props;

  return (
    <div
      role="separator"
      aria-orientation={orientation}
      style={
        orientation === 'horizontal'
          ? { width: '100%', height: '1px', backgroundColor: 'var(--ads-color-divider)' }
          : { width: '1px', height: '100%', backgroundColor: 'var(--ads-color-divider)' }
      }
    />
  );
}
