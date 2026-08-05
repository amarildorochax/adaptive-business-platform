import type { ButtonHTMLAttributes, ReactNode } from "react";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
export type ButtonSize = "sm" | "md";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  readonly variant?: ButtonVariant;
  readonly size?: ButtonSize;
  readonly icon?: boolean;
  readonly leadingIcon?: ReactNode;
}

/** Botão único de todo o Design System (UX-001) — nenhuma página monta seu próprio `<button>` estilizado. */
export function Button({ variant = "secondary", size = "md", icon = false, leadingIcon, className, children, ...rest }: ButtonProps) {
  const classes = ["btn", `btn--${variant}`, size === "sm" ? "btn--sm" : "", icon ? "btn--icon" : "", className].filter(Boolean).join(" ");

  return (
    <button className={classes} {...rest}>
      {leadingIcon}
      {children}
    </button>
  );
}
