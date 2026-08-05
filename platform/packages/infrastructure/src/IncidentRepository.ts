import type { Incident } from "./Incident.js";

/**
 * Incident Repository — único Repository deste arquivo com `update`: um Incident evolui através de
 * cinco estágios já nomeados no Blueprint (Capítulo 13) antes de ser encerrado; nunca `remove`.
 */
export interface IncidentRepository {
  create(incident: Incident): Promise<Incident>;
  update(incident: Incident): Promise<Incident>;
  find(incidentId: string): Promise<Incident | undefined>;
  list(): Promise<readonly Incident[]>;
}
