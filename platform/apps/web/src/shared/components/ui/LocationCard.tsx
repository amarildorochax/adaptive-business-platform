import { MapPin } from "lucide-react";
import { Badge } from "./Badge";

export interface LocationCardProps {
  readonly locationId: string;
  readonly name: string;
  readonly addressLine?: string;
  readonly active: boolean;
}

/**
 * Cartão de resumo de uma Stock Location real (`core/inventory-movement/`, IMP-404) — Capability
 * opcional (`StockLocation`, Core, IMP-401; uma Empresa de ponto único opera sem nenhuma instância).
 * Todo campo vem diretamente de `StockLocationResponseDto`, nunca fabricado; endereço omitido quando
 * ausente, nunca substituído por um texto genérico. Mesmo padrão de `PurchaseOrderCard`.
 */
export function LocationCard({ locationId, name, addressLine, active }: LocationCardProps) {
  return (
    <div className="purchase-card">
      <div className="purchase-card__header">
        <strong>
          <MapPin size={14} aria-hidden="true" /> {name}
        </strong>
        <Badge tone={active ? "success" : "neutral"}>{active ? "Ativa" : "Inativa"}</Badge>
      </div>
      <div className="purchase-card__meta">
        <span>Local {locationId.slice(0, 8)}</span>
        {addressLine && <span>{addressLine}</span>}
      </div>
    </div>
  );
}
