import type { ReactNode } from "react";

/** Envelope de espaçamento único de toda página de domínio — nenhuma página define sua própria margem/padding. */
export function PageContainer({ children }: { readonly children: ReactNode }) {
  return <main className="page-container">{children}</main>;
}
