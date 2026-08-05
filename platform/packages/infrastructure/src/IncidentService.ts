import type { Incident, IncidentStage } from "./Incident.js";
import type { IncidentRepository } from "./IncidentRepository.js";

/**
 * Incident Service — "Resposta a incidentes segue processo formal e documentado — detecção,
 * classificação de severidade, mitigação, resolução, e revisão posterior"
 * (`NON_FUNCTIONAL_REQUIREMENTS.md`, Capítulo 13). As cinco transições abaixo aplicam exatamente essa
 * sequência, nunca permitindo pular ou reordenar uma etapa (mesma disciplina de guarda de estágio já
 * usada em `SessionService`, IMP-011).
 */
export class IncidentService {
  constructor(private readonly repository: IncidentRepository) {}

  async open(triggeredBy: string): Promise<Incident> {
    const incident: Incident = {
      incidentId: crypto.randomUUID(),
      triggeredBy,
      stage: "Detected",
      detectedAt: new Date(),
    };
    return this.repository.create(incident);
  }

  async classify(incidentId: string, severity: string): Promise<Incident> {
    const incident = await this.requireStage(incidentId, "Detected");
    return this.repository.update({ ...incident, severity, stage: "SeverityClassified" });
  }

  async mitigate(incidentId: string): Promise<Incident> {
    return this.advance(incidentId, "SeverityClassified", "Mitigated");
  }

  async resolve(incidentId: string): Promise<Incident> {
    return this.advance(incidentId, "Mitigated", "Resolved");
  }

  async review(incidentId: string): Promise<Incident> {
    return this.advance(incidentId, "Resolved", "Reviewed");
  }

  async find(incidentId: string): Promise<Incident | undefined> {
    return this.repository.find(incidentId);
  }

  private async advance(incidentId: string, expected: IncidentStage, next: IncidentStage): Promise<Incident> {
    const incident = await this.requireStage(incidentId, expected);
    return this.repository.update({ ...incident, stage: next });
  }

  private async requireStage(incidentId: string, expected: IncidentStage): Promise<Incident> {
    const incident = await this.repository.find(incidentId);
    if (!incident) {
      throw new Error(`Incident "${incidentId}" não encontrado.`);
    }
    if (incident.stage !== expected) {
      throw new Error(`Incident "${incidentId}" está em "${incident.stage}", esperado "${expected}".`);
    }
    return incident;
  }
}
