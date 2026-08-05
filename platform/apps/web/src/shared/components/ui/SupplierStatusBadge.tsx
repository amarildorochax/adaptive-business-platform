import { Badge, type BadgeTone } from "./Badge";

export interface SupplierStatusBadgeProps {
  readonly status: string;
}

const STATUS_TONE: Record<string, BadgeTone> = { Active: "success", Disabled: "neutral" };
const STATUS_LABEL: Record<string, string> = { Active: "Ativo", Disabled: "Desabilitado" };

/**
 * Rótulo de status de um Supplier — mesmo padrão já usado por `InventoryBadge`/`CategoryBadge`/
 * `ReservationBadge` (Badge + mapeamento de tom semântico fixo por domínio). Primeiro uso real no
 * Supplier Workspace (IMP-205), sobre `SupplierStatus` real (`"Active" | "Disabled"`,
 * `@abp/supplier-hub`, IMP-201) — nunca um valor arbitrário; um status desconhecido cai em tom
 * neutro e no próprio texto recebido, nunca oculta a informação.
 */
export function SupplierStatusBadge({ status }: SupplierStatusBadgeProps) {
  return <Badge tone={STATUS_TONE[status] ?? "neutral"}>{STATUS_LABEL[status] ?? status}</Badge>;
}
