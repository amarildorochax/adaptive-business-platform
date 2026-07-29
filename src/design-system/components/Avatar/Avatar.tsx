// Avatar.tsx
//
// Responsabilidade:
// Componente Avatar — estrutura da Sprint 26, identidade visual real
// aplicada na Sprint 29: círculo com fundo `solid-primary` (contraste
// verificado) e imagem com o mesmo raio circular.

import type { ComponentSize } from '../../types/component';

const SIZE_PX: Record<ComponentSize, number> = { sm: 24, md: 32, lg: 40 };

export interface AvatarProps {
  src?: string;
  alt?: string;
  name?: string;
  size?: ComponentSize;
}

function initialsFrom(name?: string): string {
  if (!name) return '';
  return name
    .split(' ')
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('');
}

export function Avatar(props: AvatarProps) {
  const { src, alt, name, size = 'md' } = props;
  const dimension = SIZE_PX[size];
  const baseStyle = { width: dimension, height: dimension, borderRadius: 'var(--ads-radius-full)' };

  if (src) {
    return <img src={src} alt={alt ?? name ?? ''} style={{ ...baseStyle, objectFit: 'cover' as const }} />;
  }

  return (
    <span
      aria-label={name}
      style={{
        ...baseStyle,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'var(--ads-color-solid-primary)',
        color: 'var(--ads-color-on-solid)',
        fontSize: dimension * 0.4,
        fontWeight: 600,
      }}
    >
      {initialsFrom(name)}
    </span>
  );
}
