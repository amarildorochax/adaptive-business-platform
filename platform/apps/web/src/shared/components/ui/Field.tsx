import type { InputHTMLAttributes, ReactNode } from "react";
import { useId } from "react";

export interface FieldProps extends InputHTMLAttributes<HTMLInputElement> {
  readonly label: string;
  readonly error?: string;
  readonly trailingIcon?: ReactNode;
}

/** Campo de formulário único do Design System — label + input + erro, sempre associados via `htmlFor`/`aria-describedby` (nunca um `<label>` visual desacoplado do controle real). */
export function Field({ label, error, trailingIcon, className, id, ...rest }: FieldProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const errorId = `${inputId}-error`;

  return (
    <label className="field" htmlFor={inputId}>
      {label}
      <div style={{ position: "relative" }}>
        <input id={inputId} className={["input", error ? "input--invalid" : "", className].filter(Boolean).join(" ")} aria-invalid={Boolean(error)} aria-describedby={error ? errorId : undefined} {...rest} />
        {trailingIcon}
      </div>
      {error && (
        <span id={errorId} className="field__error" role="alert">
          {error}
        </span>
      )}
    </label>
  );
}
