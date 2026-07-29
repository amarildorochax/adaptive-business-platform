import { AgentRegistry } from "./AgentRegistry";
import { BlogAgent } from "../blog/BlogAgent";

/**
 * Registra, em um AgentRegistry, todos os Agent conhecidos pela
 * plataforma. Chamado por AgentStore em sua construção.
 *
 * Nota de auditoria (Sprint 0A): apenas BlogAgent é registrado hoje —
 * os demais AgentType (AgentTypes.ts) ainda não têm um Agent
 * correspondente para registrar aqui.
 */
export function registerAgents(registry: AgentRegistry): void {
  registry.register(BlogAgent);
}
