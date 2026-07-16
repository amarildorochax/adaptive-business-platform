import { AgentRegistry } from "./AgentRegistry";
import { BlogAgent } from "../blog/BlogAgent";

export function registerAgents(registry: AgentRegistry): void {
  registry.register(BlogAgent);
}