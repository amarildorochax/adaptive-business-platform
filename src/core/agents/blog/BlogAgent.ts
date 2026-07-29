import type { Agent } from "../registry/Agent";
import { AgentStatus } from "../registry/AgentStatus";

/**
 * Definição estática do único Agent real registrado na plataforma hoje.
 * Registrado por registerAgents.ts; executado por BlogAgentExecutor
 * quando despachado via AgentDispatcher.
 */
export const BlogAgent: Agent = {
  id: "blog-agent",

  name: "Blog Agent",

  department: "Conteúdo",

  workspace: "Andreia Rocha Floral",

  status: AgentStatus.IDLE,

  task: "Aguardando tarefas",

  version: "1.0.0",

  createdAt: new Date(),

  updatedAt: new Date(),

  tools: [
    "WordPress",
    "OpenAI",
    "Rank Math",
    "Canva"
  ]
};
