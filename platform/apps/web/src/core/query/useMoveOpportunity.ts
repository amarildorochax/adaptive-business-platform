import { useMutation, useQueryClient } from "@tanstack/react-query";
import { crmLogEntry, type CrmWorkspaceSnapshot } from "@core/crm/crmWorkspace";
import { crmClient } from "../http/clients/crmClient.js";
import type { DemoSnapshot } from "../managers/seedDemoData";

const OUTCOME_LABEL: Record<string, string> = { Open: "reaberta", Won: "ganha", Lost: "perdida" };

/**
 * Command "MoveOpportunity" real — desde a FUN-005, via HTTP: `POST /crm/opportunities/:id/move`
 * (`apps/api`). Desde a FUN-103, substitui a Opportunity correspondente dentro do CRM Workspace
 * (`["crm","workspace"]`, lista completa) — nunca mais um único campo isolado. Também mantém
 * `["dashboard","bootstrap"]`'s `opportunity` sincronizado quando a Opportunity movida é a mesma já
 * semeada no bootstrap, preservando o widget do Dashboard (`CRMWidget`) correto sem refazer o
 * bootstrap inteiro (que duplicaria dado, rejeitado por ADR-001 do Business Profile Engine).
 */
export function useMoveOpportunity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ opportunityId, stageId, outcome, lostReason }: { readonly opportunityId: string; readonly stageId: string; readonly outcome: "Open" | "Won" | "Lost"; readonly lostReason?: string }) =>
      crmClient.moveOpportunity(opportunityId, { stageId, outcome, lostReason }),
    onSuccess: (opportunity) => {
      queryClient.setQueryData<DemoSnapshot>(["dashboard", "bootstrap"], (previous) => (previous && previous.opportunity.opportunityId === opportunity.opportunityId ? { ...previous, opportunity } : previous));

      queryClient.setQueryData<CrmWorkspaceSnapshot>(["crm", "workspace"], (previous) =>
        previous
          ? {
              ...previous,
              opportunities: previous.opportunities.map((existing) => (existing.opportunityId === opportunity.opportunityId ? opportunity : existing)),
              activityLog: [...previous.activityLog, crmLogEntry(`Oportunidade "${opportunity.title}" movida para o Stage "${opportunity.stageId}" (${OUTCOME_LABEL[opportunity.outcome] ?? opportunity.outcome}).`)],
            }
          : previous,
      );
    },
  });
}
