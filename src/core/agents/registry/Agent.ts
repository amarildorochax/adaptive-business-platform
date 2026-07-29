import { AgentStatus } from "./AgentStatus";

/**
 * Representa um Agent (colaborador de IA) da plataforma — identidade,
 * departamento, status atual, e ferramentas que utiliza.
 *
 * Dependências: AgentStatus.
 */
export interface Agent {
  id: string;
  name: string;
  department: string;
  workspace: string;
  status: AgentStatus;
  task?: string;
  version: string;
  createdAt: Date;
  updatedAt: Date;
  tools: string[];
}
