export interface SkeletonProps {
  readonly width?: string | number;
  readonly height?: string | number;
}

/** Placeholder de carregamento — nunca usado sozinho como único indicador de "carregando" de uma página inteira (ver `Spinner`/`AsyncState`), reservado para conteúdo que já sabe sua própria forma (linha de texto, célula de tabela). */
export function Skeleton({ width = "100%", height = "1rem" }: SkeletonProps) {
  return <span className="skeleton" style={{ display: "inline-block", width, height }} aria-hidden="true" />;
}
