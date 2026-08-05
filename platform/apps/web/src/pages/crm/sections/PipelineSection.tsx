import { useState } from "react";
import { WidgetCard } from "@shared/components/WidgetCard";
import { Button } from "@shared/components/ui/Button";
import { Field } from "@shared/components/ui/Field";
import { KanbanColumn } from "@shared/components/ui/KanbanColumn";
import { NotConnectedNotice } from "@shared/components/ui/NotConnectedNotice";
import { PipelineCard } from "@shared/components/ui/PipelineCard";
import { useToast } from "@shared/components/ui/toast/useToast";
import { resolveContactNames, resolvePartyName, type CrmWorkspaceSnapshot } from "@core/crm/crmWorkspace";
import { useMoveOpportunity } from "@core/query/useMoveOpportunity";
import type { OpportunityResponseDto } from "@core/http/dtos/crm.dto";

function formatCurrency(value: number): string {
  return `R$ ${value.toLocaleString("pt-BR")}`;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
}

interface OpportunityCardProps {
  readonly workspace: CrmWorkspaceSnapshot;
  readonly opportunity: OpportunityResponseDto;
}

function OpportunityCard({ workspace, opportunity }: OpportunityCardProps) {
  const moveOpportunity = useMoveOpportunity();
  const { showToast } = useToast();
  const [stageDraft, setStageDraft] = useState(opportunity.stageId);

  const companyName = resolvePartyName(workspace, opportunity.relationshipId) ?? "—";
  const contacts = resolveContactNames(workspace, opportunity.relationshipId);

  function move(outcome: "Open" | "Won" | "Lost") {
    moveOpportunity.mutate(
      { opportunityId: opportunity.opportunityId, stageId: stageDraft, outcome },
      { onError: () => showToast("danger", "Não foi possível mover a Oportunidade.") },
    );
  }

  return (
    <PipelineCard
      title={opportunity.title}
      subtitle={`Empresa: ${companyName}`}
      value={formatCurrency(opportunity.value)}
      meta={[
        { label: "Contato", value: contacts.length > 0 ? contacts.join(", ") : "—" },
        { label: "Etapa", value: opportunity.stageId },
        { label: "Responsável", value: workspace.relationships.find((relationship) => relationship.relationshipId === opportunity.relationshipId)?.accountManagerId ?? "—" },
        { label: "Criada em", value: formatDate(opportunity.createdAt) },
      ]}
      actions={
        <>
          <Field label="Nova etapa" value={stageDraft} onChange={(event) => setStageDraft(event.target.value)} />
          <Button type="button" variant="secondary" size="sm" disabled={moveOpportunity.isPending} onClick={() => move(opportunity.outcome as "Open" | "Won" | "Lost")}>
            Atualizar etapa
          </Button>
          {opportunity.outcome !== "Won" && (
            <Button type="button" variant="primary" size="sm" disabled={moveOpportunity.isPending} onClick={() => move("Won")}>
              Marcar como Ganha
            </Button>
          )}
          {opportunity.outcome !== "Lost" && (
            <Button type="button" variant="danger" size="sm" disabled={moveOpportunity.isPending} onClick={() => move("Lost")}>
              Marcar como Perdida
            </Button>
          )}
          {opportunity.outcome !== "Open" && (
            <Button type="button" variant="ghost" size="sm" disabled={moveOpportunity.isPending} onClick={() => move("Open")}>
              Reabrir
            </Button>
          )}
        </>
      }
    />
  );
}

/**
 * Pipeline (FUN-103) — Kanban real: as três colunas são o único agrupamento fechado e real que
 * `Opportunity.outcome` oferece (`OpportunityOutcome = "Open" | "Won" | "Lost"`, ver `Opportunity.ts`)
 * — nunca um conjunto fixo de Estágios "Prospecção → Proposta → Fechamento", porque `Pipeline`/`Stage`
 * existem apenas como contratos de tipo, sem nenhum Service/Manager que os popule (`stageId` é texto
 * livre, sem catálogo real). "Mover entre etapas" é o Command real `MoveOpportunity`
 * (`useMoveOpportunity`) — tanto para o texto livre de Etapa quanto para o Outcome (Ganha/Perdida/Reabrir).
 */
export function PipelineSection({ workspace }: { readonly workspace: CrmWorkspaceSnapshot }) {
  const open = workspace.opportunities.filter((opportunity) => opportunity.outcome === "Open");
  const won = workspace.opportunities.filter((opportunity) => opportunity.outcome === "Won");
  const lost = workspace.opportunities.filter((opportunity) => opportunity.outcome === "Lost");

  return (
    <div className="dashboard-section">
      <NotConnectedNotice fields={["Prioridade", "Próxima ação", "Catálogo real de Pipeline/Stage"]} context="CRM Hub" />

      <WidgetCard title="Pipeline Comercial">
        <div className="kanban-board">
          <KanbanColumn title="Em Aberto" count={open.length} tone="info">
            {open.map((opportunity) => (
              <OpportunityCard key={opportunity.opportunityId} workspace={workspace} opportunity={opportunity} />
            ))}
          </KanbanColumn>
          <KanbanColumn title="Ganhas" count={won.length} tone="success">
            {won.map((opportunity) => (
              <OpportunityCard key={opportunity.opportunityId} workspace={workspace} opportunity={opportunity} />
            ))}
          </KanbanColumn>
          <KanbanColumn title="Perdidas" count={lost.length} tone="danger">
            {lost.map((opportunity) => (
              <OpportunityCard key={opportunity.opportunityId} workspace={workspace} opportunity={opportunity} />
            ))}
          </KanbanColumn>
        </div>
      </WidgetCard>
    </div>
  );
}
