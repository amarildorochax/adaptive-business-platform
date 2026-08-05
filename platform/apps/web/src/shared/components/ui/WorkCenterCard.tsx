import { Cog } from "lucide-react";
import { Badge } from "./Badge";

export interface WorkCenterCardProps {
  readonly workCenterId: string;
  readonly name: string;
  readonly nominalCapacity?: number;
  readonly active: boolean;
}

/**
 * Cartão de resumo de um Work Center real (`core/production/`, IMP-504) — Capability opcional
 * (`WorkCenter`, Core, IMP-501; uma Empresa sem produção segmentada em etapas opera sem nenhuma
 * instância). Mesmo padrão de `LocationCard` (mesma Capability opcional, mesmo Hub-blueprint,
 * Inventory Movement Hub).
 */
export function WorkCenterCard({ workCenterId, name, nominalCapacity, active }: WorkCenterCardProps) {
  return (
    <div className="purchase-card">
      <div className="purchase-card__header">
        <strong>
          <Cog size={14} aria-hidden="true" /> {name}
        </strong>
        <Badge tone={active ? "success" : "neutral"}>{active ? "Ativo" : "Inativo"}</Badge>
      </div>
      <div className="purchase-card__meta">
        <span>Centro {workCenterId.slice(0, 8)}</span>
        {nominalCapacity !== undefined && <span>Capacidade nominal: {nominalCapacity}</span>}
      </div>
    </div>
  );
}
