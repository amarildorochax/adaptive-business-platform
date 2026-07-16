import type { Agent } from "../registry/Agent";
import { AgentStatus } from "../registry/AgentStatus";

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