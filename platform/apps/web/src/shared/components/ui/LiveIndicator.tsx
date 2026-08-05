export interface LiveIndicatorProps {
  readonly label?: string;
}

/**
 * Selo compacto de "isto é real e acabou de mudar" (UX-002, "Demonstração em Tempo Real") — um
 * ponto pulsante mais um rótulo curto. Puramente presentacional: nunca decide sozinho quando algo
 * mudou — quem chama decide isso a partir de dado real (ex.: `useRecentlyChanged`,
 * `shared/hooks/useRecentlyChanged.ts`), nunca um cronômetro arbitrário nem um valor fabricado. Uso
 * inicial: `OverviewSection` do Supplier Workspace e do CRM Workspace, ao lado de um `MetricCard`
 * cujo valor real acabou de mudar; `AutomationWidget`, ao lado do status de Execução real.
 */
export function LiveIndicator({ label = "Atualizado agora" }: LiveIndicatorProps) {
  return (
    <span className="live-indicator" role="status">
      <span className="live-indicator__dot" aria-hidden="true" />
      {label}
    </span>
  );
}
