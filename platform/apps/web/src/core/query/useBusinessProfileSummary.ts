import { useQuery } from "@tanstack/react-query";
import { businessProfileClient } from "../http/clients/businessProfileClient.js";

/**
 * Consulta real ao Business Profile Engine via HTTP (`apps/api`, FUN-004/FUN-005) — três chamadas
 * `GET`, cada uma tratando 404 como "nenhum dado ainda" (`undefinedOn404`), nunca como erro,
 * preservando exatamente a mesma semântica que `BusinessProfileManager.current*` já tinha antes da
 * migração desta Sprint.
 */
export function useBusinessProfileSummary(profileId: string | undefined) {
  return useQuery({
    queryKey: ["business-profile", "summary", profileId],
    queryFn: async () => {
      if (!profileId) {
        throw new Error("profileId ausente.");
      }

      const [classification, maturity, stage] = await Promise.all([
        businessProfileClient.currentClassification(profileId),
        businessProfileClient.currentMaturity(profileId),
        businessProfileClient.currentStage(profileId),
      ]);

      return {
        classification,
        maturity: maturity?.maturity,
        stage: stage?.stage,
      };
    },
    enabled: profileId !== undefined,
  });
}
