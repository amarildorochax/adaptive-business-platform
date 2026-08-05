import { Badge, type BadgeTone } from "./Badge";

export interface ProductionStatusBadgeProps {
  readonly status: string;
}

const STATUS_TONE: Record<string, BadgeTone> = {
  Planned: "neutral",
  InProgress: "primary",
  Completed: "success",
  Cancelled: "danger",
};

const STATUS_LABEL: Record<string, string> = {
  Planned: "Planejada",
  InProgress: "Em Produção",
  Completed: "Concluída",
  Cancelled: "Cancelada",
};

/**
 * Rótulo de status de uma ProductionOrder — mesmo padrão de `PurchaseStatusBadge`/
 * `SupplierStatusBadge` (Badge + mapeamento de tom semântico fixo por domínio). Sobre
 * `ProductionStatus` real (`@abp/production-hub`, IMP-501) — nunca um valor arbitrário; um status
 * desconhecido cai em tom neutro e no próprio texto recebido, nunca oculta a informação.
 *
 * `Cancelled` nunca aparece como etapa do `ProcessFlow` da Visão Geral (`OverviewSection.tsx`) — é um
 * ramo terminal do estado, representado exclusivamente aqui, por Ordem, mesma disciplina já aplicada
 * a `Cancelled` em `PurchaseStatusBadge` diante de `ProcessFlow` do Purchase Workspace.
 */
export function ProductionStatusBadge({ status }: ProductionStatusBadgeProps) {
  return <Badge tone={STATUS_TONE[status] ?? "neutral"}>{STATUS_LABEL[status] ?? status}</Badge>;
}
