import type { ReactNode } from "react";

export interface WidgetCardProps {
  readonly title: string;
  readonly children: ReactNode;
}

/** Contêiner presentacional único de todo widget do Dashboard — nenhum dado embutido, apenas layout. */
export function WidgetCard({ title, children }: WidgetCardProps) {
  return (
    <section className="widget-card">
      <h2>{title}</h2>
      <div className="widget-card__body">{children}</div>
    </section>
  );
}
