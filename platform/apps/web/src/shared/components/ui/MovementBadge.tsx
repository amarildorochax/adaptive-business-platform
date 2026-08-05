import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { Badge, type BadgeTone } from "./Badge";

export interface MovementBadgeProps {
  readonly origin: string;
  readonly quantityDelta: number;
}

const ORIGIN_LABEL: Record<string, string> = {
  Purchase: "Compra",
  ProductionConsumption: "Consumo de Produção",
  ProductionOutput: "Produção Concluída",
  SaleFulfillment: "Cumprimento de Venda",
  SaleReturn: "Devolução de Venda",
  ManualAdjustment: "Ajuste Manual",
};

/**
 * Rótulo de origem de um Stock Movement real (`core/inventory-movement/`, IMP-404) — direção
 * (Entrada/Saída) derivada exclusivamente do sinal real de `quantityDelta` (`MovementOrigin`, Core,
 * IMP-401), nunca reconstruída por suposição. Mesmo padrão de `PurchaseStatusBadge` (tom semântico +
 * rótulo traduzido); um `origin` desconhecido cai no próprio texto recebido, nunca oculta a
 * informação. Primeiro uso real no Inventory Movement Workspace (IMP-405) — nunca confundir com
 * `MovementCard`/`ReservationBadge` (`shared/components/ui/`), componentes legados do Inventory
 * Workspace (FUN-105) sobre `Inventory.adjustInventory` (Commerce Hub) — forma e domínio distintos,
 * nunca reaproveitados por este Workspace (ver `IMP_405_INVENTORY_MOVEMENT_WORKSPACE_REPORT.md`,
 * "Divergências Encontradas").
 */
export function MovementBadge({ origin, quantityDelta }: MovementBadgeProps) {
  const isEntry = quantityDelta > 0;
  const tone: BadgeTone = isEntry ? "success" : "danger";
  const Icon = isEntry ? ArrowUpRight : ArrowDownRight;

  return (
    <Badge tone={tone}>
      <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
        <Icon size={12} aria-hidden="true" />
        {ORIGIN_LABEL[origin] ?? origin}
      </span>
    </Badge>
  );
}
