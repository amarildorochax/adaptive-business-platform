import { AgentStatus } from "./AgentStatus";

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