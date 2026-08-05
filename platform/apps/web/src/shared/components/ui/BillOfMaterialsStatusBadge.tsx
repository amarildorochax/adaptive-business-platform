import { Badge, type BadgeTone } from "./Badge";

export interface BillOfMaterialsStatusBadgeProps {
  readonly status: string;
}

const STATUS_TONE: Record<string, BadgeTone> = {
  Active: "success",
  Superseded: "neutral",
};

const STATUS_LABEL: Record<string, string> = {
  Active: "Ativa",
  Superseded: "Superada",
};

/** Rótulo de status de uma BillOfMaterials — mesmo padrão de `ProductionStatusBadge`. */
export function BillOfMaterialsStatusBadge({ status }: BillOfMaterialsStatusBadgeProps) {
  return <Badge tone={STATUS_TONE[status] ?? "neutral"}>{STATUS_LABEL[status] ?? status}</Badge>;
}
