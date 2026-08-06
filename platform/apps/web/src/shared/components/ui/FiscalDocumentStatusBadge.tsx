import { Badge, type BadgeTone } from "./Badge";

export interface FiscalDocumentStatusBadgeProps {
  readonly status: string;
}

const STATUS_TONE: Record<string, BadgeTone> = {
  Issued: "success",
  Cancelled: "danger",
};

const STATUS_LABEL: Record<string, string> = {
  Issued: "Emitido",
  Cancelled: "Cancelado",
};

/**
 * Rótulo de status de um Fiscal Document — mesmo padrão de `ProductionStatusBadge`/
 * `BillOfMaterialsStatusBadge` (Badge + mapeamento de tom semântico fixo por domínio). Sobre
 * `FiscalDocumentStatus` real (`@abp/fiscal-hub`, IMP-601) — nunca um valor arbitrário; um status
 * desconhecido cai em tom neutro e no próprio texto recebido, nunca oculta a informação.
 *
 * `Cancelled` nunca aparece como etapa do `ProcessFlow` da Visão Geral (`OverviewSection.tsx`) — é um
 * ramo terminal do estado, representado exclusivamente aqui, por Documento, mesma disciplina já
 * aplicada a `Cancelled` em `ProductionStatusBadge` diante do `buildProductionFlow` do Production
 * Workspace.
 */
export function FiscalDocumentStatusBadge({ status }: FiscalDocumentStatusBadgeProps) {
  return <Badge tone={STATUS_TONE[status] ?? "neutral"}>{STATUS_LABEL[status] ?? status}</Badge>;
}
