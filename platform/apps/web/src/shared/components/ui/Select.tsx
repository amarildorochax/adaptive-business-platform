import type { ReactNode, SelectHTMLAttributes } from "react";
import { useId } from "react";

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  readonly label: string;
  readonly children: ReactNode;
}

/** Select nativo estilizado — preserva navegação por teclado/leitor de tela do elemento HTML real, nunca um dropdown customizado reimplementando semântica de `<select>`. */
export function Select({ label, id, children, ...rest }: SelectProps) {
  const generatedId = useId();
  const selectId = id ?? generatedId;

  return (
    <label className="field" htmlFor={selectId}>
      {label}
      <select id={selectId} className="select" {...rest}>
        {children}
      </select>
    </label>
  );
}
