import { useEffect, useRef, useState } from "react";

/**
 * `true` por `windowMs` (padrão 4s) sempre que `value` muda de um render para o outro — nunca no
 * primeiro render (não há "mudança" a anunciar quando um dado real é apenas carregado pela
 * primeira vez, só quando um valor já visto muda de fato). Genérico, sem nenhuma dependência de
 * domínio — primeiro uso: `LiveIndicator` (UX-002) sobre valores reais de `MetricCard`
 * (`useSuppliers`/`useCrmWorkspace`), nunca um cronômetro decorativo.
 */
export function useRecentlyChanged(value: unknown, windowMs = 4000): boolean {
  const previous = useRef(value);
  const [changed, setChanged] = useState(false);

  useEffect(() => {
    if (previous.current === value) {
      return;
    }
    previous.current = value;
    setChanged(true);
    const timeout = setTimeout(() => setChanged(false), windowMs);
    return () => clearTimeout(timeout);
  }, [value, windowMs]);

  return changed;
}
