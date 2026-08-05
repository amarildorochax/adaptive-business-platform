import type { OversightCheckpoint } from "./OversightCheckpoint.js";
import type { OversightCheckpointRepository } from "./OversightCheckpointRepository.js";

/**
 * Oversight Gate Service — implementa o "Oversight Gate" (`AI_AGENTS_ARCHITECTURE_DEFINITION.md`,
 * Seções 4 e 17): "Aplica o checkpoint de Human Oversight sobre todo Agent Task Result antes de sua
 * liberação ao domínio solicitante, quando a finalidade da delegação já exige confirmação — nunca
 * liberando silenciosamente um resultado de alto impacto." A classificação de "alto impacto" —
 * financeiro, jurídico, reputacional, ou qualquer categoria já definida pela política da plataforma —
 * nunca é decidida por este Service: o Blueprint nunca enumera essa política, apenas a referencia
 * como já definida em outro lugar; `requiresConfirmation` é sempre recebida já resolvida pelo
 * chamador, nunca inferida aqui (mesma disciplina de "nenhuma tecnologia/política concreta decidida
 * por esta Sprint" já aplicada em `DispatcherService`, IMP-013).
 */
export class OversightGateService {
  constructor(private readonly repository: OversightCheckpointRepository) {}

  /** Retorna um Checkpoint `"Pending"` quando a finalidade exige confirmação; `undefined` quando o resultado é liberado sem retenção. */
  async evaluate(agentTaskResultId: string, requiresConfirmation: boolean): Promise<OversightCheckpoint | undefined> {
    if (!requiresConfirmation) {
      return undefined;
    }

    const checkpoint: OversightCheckpoint = {
      oversightCheckpointId: crypto.randomUUID(),
      agentTaskResultId,
      status: "Pending",
      requestedAt: new Date(),
    };
    return this.repository.create(checkpoint);
  }

  async approve(oversightCheckpointId: string, resolvedByIdentityId: string): Promise<OversightCheckpoint> {
    return this.resolve(oversightCheckpointId, "Approved", resolvedByIdentityId);
  }

  async deny(oversightCheckpointId: string, resolvedByIdentityId: string): Promise<OversightCheckpoint> {
    return this.resolve(oversightCheckpointId, "Denied", resolvedByIdentityId);
  }

  /** "Um Agent Task Result é considerado retido para confirmação quando referenciado por um Oversight Checkpoint de status Pending" (`OversightCheckpoint.ts`). */
  async isRetained(agentTaskResultId: string): Promise<boolean> {
    const checkpoint = await this.repository.findByTaskResultId(agentTaskResultId);
    return checkpoint?.status === "Pending";
  }

  private async resolve(oversightCheckpointId: string, status: "Approved" | "Denied", resolvedByIdentityId: string): Promise<OversightCheckpoint> {
    const checkpoint = await this.repository.find(oversightCheckpointId);
    if (!checkpoint) {
      throw new Error(`Oversight Checkpoint "${oversightCheckpointId}" não encontrado.`);
    }
    if (checkpoint.status !== "Pending") {
      throw new Error(`Oversight Checkpoint "${oversightCheckpointId}" já foi resolvido como "${checkpoint.status}".`);
    }

    return this.repository.update({ ...checkpoint, status, resolvedByIdentityId, resolvedAt: new Date() });
  }
}
